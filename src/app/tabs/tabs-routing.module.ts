import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'explorer',
                children: [
                    {
                        path: '',
                        loadChildren: '../pages/explorer/explorer.module#ExplorerPageModule'
                    }
                ]
            },
            {
                path: 'world',
                children: [
                    {
                        path: '',
                        loadChildren: '../pages/world-details/world-details.module#WorldDetailsPageModule'
                    }
                ]
            },
            {
                path: 'me',
                children: [
                    {
                        path: '',
                        loadChildren: '../pages/my-details/my-details.module#MyDetailsPageModule'
                    }
                ]
            }
        ]
    },
    {
        path: '',
        redirectTo: '/tabs/explorer',
        pathMatch: 'full' 
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }