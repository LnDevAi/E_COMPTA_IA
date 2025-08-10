# ===================================================
# VARIABLES TERRAFORM - E-COMPTA-IA AWS DEPLOYMENT
# Configuration personnalisable de l'infrastructure
# ===================================================

# ===================================================
# GENERAL CONFIGURATION
# ===================================================

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "e-compta-ia"
}

variable "environment" {
  description = "Environnement (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "Région AWS"
  type        = string
  default     = "us-west-2"
}

variable "domain_name" {
  description = "Nom de domaine pour l'application (laissez vide pour utiliser l'ALB DNS)"
  type        = string
  default     = ""
}

# ===================================================
# NETWORKING CONFIGURATION
# ===================================================

variable "vpc_cidr" {
  description = "CIDR block pour le VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks pour les subnets publics"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks pour les subnets privés"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "enable_nat_gateway" {
  description = "Activer NAT Gateway pour les subnets privés"
  type        = bool
  default     = true
}

# ===================================================
# ECS CONFIGURATION
# ===================================================

variable "fargate_cpu" {
  description = "CPU Fargate (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 512
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.fargate_cpu)
    error_message = "Fargate CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "fargate_memory" {
  description = "Mémoire Fargate en MB"
  type        = number
  default     = 1024
}

variable "app_count" {
  description = "Nombre d'instances de l'application"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Capacité minimale pour l'auto-scaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Capacité maximale pour l'auto-scaling"
  type        = number
  default     = 10
}

# ===================================================
# DATABASE CONFIGURATION
# ===================================================

variable "db_instance_class" {
  description = "Classe d'instance RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Stockage alloué pour RDS (GB)"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Stockage maximum alloué pour RDS (GB)"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Nom de la base de données"
  type        = string
  default     = "ecomptaia"
}

variable "db_username" {
  description = "Nom d'utilisateur de la base de données"
  type        = string
  default     = "ecomptaia_admin"
}

variable "backup_retention_period" {
  description = "Période de rétention des sauvegardes (jours)"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Fenêtre de sauvegarde (UTC)"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Fenêtre de maintenance (UTC)"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# ===================================================
# LOGGING CONFIGURATION
# ===================================================

variable "log_retention_days" {
  description = "Jours de rétention des logs CloudWatch"
  type        = number
  default     = 30
}

variable "alb_logs_retention_days" {
  description = "Jours de rétention des logs ALB dans S3"
  type        = number
  default     = 90
}

# ===================================================
# SECURITY CONFIGURATION
# ===================================================

variable "enable_deletion_protection" {
  description = "Activer la protection contre la suppression pour l'ALB"
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "Activer AWS WAF pour la protection"
  type        = bool
  default     = true
}

# ===================================================
# APPLICATION CONFIGURATION
# ===================================================

variable "api_url" {
  description = "URL de l'API backend"
  type        = string
  default     = "http://localhost:3000"
}

variable "app_version" {
  description = "Version de l'application à déployer"
  type        = string
  default     = "latest"
}

# ===================================================
# COST OPTIMIZATION
# ===================================================

variable "enable_spot_instances" {
  description = "Utiliser des instances Spot pour ECS (économies de coût)"
  type        = bool
  default     = false
}

variable "cloudfront_price_class" {
  description = "Classe de prix CloudFront (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"
  
  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "CloudFront price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All."
  }
}

# ===================================================
# MONITORING CONFIGURATION
# ===================================================

variable "enable_enhanced_monitoring" {
  description = "Activer le monitoring avancé"
  type        = bool
  default     = false
}

variable "sns_email_endpoint" {
  description = "Email pour les notifications SNS"
  type        = string
  default     = ""
}

# ===================================================
# TAGS CONFIGURATION
# ===================================================

variable "additional_tags" {
  description = "Tags supplémentaires à appliquer aux ressources"
  type        = map(string)
  default     = {}
}

# ===================================================
# BACKUP CONFIGURATION
# ===================================================

variable "enable_automated_backups" {
  description = "Activer les sauvegardes automatisées"
  type        = bool
  default     = true
}

variable "s3_backup_retention_days" {
  description = "Jours de rétention des sauvegardes S3"
  type        = number
  default     = 365
}