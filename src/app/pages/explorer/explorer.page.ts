import { FilterModalComponent } from './filter-modal/filter-modal.component';
import { FriendService } from 'src/app/services/friend.service';

import { Component, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { AlertController, LoadingController, Platform, ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import { ExplorerService } from 'src/app/services/explorer.service';
import { RecommendationModel } from 'src/app/models/recommendation-model';
import { filterByHaversine } from 'src/app/utils/map-utils';
import { async } from 'q';
import { PARAMETERS } from '@angular/core/src/util/decorators';

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
  recMapArray: RecommendationModel[] = [];
  recCardArray: RecommendationModel[] = [];
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
  FILTER_DISTANCE = -1; // all data load
  selectedAllFriend: boolean;
  selectedCategory: any;

  constructor(
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private explorerService: ExplorerService,
    private friendService: FriendService,
    private platform: Platform,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    // console.log('Explorer.NgOnInit: Google Variable status');
    // console.log(google)
  }

  async ionViewWillEnter() {
    this.selectedAllFriend = true;
    this.selectedCategory = 'everything';
    this.recMapArray = [];
    this.recCardArray = [];
    // await this.getFriends();
    await this.getFriendsAndRecos();
    // make array for cards with recommendations list
    await this.filterRecoByDistance();
  }

  async getFriends() {
    this.friendList = await this.friendService.getFriends(true);
    console.log('Explorer Friends list => ', this.friendList);
  }

  async getFriendsAndRecos() {

    // get recommendations of all friends
    const result = await this.explorerService.getFriendsAndRecos();
    this.friendList = result.friends;
    const recsArray = result.recos;
    // console.log('recsArray', recsArray);

    
    recsArray.forEach(data => {
      if (!data.data().gType) {
        return;
      }
      const newRec = new RecommendationModel(data.id, data.data().name, data.data().city, data.data().notes, data.data().location.lat, data.data().location.lng,
        data.data().gType, 0, data.userName, data.data().user, data.data().picture, data.data().pictureThumb, true);
      // make array for markers of Map
      this.recMapArray.push(newRec);
    });
    console.log('Returned Map Recos array => count: ' + this.recMapArray.length);
    console.log('Map array result=>', this.recMapArray);
    await this.map.addMarkers(this.recMapArray);

  }

  // filter recommendation by distance for Card list
  filterRecoByDistance() {
    const usersLocation = this.map.getCurrentLocation();
    console.log('current usersLocation', usersLocation);
    // filter recommendation within 100 miles of selected place's location
    this.recCardArray = filterByHaversine(this.recMapArray, usersLocation, this.FILTER_DISTANCE);
    this.recCardArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });
    console.log('Filtered Card result by distance => count: ' + this.recCardArray.length);
    console.log('Card array result=>', this.recCardArray);
  }

  // filter recommendation of Card list and Map markers by select friend and category
  async filterRecoBySelected() {
    this.showDealyLoading(400);
    console.log('-- Filter reco data by category and friend --');
    // filter recommendation map array
    this.changeVisibleBySelected(this.recMapArray);
    // console.log('Changed map array:', this.recMapArray);

    // filter recommendation card array
    this.changeVisibleBySelected(this.recCardArray);
    // console.log('Changed card array:', this.recCardArray);
   
    // update Google Map Markers
    await this.map.displayMarkers(this.recMapArray);
  }

  // change visible value by selected friend and category
  async changeVisibleBySelected(recAry) {
    await recAry.map(async (rec) => {
      const friend = this.friendList.find( (f) => {
          return f.userId === rec.userId;
      });

      if (this.selectedCategory === 'everything') { // if selected 'everything' category
        if ( this.selectedAllFriend ) { // if selected 'All' friend
          rec.visible = true;
        } else { // if selected any friend
          if ( friend !== undefined) { // recommendation of friend
            rec.visible = friend.selected;
          } else {
              rec.visible = false;
          }
        }
      } else { // if selected any category
        const catIndex = rec.gtype.indexOf(this.selectedCategory);
        if ( this.selectedAllFriend && catIndex !== -1) { // if selected 'All' friend
          rec.visible = true;
        } else {
          if ( friend !== undefined && catIndex !== -1) {
            rec.visible = friend.selected;
          } else {
            rec.visible = false;
          }
        }
      }
    });
  }

  // search place in search box
  searchPlace() {
    try {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    } catch (err) {
      console.log('Autocomplete service failed');
      console.log(err);
    }
    // console.log('Search place function');

    this.saveDisabled = true;

    if (this.query.length > 0 && !this.searchDisabled) {

      const config = {
        types: ['geocode'],
        input: this.query
      };

      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
        // console.log(predictions);
        // console.log(status);

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

  // delay time with loading control
  async showDealyLoading(time) {
    const loading = await this.loadingCtrl.create({
      message: '',
      mode: 'ios'
    });
    loading.present();
    setTimeout(() => loading.dismiss(), time);
  }

  // clicked a place in place list
  async selectPlace(place) {
    this.enableSelectAllFriend();
    this.focusedSearchBar = false;
    await this.showDealyLoading(300);
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    this.service = new google.maps.places.PlacesService(div);

    this.places = [];
    const location = {
      lat: null,
      lng: null,
      name: place.name,
      city: null
    };

    this.service.getDetails({ placeId: place.place_id }, (details) => {
      console.log('Map.SelectPlace');
      console.log(details);
      location.name = details.name;
      location.lat = details.geometry.location.lat();
      location.lng = details.geometry.location.lng();

      this.location = location;
      console.log('Map.selectPlace.GetDetails');
      console.log(this.location);
      this.query = location.name;
      this.map.setCurrentLocation(location.lat, location.lng);

      // reload reco data
      this.reloadRecsDataByPlace();
      this.filterRecoBySelected();
    });
  }

  // Recommendations are shown for a selected place without API.
  reloadRecsDataByPlace() {
    // move map by selected location
    this.map.moveCenter();
    // filter card data by selected location
    this.filterRecoByDistance();
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

  // Emitted when the friend item is clicked on friend list.
  async selectFriend(index) {
    if ( index < 0 ) {
      // clicked All button.
      if ( !this.selectedAllFriend ) {
        // if disable, enable all button
        await this.enableSelectAllFriend();
      } else {
        // this.selectedAllFriend = false;
        return;
      }
    } else {
      this.friendList[index].selected = !this.friendList[index].selected;
      if ( this.friendList[index].selected ) {
        this.selectedAllFriend = false;
      }
    }
    // filter reco data by selected friend list.
    await this.filterRecoBySelected();
  }

  // enable select all button and disable other friends buttons
  async enableSelectAllFriend() {
    this.selectedAllFriend = true;
    await this.friendList.map (async (friend) => {
      friend.selected = false;
    });

  }

  async showFilterModal() {
    const modal = await this.modalController.create({
      component: FilterModalComponent,
      componentProps: {
        selCategory: this.selectedCategory
      }
    });
    modal.onDidDismiss().then((param) => {
      if (param !== null && param.data) {
        this.selectedCategory = param.data.selCategory;
      }
      console.log(this.selectedCategory);
      this.filterRecoBySelected();
    });
    return await modal.present();
  }

  /* setLocation(): void {
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
        });

      }, (err) => {
        console.log(err);
        overlay.dismiss();
      });
    });
  } */

  /* takeMeHome(): void {
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
      });
    } else {
      const destination = this.latitude + ',' + this.longitude;
      if (this.platform.is('ios')) {
        window.open('maps://?q=' + destination + '_system')
      } else {
        const label = encodeURI('My location')
        window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system')
      }
    }
  } */

}
