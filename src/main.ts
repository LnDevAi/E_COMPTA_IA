import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

// Configuration Amplify (sera ajoutée plus tard)
// import { Amplify } from 'aws-amplify';
// import awsExports from './aws-exports';
// Amplify.configure(awsExports);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule,
      RouterModule.forRoot([
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard', loadComponent: () => import('./app/components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
        { path: 'bank-reconciliation', loadComponent: () => import('./app/components/bank-reconciliation/bank-reconciliation.component').then(m => m.BankReconciliationComponent) },
        { path: 'financial-statements', loadComponent: () => import('./app/components/financial-statements/financial-statements.component').then(m => m.FinancialStatementsComponent) },
        { path: 'tax-declarations', loadComponent: () => import('./app/components/tax-declarations/tax-declarations.component').then(m => m.TaxDeclarationsComponent) },
        { path: 'enterprise', loadComponent: () => import('./app/components/enterprise/enterprise.component').then(m => m.EnterpriseComponent) },
        { path: 'journals', loadComponent: () => import('./app/components/journals/journals.component').then(m => m.JournalsComponent) },
        { path: 'ledgers', loadComponent: () => import('./app/components/ledgers/ledgers.component').then(m => m.LedgersComponent) },
        { path: 'chart-of-accounts', loadComponent: () => import('./app/components/chart-of-accounts/chart-of-accounts.component').then(m => m.ChartOfAccountsComponent) },
        { path: 'entries', loadComponent: () => import('./app/components/entries/entries.component').then(m => m.EntriesComponent) },
        { path: 'ai-assistant', loadComponent: () => import('./app/components/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent) },
        { path: '**', redirectTo: '/dashboard' }
      ], { useHash: true })
    )
  ]
}).catch(err => console.error(err));