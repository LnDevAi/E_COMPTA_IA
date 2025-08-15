import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { EcrituresComponent } from './components/ecritures/ecritures.component';

const routes: Routes = [
  {
    path: '',
    component: EcrituresComponent
  }
];

@NgModule({
  declarations: [
    EcrituresComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class EcrituresModule { }