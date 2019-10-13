import { Component, Input, Renderer2, ElementRef, Inject, OnInit } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { Plugins, Network } from '@capacitor/core';
import { RecommendationModel } from 'src/app/models/recommendation-model';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';

const { Geolocation} = Plugins;

declare var google;

@Component({
  selector: 'google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {

  @Input('apiKey') apiKey: string;
  @Input('lat') lat: string;
  @Input('long') long: string;


  // variables
  public map: any;
  public infoWindow: any;
  public infoWindows = [];
  public marker: any;
  public firstLoadFailed: boolean = false;
  public mapsLoaded: boolean = false;
  public connectionAvailable: boolean = true;
  public curLocationLat: number = 0;
  public curLocationLng: number = 0;
  private networkHandler = null;
  activeInfoWindow: any;

  public readyTointeract: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  googleMapMarkers: any[] = [];

  constructor(
    private ev: Events,
    private renderer: Renderer2,
    private element: ElementRef,
    private platform: Platform,
    private storage: Storage,
    @Inject(DOCUMENT) private _document
  ) {}


  // public function intended to be called from location page 
  // promise returns to let location page the map has fully loaded 
  public init(): Promise<any> {
    // load the behavoir subject 
    this.load();
    return new Promise((resolve, reject) => {
      // make sure we don't load / inject the SDK twice 
      if (typeof (google) === 'undefined') {
        console.log('GoogleMapComponent.google =');

        this.loadSDK().then(async (res) => {
          console.log('GoogleMapComponent.SDKLoaded');
          await this.initMap().then((res) => {
            console.log('GoogleMapComponent.MapInitialized');
            this.enableMap();
            this.updateBoolToTrue();
            resolve(true);
          }, (err) => {
            // this.disableMap();
            reject(err);
          });
        }, (err) => {
          this.firstLoadFailed = true;
          reject(err);
        });
      } else {
        reject('Google Maps Already running');
      }
    });
  }

  load(): void {
    this.storage.get('readyTointeract').then((data) => {
        this.readyTointeract.next(data);
    });
}


updateBoolToTrue(): void {
  this.storage.set('readyTointeract', true);
  this.readyTointeract.next(true);
  console.log("Set value to "+ this.readyTointeract)
}

  // public init(recosArray): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     // make sure we don't load / inject the SDK twice
  //     if (typeof (google) === 'undefined') {
  //       console.log('GoogleMapComponent.google =');

  //       this.loadSDK().then(async (res) => {
  //         console.log('GoogleMapComponent.SDKLoaded');
  //         await this.initMap().then((res) => {
  //           console.log('GoogleMapComponent.MapInitialized');

  //           this.addMarkers(recosArray);

  //           this.enableMap();
  //           resolve(true);
  //         }, (err) => {
  //           this.disableMap();
  //           reject(err);
  //         });
  //       }, (err) => {
  //         this.firstLoadFailed = true;
  //         reject(err);
  //       });
  //     } else {
  //       reject('Google Maps Already running');
  //     }
  //   });
  // }

  

  // start loading the SDK, but only if there is an internet connection 
  private  loadSDK(): Promise <any> {
    console.log('Loading Google Maps SDK');
    // connectivity listner will automatically load the SDK when an internet connection is ready
    this.addConnectivityListeners();
    return new Promise((resolve, reject) => {
      if(!this.mapsLoaded){
        // first check on mobile using capacitor 
        Network.getStatus().then((status) => {
          if(status.connected){
            this.injectSDK().then((res) => {
              resolve(true);
              console.log(' - End Map load SDK - ');
            },(err) => {
              reject('Not online')
            });
          }
          else {
            reject('Not online');
          }
        },
          (err) => {
            if (navigator.onLine){
              this.injectSDK().then((res) => {
                resolve(true);
              } ,( err ) => {
                reject(err);
              });
            } else{
              reject('Not online');
            }
          }).catch((err) => {console.warn(err);});
        } else{
          reject('sdk already loaded');
        }
    })
  }


  // create a script element and manually inject with the google SRC
  private injectSDK():Promise <any> {
    return new Promise((resolve, reject)=>{
      console.log('map inject sdk');
      // gets triggered by the map's call back function
      // so we attach this function to the window 
      window['mapInit'] = () => {
        this.mapsLoaded = true;
        resolve(true)
      }

      const script = this.renderer.createElement('script');
      script.id  = 'googleMaps';

      if (this.apiKey) {
        // script.src = 'https://maps.googleapis.com/maps/api/js?key='+ this.apiKey + '&callback=mapInit';

        script.src = 'https://maps.googleapis.com/maps/api/js?key='+ this.apiKey + '&libraries=places&callback=mapInit';
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }
      this.renderer.appendChild(this._document.body, script);
    })
  }


// called once the sdk is loaded and responsible for setting up the current map
  private async initMap(): Promise <any> {
    console.log("google-map-component.InitMapMethod");
    return new Promise ((resolve, reject) => {
        // if lat long already set in the html 
        console.log("Has lat long been set?")
        console.log(this.lat)
        console.log(this.long)

      //   if(this.lat && this.long){
      //     this.curLocationLat = Number(this.lat);
      //     this.curLocationLng = Number(this.long);

      //     // this.curLocationLat = 40.74;
      //     // this.curLocationLng = -73.99;

      //     const latLng = new google.maps.LatLng(this.curLocationLat, this.curLocationLng);

      //     const mapOptions = {
      //       /*   zoomControl: boolean,
      //         mapTypeControl: boolean,
      //         scaleControl: boolean,
      //         streetViewControl: boolean,
      //         rotateControl: boolean,
      //         fullscreenControl: boolean */
      //         zoomControl : false,
      //         streetViewControl: false,
      //         fullscreenControl: false,
      //         mapTypeControl: false,
      //         center: latLng,
      //         zoom: 12
      //     };
  
      //     this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
      //     console.log('GoogleMapComponent.InitiMap.infoWindow');
      //     resolve(true);
      //   }else{

      // console.log("Lat and long not set...")
     if(!this.lat && !this.long){

      // lat long hasn't been set 
      Geolocation.getCurrentPosition().then((position) => {

        this.curLocationLat = position.coords.latitude;
        this.curLocationLng = position.coords.longitude;
        console.log(this.curLocationLat);
        const latLng = new google.maps.LatLng(this.curLocationLat, this.curLocationLng);

        const mapOptions = {
          /*   zoomControl: boolean,
            mapTypeControl: boolean,
            scaleControl: boolean,
            streetViewControl: boolean,
            rotateControl: boolean,
            fullscreenControl: boolean */
            zoomControl : false,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            center: latLng,
            zoom: 12
        };

        this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
        console.log('GoogleMapComponent.InitiMap.infoWindow');
        resolve(true);
      })}else{
        
         this.curLocationLat = Number(this.lat);
         this.curLocationLng = Number(this.long);
          
         const latLng = new google.maps.LatLng(this.curLocationLat, this.curLocationLng);

         const mapOptions = {
            /*   zoomControl: boolean,
              mapTypeControl: boolean,
              scaleControl: boolean,
              streetViewControl: boolean,
              rotateControl: boolean,
              fullscreenControl: boolean */
              zoomControl : false,
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
              center: latLng,
              zoom: 12
          };
  
          this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
          console.log('GoogleMapComponent.InitiMap.infoWindow');
          resolve(true);

      }
    // }
    });
    
  }

    // }, (err) => {
    //     console.log("Error in initMap Method ");
    //     console.log(err);
    //     console.log("Load map to NYC as error solve ");
    //     // try to initialze the map for NYC
    //     this.curLocationLat = 40.74;
    //     this.curLocationLng = -73.99;
    //     console.log(this.curLocationLat);
    //     const latLng = new google.maps.LatLng(this.curLocationLat, this.curLocationLng);

    //     const mapOptions = {
    //       /*   zoomControl: boolean,
    //         mapTypeControl: boolean,
    //         scaleControl: boolean,
    //         streetViewControl: boolean,
    //         rotateControl: boolean,
    //         fullscreenControl: boolean */
    //         zoomControl : false,
    //         streetViewControl: false,
    //         fullscreenControl: false,
    //         mapTypeControl: false,
    //         center: latLng,
    //         zoom: 12
    //     };

    //     this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
    //     console.log('GoogleMapComponent.InitiMap.infoWindow');
    //     resolve(true);
    //     // reject('Could not initialise map');
    // });

  

  public moveCenter(lat?, lng?) {
    // move map by current location
    const latLng = new google.maps.LatLng(lat || this.curLocationLat, lng || this.curLocationLng);
    this.map.setCenter(latLng);
  }

  public getCurrentLocation() {
    const location = {
      lat: this.curLocationLat,
      lng: this.curLocationLng
    };
    return location;
  }

  public setCurrentLocation(lat,lng) {
    this.curLocationLat = lat;
    this.curLocationLng = lng;
  }

  // show info window of activated marker when clicking a place card of list.
  public showInfoWindow(markerIndex) {
    this.closeActiveInfoWindow();
    this.infoWindows[markerIndex].open(this.map, this.googleMapMarkers[markerIndex]);
    this.activeInfoWindow = this.infoWindows[markerIndex];
  }
  
  // close active info window
  public closeActiveInfoWindow() {
    if (this.activeInfoWindow) {
      this.activeInfoWindow.close();
    }
  }

  disableMap(): void {
    this.connectionAvailable = false;

  }

  enableMap(): void {
    this.connectionAvailable = true;


  }

  // triggers each time the network status changes
  addConnectivityListeners(): void {

    console.warn('Capacitor API does not currently have a web implementation. This will only work when running as an ios / android app');

    if (this.platform.is('cordova')) {
      this.networkHandler = Network.addListener('networkStatusChange', (status) =>{
        if (status.connected){
          if (typeof google === 'undefined' && this.firstLoadFailed) {
            this.init().then((res) => {
              console.log('Google maps ready!');
            }, (err) => {
              console.log(err);
            });
          } else {
            this.enableMap();
          }
        } else {
          // this.disableMap();
        }
      });

    }


  }

  // utility function to drop a new pin
  public changeMarker(lat: number, lng: number) {

    const latLng = new google.maps.LatLng(lat, lng);

    const marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });


    // remove marketer if exists
    if (this.marker) {
      this.marker.setMap(null);
    }

    // add new marker
    this.marker = marker;

  }

  private getLabelString(str) {
    for ( let i = 0; i < str.length; i++ ) {
      const c = str.charAt(i);
      if ( c !== '@' ) {
        return c.toUpperCase();
      }
    }
  }

  // function used by location page to add reco markers and info window 
  addMarkers(recosArray: RecommendationModel[]) {

    this.deleteMarkers();
    const that = this;
    const groupIcon = {
      url: 'assets/images/group_marker.png', // image url
      scaledSize: new google.maps.Size(26, 45), // scaled size
    };
    
    // create a marker and info window for each one
    for (let i = 0; i < recosArray.length; ++i) {
        // create the info window for each
        this.infoWindows[i] = new google.maps.InfoWindow({
            // content: recosArray[i].name
            content: this.formatContent(recosArray[i])
        });

        // get lat / long for the reco
        const latLng = new google.maps.LatLng(recosArray[i].lat, recosArray[i].lng);
        let markerLabel = 'Gr'; // group label
        if ( recosArray[i].userNames.length === 1 ) {
          // console.log(recosArray[i].userNames);
          // create single marker with first character
          markerLabel = this.getLabelString(recosArray[i].userNames[0]);
          this.googleMapMarkers[i] = new google.maps.Marker({
            position: latLng,
            map: this.map,
            animation: google.maps.Animation.DROP,
            recoId: recosArray[i].id,
            label: markerLabel
          });
        } else {
          // create group marker
          this.googleMapMarkers[i] = new google.maps.Marker({
            position: latLng,
            map: this.map,
            animation: google.maps.Animation.DROP,
            recoId: recosArray[i].id,
            icon: groupIcon
          });
        }

        // add listener to the map
        google.maps.event.addListener(that.googleMapMarkers[i], 'click', ( (marker, i) => {
          return function() {
            that.closeActiveInfoWindow();
            that.infoWindows[i].open(that.map, that.googleMapMarkers[i]);
            // publish event
            that.ev.publish('select-marker', {
              reco_id: recosArray[i].id
            });
            that.activeInfoWindow = that.infoWindows[i];
          };
        })(that.googleMapMarkers[i], i));
    }

    console.log('Added markers on Map => count: ' + recosArray.length);
    console.log('google marker count: ' + this.googleMapMarkers.length);
  }

  // filter marker by selected friend
  async displayMarkers(recosArray: RecommendationModel[]) {
    await recosArray.map( async (reco, index) => {
      if ( reco.visible ) {
        this.googleMapMarkers[index].setVisible(true);
      } else {
        this.googleMapMarkers[index].setVisible(false);
      }
    });
  }

  // Sets the map on all markers in the array.
  setMapOnAll(map) {
    for (var i = 0; i < this.googleMapMarkers.length; i++) {
      this.googleMapMarkers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  clearMarkers() {
    this.setMapOnAll(null);
  }

  // Shows any markers currently in the array.
  showMarkers() {
    this.setMapOnAll(this.map);
  }

  // Deletes all markers in the array by removing references to them.
  deleteMarkers() {
    this.clearMarkers();
    this.googleMapMarkers = [];
    // arrays to store the info
    this.infoWindows = [];
  }

  formatContent(reco: RecommendationModel) {
    const content =
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">' + reco.name + '</h1>' +
      '<div id="bodyContent">' +
      '<p>recommended by <b>' + reco.userNames.join() + '</b></p>' +
      // '<p>' + reco.notes[0] + '</p>' +
      // '</div>' +
      '</div>';
      // '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
      // 'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
      // '(last visited June 22, 2009).</p>'+

    return content;

  }

  ngOnInit() {
    // var test = [];
    this.init().then((res) => {
      console.log('Google Maps ready.');
    }, (err) => {
        console.log(err);
    });
  }

}
