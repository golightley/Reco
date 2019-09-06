import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExplorerPage } from './explorer.page';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import {FilterModalComponent} from './filter-modal/filter-modal.component';
import { RecoPlaceModalComponent } from './reco-place-modal/reco-place-modal.component';
const routes: Routes = [
  {
    path: '',
    component: ExplorerPage
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
    ExplorerPage,
    GoogleMapComponent,
    FilterModalComponent,
    RecoPlaceModalComponent
  ],
  entryComponents: [FilterModalComponent, RecoPlaceModalComponent]
})
export class ExplorerPageModule {}
