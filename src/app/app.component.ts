import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'E COMPTA IA';
  
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de Bord', color: '#1976d2' },
    { path: '/entreprise', icon: 'business', label: 'Identité Entreprise', color: '#2e7d32' },
    { path: '/plan-comptable', icon: 'account_tree', label: 'Plan Comptable', color: '#7b1fa2' },
    { path: '/tiers', icon: 'people', label: 'Gestion Tiers', color: '#f57c00' },
    { path: '/ecritures', icon: 'edit', label: 'Saisie Écritures', color: '#d32f2f' },
    { path: '/assistant-ia', icon: 'smart_toy', label: 'Assistant IA', color: '#00796b' },
    { path: '/journaux', icon: 'book', label: 'Journaux', color: '#5d4037' },
    { path: '/grands-livres', icon: 'menu_book', label: 'Grands Livres', color: '#455a64' },
    { path: '/balances', icon: 'balance', label: 'Balances', color: '#e65100' },
    { path: '/rapprochements', icon: 'compare_arrows', label: 'Rapprochements', color: '#1565c0' },
    { path: '/etats-financiers', icon: 'assessment', label: 'États Financiers', color: '#ad1457' },
    { path: '/declarations', icon: 'receipt_long', label: 'Déclarations', color: '#6a1b9a' }
  ];
}