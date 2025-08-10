# ===================================================
# OUTPUTS TERRAFORM - E-COMPTA-IA
# Informations importantes de l'infrastructure déployée
# ===================================================

# ===================================================
# NETWORKING OUTPUTS
# ===================================================

output "vpc_id" {
  description = "ID du VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block du VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs des subnets publics"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs des subnets privés"
  value       = aws_subnet.private[*].id
}

# ===================================================
# LOAD BALANCER OUTPUTS
# ===================================================

output "alb_dns_name" {
  description = "Nom DNS de l'Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID de l'Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ARN de l'Application Load Balancer"
  value       = aws_lb.main.arn
}

# ===================================================
# ECS OUTPUTS
# ===================================================

output "ecs_cluster_id" {
  description = "ID du cluster ECS"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_arn" {
  description = "ARN du cluster ECS"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "Nom du service ECS"
  value       = aws_ecs_service.app.name
}

output "ecr_repository_url" {
  description = "URL du repository ECR"
  value       = aws_ecr_repository.app.repository_url
}

# ===================================================
# DATABASE OUTPUTS
# ===================================================

output "rds_endpoint" {
  description = "Endpoint de la base de données RDS"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "Port de la base de données RDS"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "Nom de la base de données"
  value       = aws_db_instance.main.db_name
}

