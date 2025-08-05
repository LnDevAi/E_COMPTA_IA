import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { PlanComptableComponent } from './components/plan-comptable/plan-comptable.component';

const routes: Routes = [
  {
    path: '',
    component: PlanComptableComponent
  }
];

@NgModule({
  declarations: [
    PlanComptableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PlanComptableModule { }