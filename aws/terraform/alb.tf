# ===================================================
# APPLICATION LOAD BALANCER - E-COMPTA-IA
# Load balancing avec SSL et sécurité
# ===================================================

# ===================================================
# APPLICATION LOAD BALANCER
# ===================================================

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = var.enable_deletion_protection
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }
  
  tags = {
    Name = "${var.project_name}-alb"
  }
}

# ===================================================
# TARGET GROUP
# ===================================================

resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  # Déregistration plus rapide pour les déploiements
  deregistration_delay = 30
  
  tags = {
    Name = "${var.project_name}-target-group"
  }
}

# ===================================================
# SSL CERTIFICATE (ACM)
# ===================================================

resource "aws_acm_certificate" "main" {
  count           = var.domain_name != "" ? 1 : 0
  domain_name     = var.domain_name
  validation_method = "DNS"
  
  subject_alternative_names = [
    "*.${var.domain_name}"
  ]
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "${var.project_name}-certificate"
  }
}

# ===================================================
# LISTENERS
# ===================================================

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener
resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.main.arn
  port              = var.domain_name != "" ? "443" : "80"
  protocol          = var.domain_name != "" ? "HTTPS" : "HTTP"
  ssl_policy        = var.domain_name != "" ? "ELBSecurityPolicy-TLS-1-2-2017-01" : null
  certificate_arn   = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# ===================================================
# LISTENER RULES (Sécurité supplémentaire)
# ===================================================

# Bloquer certains user agents
resource "aws_lb_listener_rule" "block_bad_bots" {
  listener_arn = aws_lb_listener.app.arn
  priority     = 100
  
  action {
    type = "fixed-response"
    
    fixed_response {
      content_type = "text/plain"
      message_body = "Access Denied"
      status_code  = "403"
    }
  }
  
  condition {
    http_header {
      http_header_name = "User-Agent"
      values = [
        "*bot*",
        "*crawler*",
        "*spider*",
        "*scanner*"
      ]
    }
  }
}

# Rate limiting via WAF (voir waf.tf)
resource "aws_lb_listener_rule" "rate_limit" {
  listener_arn = aws_lb_listener.app.arn
  priority     = 50
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ===================================================
# S3 BUCKET POUR ALB LOGS
# ===================================================

resource "aws_s3_bucket" "alb_logs" {
  bucket        = "${var.project_name}-alb-logs-${random_string.bucket_suffix.result}"
  force_destroy = var.environment == "dev"
  
  tags = {
    Name = "${var.project_name}-alb-logs"
  }
}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = data.aws_elb_service_account.main.arn
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/alb-logs/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/alb-logs/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.alb_logs.arn
      }
    ]
  })
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  rule {
    id     = "alb_logs_lifecycle"
    status = "Enabled"
    
    expiration {
      days = var.alb_logs_retention_days
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

# ===================================================
# DATA SOURCES
# ===================================================

data "aws_elb_service_account" "main" {}
data "aws_caller_identity" "current" {}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}