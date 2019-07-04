import { Component, ViewChild, OnInit } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular'
import { Plugins } from '@capacitor/core'
import { GoogleMapComponent } from '../components/google-map/google-map.component'
import { DataService } from '../services/data.service';

const { Geolocation } = Plugins;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;

  private latitude: number;
  private longtitude: number;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private dataService: DataService,
    private platform: Platform

  ) { }

  ngOnInit() {

    this.dataService.getLocation().then((location)=>{
      this.map.init().then((res)=>{

        if(location != null){
          this.latitude = location.latitude;
          this.longtitude = location.longitude;
          this.map.changeMarker(this.latitude,this.longtitude);
          console.log('Map Ready');
        }
      },(err)=>{
        console.log(err)
      });

  })
    
  }

  setLocation():void {

    this.loadingCtrl.create({
      message:'Setting current location'

    }).then((overlay)=>{
      overlay.present();
      Geolocation.getCurrentPosition().then((postition)=>{
        overlay.dismiss();
        
        this.latitude   = postition.coords.latitude;
        this.longtitude = postition.coords.longitude;
        
        this.map.changeMarker(this.latitude,this.longtitude);

        let data = {
          latitude: this.latitude,
          longitude: this.longtitude
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

  takeMeHome():void {

    if(!this.latitude || !this.longtitude){

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
      let destination = this.latitude + ',' + this.longtitude;
      if(this.platform.is('ios')){
        window.open('maps://?q='+destination+'_system')
      }else{
        let label = encodeURI('My location')
        window.open('geo:0,0?q=' + destination + '('+label +')','_system')
      }
    }

  }

}
