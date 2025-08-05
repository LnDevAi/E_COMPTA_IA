import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'entreprise', loadChildren: () => import('./modules/entreprise/entreprise.module').then(m => m.EntrepriseModule) },
  { path: 'plan-comptable', loadChildren: () => import('./modules/plan-comptable/plan-comptable.module').then(m => m.PlanComptableModule) },
  { path: 'tiers', loadChildren: () => import('./modules/tiers/tiers.module').then(m => m.TiersModule) },
  { path: 'ecritures', loadChildren: () => import('./modules/ecritures/ecritures.module').then(m => m.EcrituresModule) },
  { path: 'assistant-ia', loadChildren: () => import('./modules/assistant-ia/assistant-ia.module').then(m => m.AssistantIaModule) },
  { path: 'journaux', loadChildren: () => import('./modules/journaux/journaux.module').then(m => m.JournauxModule) },
  { path: 'grands-livres', loadChildren: () => import('./modules/grands-livres/grands-livres.module').then(m => m.GrandsLivresModule) },
  { path: 'balances', loadChildren: () => import('./modules/balances/balances.module').then(m => m.BalancesModule) },
  { path: 'rapprochements', loadChildren: () => import('./modules/rapprochements/rapprochements.module').then(m => m.RapprochmentsModule) },
  { path: 'etats-financiers', loadChildren: () => import('./modules/etats-financiers/etats-financiers.module').then(m => m.EtatsFinanciersModule) },
  { path: 'declarations', loadChildren: () => import('./modules/declarations/declarations.module').then(m => m.DeclarationsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }