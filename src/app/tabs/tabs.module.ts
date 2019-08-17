import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';
import { TabsPageRoutingModule } from './tabs-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    RouterModule.forChild([
      {
        path: '',
        component: TabsPage
      }
    ])
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
