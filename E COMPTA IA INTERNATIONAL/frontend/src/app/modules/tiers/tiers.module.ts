import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TiersComponent } from './components/tiers/tiers.component';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent
  }
];

@NgModule({
  declarations: [
    TiersComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class TiersModule { }