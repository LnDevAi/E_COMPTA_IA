import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AssistantIAComponent } from './components/assistant-ia/assistant-ia.component';

const routes: Routes = [
  {
    path: '',
    component: AssistantIAComponent
  }
];

@NgModule({
  declarations: [
    AssistantIAComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AssistantIAModule { }