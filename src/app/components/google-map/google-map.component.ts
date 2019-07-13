import { Component,Input, Renderer2, ElementRef, Inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { Plugins, Network }  from '@capacitor/core';
import { inject } from '@angular/core/testing';
import { reject } from 'q';
import { DataService } from '../../services/data.service';
import { RecommendationModel } from 'src/app/models/recommendation-model';

const { Geolocation, Newtwork } = Plugins; 


declare var google;

@Component({
  selector: 'google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent {

  @Input('apiKey') apiKey: string;

  // variables
  public map:any;
  public infowindow:any;
  public infowindows = [];
  public marker:any;
  public firstLoadFailed:boolean = false;
  private mapsLoaded:boolean = false;
  private newtworkHandler = null;
  public connectionAvailable:boolean = true;
  public contentString:any =  '<div id="content">'+
  '<div id="siteNotice">'+
  '</div>'+
  '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
  '<div id="bodyContent">'+
  '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
  'sandstone rock formation in the southern part of the '+
  'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
  'south west of the nearest large town, Alice Springs; 450&#160;km '+
  '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
  'features of the Uluru - Kata Tjuta National Park. Uluru is '+
  'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
  'Aboriginal people of the area. It has many springs, waterholes, '+
  'rock caves and ancient paintings. Uluru is listed as a World '+
  'Heritage Site.</p>'+
  '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
  'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
  '(last visited June 22, 2009).</p>'+
  '</div>'+
  '</div>';

  constructor
  (
    private renderer: Renderer2,
    private element: ElementRef,
    private platform: Platform,
    private dataService: DataService,
    @Inject(DOCUMENT) private _document

  ) {}

  // public function intended to be called from location page 
  // promise returns to let location page the map has fully loaded 
  public init(): Promise <any> {
    return new Promise((resolve, reject) => {
      // make sure we don't load / inject the SDK twice 
      if(typeof(google)=="undefined"){
        console.log("GoogleMapComponent.google =")

        this.loadSDK().then((res)=>{
           console.log("GoogleMapComponent.SDKLoaded")
          this.initMap().then((res)=>{
            console.log("GoogleMapComponent.MapInitialized")
            this.enableMap();
            resolve(true);
          },(err) => {
            this.disableMap();
            reject(err);
          });
        }, (err) =>{
          this.firstLoadFailed = true;
          reject(err);
        });
      }else{
          reject('Google Maps Already running')
      }
    });
  }

  // start loading the SDK, but only if there is an internet connection 
  private loadSDK():Promise <any> {
    console.log('Loading Google Maps SDK');
    // connectivity listner will automatically load the SDK when an internet connection is ready
    this.addConnectivityListeners();
    return new Promise((resolve, reject)=>{
      if(!this.mapsLoaded){
        // first check on mobile using capacitor 
        Network.getStatus().then((status)=>{
          if(status.connected){
            this.injectSDK().then((res)=>{
              resolve(true);
            },(err) => {
              reject('Not online')
            });
          }
          else{
            reject('Not online');
          }
        },
          (err) =>{
            if(navigator.onLine){
              this.injectSDK().then((res)=>{
                resolve(true);
              },(err) => {
                reject(err)
              });
            } else{
              reject('Not online');
            }
          }).catch((err) => {console.warn(err);});
        } else{
          reject('sdk already loaded')
        }
    })
  }


  // create a script element and manually inject with the google SRC
  private injectSDK():Promise <any> {
    return new Promise((resolve, reject)=>{

      // gets triggered by the map's call back function
      // so we attach this function to the window 
      window['mapInit'] = () => {
        this.mapsLoaded = true;
        resolve(true)
      }

      let script = this.renderer.createElement('script');
      script.id  = 'googleMaps';

      if(this.apiKey){
        // script.src = 'https://maps.googleapis.com/maps/api/js?key='+ this.apiKey + '&callback=mapInit';

        script.src = 'https://maps.googleapis.com/maps/api/js?key='+ this.apiKey + '&libraries=places&callback=mapInit';
      }else{
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }
      this.renderer.appendChild(this._document.body, script);
    })
  }


// called once the sdk is loaded and responsible for setting up the current map
  private async initMap():Promise <any> {
    return new Promise ((resolve, reject) =>{
      Geolocation.getCurrentPosition().then((position) => {

        console.log(position);

        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
            center: latLng,
            zoom: 15
        };

        this.map         = new google.maps.Map(this.element.nativeElement, mapOptions);
        
        console.log('GoogleMapComponent.InitiMap.Infowindow')
        console.log(this.infowindow)
        resolve(true);

    }, (err) => {

        reject('Could not initialise map');

    });
    });
  }

  disableMap():void {
    this.connectionAvailable = false;

  }

  enableMap():void {
    this.connectionAvailable = true;


  }

  // triggers each time the network status changes
  addConnectivityListeners():void {

    console.warn('Capacitor API does not currently have a web implementation. This will only work when running as an ios / android app');

    if(this.platform.is('cordova')){
      this.newtworkHandler = Network.addListener('networkStatusChange', (status) =>{
        if(status.connected){
          if(typeof google == 'undefined' && this.firstLoadFailed){
            this.init().then((res) => {
              console.log("Google maps ready!")
            }, (err) => {
              console.log(err)
            });
          }
          else{
            this.enableMap();
          }
        }
        else{
          this.disableMap();
        }
      });

    }


  }

  // utility function to drop a new pin
  public changeMarker(lat:number,lng:number){

    let latLng = new google.maps.LatLng(lat,lng);

    let marker = new google.maps.Marker({
      map:this.map, 
      animation:google.maps.Animation.DROP,
      position:latLng
    });


    // remove marketer if exists
    if(this.marker){
      this.marker.setMap(null);
    }

    // add new marker 
    this.marker = marker;

  }

  // function used by location page to add reco markers and info window 
  public addMarkers(recosArray: RecommendationModel[]){

    // arrays to store the info 
    var markers = [];
    var infowindows = [];


    // create a marker and info window for each one 
    for (var i = 0; i < recosArray.length; ++i) {


      // create the info window for each   
      infowindows[i] = new google.maps.InfoWindow({
          // content:recosArray[i].name
          content:this.formatContent(recosArray[i])
      });

      // get lat / long for the reco
      var latLng = new google.maps.LatLng(recosArray[i].lat,recosArray[i].lng);

      // create marker and add it to the array 
      markers[i] = new google.maps.Marker({
        position:latLng,
        map:this.map, 
        animation:google.maps.Animation.DROP,
        label:"L",
        title: 'Hello World!'
        // icon: fonekingiconsrc
      });

      // add listener to the map
      google.maps.event.addListener(markers[i], 'click', (function(marker, i) {
        return function() {
         infowindows[i].open(this.map, markers[i]);
        }
       })(markers[i], i));
    }
  };  


  formatContent(reco: RecommendationModel){


    var content = 

    '<div id="siteNotice">'+
    '</div>'+
    '<h1 id="firstHeading" class="firstHeading">'+reco.name + '</h1>'+
    '<div id="bodyContent">'+
    '<p>recommended by <b>'+ 'Liam</b>'+'</p>'+
    '<p>'+reco.notes+'</p>'
    // '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
    // 'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
    // '(last visited June 22, 2009).</p>'+
    '</div>'+
    '</div>';

    return content;

  }



  

  ngOnInit() {
      this.init().then((res) => {
        console.log("Google Maps ready.")
        
    }, (err) => {    
        console.log(err);
    });
  }





}
