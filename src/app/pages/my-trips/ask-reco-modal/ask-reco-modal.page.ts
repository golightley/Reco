import { MytripService } from 'src/app/services/mytrip.service';
import { AuthService } from 'src/app/services/user/auth.service'
import { ModalController, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { Email } from '@teamhive/capacitor-email';
declare var google;

@Component({
  selector: 'app-ask-reco-modal',
  templateUrl: './ask-reco-modal.page.html',
  styleUrls: ['./ask-reco-modal.page.scss'],
})
export class AskRecoModalPage implements OnInit {
  location: string;
  queryPlace: string = '';
  places: any = [];
  autocompleteService: any;
  placesService: any;
  lat: number = 0;
  lng: number = 0;
  userName: string;
  smsContent: string;
  currentUser: any;

  constructor(
    private modalController: ModalController,
    private mytripService: MytripService,
    public alertCtrl: AlertController,
    private authService: AuthService,
    private renderer: Renderer2
  ) { }

  async ngOnInit() {
    try {
      const div = this.renderer.createElement('div');
      div.id = 'googleDiv';
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(div);
    } catch (err) {
      console.log('Autocomplete service failed');
      console.log(err);
    }
    this.currentUser = await this.authService.getCurrentUser();
    this.location = '';
    this.userName = '';
    if (this.currentUser) {
      this.userName = this.currentUser.handle;
    }
    this.smsContent = this.userName + ' would like your recommendations for ';
  }

  ionViewWillEnter(): void {
    this.initGoogleMapService();
    // this.searchDisabled = false;
  }

  initGoogleMapService() {
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    try {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(div);
      console.log('Autocomplete service succeed!');
    } catch (err) {
      console.log('Autocomplete service failed');
      console.log(err);
    }
  }

  searchPlace() {
    this.lat = 0;
    this.lng = 0;

    if (this.queryPlace.length > 0) {
      const config = {
        types: ['geocode'],
        input: this.queryPlace
      };

      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
        // console.log(predictions);

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {

          this.places = [];

          predictions.forEach((prediction) => {
            this.places.push(prediction);
          });
        }

      });

    } else {
      this.places = [];
    }

  }

  async selectPlace(place) {
    this.places = [];
    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      console.log('AskRecoModal.selectPlace(): details => ', details);
      console.log(details);
      this.lat = details.geometry.location.lat();
      this.lng = details.geometry.location.lng();
      this.queryPlace = details.name;
      // this.saveDisabled = false;
    });

  }

  async getShareContent() {
    if ( !this.queryPlace || !this.lat || !this.lng ) {
      return;
    }
    const askId = await this.mytripService.createAskForReco(this.queryPlace, this.currentUser);
    // if error occurred
    if ( askId.error) {
      const msg = 'Unable to ask a recommendation. Please try again later.';
      this.showErrorAlert(msg);
      return;
    }
    
    const shareUrl = ` https://reco-6c892.firebaseapp.com/asked-reco/${askId}/${this.lat}/${this.lng}`;
    const content = this.smsContent + this.queryPlace + shareUrl;
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
