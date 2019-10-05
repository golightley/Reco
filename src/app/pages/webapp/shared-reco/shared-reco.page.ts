import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { LoadingController, Events } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import { ExplorerService } from 'src/app/services/explorer.service';
import { RecommendationModel } from 'src/app/models/recommendation-model';
import * as moment from 'moment';
import { filterByHaversine, getDistanceByLocation } from 'src/app/utils/map-utils';
import { ActivatedRoute } from '@angular/router';

const { Geolocation } = Plugins;
declare var google;

@Component({
  selector: 'app-shared-reco',
  templateUrl: './shared-reco.page.html',
  styleUrls: ['./shared-reco.page.scss'],
})
export class SharedRecoPage implements OnInit {

  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;
  @ViewChild('recoCardList', { read: ElementRef }) private cardListElem: ElementRef;
  
  recMapArray: RecommendationModel[] = [];
  recCardArray: RecommendationModel[] = [];
  service: any;
  placesService: any;
  query: string = '';
  places: any = [];
  saveDisabled: boolean;
  location: any;
  activatedRecoId: any;
  activatedRecoIndex: any;
  FILTER_DISTANCE = -1; // all data load
  CardItemWidth = 330;
  sharedRecoId: any;
  userName: any;

  constructor(
    private ev: Events,
    private loadingCtrl: LoadingController,
    private explorerService: ExplorerService,
    private route: ActivatedRoute
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
    // get ask info from parameter
    this.sharedRecoId = this.route.snapshot.paramMap.get('sharedId');
    console.log('Got Shared Reco IDs => ' + this.sharedRecoId);
  }

  async ionViewWillEnter() {
    this.recMapArray = [];
    this.recCardArray = [];
    await this.getSharedRecos();
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

  async getSharedRecos() {
    // get recommendations of all friends
    const result = await this.explorerService.getSharedRecos(this.sharedRecoId);
    const usersLocation = await this.map.getCurrentLocation();
    console.log('Returned Recos array => ', result.recos);
    console.log(usersLocation);
    // Get distance and sort by distance
    const sortedRecsArray = await getDistanceByLocation(result.recos, usersLocation) ;
    /*sortedRecsArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });*/
    
    // Generate recMapArray

    let dist = 0;
    let index = 0;
    sortedRecsArray.forEach(data => {
      console.log('data=>', data);
      this.userName = data.userName;
      if (!data.gType) {
        return;
      }
      const createdAt = moment.unix(data.timestamp.seconds).format('MMM YYYY');
      let userPhoto = '';
      if (data.photoURL) {
        userPhoto = data.photoURL;
      }
      const newRec = new RecommendationModel(data.id,
                                            data.name,
                                            data.city,
                                            data.location.lat,
                                            data.location.lng,
                                            data.gType,
                                            0,
                                            [data.userName],
                                            [data.user],
                                            [userPhoto],
                                            [data.notes],
                                            [data.picture],
                                            [data.pictureThumb],
                                            [createdAt],
                                            data.phone,
                                            data.website,
                                            true);
      // make array for markers of Map
      this.recMapArray.push(newRec);
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
    const usersLocation = this.map.getCurrentLocation();
    console.log('current usersLocation', usersLocation);
    // filter recommendation within 100 miles of selected place's location
    this.recCardArray = await filterByHaversine(this.recMapArray, usersLocation, this.FILTER_DISTANCE);
    this.recCardArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });
    console.log('Sorted Card result by distance => count: ' + this.recCardArray.length);
    console.log('Sorted Card result by distance =>', this.recCardArray);
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

  // Recommendations are shown for a selected place without API.
  reloadRecsDataByPlace() {
    // move map by selected location
    this.map.moveCenter();
    // filter card data by selected location
    this.filterCardRecoByDistance();
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
    await this.map.setCurrentLocation(lat, lng);
    await this.map.moveCenter();
    // get index of marker
    const mapRecoIndex = this.recMapArray.findIndex ( reco => {
      return reco.id === recoId;
    });
    await this.map.showInfoWindow(mapRecoIndex);

    // open detail modal
    /* const modal = await this.modalController.create({
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
    return await modal.present(); */
  }

  downloadApp() {
    console.log('clicked download app button');
  }

}
