import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) 
  },
  { 
    path: 'entreprise', 
    loadChildren: () => import('./modules/entreprise/entreprise.module').then(m => m.EntrepriseModule) 
  },
  { 
    path: 'plan-comptable', 
    loadChildren: () => import('./modules/plan-comptable/plan-comptable.module').then(m => m.PlanComptableModule) 
  },
  { 
    path: 'tiers', 
    loadChildren: () => import('./modules/tiers/tiers.module').then(m => m.TiersModule) 
  },
  { 
    path: 'ecritures', 
    loadChildren: () => import('./modules/ecritures/ecritures.module').then(m => m.EcrituresModule) 
  },
  { 
    path: 'subscription', 
    loadChildren: () => import('./modules/subscription/subscription.module').then(m => m.SubscriptionModule) 
  },
  { 
    path: 'elearning', 
    loadChildren: () => import('./modules/elearning/elearning.module').then(m => m.ElearningModule) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }