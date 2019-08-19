import { FriendService } from 'src/app/services/friend.service';

import { Component, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import { ExplorerService } from 'src/app/services/explorer.service';
import { RecommendationModel } from 'src/app/models/recommendation-model';
import { filterByHaversine } from 'src/app/utils/map-utils';
import { BlockerConfig } from '@ionic/core/dist/types/utils/gesture/gesture-controller';

const { Geolocation } = Plugins;
declare var google;

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
})
export class ExplorerPage implements OnInit {

  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;

  private latitude: number;
  private longitude: number;
  public stopSuggestions: any = ['Test', 'es', 't', 'te', 'te', 'et']
  public recMapResults: RecommendationModel[] = [];
  public recCardResults: RecommendationModel[] = [];
  public markersArray: any = [];
  friendList: any[] = [];
  service: any;
  placesService: any;
  query: string = '';
  places: any = [];
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any;
  autocompleteService: any;
  focusedSearchBar: boolean;
  FILTER_DISTANCE = 100;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private explorerService: ExplorerService,
    private friendService: FriendService,
    private platform: Platform,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {

    console.log('Location.NgOnInit: Google Variable status');
    // console.log(google)
    console.log('Location.NgOnInit: Map Variable status');

    /* this.authService.getUsersFolliowing().then((usersFollowingArray)=>{
      this.getRecommendations();
    }); */
  }

  async ionViewWillEnter() {
    await this.getFriends();
    await this.getRecommendations();
  }

  async getFriends() {
    this.friendList = await this.friendService.getFriends();
    console.log('Explorer Friends list => ', this.friendList);
  }

  async getRecommendations() {

    const getType = 'all';
    const recsArray = await this.explorerService.getRecommendations(getType);
    console.log('recsArray', recsArray);

    this.recMapResults = [];
    recsArray.forEach(data => {
      const newRec = new RecommendationModel(data.id, data.data().name, data.data().city, data.data().notes, data.data().location.lat,
        data.data().location.lng, 0, data.userName, data.data().picture, data.data().pictureThumb);
      // make array for markers of Map
      this.recMapResults.push(newRec);
    });
    console.log('Location.getMapRecos. Built Map Recos array => count: ' + this.recMapResults.length);
    console.log(this.recMapResults);
    await this.map.addMarkers(this.recMapResults);

    // make array for cards with recommendations list
    this.filterRecommendations();

  }

  // filter recommendation for cards
  filterRecommendations() {
    this.recCardResults = [];
    const usersLocation = this.map.getCurrentLocation();
    console.log('current usersLocation', usersLocation);
    // filter recommendation within 10 miles of selected city location
    this.recCardResults = filterByHaversine(this.recMapResults, usersLocation, this.FILTER_DISTANCE);
    this.recCardResults.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });
    console.log('Location.getCardRecos. Built Card Recos array => count: ' + this.recCardResults.length);
    console.log('card result=>',this.recCardResults);
  }

  loadRecsData() {
    // move map by selected location
    this.map.moveCenter();
    // filter card data by selected location
    this.filterRecommendations();
  }

  setLocation(): void {

    this.loadingCtrl.create({
      message: 'Setting current location'

    }).then((overlay) => {
      overlay.present();
      Geolocation.getCurrentPosition().then((postition) => {
        overlay.dismiss();

        this.latitude = postition.coords.latitude;
        this.longitude = postition.coords.longitude;

        this.map.changeMarker(this.latitude, this.longitude);

        let data = {
          latitude: this.latitude,
          longitude: this.longitude
        };

        this.alertCtrl.create({
          header: 'location set',
          message: 'You are good!',
          buttons: [
            {
              text: 'ok'
            }
          ]
        }).then((alert) => {
          alert.present();
        })

      }, (err) => {
        console.log(err)
        overlay.dismiss();
      });
    });
  }

  searchPlace() {

    try {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    } catch (err) {
      console.log('Autocomplete service failed');
      console.log(err);
    }

    console.log('Searchplace');

    this.saveDisabled = true;

    if (this.query.length > 0 && !this.searchDisabled) {

      const config = {
        types: ['geocode'],
        // types: ['geocode'],
        input: this.query
      };

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

    this.focusedSearchBar = false;

    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    this.service = new google.maps.places.PlacesService(div);


    this.places = [];

    let location = {
      lat: null,
      lng: null,
      name: place.name,
      city: null
    };

    this.service.getDetails({ placeId: place.place_id }, (details) => {
      console.log('Map.SelectPlace');
      console.log(details)
      location.name = details.name;
      location.lat = details.geometry.location.lat();
      location.lng = details.geometry.location.lng();

      this.location = location;
      console.log('Map.selectPlace.GetDetails');
      console.log(this.location);
      this.query = location.name;
      this.map.setCurrentLocation(location.lat, location.lng);
      this.loadRecsData();

    });

  }

  takeMeHome(): void {

    if (!this.latitude || !this.longitude) {

      this.alertCtrl.create({
        header: 'No where to go',
        message: 'No location set!',
        buttons: [
          {
            text: 'ok'
          }
        ]
      }).then((alert) => {
        alert.present();
      })
    }
    else {
      let destination = this.latitude + ',' + this.longitude;
      if (this.platform.is('ios')) {
        window.open('maps://?q=' + destination + '_system')
      } else {
        let label = encodeURI('My location')
        window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system')
      }
    }

  }

  // Emitted when the search input has focus.
  focusSearchBar() {
    console.log('focused search bar');
    this.focusedSearchBar = true;
  }
  // Emitted when the cancel button is clicked.
  cancelSearchBar() {
    this.focusedSearchBar = false;
  }

}
