import { Component, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular'
import { Plugins } from '@capacitor/core'
import { GoogleMapComponent } from '../components/google-map/google-map.component'
import { DataService } from '../services/data.service';
import { RecommendationModel } from '../models/recommendation-model';
import { AuthService } from '../services/user/auth.service';
import { filterByHaversine } from 'src/app/utils/map-utils';

const { Geolocation } = Plugins;
declare var google;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;

  private latitude: number;
  private longitude: number;
  public stopSuggestions: any = ['Test','es','t','te','te','et']
  public recMapResults: RecommendationModel[] = [];
  public recCardResults: RecommendationModel[] = [];
  public markersArray: any = [];
  service: any;
  placesService: any;
  query: string = '';
  places: any = [];
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any; 
  autocompleteService: any;

  FILTER_DISTANCE = 100;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private dataService: DataService,
    private platform: Platform,
    private renderer: Renderer2,
    private authService: AuthService,


  ) { }

  ngOnInit() {

    console.log('Location.NgOnInit: Google Variable status');
    // console.log(google)
    console.log('Location.NgOnInit: Map Variable status');

    /* this.authService.getUsersFolliowing().then((usersFollowingArray)=>{
      this.getRecommendations();
    }); */
  }

  ionViewWillEnter() {
    this.getRecommendations();
  }


  async getRecommendations() {

    const getType = 'all';
    const recsArray = await this.dataService.getRecommendations(getType);
    // console.log('recsArray', recsArray);

    this.recMapResults = [];
    recsArray.forEach( data => {
      const newRec = new RecommendationModel(
            data.id, data.data().name, data.data().city, data.data().notes, data.data().location.lat, data.data().location.lng, 0, data.userName
          );

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
    console.log(this.recCardResults);
  }

  loadRecsData() {
    // move map by selected location
    this.map.moveCenter();
    // filter card data by selected location
    this.filterRecommendations();
  }

  setLocation():void {

    this.loadingCtrl.create({
      message:'Setting current location'

    }).then((overlay)=>{
      overlay.present();
      Geolocation.getCurrentPosition().then((postition)=>{
        overlay.dismiss();
        
        this.latitude   = postition.coords.latitude;
        this.longitude = postition.coords.longitude;
        
        this.map.changeMarker(this.latitude, this.longitude);

        let data = {
          latitude: this.latitude,
          longitude: this.longitude
        };

        this.alertCtrl.create({
          header:'location set',
          message:'You are good!',
          buttons: [
            {
              text:'ok'
            }
          ]
        }).then((alert)=>{
          alert.present();
        })

      },(err)=>{
        console.log(err)
        overlay.dismiss();
      });
    });
  }
  
  searchPlace(){

    try{
      this.autocompleteService = new google.maps.places.AutocompleteService()
    }catch(err){
      console.log('Autocomplete service failed')
      console.log(err)
    }

    console.log('Searchplace')

    this.saveDisabled = true;

    if(this.query.length > 0 && !this.searchDisabled) {

        let config = {
            types: ['geocode'],
            // types: ['geocode'],
            input: this.query
        }

          this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
          console.log('CreateModalPage.SearchPlace.Autocomplete')
          console.log(predictions)
          console.log(status)

            if(status == google.maps.places.PlacesServiceStatus.OK && predictions){

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

  selectPlace(place){

    let div = this.renderer.createElement('div');
    div.id  = 'googleDiv';
    this.service = new google.maps.places.PlacesService(div);


    this.places = [];

    let location = {
        lat: null,
        lng: null,
        name: place.name,
        city:null
    };

    this.service.getDetails({placeId: place.place_id}, (details) => {
            console.log('CreatePlaceModal.SelectPlace')
            console.log(details)
            location.name = details.name;
            location.lat  = details.geometry.location.lat();
            location.lng  = details.geometry.location.lng();

            this.location = location;
            console.log('location.selectPlace.GetDetails')
            console.log(this.location)
            this.query = location.name;
            this.map.setCurrentLocation(location.lat, location.lng);
            this.loadRecsData();

    });

  }

  takeMeHome():void {

    if(!this.latitude || !this.longitude){

      this.alertCtrl.create({
        header:'No where to go',
        message:'No location set!',
        buttons: [
          {
            text:'ok'
          }
        ]
      }).then((alert)=>{
        alert.present();
      })
    }
    else{
      let destination = this.latitude + ',' + this.longitude;
      if(this.platform.is('ios')){
        window.open('maps://?q='+destination+'_system')
      }else{
        let label = encodeURI('My location')
        window.open('geo:0,0?q=' + destination + '('+label +')','_system')
      }
    }

    }

}
