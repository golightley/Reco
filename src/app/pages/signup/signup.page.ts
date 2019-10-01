import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/user/auth.service';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public emailForm: FormGroup;
  public usernameForm: FormGroup;
  public loading: any;
  private showPass: boolean;
  userId: string;
  step: string;
  appType: string;
  backUrl: string;

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.emailForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        '',
        Validators.compose([Validators.minLength(6), Validators.required]),
      ],
    });
    this.usernameForm = this.formBuilder.group({
      handle: [
        '',
        Validators.compose([Validators.required]),
      ]
    });
  }

  ngOnInit( ) {
    this.step = 'email-register';
    this.userId = '';
    this.appType = this.route.snapshot.paramMap.get('type');
    console.log('App Type parameter => ' + this.appType);
    if (this.appType === 'app') {
      this.backUrl = '/login';
    } else {
      this.backUrl = '/webapp-user';
    }
  }

  async registerEmail(emailForm: FormGroup): Promise<void> {
    if (!emailForm.valid) {
      console.log(
        'Need to complete the form, current value: ', emailForm.value
      );
    } else {
      const email: string = emailForm.value.email;
      const password: string = emailForm.value.password;
      const result = await this.authService.registerEmail(email, password);
      console.log('result', result);
      if ( result.user ) {
        // success
        this.step = 'username-register';
        this.userId = result.user.uid;
      } else {
        let errorMessage = 'Email register failed. Try again later';
        if ( result.error.message ) {
          errorMessage = result.error.message;
        }
        this.showErrorAlert(errorMessage);
      }
    }
  }

  async registerUsername(usernameForm: FormGroup): Promise<void> {
    if (!usernameForm.valid || !this.userId) {
      console.log(
        'Need to complete the form, current value: ', usernameForm.value
      );
    } else {
      // username field
      const handle: string = usernameForm.value.handle;

      const result = await this.authService.registerUsername(this.userId, handle);
      console.log('result=> ', result);
      if ( result === 'success' ) {
        // if success
        if (this.appType === 'app') {
          // navigate to explorer page
          this.router.navigateByUrl('');
        } else {
          this.router.navigateByUrl('/app-download');
        }
      } else if ( result ==='duplicate' ){
        const errorMessage = 'Username already exists. please input another username.'
        this.showErrorAlert(errorMessage);
      } else {
        let errorMessage = 'Username register failed. Try again later';
        if ( result.error.message ) {
          errorMessage = result.error.message;
        }
        this.showErrorAlert(errorMessage);
      }
    }
  }

  async showErrorAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: [{ text: 'Ok', role: 'cancel' }],
    });
    await alert.present();
  }

  toggleShowPass() {
    this.showPass = !this.showPass;
  }

}
