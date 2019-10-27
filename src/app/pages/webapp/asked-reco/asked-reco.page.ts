import { Events, ModalController } from '@ionic/angular';
import { AskedRecoService } from 'src/app/services/asked-reco.service';
import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';
import { filterByHaversine, getDistanceByLocation } from 'src/app/utils/map-utils';
import * as moment from 'moment';
import { RecommendationModel } from 'src/app/models/recommendation-model';
import { AddRecoModalPage } from './add-reco-modal/add-reco-modal.page';

@Component({
  selector: 'app-asked-reco',
  templateUrl: './asked-reco.page.html',
  styleUrls: ['./asked-reco.page.scss'],
})
export class AskedRecoPage implements OnInit {
  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;
  @ViewChild('recoCardList', { read: ElementRef }) private cardListElem: ElementRef;
  
  recoTitle: string;
  isCreatedReco: boolean;

  CardItemWidth = 330;

  askUserName: string;
  askId: string;
  askLat: string;
  askLng: string;

  addRecoTitle = 'Share your recommendations';
  recMapArray: RecommendationModel[] = [];
  recCardArray: RecommendationModel[] = [];
  activatedRecoId: any;
  activatedRecoIndex: any;
  

  constructor(
    private route: ActivatedRoute,
    private askedRecoService: AskedRecoService,
    private renderer: Renderer2,
    private router: Router,
    private ev: Events,
    private modalController: ModalController
  ) {
    this.ev.subscribe('select-marker', async (params) => {
      console.log('Subscribe select marker event: ', params);
      if (params && params.reco_id) {
        this.activatedRecoId = params.reco_id;
        this.activateRecoCard();
      }
    });
   }

  async ngOnInit() {
    await this.getParam();
  }

  async ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    this.recMapArray = [];
    this.recCardArray = [];

    if (localStorage.getItem('userId')) {
      this.isCreatedReco = true;
      this.addRecoTitle = 'Add another Reco';
    } else {
      this.isCreatedReco = false;
      this.addRecoTitle = 'Share your recommendations';
    }
    await this.showRecosMap();
    await this.showRecosCardList();
  }
  async getParam() {
    // get ask info from parameter
    this.askId = this.route.snapshot.paramMap.get('id');
    this.askLat = this.route.snapshot.paramMap.get('lat') || '40.74';
    this.askLng = this.route.snapshot.paramMap.get('lng') || '-73.99';
    localStorage.setItem('askId', JSON.stringify(this.askId));
    localStorage.setItem('askLat', JSON.stringify(this.askLat));
    localStorage.setItem('askLng', JSON.stringify(this.askLng));
    console.log('Got parameter => ' + this.askId + ', ' + this.askLat + ', ' + this.askLng);
  }

  // show the modal for create a recommendation
  async shareYourReco() {
    const modal = await this.modalController.create({
      component: AddRecoModalPage,
      componentProps: {
        askId: this.askId,
        lat: this.askLat,
        lng: this.askLng
      }
    });
    // wait for the modal to be dismissed
    modal.onDidDismiss().then((dataReturned) => {
      console.log('return modal' + dataReturned);
      if (dataReturned != null && dataReturned.data === 'Created') {
        this.loadData();
      }
    });
    return await modal.present();
  }

  async showRecosMap() {
    const askedReco = await this.askedRecoService.getAskForReco(this.askId);
    console.log(askedReco);
    if (!askedReco) {
      return;
    }

    this.askUserName = askedReco.userName;
    localStorage.setItem('askUserId', JSON.stringify(askedReco.user));
    
    this.recoTitle = `${this.askUserName} is asking for ${askedReco.location} Recommendations`;
    if (!(askedReco.recsArray && askedReco.recsArray.length > 0)) {
      return;
    }

    // ****** show markers and recommendation list ****** //
    // Get distance and sort by distance
    const sortedRecsArray = await getDistanceByLocation(askedReco.recsArray, {lat: this.askLat, lng: this.askLng}) ;
    sortedRecsArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });

    // Generate recMapArray
    let dist = 0;
    let index = 0;
    sortedRecsArray.forEach(data => {
      if (!data.gType) {
        return;
      }
      const createdAt = moment.unix(data.timestamp.seconds).format('MMM YYYY');
      // grouping recommendations for the same place
      if ( data.distance !== dist || dist === 0 ) {
        const newRec = new RecommendationModel(data.id,
                                              data.name,
                                              data.city,
                                              data.location.lat,
                                              data.location.lng,
                                              data.gType,
                                              0,
                                              [data.userName],
                                              [data.user],
                                              [data.userPhoto],
                                              [data.notes],
                                              [data.picture],
                                              [data.pictureThumb],
                                              [createdAt],
                                              data.phone,
                                              data.website,
                                              true);
        // make array for markers of Map
        this.recMapArray.push(newRec);
        index++;
      } else {
        const rec = this.recMapArray[index - 1];
        rec.userNames.push(data.userName);
        rec.userIds.push(data.user);
        rec.userPhotoURLs.push(data.userPhoto);
        rec.notes.push(data.notes);
        rec.createdAts.push(createdAt);
        // remove empty picture
        if ( rec.pictures[rec.pictures.length - 1] === '') {
          console.log('&&&& slice empty picture &&&&');
          rec.pictures.shift();
          rec.pictureThumbs.shift();
        }
        if (data.picture) {
          rec.pictures.push(data.picture); // can't know whose picture.
          rec.pictureThumbs.push(data.pictureThumb);
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
    });
  }

  async showRecosCardList() {
    // filter recommendation within 100 miles of selected place's location
    this.recCardArray = await filterByHaversine(this.recMapArray, {lat: this.askLat, lng: this.askLng}, -1 /** load all data */ );
    this.recCardArray.sort((locationA, locationB) => {
      return locationA.distance - locationB.distance;
    });
    console.log('Sorted Card result by distance => count: ' + this.recCardArray.length);
    console.log('Sorted Card result by distance =>', this.recCardArray);
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
  }

  async activateRecoCard() {
    console.log('Activate reco on card list: reco id=>' + this.activatedRecoId);
    const showIndex = await this.getRecoIndexOnCardList(this.activatedRecoId);
    const xPoint = this.CardItemWidth * showIndex - 15;
    // console.log(this.CardItemWidth, xPoint);
    this.moveScollCardList(xPoint);
  }

  async moveScollCardList(x) {
    this.cardListElem.nativeElement.scrollTo(x, 0, 5000);
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


  createProfile() {
    this.router.navigate(['/webapp-user']);
  }
}
