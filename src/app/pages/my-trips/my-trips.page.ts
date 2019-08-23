import { MytripService } from './../../services/mytrip.service';
import { Plugins } from '@capacitor/core';
import { Component, OnInit } from '@angular/core';
import { ExplorerService } from 'src/app/services/explorer.service';

// for the modal 
import { ModalController } from '@ionic/angular';
import { CreatePlaceModalPage } from './create-place-modal/create-place-modal.page';

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
  fdlUrl: string;  // firebase dynamic link url
  
  constructor(
    private explorerService: ExplorerService,
    private mytripService: MytripService,
    public modalController: ModalController) {
   }

  ngOnInit() {
   // this.getRecommendations();
  }

  ionViewWillEnter() {
    this.getRecommendations();
  }

  getRecommendations() {
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
        // alert('Modal Sent Data :'+ dataReturned);
      }
    });
    return await modal.present();
  }

  // get selected rocos
  getSelectedRecos() {
    const selRecos: any[] = [];
    this.recoArray.forEach( r => {
      if (r.selected) {
        selRecos.push(r.id);
      }
    });
    return selRecos;
  }

  // show modal for send SMS to friends
  async sendReco() {
    this._backdropOn = false;
    const selRecos = this.getSelectedRecos();
    console.log('Selected Recos' , selRecos);
    // const numbers = ['+8613688888888'];
    this.fdlUrl = await this.mytripService.getFdlURL(selRecos);
    const content = this.smsContent + this.fdlUrl;
    Plugins.SmsManager.send({
      numbers: [],
      text: content,
    }).then(() => {
      // SMS app was opened
      console.log('sms app wes opened');
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

  // select recommendation on list
  selectReco(i) {
    // console.log('Selected reco index : ' + i);
    this.recoArray[i].selected = !this.recoArray[i].selected;
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
