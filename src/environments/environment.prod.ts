export const environment = {
  production: true,
  name: 'production',
  
  // Configuration Amplify (sera automatiquement généré par Amplify CLI)
  amplify: {
    region: 'us-west-2',
    apiUrl: 'https://api.e-compta-ia.com',
    cognitoDomain: 'auth.e-compta-ia.com'
  },
  
  // Configuration application
  app: {
    name: 'E-COMPTA-IA',
    version: '1.0.0',
    description: 'Plateforme Comptable SYSCOHADA avec IA'
  }
};