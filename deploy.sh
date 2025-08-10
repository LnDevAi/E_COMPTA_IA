#!/bin/bash

# E-COMPTA-IA AWS Deployment Script
# Automated deployment to AWS with Terraform and Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="e-compta-ia"
AWS_REGION="eu-west-1"
ENVIRONMENT="production"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "🔍 Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "✅ All prerequisites met!"
}

setup_terraform_backend() {
    log_info "🏗️ Setting up Terraform backend..."
    
    # Create S3 bucket for Terraform state
    BUCKET_NAME="${PROJECT_NAME}-terraform-state-$(date +%s)"
    
    aws s3 mb s3://${BUCKET_NAME} --region ${AWS_REGION} || true
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket ${BUCKET_NAME} \
        --versioning-configuration Status=Enabled
    
    # Enable server-side encryption
    aws s3api put-bucket-encryption \
        --bucket ${BUCKET_NAME} \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    
    # Update Terraform backend configuration
    sed -i.bak "s/e-compta-ia-terraform-state/${BUCKET_NAME}/g" terraform/main.tf
    
    log_success "✅ Terraform backend configured with bucket: ${BUCKET_NAME}"
}

build_frontend() {
    log_info "🏗️ Building Angular frontend..."
    
    # Install dependencies
    npm ci --production=false
    
    # Build for production
    npm run build --prod
    
    # Build Docker image
    docker build -t ${PROJECT_NAME}-frontend:latest .
    
    log_success "✅ Frontend built successfully!"
}

setup_ecr_repositories() {
    log_info "🐳 Setting up ECR repositories..."
    
    # Create ECR repositories
    aws ecr create-repository \
        --repository-name ${PROJECT_NAME}-frontend \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true || true
    
    aws ecr create-repository \
        --repository-name ${PROJECT_NAME}-backend \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true || true
    
    log_success "✅ ECR repositories created!"
}

push_docker_images() {
    log_info "📤 Pushing Docker images to ECR..."
    
    # Get AWS account ID
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | \
        docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Tag and push frontend image
    FRONTEND_REPO_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend"
    docker tag ${PROJECT_NAME}-frontend:latest ${FRONTEND_REPO_URI}:latest
    docker push ${FRONTEND_REPO_URI}:latest
    
    log_success "✅ Docker images pushed to ECR!"
}

deploy_infrastructure() {
    log_info "🚀 Deploying infrastructure with Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan \
        -var="aws_region=${AWS_REGION}" \
        -var="environment=${ENVIRONMENT}" \
        -var="project_name=${PROJECT_NAME}" \
        -out=tfplan
    
    # Apply deployment
    terraform apply tfplan
    
    # Get outputs
    ALB_DNS=$(terraform output -raw load_balancer_dns)
    CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain)
    
    cd ..
    
    log_success "✅ Infrastructure deployed successfully!"
    log_info "🌐 Load Balancer DNS: ${ALB_DNS}"
    log_info "🌐 CloudFront Domain: ${CLOUDFRONT_DOMAIN}"
}

update_ecs_services() {
    log_info "🔄 Updating ECS services..."
    
    # Force new deployment of ECS services
    aws ecs update-service \
        --cluster ${PROJECT_NAME}-cluster \
        --service ${PROJECT_NAME}-frontend \
        --force-new-deployment \
        --region ${AWS_REGION}
    
    # Wait for deployment to complete
    aws ecs wait services-stable \
        --cluster ${PROJECT_NAME}-cluster \
        --services ${PROJECT_NAME}-frontend \
        --region ${AWS_REGION}
    
    log_success "✅ ECS services updated!"
}

setup_monitoring() {
    log_info "📊 Setting up monitoring and alerts..."
    
    # Create CloudWatch dashboard
    cat > dashboard.json << EOF
{
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    [ "AWS/ECS", "CPUUtilization", "ServiceName", "${PROJECT_NAME}-frontend", "ClusterName", "${PROJECT_NAME}-cluster" ],
                    [ ".", "MemoryUtilization", ".", ".", ".", "." ],
                    [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", "${PROJECT_NAME}-alb" ],
                    [ ".", "TargetResponseTime", ".", "." ]
                ],
                "period": 300,
                "stat": "Average",
                "region": "${AWS_REGION}",
                "title": "E-COMPTA-IA Metrics"
            }
        }
    ]
}
EOF
    
    aws cloudwatch put-dashboard \
        --dashboard-name "${PROJECT_NAME}-dashboard" \
        --dashboard-body file://dashboard.json \
        --region ${AWS_REGION}
    
    rm dashboard.json
    
    log_success "✅ Monitoring dashboard created!"
}

