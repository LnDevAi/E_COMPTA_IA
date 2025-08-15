export const environment = {
  production: false,
  name: 'development',
  
  // Configuration Amplify (sera automatiquement généré par Amplify CLI)
  amplify: {
    region: 'us-west-2',
    apiUrl: 'https://dev-api.e-compta-ia.com',
    cognitoDomain: 'dev-auth.e-compta-ia.com'
  },
  
  // Backend API
  apiUrl: 'https://e-compta-ia-backend.dev',
  
  // Configuration application
  app: {
    name: 'E-COMPTA-IA',
    version: '1.0.0',
    description: 'Plateforme Comptable SYSCOHADA avec IA'
  }
};