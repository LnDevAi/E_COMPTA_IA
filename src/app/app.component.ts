import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'E COMPTA IA - SYSCOHADA AUDCIF';
  
  menuItems = [
    { 
      title: 'Dashboard', 
      icon: 'dashboard', 
      route: '/dashboard',
      description: 'Vue d\'ensemble et KPIs'
    },
    { 
      title: 'Identité Entreprise', 
      icon: 'business', 
      route: '/entreprise',
      description: 'Configuration et paramétrage'
    },
    { 
      title: 'Plan Comptable', 
      icon: 'account_tree', 
      route: '/plan-comptable',
      description: 'Gestion du plan de comptes SYSCOHADA'
    },
    { 
      title: 'Gestion Tiers', 
      icon: 'people', 
      route: '/tiers',
      description: 'Clients, fournisseurs et partenaires'
    },
    { 
      title: 'Saisie Écritures', 
      icon: 'edit', 
      route: '/ecritures',
      description: 'Enregistrement des opérations comptables'
    },
    { 
      title: 'E-Learning', 
      icon: 'school', 
      route: '/elearning',
      description: 'Formation comptabilité SYSCOHADA'
    },
    { 
      title: 'Abonnement', 
      icon: 'card_membership', 
      route: '/subscription',
      description: 'Gestion de votre abonnement'
    }
  ];
}