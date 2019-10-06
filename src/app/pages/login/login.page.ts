
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/user/auth.service';


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

  toggleShowPass() {
    this.showPass = !this.showPass;
  }

  gotoSignUp() {
    this.router.navigateByUrl('/signup/app');
  }

}