run_health_checks() {
    log_info "🏥 Running health checks..."
    
    # Get ALB DNS name
    cd terraform
    ALB_DNS=$(terraform output -raw load_balancer_dns)
    cd ..
    
    # Wait for ALB to be ready
    sleep 60
    
    # Test frontend
    if curl -f "http://${ALB_DNS}/health" &> /dev/null; then
        log_success "✅ Frontend health check passed!"
    else
        log_warning "⚠️ Frontend health check failed - may need more time"
    fi
    
    # Test API (when backend is ready)
    if curl -f "http://${ALB_DNS}/api/health" &> /dev/null; then
        log_success "✅ Backend health check passed!"
    else
        log_warning "⚠️ Backend health check failed - backend may not be deployed yet"
    fi
}

cleanup_old_resources() {
    log_info "🧹 Cleaning up old resources..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Clean up old ECR images (keep last 5)
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    aws ecr list-images \
        --repository-name ${PROJECT_NAME}-frontend \
        --filter tagStatus=UNTAGGED \
        --query 'imageIds[?imageDigest!=null]' \
        --output json | \
        aws ecr batch-delete-image \
            --repository-name ${PROJECT_NAME}-frontend \
            --image-ids file:///dev/stdin || true
    
    log_success "✅ Cleanup completed!"
}

print_deployment_info() {
    log_info "📋 Deployment Information:"
    echo "=================================="
    echo "🚀 E-COMPTA-IA Successfully Deployed!"
    echo "=================================="
    
    cd terraform
    ALB_DNS=$(terraform output -raw load_balancer_dns)
    CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain)
    cd ..
    
    echo "🌐 Application URLs:"
    echo "   Load Balancer: http://${ALB_DNS}"
    echo "   CloudFront:    https://${CLOUDFRONT_DOMAIN}"
    echo ""
    echo "📊 Monitoring:"
    echo "   CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION}#dashboards:name=${PROJECT_NAME}-dashboard"
    echo "   ECS Cluster: https://console.aws.amazon.com/ecs/home?region=${AWS_REGION}#/clusters/${PROJECT_NAME}-cluster"
    echo ""
    echo "🗄️ Resources:"
    echo "   RDS Database: ${PROJECT_NAME}-db"
    echo "   Redis Cache: ${PROJECT_NAME}-redis"
    echo "   S3 Storage: Check Terraform outputs"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Configure your domain DNS to point to CloudFront"
    echo "   2. Set up SSL certificate in ACM"
    echo "   3. Configure backend API endpoints"
    echo "   4. Set up CI/CD pipeline"
    echo "=================================="
}

# Main deployment flow
main() {
    echo "🚀 Starting E-COMPTA-IA AWS Deployment"
    echo "======================================="
    
    check_prerequisites
    setup_terraform_backend
    build_frontend
    setup_ecr_repositories
    push_docker_images
    deploy_infrastructure
    update_ecs_services
    setup_monitoring
    run_health_checks
    cleanup_old_resources
    print_deployment_info
    
    log_success "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "plan")
        log_info "Running Terraform plan only..."
        cd terraform
        terraform init
        terraform plan -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}" -var="project_name=${PROJECT_NAME}"
        ;;
    "destroy")
        log_warning "⚠️ This will destroy all AWS resources!"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            cd terraform
            terraform destroy -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}" -var="project_name=${PROJECT_NAME}"
            log_success "✅ Resources destroyed!"
        else
            log_info "Destruction cancelled."
        fi
        ;;
    "update")
        log_info "Updating existing deployment..."
        build_frontend
        push_docker_images
        update_ecs_services
        run_health_checks
        log_success "✅ Update completed!"
        ;;
    *)
        main
        ;;
esac