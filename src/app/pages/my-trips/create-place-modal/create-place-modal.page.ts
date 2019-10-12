import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModalController, NavParams, Platform, ToastController } from '@ionic/angular';
import { ExplorerService } from 'src/app/services/explorer.service';

import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { generateThumbImage, getImageSize, saveGoogleImage } from 'src/app/utils/image-utils';
import undefined = require('firebase/empty-import');

declare var google;

@Component({
  selector: 'app-create-place-modal',
  templateUrl: './create-place-modal.page.html',
  styleUrls: ['./create-place-modal.page.scss'],
})

export class CreatePlaceModalPage implements OnInit {

  modalTitle: string;
  modelId: number;
  autocompleteService: any;
  placesService: any;
  queryPlace: string = '';
  places: any = [];
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any;
  googlePlaceId: string;
  googleTypes: any;
  placePhone: any;
  googlePhoto:any;
  placeWebsite: string;
  public name: string = '';
  public city: string = '';
  public notes: string = '';
  script: any;

  picture: SafeResourceUrl;
  toast: any;
  originalPicture: string;
  pictureDataUrl; string;
  pictureDataThumbUrl: string;
  ThumbnailSize = 500;
  PictureSize = 1500;
  limitFileSize = 1024; // KB

  constructor(
    private modalController: ModalController,
    private explorerService: ExplorerService,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
    private platform: Platform,
    private tc: ToastController
  ) { }

  ngOnInit() {
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    console.log('CreatePlaceMOdal.NgOnInit: Google AutoComplete status');
    console.log(this.autocompleteService);
    try {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(div);
    } catch {

    }
  }



  ionViewDidLoad(): void {
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.autocompleteService = new google.maps.places.PlacesService(div);
    // this.searchDisabled = false;
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
    })
    this.toast.present();
  }

  searchPlace() {

    console.log('Searchplace');

    this.saveDisabled = true;

    if (this.queryPlace.length > 0 && !this.searchDisabled) {

      const config = {
        types: ['establishment'],
        // types: ['geocode'],
        input: this.queryPlace
      }

      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
        console.log('CreateModalPage.SearchPlace.Autocomplete');
        console.log(predictions);
        console.log(status);

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

  selectPlace(place) {

    this.places = [];

    const location = {
      lat: null,
      lng: null,
      name: place.name,
      city: null
    };

    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      console.log('CreatePlaceModal.SelectPlace');
      console.log(details);
      console.log(details.address_components[3].short_name);
      location.name = details.name;
      location.lat = details.geometry.location.lat();
      location.lng = details.geometry.location.lng();
      location.city = details.address_components[3].short_name;
      this.saveDisabled = false;
      this.googlePhoto = details.photos[0].getUrl();
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


  async createNewRec() {
    /* if (this.pictureDataUrl) {
      const uploadState = await this.explorerService.uploadPicture(this.pictureDataUrl);
      // console.log(uploadPicture);
      await this.presentToast(uploadState.state);
    } */
    const isAskReco = false;
    console.log("this.pictureDataUrl")
    console.log(this.pictureDataUrl)
    console.log("this.googlephoto")
    console.log(this.googlePhoto)

    if(this.pictureDataUrl == null){
      saveGoogleImage(this.googlePhoto, 50, 50, 1, data => {
        this.pictureDataUrl = data;
        console.log(this.pictureDataUrl);
      });      

    }
    const result = await this.explorerService.createNewRecommendation(isAskReco,
      this.queryPlace, this.city, this.notes, this.location, this.googlePlaceId, this.googleTypes,
      // this.placeWebsite, this.placePhone, this.pictureDataUrl, this.pictureDataThumbUrl);
      this.placeWebsite, this.placePhone, this.pictureDataUrl, this.pictureDataUrl);

    console.log(result);
    if (result) {
      await this.presentToast('Successfully saved!');
    }

    this.dismiss();

  }

  async dismiss() {
    const onClosedData: string = 'Wrapped Up!';
    await this.modalController.dismiss(onClosedData);
  }

}
