import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/user/auth.guard';


const routes: Routes = [
  {path: '', loadChildren: './tabs/tabs.module#TabsPageModule',  canActivate: [AuthGuard] },
  { path: 'main', loadChildren: './pages/main/main.module#MainPageModule' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'reset-password', loadChildren: './pages/reset-password/reset-password.module#ResetPasswordPageModule' },
  { path: 'signup', loadChildren: './pages/signup/signup.module#SignupPageModule' },
  { path: 'ask-reco', loadChildren: './pages/webapp/ask-reco/ask-reco.module#AskRecoPageModule' },
  { path: 'asked-reco', loadChildren: './pages/webapp/asked-reco/asked-reco.module#AskedRecoPageModule' }, // new logic
  { path: 'webapp-user', loadChildren: './pages/webapp/webapp-user/webapp-user.module#WebappUserPageModule' },
  { path: 'app-download', loadChildren: './pages/webapp/app-download/app-download.module#AppDownloadPageModule' },
  { path: 'shared-reco', loadChildren: './pages/webapp/shared-reco/shared-reco.module#SharedRecoPageModule' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
