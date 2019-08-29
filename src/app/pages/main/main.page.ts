import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/user/auth.service';
import { AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { FacebookLoginResponse } from '@rdlabo/capacitor-facebook-login';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  constructor(
    private authService: AuthService,
    public alertCtrl: AlertController,
    private router: Router
    ) { }

  ngOnInit() {
  }

  async capacitorFbLogin() {
    const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];  /* , 'user_friends', 'user_birthday', 'user_photos', 'user_gender' */
    Plugins.FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS })
    .then(async (result: FacebookLoginResponse)  => {
      if (result.accessToken) {
        // Login successful.
        console.log(`Facebook access token is ${result.accessToken.token}`);
        console.log('Logged into Facebook!', result);
        this.onFbLoginSuccess(result.accessToken);
      } else {
        console.log('fb login error', result);
        const message = 'facebook login failed';
        this.showErrorAlert(message);
      }
    });
  }

  async onFbLoginSuccess(accessToken) {
    const facebookCredential = firebase.auth.FacebookAuthProvider.credential(accessToken.token);
    const result = await this.authService.loginWithFacebookToken(facebookCredential);
    console.log('result', result);
    if ( !result.error ) {
      this.router.navigateByUrl('');
    } else {
      let errorMessage = 'Facebook login failed. Try again later';
      if ( result.error.message ) {
        errorMessage = result.error.message;
      }
      // error code : "auth/account-exists-with-different-credential"
      this.showErrorAlert(errorMessage);
    }
  }

  gotoEmailLogin() {
    this.router.navigateByUrl('/login');
  }

  async showErrorAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: [{ text: 'Ok', role: 'cancel' }],
    });
    await alert.present();
  }

}
