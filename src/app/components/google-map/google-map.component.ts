import { Component,Input, Renderer2, ElementRef, Inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { Plugins, Network }  from '@capacitor/core';
import { inject } from '@angular/core/testing';
import { reject } from 'q';
import { DataService } from '../../services/data.service';

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
  public marker:any;
  public firstLoadFailed:boolean = false;
  private mapsLoaded:boolean = false;
  private newtworkHandler = null;
  public connectionAvailable:boolean = true;


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
      // if(typeof(google)=="undefined"){
        this.loadSDK().then((res)=>{
          this.initMap().then((res)=>{
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
      // }else{
      //     reject('Google Maps Already running')
      // }
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
        script.src = 'https://maps.googleapis.com/maps/api/js?key='+ this.apiKey + '&callback=mapInit';
      }else{
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }
      this.renderer.appendChild(this._document.body, script);
    })
  }

// called once the sdk is loaded and responsible for setting up the current map
  private async initMap():Promise <any> {
    return new Promise ((resolve, reject) =>{

      Geolocation.getCurrentPosition({enableHighAccuracy:true,timeout:1000}).then((position) => {
       
        console.log(position)

        let latLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

        let mapOptions = {
          center:latLng,
          zoom:15
        };

        this.map = new google.maps.Map(this.element.nativeElement, mapOptions);

        this.dataService.getReccos().then((recsArray)=>{

          recsArray.forEach(data => {
            this.addMarker(data.data().location.lat,data.data().location.long)
          });

          
        })
    
        resolve(true)
      }, (err)=>{
        console.log(err)
        reject('Could not initatilze map');
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


  // utility function to drop a new pin
  public addMarker(lat:number,lng:number){

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

  ngOnInit() {}

}
