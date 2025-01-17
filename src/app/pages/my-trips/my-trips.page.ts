import { AuthService } from 'src/app/services/user/auth.service';
import { AskRecoModalPage } from './ask-reco-modal/ask-reco-modal.page';
import { MytripService } from './../../services/mytrip.service';
import { Plugins } from '@capacitor/core';
import { Component, OnInit } from '@angular/core';
import { ExplorerService } from 'src/app/services/explorer.service';
import { ActionSheetController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
// import { PopoverComponent } from '../../component/popover/popover.component';
// for the modal 
import { ModalController, AlertController } from '@ionic/angular';
import { CreatePlaceModalPage } from './create-place-modal/create-place-modal.page';
import { ShareRecoModelPage } from './share-reco-modal/share-reco-modal.page';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {

  dataReturned: any;
  recoArray: any = [];
  _backdropOn: boolean;
  smsContent = 'Hey! Checkout my Travel recommendation and sign in to the Reco app to see more ';
  fdlUrl: any;  // firebase dynamic link url  
  currentUser: any;

  constructor(
    private explorerService: ExplorerService,
    public alertCtrl: AlertController,
    private mytripService: MytripService,
    public modalController: ModalController,
    private authService: AuthService,
    public popoverController: PopoverController,
    public actionSheetController: ActionSheetController) {
  }

  ngOnInit() {
    // this.getRecommendations();
  }

  ionViewWillEnter() {
    this.getRecommendations();
  }

  getRecommendations() {
    this.recoArray = [];
    this.explorerService.getRecommendations('mine').then((recos) => {
      recos.forEach(data => {
        this.recoArray.push(data);
      });
    });
    console.log('MyTripsPage.GetRecommendation: Results', this.recoArray);
  }

  // show the modal for create a recommendation
  async addReco() {
    this._backdropOn = false;
    const modal = await this.modalController.create({
      component: CreatePlaceModalPage,
      componentProps: {
        // 'paramID': 123,
        // 'paramTitle': 'Test Title'
      }
    });
    // wait for the modal to be dismissed 
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
        this.getRecommendations();
        // alert('Modal Sent Data :'+ dataReturned);
      }
    });
    return await modal.present();
  }



  // show the modal for ask reco to friends
  async askReco() {
    this._backdropOn = false;
    const modal = await this.modalController.create({
      component: AskRecoModalPage,
      componentProps: {
        // 'param': 123
      }
    });
    // wait for the modal to be dismissed
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
      }
    });
    return await modal.present();
  }

  // show the other reco
  async shareLinkReco(link:any) {
    this._backdropOn = false;
    const modal = await this.modalController.create({
      component: ShareRecoModelPage,
      cssClass: 'share-modal',
      componentProps: {
        'param': link
      }
    });
    // wait for the modal to be dismissed
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
      }
    });
    return await modal.present();
  }

  // Get selected rocos
  getSelectedRecos() {
    const selRecos: any[] = [];
    this.recoArray.forEach(r => {
      if (r.selected) {
        selRecos.push(r.id);
      }
    });
    return selRecos;
  }

  // Release selected all recos
  releaseSelectedRecos() {
    this.recoArray.map(r => {
      if (r.selected) {
        r.selected = false;
      }
    });
  }

  async showErrorAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: [{ text: 'Ok', role: 'cancel' }],
    });
    await alert.present();
  }

  async showCopyAlert(msg: string) {
    const alert = await this.alertCtrl.create({
      header: "Text this link!",
      message: msg,
      buttons: [{ text: 'Ok', role: 'cancel' }],
    });
    await alert.present();
  }


  // show modal for send SMS to friends
  async sendReco() {
    this._backdropOn = false;
    this.currentUser = await this.authService.getCurrentUser();
    const selRecos = this.getSelectedRecos();
    if (!selRecos.length) {
      const msg = 'Please select recommendations you want to send to friend.';
      this.showErrorAlert(msg);
      return;
    }
    const sharedId = await this.mytripService.createShareReco(selRecos, this.currentUser);
    // if error occurred
    if (sharedId.error) {
      const msg = 'Unable to send selected recommendations via SMS. Please try again later.';
      this.showErrorAlert(msg);
      return;
    }
    const shareUrl = 'https://reco-6c892.firebaseapp.com/shared-reco/' + sharedId;
    const content = this.smsContent + shareUrl;
    console.log(shareUrl);
    console.log(content);
    Plugins.SmsManager.send({
      numbers: [''],
      text: content,
    }).then(async () => {
      // call back after sent sms
      this.releaseSelectedRecos();
    }).catch(error => {
      console.log("Send manual message...");
      this.shareLinkReco(shareUrl);

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

  // async presentPopover(ev: any) {
  //   const popover = await this.popoverController.create({
  //     component: PopoverComponent,
  //     event: ev,
  //     translucent: true
  //   });
  //   return await popover.present();
  // }

  // select recommendation on list
  selectReco(i) {
    // console.log('Selected reco index : ' + i);
    this.recoArray[i].selected = !this.recoArray[i].selected;
  }

  async deleteTrip(id) {
    console.log("Delete trip with id = " + id)
    const result = await this.mytripService.deleteReco(id);
    this.getRecommendations();


  }


  async showShareLink(event: any) {
    console.log(event);
    const that = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'My Trips',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Delete clicked');
          that.deleteTrip(event.id);
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  // show action buttons
  showMoreActions() {
    this._backdropOn = !this._backdropOn;
  }

  // dismiss action buttons
  dismissMoreActions() {
    this._backdropOn = false;
  }

}
