import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SubscriptionPlansComponent } from './components/subscription-plans/subscription-plans.component';
import { BillingDashboardComponent } from './components/billing-dashboard/billing-dashboard.component';
import { PaymentMethodsComponent } from './components/payment-methods/payment-methods.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { UsageStatsComponent } from './components/usage-stats/usage-stats.component';

// Services
import { SubscriptionService } from './services/subscription.service';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'plans', pathMatch: 'full' },
      { path: 'plans', component: SubscriptionPlansComponent },
      { path: 'billing', component: BillingDashboardComponent },
      { path: 'payment-methods', component: PaymentMethodsComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'usage', component: UsageStatsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SubscriptionPlansComponent,
    BillingDashboardComponent,
    PaymentMethodsComponent,
    InvoicesComponent,
    UsageStatsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: [
    SubscriptionService
  ],
  exports: [
    SubscriptionPlansComponent,
    BillingDashboardComponent,
    UsageStatsComponent
  ]
})
export class SubscriptionModule { }