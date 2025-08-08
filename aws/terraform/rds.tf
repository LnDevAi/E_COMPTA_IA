# ===================================================
# RDS POSTGRESQL - E-COMPTA-IA
# Base de données relationnelle avec haute disponibilité
# ===================================================

# ===================================================
# DB SUBNET GROUP
# ===================================================

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# ===================================================
# DB PARAMETER GROUP
# ===================================================

resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-db-params"
  
  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }
  
  parameter {
    name  = "log_statement"
    value = "all"
  }
  
  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }
  
  parameter {
    name  = "timezone"
    value = "Africa/Ouagadougou"
  }
  
  tags = {
    Name = "${var.project_name}-db-parameter-group"
  }
}

# ===================================================
# RANDOM PASSWORD FOR DATABASE
# ===================================================

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# ===================================================
# RDS INSTANCE
# ===================================================

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-database"
  
  # Engine configuration
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  
  # Storage configuration
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn
  
  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result
  port     = 5432
  
  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  
  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  copy_tags_to_snapshot  = true
  delete_automated_backups = false
  
  # Performance and monitoring
  parameter_group_name        = aws_db_parameter_group.main.name
  performance_insights_enabled = var.enable_enhanced_monitoring
  monitoring_interval         = var.enable_enhanced_monitoring ? 60 : 0
  monitoring_role_arn        = var.enable_enhanced_monitoring ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  
  # Security
  deletion_protection      = var.environment == "prod"
  skip_final_snapshot     = var.environment == "dev"
  final_snapshot_identifier = var.environment != "dev" ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  # Multi-AZ for production
  multi_az = var.environment == "prod"
  
  # Apply modifications immediately in dev, during maintenance window in prod
  apply_immediately = var.environment == "dev"
  
  tags = {
    Name = "${var.project_name}-database"
  }
  
  lifecycle {
    ignore_changes = [
      final_snapshot_identifier,
      password
    ]
  }
}

# ===================================================
# RDS READ REPLICA (Pour la production)
# ===================================================

resource "aws_db_instance" "read_replica" {
  count = var.environment == "prod" ? 1 : 0
  
  identifier     = "${var.project_name}-database-read-replica"
  replicate_source_db = aws_db_instance.main.id
  
  instance_class = var.db_instance_class
  
  # Network configuration
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  
  # Performance monitoring
  performance_insights_enabled = var.enable_enhanced_monitoring
  monitoring_interval         = var.enable_enhanced_monitoring ? 60 : 0
  monitoring_role_arn        = var.enable_enhanced_monitoring ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  
  tags = {
    Name = "${var.project_name}-database-read-replica"
  }
}

# ===================================================
# KMS KEY FOR RDS ENCRYPTION
# ===================================================

resource "aws_kms_key" "rds" {
  description = "KMS key for RDS encryption - ${var.project_name}"
  
  tags = {
    Name = "${var.project_name}-rds-kms-key"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.project_name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# ===================================================
# IAM ROLE FOR ENHANCED MONITORING
# ===================================================

resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.enable_enhanced_monitoring ? 1 : 0
  
  name = "${var.project_name}-rds-enhanced-monitoring"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count = var.enable_enhanced_monitoring ? 1 : 0
  
  role       = aws_iam_role.rds_enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ===================================================
# SSM PARAMETER POUR DATABASE URL
# ===================================================

resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project_name}/database/url"
  type  = "SecureString"
  value = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}/${var.db_name}"
  
  tags = {
    Name = "${var.project_name}-database-url"
  }
}

resource "aws_ssm_parameter" "database_host" {
  name  = "/${var.project_name}/database/host"
  type  = "String"
  value = aws_db_instance.main.address
  
  tags = {
    Name = "${var.project_name}-database-host"
  }
}

resource "aws_ssm_parameter" "database_port" {
  name  = "/${var.project_name}/database/port"
  type  = "String"
  value = tostring(aws_db_instance.main.port)
  
  tags = {
    Name = "${var.project_name}-database-port"
  }
}

resource "aws_ssm_parameter" "database_name" {
  name  = "/${var.project_name}/database/name"
  type  = "String"
  value = aws_db_instance.main.db_name
  
  tags = {
    Name = "${var.project_name}-database-name"
  }
}

resource "aws_ssm_parameter" "database_username" {
  name  = "/${var.project_name}/database/username"
  type  = "String"
  value = aws_db_instance.main.username
  
  tags = {
    Name = "${var.project_name}-database-username"
  }
}

resource "aws_ssm_parameter" "database_password" {
  name  = "/${var.project_name}/database/password"
  type  = "SecureString"
  value = random_password.db_password.result
  
  tags = {
    Name = "${var.project_name}-database-password"
  }
}

# ===================================================
# CLOUDWATCH ALARMS POUR RDS
# ===================================================

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = var.sns_email_endpoint != "" ? [aws_sns_topic.alerts[0].arn] : []
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  tags = {
    Name = "${var.project_name}-rds-cpu-alarm"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_connection_count" {
  alarm_name          = "${var.project_name}-rds-connection-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "40"
  alarm_description   = "This metric monitors RDS connection count"
  alarm_actions       = var.sns_email_endpoint != "" ? [aws_sns_topic.alerts[0].arn] : []
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  tags = {
    Name = "${var.project_name}-rds-connections-alarm"
  }
}