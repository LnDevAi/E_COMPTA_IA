#!/bin/bash

# ===================================================
# SCRIPT DE DÉPLOIEMENT AWS - E-COMPTA-IA
# Automatisation complète du déploiement
# ===================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables par défaut
PROJECT_NAME="e-compta-ia"
AWS_REGION="us-west-2"
ENVIRONMENT="prod"

# ===================================================
# FONCTIONS UTILITAIRES
# ===================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI n'est pas installé. Installez-le d'abord."
    fi
    
    # Vérifier Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform n'est pas installé. Installez-le d'abord."
    fi
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé. Installez-le d'abord."
    fi
    
    # Vérifier les credentials AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        error "Credentials AWS non configurés. Exécutez 'aws configure'."
    fi
    
    log "✅ Tous les prérequis sont satisfaits"
}

# ===================================================
# FONCTIONS DE DÉPLOIEMENT
# ===================================================

deploy_infrastructure() {
    log "🏗️ Déploiement de l'infrastructure Terraform..."
    
    cd aws/terraform
    
    # Initialiser Terraform
    info "Initialisation de Terraform..."
    terraform init
    
    # Valider la configuration
    info "Validation de la configuration..."
    terraform validate
    
    # Planifier le déploiement
    info "Planification du déploiement..."
    if [ -f "terraform.tfvars" ]; then
        terraform plan -var-file="terraform.tfvars"
    else
        warn "terraform.tfvars non trouvé, utilisation des valeurs par défaut"
        terraform plan
    fi
    
    # Demander confirmation
    echo
    read -p "Voulez-vous continuer avec le déploiement ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warn "Déploiement annulé"
        exit 0
    fi
    
    # Appliquer la configuration
    info "Application de la configuration..."
    if [ -f "terraform.tfvars" ]; then
        terraform apply -var-file="terraform.tfvars" -auto-approve
    else
        terraform apply -auto-approve
    fi
    
    # Obtenir les outputs
    ECR_URL=$(terraform output -raw ecr_repository_url)
    APPLICATION_URL=$(terraform output -raw application_url)
    
    log "✅ Infrastructure déployée avec succès"
    log "📦 ECR Repository: $ECR_URL"
    log "🌐 Application URL: $APPLICATION_URL"
    
    cd ../..
    
    # Exporter les variables pour les étapes suivantes
    export ECR_URL
    export APPLICATION_URL
}

build_and_push_image() {
    log "🐳 Build et push de l'image Docker..."
    
    if [ -z "$ECR_URL" ]; then
        error "ECR_URL non défini. Exécutez d'abord deploy_infrastructure()"
    fi
    
    # Login ECR
    info "Connexion à ECR..."
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_URL
    
    # Build de l'image
    info "Build de l'image Docker..."
    docker build -t $PROJECT_NAME .
    
    # Tag pour ECR
    info "Tag de l'image pour ECR..."
    docker tag $PROJECT_NAME:latest $ECR_URL:latest
    docker tag $PROJECT_NAME:latest $ECR_URL:$(date +%Y%m%d-%H%M%S)
    
    # Push vers ECR
    info "Push vers ECR..."
    docker push $ECR_URL:latest
    docker push $ECR_URL:$(date +%Y%m%d-%H%M%S)
    
    log "✅ Image Docker déployée sur ECR"
}

deploy_application() {
    log "🚀 Déploiement de l'application ECS..."
    
    # Forcer le redéploiement du service ECS
    info "Mise à jour du service ECS..."
    aws ecs update-service \
        --cluster ${PROJECT_NAME}-cluster \
        --service ${PROJECT_NAME}-service \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    
    # Attendre que le service soit stable
    info "Attente de la stabilisation du service..."
    aws ecs wait services-stable \
        --cluster ${PROJECT_NAME}-cluster \
        --services ${PROJECT_NAME}-service \
        --region $AWS_REGION
    
    log "✅ Application déployée avec succès"
}

check_health() {
    log "🩺 Vérification de la santé de l'application..."
    
    if [ -z "$APPLICATION_URL" ]; then
        cd aws/terraform
        APPLICATION_URL=$(terraform output -raw application_url)
        cd ../..
    fi
    
    # Attendre que l'application soit accessible
    info "Vérification de l'accessibilité..."
    for i in {1..30}; do
        if curl -f -s "${APPLICATION_URL}/health" > /dev/null; then
            log "✅ Application accessible et en bonne santé"
            return 0
        fi
        info "Tentative $i/30 - En attente..."
        sleep 10
    done
    
    warn "⚠️ L'application n'est pas encore accessible. Vérifiez les logs."
    return 1
}

