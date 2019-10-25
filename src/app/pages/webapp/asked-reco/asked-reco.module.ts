import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AskedRecoPage } from './asked-reco.page';
import { RecoCardComponent } from './reco-card/reco-card.component';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';

const routes: Routes = [
  {
    path: ':id/:lat/:lng',
    component: AskedRecoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AskedRecoPage,
    RecoCardComponent,
    GoogleMapComponent
  ],
  entryComponents: [
    RecoCardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AskedRecoPageModule {}