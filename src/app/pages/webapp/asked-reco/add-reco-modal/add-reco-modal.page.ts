import { Component, OnInit, Renderer2, Input } from '@angular/core';
import { ModalController, NavParams, Platform, ToastController, Events } from '@ionic/angular';
import { ExplorerService } from 'src/app/services/explorer.service';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { generateThumbImage, getImageSize, saveGoogleImage } from 'src/app/utils/image-utils';
import { Router } from '@angular/router';
import { AskedRecoService } from 'src/app/services/asked-reco.service';

declare var google;

@Component({
  selector: 'app-add-reco-modal',
  templateUrl: './add-reco-modal.page.html',
  styleUrls: ['./add-reco-modal.page.scss'],
})

export class AddRecoModalPage implements OnInit {

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
  googlePhoto: any;
  placeWebsite: string;
  public name: string = '';
  public city: string = '';
  public notes: string = '';
  script: any;

  toast: any;
  
  _askId: string;
  _lat: string;
  _lng: string;
  backUrl: string;
  @Input()
  set askId(val: string) {
    this._askId = val;
  }
  @Input()
  set lat(val: string) {
    this._lat = val;
  }
  @Input()
  set lng(val: string) {
    this._lng = val;
  }
  
  constructor(
    private modalController: ModalController,
    private explorerService: ExplorerService,
    private renderer: Renderer2,
    private tc: ToastController,
    private router: Router,
    private askedRecoService: AskedRecoService
  ) { }

  ngOnInit() {
    this.backUrl = `/asked-reco/${this._askId}/${this._lat}/${this._lng}`;
  }

  ionViewWillEnter(): void {
    this.initGoogleMapService();
  }

  initGoogleMapService() {
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    try {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(div);
      console.log('Add reco modal: Autocomplete service succeed');
    } catch (err) {
      console.log('Add reco modal: Autocomplete service failed');
      console.log(err);
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

    this.googlePhoto = '';
    this.saveDisabled = true;

    if (this.queryPlace.length > 0 && !this.searchDisabled) {

      const config = {
        types: ['establishment'],
        // types: ['geocode'],
        input: this.queryPlace
      }

      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {

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
      console.log('this.googlePhoto: ', this.googlePhoto);
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
    const isAskReco = true;
    let userId = '';
    if (localStorage.getItem('userId')) {
      userId = JSON.parse(localStorage.getItem('userId'));
    }
    console.log('this.google photo' , this.googlePhoto);

    const recoId = await this.explorerService.createNewRecommendation(this._askId,
      this.queryPlace, this.city, this.notes, this.location, this.googlePlaceId, this.googleTypes,
      this.placeWebsite, this.placePhone, 'googlePhoto', this.googlePhoto, userId);
    console.log(recoId);
    if (recoId) {
      // init asked reco ids
      await this.askedRecoService.setAskedRecoId('');
      await this.askedRecoService.setAskedRecoId(recoId);
      // await this.presentToast('Successfully saved!');
      await this.modalController.dismiss('Created');
      if (userId === '') {
        await this.router.navigateByUrl('/webapp-user');
      }
    } else {
      this.back();
    }

  }

  async back() {
    const onClosedData: string = 'Canceled';
    await this.modalController.dismiss(onClosedData);
  }

}
