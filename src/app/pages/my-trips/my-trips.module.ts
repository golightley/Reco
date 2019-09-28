import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MyTripsPage } from './my-trips.page';
import { CreatePlaceModalPage} from './create-place-modal/create-place-modal.page';
import { AskRecoModalPage} from './ask-reco-modal/ask-reco-modal.page';

const routes: Routes = [
  {
    path: '',
    component: MyTripsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    MyTripsPage,
    CreatePlaceModalPage,
    AskRecoModalPage
  ],
  entryComponents: [
    CreatePlaceModalPage,
    AskRecoModalPage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyTripsPageModule {}