show_summary() {
    log "📋 Résumé du déploiement"
    
    cd aws/terraform
    
    echo
    echo "🎯 URLs importantes:"
    echo "   Application: $(terraform output -raw application_url)"
    echo "   API: $(terraform output -raw api_url)"
    echo "   CloudFront: https://$(terraform output -raw cloudfront_domain_name)"
    echo
    
    echo "📊 Infrastructure:"
    echo "   Cluster ECS: $(terraform output -raw ecs_cluster_id)"
    echo "   Base de données: $(terraform output -raw rds_endpoint)"
    echo "   Stockage S3: $(terraform output -raw s3_app_storage_bucket)"
    echo
    
    echo "💰 Coût estimé:"
    terraform output estimated_monthly_cost
    echo
    
    cd ../..
    
    log "🎉 Déploiement terminé avec succès !"
}

# ===================================================
# FONCTIONS DE GESTION
# ===================================================

undeploy() {
    log "🗑️ Suppression de l'infrastructure..."
    
    cd aws/terraform
    
    echo
    warn "⚠️ ATTENTION: Cette action va supprimer TOUTE l'infrastructure AWS !"
    read -p "Êtes-vous sûr de vouloir continuer ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warn "Suppression annulée"
        exit 0
    fi
    
    if [ -f "terraform.tfvars" ]; then
        terraform destroy -var-file="terraform.tfvars" -auto-approve
    else
        terraform destroy -auto-approve
    fi
    
    cd ../..
    
    log "✅ Infrastructure supprimée"
}

logs() {
    log "📝 Affichage des logs ECS..."
    
    aws logs tail "/ecs/${PROJECT_NAME}" --follow --region $AWS_REGION
}

status() {
    log "📊 Status de l'infrastructure..."
    
    cd aws/terraform
    
    if [ ! -f "terraform.tfstate" ]; then
        warn "Aucune infrastructure déployée"
        exit 0
    fi
    
    terraform refresh > /dev/null
    terraform output infrastructure_summary
    
    cd ../..
}

# ===================================================
# FONCTION PRINCIPALE
# ===================================================

usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  deploy    - Déployer l'infrastructure et l'application complètes"
    echo "  infra     - Déployer uniquement l'infrastructure"
    echo "  app       - Déployer uniquement l'application"
    echo "  undeploy  - Supprimer l'infrastructure"
    echo "  status    - Afficher le status de l'infrastructure"
    echo "  logs      - Afficher les logs de l'application"
    echo "  health    - Vérifier la santé de l'application"
    echo "  help      - Afficher cette aide"
    echo
    echo "Variables d'environnement:"
    echo "  AWS_REGION    - Région AWS (défaut: us-west-2)"
    echo "  ENVIRONMENT   - Environnement (défaut: prod)"
    echo "  PROJECT_NAME  - Nom du projet (défaut: e-compta-ia)"
    echo
}

main() {
    # Traitement des arguments
    case "${1:-}" in
        "deploy")
            check_prerequisites
            deploy_infrastructure
            build_and_push_image
            deploy_application
            sleep 30  # Attendre que l'application démarre
            check_health
            show_summary
            ;;
        "infra")
            check_prerequisites
            deploy_infrastructure
            ;;
        "app")
            check_prerequisites
            # Récupérer l'URL ECR depuis Terraform
            cd aws/terraform
            ECR_URL=$(terraform output -raw ecr_repository_url)
            APPLICATION_URL=$(terraform output -raw application_url)
            cd ../..
            export ECR_URL APPLICATION_URL
            build_and_push_image
            deploy_application
            check_health
            ;;
        "undeploy")
            undeploy
            ;;
        "status")
            status
            ;;
        "logs")
            logs
            ;;
        "health")
            check_health
            ;;
        "help"|"")
            usage
            ;;
        *)
            error "Commande inconnue: $1. Utilisez '$0 help' pour l'aide."
            ;;
    esac
}

# ===================================================
# EXÉCUTION
# ===================================================

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "aws/terraform" ]; then
    error "Ce script doit être exécuté depuis la racine du projet E-COMPTA-IA"
fi

# Traitement des variables d'environnement
AWS_REGION=${AWS_REGION:-$AWS_REGION}
ENVIRONMENT=${ENVIRONMENT:-$ENVIRONMENT}
PROJECT_NAME=${PROJECT_NAME:-$PROJECT_NAME}

log "🚀 Script de déploiement E-COMPTA-IA"
log "   Projet: $PROJECT_NAME"
log "   Environnement: $ENVIRONMENT"
log "   Région AWS: $AWS_REGION"
echo

main "$@"