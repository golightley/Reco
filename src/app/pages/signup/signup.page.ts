import { AskrecoService } from 'src/app/services/ask-reco.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/user/auth.service';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExplorerService } from 'src/app/services/explorer.service';
import { FriendService } from 'src/app/services/friend.service';

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
  recoIds: any[];
  backUrl: string;

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private askRecoService: AskrecoService,
    private explorerService: ExplorerService,
    private friendService: FriendService
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

  async ngOnInit( ) {
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
          // update recommendations with user id created
          const recoIds = await this.askRecoService.getAskedRecoId();
          await this.explorerService.updateRecommendations(recoIds);

          // make friend
          const askUserId =  JSON.parse(localStorage.getItem('askUserId'));
          await this.friendService.followUser(askUserId, true);

          localStorage.setItem('userId', JSON.stringify(this.userId));
          // navigate to reco page
          const askId = JSON.parse(localStorage.getItem('askId'));
          const askLat = JSON.parse(localStorage.getItem('askLat'));
          const askLng = JSON.parse(localStorage.getItem('askLng'));
          const url = `/asked-reco/${askId}/${askLat}/${askLng}`;
          this.router.navigateByUrl(url);
        }
      } else if ( result === 'duplicate' ){
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
