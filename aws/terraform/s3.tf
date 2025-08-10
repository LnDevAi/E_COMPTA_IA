# ===================================================
# S3 & CLOUDFRONT - E-COMPTA-IA
# Stockage et distribution de contenu
# ===================================================

# ===================================================
# S3 BUCKET POUR STOCKAGE APPLICATION
# ===================================================

resource "aws_s3_bucket" "app_storage" {
  bucket        = "${var.project_name}-storage-${random_string.bucket_suffix.result}"
  force_destroy = var.environment == "dev"
  
  tags = {
    Name = "${var.project_name}-app-storage"
  }
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  rule {
    id     = "app_storage_lifecycle"
    status = "Enabled"
    
    # Transition vers IA après 30 jours
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    # Transition vers Glacier après 90 jours
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    # Transition vers Deep Archive après 365 jours
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    
    # Supprimer les versions non-current après 30 jours
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
    
    # Supprimer les uploads multipart incomplets après 7 jours
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ===================================================
# S3 BUCKET POUR SAUVEGARDES
# ===================================================

resource "aws_s3_bucket" "backups" {
  bucket        = "${var.project_name}-backups-${random_string.bucket_suffix.result}"
  force_destroy = var.environment == "dev"
  
  tags = {
    Name = "${var.project_name}-backups"
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  rule {
    id     = "backup_lifecycle"
    status = "Enabled"
    
    # Transition vers IA après 7 jours
    transition {
      days          = 7
      storage_class = "STANDARD_IA"
    }
    
    # Transition vers Glacier après 30 jours
    transition {
      days          = 30
      storage_class = "GLACIER"
    }
    
    # Transition vers Deep Archive après 90 jours
    transition {
      days          = 90
      storage_class = "DEEP_ARCHIVE"
    }
    
    # Expiration des sauvegardes après rétention
    expiration {
      days = var.s3_backup_retention_days
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# ===================================================
# KMS KEY POUR S3
# ===================================================

resource "aws_kms_key" "s3" {
  description = "KMS key for S3 encryption - ${var.project_name}"
  
  tags = {
    Name = "${var.project_name}-s3-kms-key"
  }
}

resource "aws_kms_alias" "s3" {
  name          = "alias/${var.project_name}-s3"
  target_key_id = aws_kms_key.s3.key_id
}

# ===================================================
# CLOUDFRONT DISTRIBUTION
# ===================================================

# Origin Access Control pour S3
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for ${var.project_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name              = aws_s3_bucket.app_storage.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id                = "S3-${aws_s3_bucket.app_storage.bucket}"
  }
  
  # Origin pour ALB (API)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB-${var.project_name}"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = var.domain_name != "" ? "https-only" : "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  # Aliases (si domaine personnalisé)
  aliases = var.domain_name != "" ? [var.domain_name, "www.${var.domain_name}"] : []
  
  # Comportement par défaut (SPA)
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.app_storage.bucket}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400   # 1 jour
    max_ttl     = 31536000 # 1 an
  }
  
  # Comportement pour les assets statiques
  ordered_cache_behavior {
    path_pattern     = "assets/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.app_storage.bucket}"
    compress         = true
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl                = 0
    default_ttl            = 86400     # 1 jour
    max_ttl                = 31536000  # 1 an
    viewer_protocol_policy = "redirect-to-https"
  }
  
  # Comportement pour l'API
  ordered_cache_behavior {
    path_pattern     = "api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${var.project_name}"
    compress         = true
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]
      cookies {
        forward = "all"
      }
    }
    
    min_ttl                = 0
    default_ttl            = 0      # Pas de cache pour l'API
    max_ttl                = 0
    viewer_protocol_policy = "redirect-to-https"
  }
  
  # Configuration géographique
  price_class = var.cloudfront_price_class
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  # Certificat SSL
  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == ""
    acm_certificate_arn           = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
    ssl_support_method            = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version      = var.domain_name != "" ? "TLSv1.2_2021" : null
  }
  
  # Pages d'erreur personnalisées pour SPA
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  tags = {
    Name = "${var.project_name}-cloudfront"
  }
}

# ===================================================
# S3 BUCKET POLICY POUR CLOUDFRONT
# ===================================================

resource "aws_s3_bucket_policy" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.app_storage.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}

# ===================================================
# CLOUDWATCH ALARMS POUR S3
# ===================================================

resource "aws_cloudwatch_metric_alarm" "s3_storage_size" {
  alarm_name          = "${var.project_name}-s3-storage-size"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BucketSizeBytes"
  namespace           = "AWS/S3"
  period              = "86400"  # 1 jour
  statistic           = "Average"
  threshold           = "10737418240"  # 10 GB
  alarm_description   = "This metric monitors S3 bucket storage size"
  alarm_actions       = var.sns_email_endpoint != "" ? [aws_sns_topic.alerts[0].arn] : []
  
  dimensions = {
    BucketName  = aws_s3_bucket.app_storage.bucket
    StorageType = "StandardStorage"
  }
  
  tags = {
    Name = "${var.project_name}-s3-storage-alarm"
  }
}

# ===================================================
# SNS TOPIC POUR ALERTES
# ===================================================

resource "aws_sns_topic" "alerts" {
  count = var.sns_email_endpoint != "" ? 1 : 0
  name  = "${var.project_name}-alerts"
  
  tags = {
    Name = "${var.project_name}-sns-alerts"
  }
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.sns_email_endpoint != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.sns_email_endpoint
}