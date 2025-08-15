import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  kpis = [
    {
      title: 'Chiffre d\'Affaires',
      value: '2,450,000',
      unit: 'FCFA',
      evolution: '+12.5%',
      positive: true,
      icon: 'trending_up',
      color: '#4caf50'
    },
    {
      title: 'Créances Clients',
      value: '850,000',
      unit: 'FCFA',
      evolution: '-5.2%',
      positive: true,
      icon: 'account_balance_wallet',
      color: '#2196f3'
    },
    {
      title: 'Dettes Fournisseurs',
      value: '620,000',
      unit: 'FCFA',
      evolution: '+8.1%',
      positive: false,
      icon: 'payment',
      color: '#ff9800'
    },
    {
      title: 'Trésorerie',
      value: '1,250,000',
      unit: 'FCFA',
      evolution: '+15.3%',
      positive: true,
      icon: 'savings',
      color: '#9c27b0'
    }
  ];

  ratiosAudcif = [
    { label: 'Ratio de Liquidité Générale', value: '1.45', target: '> 1.2', status: 'good' },
    { label: 'Ratio d\'Endettement', value: '0.35', target: '< 0.5', status: 'good' },
    { label: 'Rentabilité Nette', value: '8.2%', target: '> 5%', status: 'good' },
    { label: 'Rotation des Stocks', value: '12.5', target: '> 10', status: 'good' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}