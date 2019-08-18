
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/user/auth.service';
import { Plugins } from '@capacitor/core';
import { FacebookLoginResponse } from '@rdlabo/capacitor-facebook-login';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showPass: boolean;
  public loginForm: FormGroup;
  public loading: HTMLIonLoadingElement;

  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {

      this.loginForm = this.formBuilder.group({
        email: ['',
          Validators.compose([Validators.required, Validators.email])],
        password: [
          '',
          Validators.compose([Validators.required, Validators.minLength(6)]),
        ],
      });

   }

  async ngOnInit() {
  }

  async showErrorAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: [{ text: 'Ok', role: 'cancel' }],
    });
    await alert.present();
  }

  async emailLogin(loginForm: FormGroup): Promise<void> {
    if (!loginForm.valid) {
      console.log('Form is not valid yet, current value:', loginForm.value);
    } else {

      const email = loginForm.value.email;
      const password = loginForm.value.password;
      const result = await this.authService.loginWithEmail(email, password);
      console.log('[Email login]: result=> ', result);
      if ( !result.error ) {
        // success
        this.router.navigateByUrl('');
      } else {
        // failed
        let errorMessage = 'Login failed. Try again later';
        if ( result.error.message ) {
          errorMessage = result.error.message;
        }
        this.showErrorAlert(errorMessage);
      }
    }
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

  toggleShowPass() {
    this.showPass = !this.showPass;
  }

  gotoSignUp() {
    this.router.navigateByUrl('/signup');
  }

}
