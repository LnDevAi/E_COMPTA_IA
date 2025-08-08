# 🚀 Guide de Déploiement AWS - E-COMPTA-IA

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Architecture AWS](#architecture-aws)
3. [Configuration Initiale](#configuration-initiale)
4. [Déploiement Infrastructure](#déploiement-infrastructure)
5. [Déploiement Application](#déploiement-application)
6. [Configuration DNS](#configuration-dns)
7. [Monitoring & Surveillance](#monitoring--surveillance)
8. [Maintenance](#maintenance)
9. [Coûts](#coûts)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Prérequis

### Outils Requis

```bash
# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

### Compte AWS

- **Compte AWS** avec permissions administrateur
- **Région recommandée** : `us-west-2` (Oregon) ou `eu-west-1` (Irlande)
- **Limite de service** : Vérifier les quotas ECS, RDS, VPC

### Domaine (Optionnel)

- Domaine enregistré (ex: `e-compta-ia.com`)
- Accès à la configuration DNS

---

## 🏗️ Architecture AWS

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                   CloudFront                        │
│                 (Distribution CDN)                  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                    ALB                              │
│            (Load Balancer)                          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                  ECS Fargate                        │
│               (Containers)                          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                   RDS PostgreSQL                    │
│                  (Database)                         │
└─────────────────────────────────────────────────────┘
```

### Composants

| Service | Description | Configuration |
|---------|-------------|---------------|
| **VPC** | Réseau privé virtuel | CIDR: 10.0.0.0/16 |
| **ECS Fargate** | Orchestration containers | CPU: 512, RAM: 1024MB |
| **ALB** | Load balancer applicatif | SSL/TLS, Health checks |
| **RDS PostgreSQL** | Base de données | Version 15.4, Multi-AZ |
| **CloudFront** | CDN global | Compression, Cache |
| **S3** | Stockage objet | Chiffrement, Lifecycle |
| **ECR** | Registry Docker | Scan sécurité |

---

## ⚙️ Configuration Initiale

### 1. Configuration AWS CLI

```bash
aws configure
# AWS Access Key ID: [Votre clé]
# AWS Secret Access Key: [Votre secret]
# Default region name: us-west-2
# Default output format: json
```

### 2. Création du Backend Terraform (Optionnel)

```bash
# Créer bucket S3 pour l'état Terraform
aws s3 mb s3://e-compta-ia-terraform-state-$(date +%s)

# Activer le versioning
aws s3api put-bucket-versioning \
  --bucket e-compta-ia-terraform-state-XXXXX \
  --versioning-configuration Status=Enabled
```

### 3. Variables d'Environnement

Créer `aws/terraform/terraform.tfvars` :

```hcl
# Configuration de base
project_name = "e-compta-ia"
environment  = "prod"
aws_region   = "us-west-2"

# Domaine (optionnel)
domain_name = "votre-domaine.com"

# Configuration ECS
fargate_cpu    = 512
fargate_memory = 1024
app_count      = 2

# Configuration base de données
db_instance_class = "db.t3.small"
db_allocated_storage = 20

# Notifications
sns_email_endpoint = "admin@votre-domaine.com"

# Optimisations coût
enable_nat_gateway = true
cloudfront_price_class = "PriceClass_100"
```

---

## 🚀 Déploiement Infrastructure

### 1. Initialisation Terraform

```bash
cd aws/terraform

# Initialiser Terraform
terraform init

# Vérifier la configuration
terraform validate

# Planifier le déploiement
terraform plan -var-file="terraform.tfvars"
```

### 2. Déploiement

```bash
# Déployer l'infrastructure
terraform apply -var-file="terraform.tfvars"

# Confirmer avec 'yes'
```

⏱️ **Temps estimé** : 15-20 minutes

### 3. Vérification

```bash
# Obtenir les outputs
terraform output

# URLs importantes
terraform output application_url
terraform output ecr_repository_url
```

---

## 📦 Déploiement Application

### 1. Build Docker Image

```bash
# Retourner à la racine du projet
cd ../..

# Obtenir l'URL ECR
ECR_URL=$(cd aws/terraform && terraform output -raw ecr_repository_url)

# Login ECR
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin $ECR_URL
```

### 2. Build & Push

```bash
# Build l'image
docker build -t e-compta-ia .

# Tag pour ECR
docker tag e-compta-ia:latest $ECR_URL:latest

# Push vers ECR
docker push $ECR_URL:latest
```

### 3. Déploiement ECS

```bash
# Forcer le redéploiement
aws ecs update-service \
  --cluster e-compta-ia-cluster \
  --service e-compta-ia-service \
  --force-new-deployment \
  --region us-west-2

# Suivre le déploiement
aws ecs wait services-stable \
  --cluster e-compta-ia-cluster \
  --services e-compta-ia-service \
  --region us-west-2
```

---

## 🌐 Configuration DNS

### Avec Domaine Personnalisé

#### 1. Validation Certificat SSL

```bash
# Obtenir les enregistrements de validation
terraform output ssl_certificate_domain_validation_options
```

#### 2. Configuration DNS

Ajouter ces enregistrements dans votre registrar :

```dns
# Validation SSL (exemple)
_acme-challenge.votre-domaine.com CNAME _xyz.acme-validations.aws.

# Pointer vers CloudFront
votre-domaine.com CNAME d123456789.cloudfront.net
www.votre-domaine.com CNAME d123456789.cloudfront.net
```

### Sans Domaine

L'application sera accessible via l'URL CloudFront :
```
https://d123456789.cloudfront.net
```

---

## 📊 Monitoring & Surveillance

### CloudWatch Dashboards

```bash
# Accéder à CloudWatch
aws cloudwatch list-dashboards --region us-west-2
```

### Métriques Surveillées

| Métrique | Seuil | Action |
|----------|-------|--------|
| CPU ECS | > 70% | Scale out |
| Mémoire ECS | > 80% | Scale out |
| CPU RDS | > 80% | Alerte email |
| Connexions RDS | > 40 | Alerte email |
| Erreurs ALB | > 5% | Alerte email |

### Logs

```bash
# Logs ECS
aws logs tail /ecs/e-compta-ia --follow --region us-west-2

# Logs ALB
aws s3 sync s3://e-compta-ia-alb-logs-xxxxx/alb-logs/ ./alb-logs/
```

---

## 🔧 Maintenance

### Mise à Jour Application

```bash
# 1. Build nouvelle version
docker build -t e-compta-ia:v1.1.0 .

# 2. Tag et push
docker tag e-compta-ia:v1.1.0 $ECR_URL:v1.1.0
docker push $ECR_URL:v1.1.0

# 3. Mettre à jour la task definition
aws ecs update-service \
  --cluster e-compta-ia-cluster \
  --service e-compta-ia-service \
  --force-new-deployment
```

### Sauvegarde Base de Données

```bash
# Créer snapshot manuel
aws rds create-db-snapshot \
  --db-instance-identifier e-compta-ia-database \
  --db-snapshot-identifier e-compta-ia-manual-$(date +%Y%m%d)
```

### Mise à Jour Infrastructure

```bash
cd aws/terraform

# Mettre à jour
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

---

## 💰 Coûts

### Estimation Mensuelle (USD)

| Service | Configuration | Coût Estimé |
|---------|---------------|-------------|
| **ECS Fargate** | 2 tâches, 512 CPU, 1GB RAM | $25-35 |
| **RDS PostgreSQL** | db.t3.small, 20GB | $25-30 |
| **ALB** | Application Load Balancer | $16 |
| **CloudFront** | 1TB/mois | $85 |
| **S3** | 100GB stockage | $2-3 |
| **Data Transfer** | Variable | $10-20 |
| **Total** | | **$165-190/mois** |

### Optimisations

1. **Environnement Dev** : Utiliser `db.t3.micro` (-$15/mois)
2. **Spot Instances** : Réduction 70% sur ECS (-$20/mois)
3. **Reserved Instances** : Réduction 30% sur RDS (-$8/mois)

---

## 🚨 Troubleshooting

### Problèmes Courants

#### 1. Service ECS ne démarre pas

```bash
# Vérifier les logs
aws logs get-log-events \
  --log-group-name /ecs/e-compta-ia \
  --log-stream-name ecs/e-compta-ia-container/TASK_ID

# Vérifier la task definition
aws ecs describe-task-definition \
  --task-definition e-compta-ia-app
```

#### 2. ALB Health Check échoue

```bash
# Vérifier les target groups
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:...

# Vérifier les security groups
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx
```

#### 3. RDS Connection Error

```bash
# Tester la connectivité
aws rds describe-db-instances \
  --db-instance-identifier e-compta-ia-database

# Vérifier les paramètres
aws ssm get-parameter \
  --name /e-compta-ia/database/url \
  --with-decryption
```

### Commandes Utiles

```bash
# Status général
terraform refresh && terraform output infrastructure_summary

# Redémarrer service ECS
aws ecs update-service \
  --cluster e-compta-ia-cluster \
  --service e-compta-ia-service \
  --force-new-deployment

# Vérifier certificat SSL
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw ssl_certificate_arn)

# Invalider cache CloudFront
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

---

## 🎯 Points de Contrôle

### ✅ Checklist Déploiement

- [ ] Infrastructure Terraform déployée
- [ ] Image Docker dans ECR
- [ ] Service ECS en cours d'exécution
- [ ] Health checks ALB OK
- [ ] Base de données accessible
- [ ] CloudFront distribue le contenu
- [ ] Certificat SSL valide (si domaine)
- [ ] Monitoring configuré
- [ ] Sauvegardes programmées

### 🔐 Sécurité

- [ ] Security groups restrictifs
- [ ] Chiffrement activé (RDS, S3)
- [ ] WAF configuré (optionnel)
- [ ] Logs d'accès activés
- [ ] Alertes configurées

---

## 📞 Support

### Ressources

- **Documentation AWS** : https://docs.aws.amazon.com/
- **Terraform Registry** : https://registry.terraform.io/
- **Status AWS** : https://status.aws.amazon.com/

### Contacts

- **Support Technique** : Créer un ticket AWS Support
- **Communauté** : AWS Forums, Stack Overflow

---

## 🎉 Conclusion

Votre plateforme **E-COMPTA-IA** est maintenant déployée sur AWS avec :

- ✅ **Haute disponibilité** (Multi-AZ)
- ✅ **Scalabilité automatique** (ECS + Auto Scaling)
- ✅ **Sécurité renforcée** (VPC, chiffrement, SSL)
- ✅ **Monitoring complet** (CloudWatch, alertes)
- ✅ **Optimisation coûts** (Lifecycle policies, Spot instances)

🌐 **Accédez à votre application** : Utilisez l'URL fournie dans les outputs Terraform !

---

*Guide créé pour E-COMPTA-IA v1.0 - Dernière mise à jour : Décembre 2024*