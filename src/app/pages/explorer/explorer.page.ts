import { RecoPlaceModalComponent } from './reco-place-modal/reco-place-modal.component';
import { FilterModalComponent } from './filter-modal/filter-modal.component';
import { FriendService } from 'src/app/services/friend.service';

import { Component, ViewChild, OnInit, Renderer2, ElementRef } from '@angular/core';
import { LoadingController, ModalController, Events } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import { ExplorerService } from 'src/app/services/explorer.service';
import { RecommendationModel } from 'src/app/models/recommendation-model';
import * as moment from 'moment';
import { filterByHaversine, getDistanceByLocation } from 'src/app/utils/map-utils';

const { Geolocation } = Plugins;
declare var google;

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
})
export class ExplorerPage implements OnInit {

  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;
  @ViewChild('recoCardList', { read: ElementRef }) private cardListElem: ElementRef;

  usersLocation: any;
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
  selectedAllFriend: boolean;
  selectedCategory: any;
  activatedRecoId: any;
  activatedRecoIndex: any;
  FILTER_DISTANCE = -1; // load all data
  CardItemWidth = 330;

  constructor(
    private ev: Events,
    private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private explorerService: ExplorerService,
    private friendService: FriendService,
    private renderer: Renderer2,
  ) {
    this.ev.subscribe('select-marker', async (params) => {
      console.log('Subscribe select marker event: ', params);
      if (params && params.reco_id) {
        this.activatedRecoId = params.reco_id;
        this.activateRecoCard();
      }
    });
  }

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
    await this.filterCardRecoByDistance();
  }

  async activateRecoCard() {
    console.log('Activate reco on card list: reco id=>' + this.activatedRecoId);
    const showIndex = await this.getRecoIndexOnCardList(this.activatedRecoId);
    const xPoint = this.CardItemWidth * showIndex - 15;
    // console.log(this.CardItemWidth, xPoint);
    this.moveScollCardList(xPoint);
  }

  getRecoIndexOnCardList(recoId): number {
    let j = 0;
    for (let i = 0; i < this.recCardArray.length; i++ ) {
      if (this.recCardArray[i].visible) {
        if ( this.recCardArray[i].id === recoId ) {
          console.log('Activated card index:' + i);
          console.log('show index:' + j);
          this.activatedRecoIndex = i; // index of activated recommendation on all card list
          return j;
        }
        j++;
      }
    }
  }

  async getFriends() {
    this.friendList = await this.friendService.getFriends(true);
    console.log('Explorer Friends list => ', this.friendList);
  }

  async changeUserLocation() {
    this.usersLocation = await this.map.getCurrentLocation();
    /* localStorage.setItem('UsersLocation', JSON.stringify(this.usersLocation)); */
  }

  async getFriendsAndRecos() {
    // get recommendations of all friends
    const result = await this.explorerService.getFriendsAndRecos();
    this.friendList = result.friends;
    console.log('Returned Recos array => ', result.recos);
    await this.changeUserLocation();
    // Get distance and sort by distance
    const sortedRecsArray = await getDistanceByLocation(result.recos, this.usersLocation) ;
    sortedRecsArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });
    // console.log('Returned sorted array=> ', sortedRecsArray);
    // console.log('Recos array => count: ' + sortedRecsArray.length);

    // Generate recMapArray

    let dist = 0;
    let index = 0;
    sortedRecsArray.forEach(data => {
      if (!data.data().gType) {
        return;
      }
      const createdAt = moment.unix(data.data().timestamp.seconds).format('MMM YYYY');
      let userPhoto = '';
      if (data.data().photoURL) {
        userPhoto = data.data().photoURL;
      }
      // grouping recommendations for the same place
      if ( data.distance !== dist || dist === 0 ) {
        const newRec = new RecommendationModel(data.id,
                                              data.data().name,
                                              data.data().city,
                                              data.data().location.lat,
                                              data.data().location.lng,
                                              data.data().gType,
                                              0,
                                              [data.userName],
                                              [data.data().user],
                                              [userPhoto],
                                              [data.data().notes],
                                              [data.data().picture],
                                              [data.data().pictureThumb],
                                              [createdAt],
                                              data.data().phone,
                                              data.data().website,
                                              true);
        // make array for markers of Map
        this.recMapArray.push(newRec);
        index++;
      } else {
        const rec = this.recMapArray[index - 1];
        rec.userNames.push(data.userName);
        rec.userIds.push(data.data().user);
        rec.userPhotoURLs.push(userPhoto);
        rec.notes.push(data.data().notes);
        rec.createdAts.push(createdAt);
        // remove empty picture
        if ( rec.pictures[rec.pictures.length - 1] === '') {
          console.log('&&&& slice empty picture &&&&');
          rec.pictures.shift();
          rec.pictureThumbs.shift();
        }
        if (data.data().picture) {
          rec.pictures.push(data.data().picture); // can't know whose picture.
          rec.pictureThumbs.push(data.data().pictureThumb);
        }
        this.recMapArray[index - 1] = rec;
      }
      dist = data.distance;


    });
    console.log('Group Map Recos array => count: ' + this.recMapArray.length);
    console.log('Group Map array result=>', this.recMapArray);

    this.map.readyTointeract.subscribe((data) => {
      if (data) {
        this.map.addMarkers(this.recMapArray);
      } 

      console.log(data);
    });
    // await this.map.addMarkers(this.recMapArray);
    this.moveScollCardList(0);
  }

  async moveScollCardList(x) {
    this.cardListElem.nativeElement.scrollTo(x, 0, 5000);
  }

  // filter recommendation by distance for Card list
  async filterCardRecoByDistance() {
    // filter recommendation within 100 miles of selected place's location
    this.recCardArray = await filterByHaversine(this.recMapArray, this.usersLocation, this.FILTER_DISTANCE);
    this.recCardArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });
    console.log('Sorted Card result by distance => count: ' + this.recCardArray.length);
    console.log('Sorted Card result by distance =>', this.recCardArray);
  }

  // filter recommendation of Card list and Map markers by select friend and category
  async filterRecoBySelected() {
    this.showDealyLoading(400);
    console.log('-- Filter reco data by category and friend --');
    // filter recommendation map array
    await this.changeVisibleBySelected(this.recMapArray);
    // console.log('Changed map array:', this.recMapArray);

    // filter recommendation card array
    await this.changeVisibleBySelected(this.recCardArray);
    // console.log('Changed card array:', this.recCardArray);
   
    // update Google Map Markers
    await this.map.displayMarkers(this.recMapArray);
  }

  // change visible value by selected friend and category
  async changeVisibleBySelected(recAry) {
    await recAry.map(async (rec) => {

      if (this.selectedCategory === 'everything') { // if selected 'everything' category
        if ( this.selectedAllFriend ) { // if selected 'All' friend
          rec.visible = true;
        } else { // if selected any friend

          if ( await this.isSelectedByAnyFriend(rec.userIds) ) { // recommendation of friend
            rec.visible = true;
          } else {
            rec.visible = false;
          }
        }
      } else { // if selected any category
        const catIndex = rec.gtype.indexOf(this.selectedCategory);
        if ( this.selectedAllFriend && catIndex !== -1) { // if selected 'All' friend
          rec.visible = true;
        } else { // if selected any friend

          if ( await this.isSelectedByAnyFriend(rec.userIds)  && catIndex !== -1 ) { // recommendation of friend
            rec.visible = true;
          } else {
            rec.visible = false;
          }
        }
      }
      // console.log(rec.visible);
    });
  }

  async isSelectedByAnyFriend(userIds) {
    for ( let i=0; i < userIds.length; i++ ) {
      const friend = this.friendList.find( (f) => {
        return f.userId === userIds[i];
      });
      if ( friend.selected ) {
        return true;
      }
    }
    return false;
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

    this.service.getDetails({ placeId: place.place_id }, async (details) => {
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
      await this.changeUserLocation();
      // close activated info window on Map
      this.map.closeActiveInfoWindow();
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
    this.filterCardRecoByDistance();
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

  // enable select all button and disable other friends buttons
  async enableSelectAllFriend() {
    this.selectedAllFriend = true;
    await this.friendList.map (async (friend) => {
      friend.selected = false;
    });

  }

  // open modal for category filter
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
    // close activated info window on map
    await this.map.closeActiveInfoWindow();
    return await modal.present();
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
    // close opened info window on Map
    await this.map.closeActiveInfoWindow();
    // filter reco data by selected friend list.
    await this.filterRecoBySelected();
  }

  // Emitted when clicking a card of place card list.
  async selectPlaceCard(index, recoId) {

    // select marker
    this.activatedRecoIndex = index;
    this.activatedRecoId = recoId;
    console.log('Changed activate reco on card list: reco id=>' + this.activatedRecoId);
    console.log('reco index=>' + this.activatedRecoIndex);
    console.log(this.recCardArray[index]);

    // move map according to position of selected card place
    const lat = this.recCardArray[index].lat;
    const lng = this.recCardArray[index].lng;
    await this.map.moveCenter(lat, lng);
    // get index of marker
    const mapRecoIndex = this.recMapArray.findIndex ( reco => {
      return reco.id === recoId;
    });
    await this.map.showInfoWindow(mapRecoIndex);

    // open detail modal
    const modal = await this.modalController.create({
      component: RecoPlaceModalComponent,
      componentProps: {
        placeData: this.recCardArray[index]
      }
    });
    modal.onDidDismiss().then((param) => {
      if (param !== null && param.data) {
        // this.selectedCategory = param.data.selCategory;
      }
      console.log('closed modal');
    });
    return await modal.present();
  }

}
