import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/user/auth.guard';


const routes: Routes = [
  {path:'', loadChildren:'./home/home.module#HomePageModule',  canActivate: [AuthGuard],
},
  {
    path: 'ask-for-recommendation/:id',
    loadChildren:
      './pages/askforrecco/askforrecco.module#AskforreccoPageModule',
  },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'reset-password', loadChildren: './pages/reset-password/reset-password.module#ResetPasswordPageModule' },
  { path: 'signup', loadChildren: './pages/signup/signup.module#SignupPageModule' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
