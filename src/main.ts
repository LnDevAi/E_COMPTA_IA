import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

// Configuration Amplify (sera ajoutée plus tard)
// import { Amplify } from 'aws-amplify';
// import awsExports from './aws-exports';
// Amplify.configure(awsExports);

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
             RouterModule.forRoot([
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard', loadComponent: () => import('./app/components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
        { path: 'bank-reconciliation', loadComponent: () => import('./app/components/bank-reconciliation/bank-reconciliation.component').then(m => m.BankReconciliationComponent) },
        { path: 'financial-statements', loadComponent: () => import('./app/components/financial-statements/financial-statements.component').then(m => m.FinancialStatementsComponent) },
        { path: 'tax-declarations', loadComponent: () => import('./app/components/tax-declarations/tax-declarations.component').then(m => m.TaxDeclarationsComponent) },
        { path: 'enterprise', loadComponent: () => import('./app/components/enterprise/enterprise.component').then(m => m.EnterpriseComponent) },
        { path: '**', redirectTo: '/dashboard' }
      ])
    )
  ]
}).catch(err => console.error(err));