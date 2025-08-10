# 🚀 E-COMPTA-IA - Guide de Déploiement AWS

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement complet de **E-COMPTA-IA** sur AWS, une plateforme comptable SYSCOHADA avec Intelligence Artificielle.

## 🏗️ Architecture AWS

### Services Utilisés
- **ECS Fargate** - Containers sans serveur
- **Application Load Balancer** - Répartition de charge
- **CloudFront** - CDN global
- **RDS PostgreSQL** - Base de données relationnelle
- **ElastiCache Redis** - Cache en mémoire
- **S3** - Stockage d'objets
- **ECR** - Registry Docker
- **CloudWatch** - Monitoring et logs
- **VPC** - Réseau privé virtuel

### Coûts Estimés (USD/mois)
- **Développement** : ~$50-80/mois
- **Production** : ~$200-400/mois
- **Enterprise** : ~$800-1500/mois

## 🔧 Prérequis

### 1. Outils Requis
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Configuration AWS
```bash
# Configurer les credentials AWS
aws configure

# Vérifier la configuration
aws sts get-caller-identity
```

### 3. Permissions IAM Requises
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "ecs:*",
                "ecr:*",
                "rds:*",
                "elasticache:*",
                "s3:*",
                "cloudfront:*",
                "iam:*",
                "logs:*",
                "cloudwatch:*",
                "application-autoscaling:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🚀 Déploiement Rapide

### Option 1: Déploiement Automatique
```bash
# Cloner le projet
git clone https://github.com/LnDevAi/E_COMPTA_IA.git
cd E_COMPTA_IA

# Lancer le déploiement complet
./deploy.sh
```

### Option 2: Déploiement Manuel

#### Étape 1: Préparation
```bash
# Installer les dépendances
npm install

# Build de production
npm run build --prod

# Build de l'image Docker
docker build -t e-compta-ia-frontend:latest .
```

#### Étape 2: Infrastructure Terraform
```bash
cd terraform

# Initialiser Terraform
terraform init

# Planifier le déploiement
terraform plan -var="aws_region=eu-west-1" -var="environment=production"

# Appliquer l'infrastructure
terraform apply
```

#### Étape 3: Déploiement des Images
```bash
# Créer les repositories ECR
aws ecr create-repository --repository-name e-compta-ia-frontend --region eu-west-1

# Login ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com

# Push des images
docker tag e-compta-ia-frontend:latest ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/e-compta-ia-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/e-compta-ia-frontend:latest
```

## 🎛️ Options de Déploiement

### Déploiement par Environnement

#### Développement
```bash
./deploy.sh plan
```

#### Production
```bash
./deploy.sh
```

#### Mise à jour
```bash
./deploy.sh update
```

#### Destruction
```bash
./deploy.sh destroy
```

## 🔧 Configuration Post-Déploiement

### 1. Configuration du Domaine
```bash
# Obtenir l'URL CloudFront
cd terraform
terraform output cloudfront_domain

# Configurer votre DNS
# CNAME: votre-domaine.com -> d1234567890.cloudfront.net
```

### 2. Certificat SSL
```bash
# Demander un certificat ACM
aws acm request-certificate \
    --domain-name votre-domaine.com \
    --validation-method DNS \
    --region us-east-1
```

### 3. Variables d'Environnement
```bash
# Mettre à jour les variables ECS
aws ecs update-service \
    --cluster e-compta-ia-cluster \
    --service e-compta-ia-frontend \
    --task-definition e-compta-ia-frontend:REVISION
```

## 📊 Monitoring et Maintenance

### CloudWatch Dashboard
- **URL**: `https://console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=e-compta-ia-dashboard`
- **Métriques**: CPU, Mémoire, Requêtes, Temps de réponse

### Logs
```bash
# Logs Frontend
aws logs tail /ecs/e-compta-ia-frontend --follow

# Logs Backend
aws logs tail /ecs/e-compta-ia-backend --follow
```

### Sauvegarde
```bash
# Snapshot RDS automatique (configuré à 7 jours)
aws rds describe-db-snapshots --db-instance-identifier e-compta-ia-db

# Backup S3 avec versioning activé
aws s3api list-object-versions --bucket e-compta-ia-storage-XXXX
```

## 🔐 Sécurité

### 1. Chiffrement
- **RDS**: Chiffrement au repos activé
- **S3**: Chiffrement AES-256
- **Redis**: Chiffrement en transit et au repos
- **ECS**: Secrets Manager pour les variables sensibles

### 2. Réseau
- **VPC**: Réseau privé isolé
- **Subnets**: Publics (ALB) et privés (ECS, RDS)
- **Security Groups**: Accès restreint par service
- **NAT Gateway**: Accès internet sortant sécurisé

### 3. IAM
- **Roles**: Principe du moindre privilège
- **Policies**: Accès granulaire par service
- **Task Roles**: Permissions spécifiques aux containers

## 🚨 Dépannage

### Problèmes Courants

#### 1. Échec de déploiement ECS
```bash
# Vérifier les logs
aws ecs describe-services --cluster e-compta-ia-cluster --services e-compta-ia-frontend

# Vérifier les tasks
aws ecs list-tasks --cluster e-compta-ia-cluster --service-name e-compta-ia-frontend
```

#### 2. Base de données inaccessible
```bash
# Vérifier la connectivité
aws rds describe-db-instances --db-instance-identifier e-compta-ia-db

# Test de connexion depuis ECS
aws ecs run-task --cluster e-compta-ia-cluster --task-definition test-db-connection
```

#### 3. Images Docker non trouvées
```bash
# Lister les images ECR
aws ecr list-images --repository-name e-compta-ia-frontend

# Re-push si nécessaire
docker push ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/e-compta-ia-frontend:latest
```

### Commandes de Debug
```bash
# Status général
aws ecs describe-clusters --clusters e-compta-ia-cluster

# Health checks ALB
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN

# Métriques CloudWatch
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value=e-compta-ia-frontend \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-01T23:59:59Z \
    --period 300 \
    --statistics Average
```

## 📈 Scaling et Performance

### Auto Scaling
```bash
# Configurer l'auto-scaling ECS
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id service/e-compta-ia-cluster/e-compta-ia-frontend \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 2 \
    --max-capacity 10
```

### Optimisations
1. **CloudFront**: Cache statique 1 an, API non cachée
2. **RDS**: Read replicas pour les lectures
3. **Redis**: Cache applicatif pour les données fréquentes
4. **ECS**: Fargate Spot pour réduire les coûts

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommandé)
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: ./deploy.sh update
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### AWS CodePipeline
```bash
# Créer un pipeline CodePipeline
aws codepipeline create-pipeline --cli-input-json file://pipeline.json
```

## 📞 Support

### Ressources
- **Documentation AWS**: https://docs.aws.amazon.com/
- **Terraform Registry**: https://registry.terraform.io/
- **Docker Hub**: https://hub.docker.com/

### Contacts
- **Équipe DevOps**: devops@e-compta-ia.com
- **Support Technique**: support@e-compta-ia.com

---

## 🎯 Checklist de Déploiement

- [ ] AWS CLI configuré
- [ ] Terraform installé
- [ ] Docker installé
- [ ] Permissions IAM configurées
- [ ] Variables d'environnement définies
- [ ] Domaine DNS configuré
- [ ] Certificat SSL demandé
- [ ] Tests de santé validés
- [ ] Monitoring configuré
- [ ] Sauvegardes programmées
- [ ] Pipeline CI/CD configuré

**🚀 Votre plateforme E-COMPTA-IA est maintenant prête pour la production !**