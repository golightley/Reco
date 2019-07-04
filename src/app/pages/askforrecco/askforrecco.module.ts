import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AskforreccoPage } from './askforrecco.page';

const routes: Routes = [
  {
    path: '',
    component: AskforreccoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AskforreccoPage]
})
export class AskforreccoPageModule {}
