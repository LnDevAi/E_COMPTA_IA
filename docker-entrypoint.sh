#!/bin/sh

# Docker entrypoint script for E-COMPTA-IA
# Handles environment variable substitution and startup

set -e

# Default environment variables
export API_URL=${API_URL:-"https://api.e-compta-ia.com"}
export APP_ENV=${APP_ENV:-"production"}
export AWS_REGION=${AWS_REGION:-"eu-west-1"}

# Function to substitute environment variables in files
substitute_env_vars() {
    echo "🔧 Substituting environment variables..."
    
    # Create environment configuration for Angular
    cat > /usr/share/nginx/html/assets/config/env.json << EOF
{
  "apiUrl": "${API_URL}",
  "environment": "${APP_ENV}",
  "awsRegion": "${AWS_REGION}",
  "version": "${APP_VERSION:-1.0.0}",
  "features": {
    "ai": ${ENABLE_AI:-true},
    "multiCountry": ${ENABLE_MULTI_COUNTRY:-true},
    "advancedReporting": ${ENABLE_ADVANCED_REPORTING:-true}
  }
}
EOF

    echo "✅ Environment configuration created"
}

# Function to setup logging
setup_logging() {
    echo "📝 Setting up logging..."
    
    # Ensure log directory exists
    mkdir -p /var/log/nginx
    
    # Create log files if they don't exist
    touch /var/log/nginx/access.log
    touch /var/log/nginx/error.log
    
    echo "✅ Logging configured"
}

# Function to validate configuration
validate_config() {
    echo "🔍 Validating configuration..."
    
    # Test nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration is invalid"
        exit 1
    fi
}

# Function to setup health check
setup_health_check() {
    echo "🏥 Setting up health check..."
    
    # Create health check file
    echo "healthy" > /usr/share/nginx/html/health
    
    echo "✅ Health check configured"
}

# Main execution
main() {
    echo "🚀 Starting E-COMPTA-IA Frontend Container..."
    echo "📊 Environment: ${APP_ENV}"
    echo "🌐 API URL: ${API_URL}"
    echo "☁️  AWS Region: ${AWS_REGION}"
    
    # Run setup functions
    substitute_env_vars
    setup_logging
    setup_health_check
    validate_config
    
    echo "✅ Container initialization complete!"
    echo "🎯 Starting Nginx server..."
    
    # Execute the main command
    exec "$@"
}

# Handle signals gracefully
trap 'echo "🛑 Received shutdown signal, stopping gracefully..."; exit 0' SIGTERM SIGINT

# Run main function
main "$@"