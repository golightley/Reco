import { MytripService } from 'src/app/services/mytrip.service';
import { AuthService } from 'src/app/services/user/auth.service'
import { ModalController, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { Component, OnInit } from '@angular/core';
import { Email } from '@teamhive/capacitor-email';

@Component({
  selector: 'app-ask-reco-modal',
  templateUrl: './ask-reco-modal.page.html',
  styleUrls: ['./ask-reco-modal.page.scss'],
})
export class AskRecoModalPage implements OnInit {
  location: string;
  userName: string;
  smsContent: string;

  constructor(
    private modalController: ModalController,
    private mytripService: MytripService,
    public alertCtrl: AlertController,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    const currentUser = await this.authService.getCurrentUser();
    this.location = '';
    this.userName = '';
    if (currentUser) {
      this.userName = currentUser.handle;
    }
    this.smsContent = this.userName + ' would like your recommendations for ';
  }

  async getShareContent() {
    this.location = this.location.replace(/\s/g, '');
    if (this.location.length === 0 ) {
      return;
    }
    const askId = await this.mytripService.createAskForReco(this.location);
    // if error occurred
    if ( askId.error) {
      const msg = 'Unable to ask a recommendation. Please try again later.';
      this.showErrorAlert(msg);
      return;
    }
    const shareUrl = ' https://reco-6c892.web.app/reco_ask?id=' + askId;
    const content = this.smsContent + this.location + shareUrl;
    return content;
  }
  async inviteViaSMS() {
    const content = await this.getShareContent();
    console.log(content);
    if (!content) {
      return;
    }
    Plugins.SmsManager.send({
      numbers: [''],
      text: content,
    }).then(async () => {
      // call back after sent sms
      this.location = '';
    }).catch(error => {
        // see error codes below
        if (error === 'ERR_NO_NUMBERS') {
            // show toast with error message
            console.log('SMS Error: No recipient numbers were retrieved from options.');
        }
        if (error === 'ERR_SERVICE_NOTFOUND') {
            // show toast with error message
            console.log('SMS Error: The used device can not send SMS.');
        }
        if (error === 'ERR_PLATFORM_NOT_SUPPORTED') {
            // show toast with error message
            console.log('SMS Error: Sending SMS on the web is not supported.');
        }
        if (error === 'SEND_CANCELLED') {
            // show toast with error message
            console.log('SMS Error: User cancelled or closed the SMS app.');
        }
    });
  }

  async inviteViaEmail() {
    const content = await this.getShareContent();
    console.log(content);
    if (!content) {
      return;
    }
    const email = new Email();
    console.log(email);
    /*
    const hasPermission = await email.hasPermission();
    if (!hasPermission) {
      console.log('do not have permission for email');
      await email.requestPermission();
    } */
    const available = await email.isAvailable({
          alias: 'gmail' // gmail, outlook, yahoo *optional*,
    });

    // available.hasAccount  *If email is setup*
    // available.hasApp  *If device has alias supplied*

    if (available.hasApp) {
        email.open({
          to: [''],
          cc: [''],
          bcc: [''],
          subject: 'Ask for a recommendation',
          body: content,
          isHtml: true
        });
    } else {
      const msg = 'Unable to send an ask email.';
      this.showErrorAlert(msg);
    }
  }

  async showErrorAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: [{ text: 'Ok', role: 'cancel' }],
    });
    await alert.present();
  }

  dismiss() {
    const onClosedData: string = 'Cancelled!';
    this.modalController.dismiss(onClosedData);
  }

}
