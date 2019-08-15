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
                path: 'my-trips',
                children: [
                    {
                        path: '',
                        loadChildren: '../pages/my-trips/my-trips.module#MyTripsPageModule'
                    }
                ]
            },
            {
                path: 'friends',
                children: [
                    {
                        path: '',
                        loadChildren: '../pages/friends/friends.module#FriendsPageModule'
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