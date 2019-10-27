import { AskrecoService } from 'src/app/services/ask-reco.service';
import { Platform, ToastController, Events } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { generateThumbImage, getImageSize } from 'src/app/utils/image-utils';
import { ExplorerService } from 'src/app/services/explorer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reco-card',
  templateUrl: './reco-card.component.html',
  styleUrls: ['./reco-card.component.scss'],
})
export class RecoCardComponent implements OnInit {
  _cardIndex: number;
  _askUserName: any;
  _autocompleteService: any;
  _placeService: any;

  addButtonLabel: any;
  toast: any;
  isCreatedReco: boolean;

  // place data
  places: any = [];
  queryPlace: string = '';
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any;
  googlePlaceId: string;
  googleTypes: any;
  placePhone: any;
  placeWebsite: string;

  // image data
  picture: SafeResourceUrl;
  originalPicture: string;
  pictureDataUrl; string;
  pictureDataThumbUrl: string;
  ThumbnailSize = 700;
  PictureSize = 1500;
  limitFileSize = 1024; // KB

  name: string = '';
  city: string = '';
  notes: string = '';

  cardTitle = [
    'Reco one',
    'Reco two',
    'Save your Recos'
  ];

  @Input()
  set cardIndex(val: number) {
    this._cardIndex = val;
  }
  @Input()
  set askUserName(val: any) {
    this._askUserName = val;
  }
  @Input()
  set autocompleteService(val: any) {
    this._autocompleteService = val;
  }
  @Input()
  set placeService(val: any) {
    this._placeService = val;
  }

  constructor(
    private platform: Platform,
    private tc: ToastController,
    private sanitizer: DomSanitizer,
    private explorerService: ExplorerService,
    private askRecoService: AskrecoService,
    private router: Router,
    private ev: Events
  ) { }

  ngOnInit() {
    this.addButtonLabel = `Add to ${this._askUserName}'s Map`;
    this.isCreatedReco = false;
  }

  searchPlace() {
    this.saveDisabled = true;

    if (this.queryPlace.length > 0 && !this.searchDisabled) {

      const config = {
        types: ['establishment'],
        // types: ['geocode'],
        input: this.queryPlace
      };

      this._autocompleteService.getPlacePredictions(config, (predictions, status) => {
        // console.log('CreateModalPage.SearchPlace.Autocomplete');
        // console.log(predictions);
        // console.log(status);

        if (status === 'OK' && predictions) {
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

  selectPlace(place) {

    this.places = [];

    const location = {
      lat: null,
      lng: null,
      name: place.name,
      city: null
    };

    this._placeService.getDetails({ placeId: place.place_id }, (details) => {
      // console.log('CreatePlaceModal.SelectPlace');
      // console.log(details);
      // console.log(details.address_components[3].short_name);
      location.name = details.name;
      location.lat = details.geometry.location.lat();
      location.lng = details.geometry.location.lng();
      location.city = details.address_components[3].short_name;
      this.saveDisabled = false;

      this.queryPlace = location.name;
      this.city = location.city;
      this.googlePlaceId = details.place_id;
      this.googleTypes = details.types;
      this.placeWebsite = details.website;
      this.placePhone = details.international_phone_number;

      this.location = location;
      console.log(this.location);

    });

  }

  async selectPicture() {
    console.log(this.platform);
    if (
      this.platform.is('hybrid') ||
      this.platform.is('android') ||
      this.platform.is('ios')
    ) {
      const image = await Plugins.Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      this.picture = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
      this.originalPicture = image.dataUrl;
      // console.log('****image data*****');
      // console.log(this.pictureDataUrl);
      console.log('****image size*****');
      console.log(getImageSize(this.originalPicture));
      // check image file size
      // if (getImageSize(this.originalPicture) > this.limitFileSize) {
      // compress image
      generateThumbImage(this.originalPicture, this.PictureSize, this.PictureSize, 1, data => {
        this.pictureDataUrl = data;
        console.log('****compressed image data*****');
        // console.log(this.pictureDataUrl);
      });
      // } else {
      //   this.pictureDataUrl = this.originalPicture;
      // }
      // create a thumbnail
      generateThumbImage(this.pictureDataUrl, this.ThumbnailSize, this.ThumbnailSize, 1, data => {
        this.pictureDataThumbUrl = data;
        console.log('****thumb image data*****');
        console.log(this.pictureDataThumbUrl);
      });
    } else {
      await this.presentToast('Only available on mobile');
    }
  }

  async createAskRec() {
    const isAskReco = true;
    const recoID = await this.explorerService.createNewRecommendation('',
      this.queryPlace, this.city, this.notes, this.location, this.googlePlaceId, this.googleTypes,
      this.placeWebsite, this.placePhone, this.pictureDataUrl, this.pictureDataThumbUrl);

    console.log('Reco ID => ' + recoID);
    if (recoID) {
      // if success to create reco
      // await this.presentToast('Successfully saved!');
      await this.askRecoService.setAskedRecoId(recoID);
      this.isCreatedReco = true;
      // const recoIds = await this.askRecoService.getAskedRecoId();
      // console.log(recoIds);
      this.ev.publish('createdReco', {
        param: true,
      });
    }

  }

  async presentToast(message) {
    const closeText = 'close';

    if (this.toast) {
      this.toast.dismiss();
    }

    this.toast = await this.tc.create({
      message: message,
      closeButtonText: closeText,
      showCloseButton: true,
      duration: 2000,
      color: 'dark'
    })
    this.toast.present();
  }
  
  createProfile() {
    this.router.navigate(['/webapp-user']);
  }
}