output "rds_username" {
  description = "Nom d'utilisateur de la base de données"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "database_url_ssm_parameter" {
  description = "Nom du paramètre SSM contenant l'URL de la base de données"
  value       = aws_ssm_parameter.database_url.name
}

# ===================================================
# S3 OUTPUTS
# ===================================================

output "s3_app_storage_bucket" {
  description = "Nom du bucket S3 pour le stockage de l'application"
  value       = aws_s3_bucket.app_storage.bucket
}

output "s3_app_storage_arn" {
  description = "ARN du bucket S3 pour le stockage de l'application"
  value       = aws_s3_bucket.app_storage.arn
}

output "s3_backups_bucket" {
  description = "Nom du bucket S3 pour les sauvegardes"
  value       = aws_s3_bucket.backups.bucket
}

output "s3_alb_logs_bucket" {
  description = "Nom du bucket S3 pour les logs ALB"
  value       = aws_s3_bucket.alb_logs.bucket
}

# ===================================================
# CLOUDFRONT OUTPUTS
# ===================================================

output "cloudfront_distribution_id" {
  description = "ID de la distribution CloudFront"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "Nom de domaine CloudFront"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "Zone ID de CloudFront pour les enregistrements DNS"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

# ===================================================
# SECURITY OUTPUTS
# ===================================================

output "alb_security_group_id" {
  description = "ID du security group de l'ALB"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ID du security group d'ECS"
  value       = aws_security_group.ecs.id
}

output "rds_security_group_id" {
  description = "ID du security group de RDS"
  value       = aws_security_group.rds.id
}

# ===================================================
# SSL/TLS OUTPUTS
# ===================================================

output "ssl_certificate_arn" {
  description = "ARN du certificat SSL/TLS"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

output "ssl_certificate_domain_validation_options" {
  description = "Options de validation du domaine pour le certificat SSL"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].domain_validation_options : null
  sensitive   = true
}

# ===================================================
# MONITORING OUTPUTS
# ===================================================

output "cloudwatch_log_group_name" {
  description = "Nom du groupe de logs CloudWatch"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "sns_topic_arn" {
  description = "ARN du topic SNS pour les alertes"
  value       = var.sns_email_endpoint != "" ? aws_sns_topic.alerts[0].arn : null
}

# ===================================================
# APPLICATION URLs
# ===================================================

output "application_url" {
  description = "URL principale de l'application"
  value = var.domain_name != "" ? (
    "https://${var.domain_name}"
  ) : (
    "https://${aws_cloudfront_distribution.main.domain_name}"
  )
}

output "api_url" {
  description = "URL de l'API"
  value = var.domain_name != "" ? (
    "https://${var.domain_name}/api"
  ) : (
    "http://${aws_lb.main.dns_name}/api"
  )
}

# ===================================================
# INFRASTRUCTURE SUMMARY
# ===================================================

output "infrastructure_summary" {
  description = "Résumé de l'infrastructure déployée"
  value = {
    project_name = var.project_name
    environment  = var.environment
    region       = var.aws_region
    
    vpc = {
      id         = aws_vpc.main.id
      cidr_block = aws_vpc.main.cidr_block
    }
    
    application = {
      url            = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.main.domain_name}"
      api_url        = var.domain_name != "" ? "https://${var.domain_name}/api" : "http://${aws_lb.main.dns_name}/api"
      cloudfront_url = "https://${aws_cloudfront_distribution.main.domain_name}"
      alb_url        = "http://${aws_lb.main.dns_name}"
    }
    
    database = {
      engine   = aws_db_instance.main.engine
      version  = aws_db_instance.main.engine_version
      instance = aws_db_instance.main.instance_class
      multi_az = aws_db_instance.main.multi_az
    }
    
    containers = {
      cluster_name = aws_ecs_cluster.main.name
      service_name = aws_ecs_service.app.name
      task_count   = aws_ecs_service.app.desired_count
      cpu          = var.fargate_cpu
      memory       = var.fargate_memory
    }
    
    storage = {
      app_bucket     = aws_s3_bucket.app_storage.bucket
      backups_bucket = aws_s3_bucket.backups.bucket
      logs_bucket    = aws_s3_bucket.alb_logs.bucket
    }
  }
}

# ===================================================
# DEPLOYMENT INSTRUCTIONS
# ===================================================

output "deployment_instructions" {
  description = "Instructions de déploiement"
  value = <<-EOT
🚀 INFRASTRUCTURE E-COMPTA-IA DÉPLOYÉE AVEC SUCCÈS !

📋 ÉTAPES SUIVANTES :

1. 🐳 Build et Push Docker Image :
   ```bash
   aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.app.repository_url}
   docker build -t ${var.project_name} .
   docker tag ${var.project_name}:latest ${aws_ecr_repository.app.repository_url}:latest
   docker push ${aws_ecr_repository.app.repository_url}:latest
   ```

2. 🔄 Mise à jour du service ECS :
   ```bash
   aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service ${aws_ecs_service.app.name} --force-new-deployment --region ${var.aws_region}
   ```

3. 🌐 Configuration DNS (si domaine personnalisé) :
   - Pointer ${var.domain_name != "" ? var.domain_name : "votre-domaine.com"} vers ${aws_cloudfront_distribution.main.domain_name}
   - Ajouter CNAME : www -> ${aws_cloudfront_distribution.main.domain_name}

4. 📧 Vérifier votre email pour confirmer les alertes SNS

5. 🔍 Surveiller les logs :
   - CloudWatch : ${aws_cloudwatch_log_group.ecs.name}
   - Application : ${var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.main.domain_name}"}

🎯 URL de l'application : ${var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.main.domain_name}"}
  EOT
}

# ===================================================
# COST ESTIMATION
# ===================================================

output "estimated_monthly_cost" {
  description = "Estimation du coût mensuel (USD)"
  value = {
    fargate_tasks = format("$%.2f", var.app_count * var.fargate_cpu * 0.04048 + var.app_count * var.fargate_memory / 1024 * 0.004445 * 24 * 30)
    rds_instance = var.db_instance_class == "db.t3.micro" ? "$12.41" : "$25-100"
    alb = "$16.43"
    cloudfront = "$0.085 per GB + $0.0075 per 10k requests"
    s3_storage = "$0.023 per GB/month"
    data_transfer = "Variable selon utilisation"
    total_estimate = var.db_instance_class == "db.t3.micro" ? "$40-60/month" : "$80-200/month"
  }
}