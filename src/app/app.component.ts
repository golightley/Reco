import { Component } from '@angular/core';
import { Plugins }   from '@capacitor/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';


const { SplashScreen, StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor() {
    SplashScreen.hide().catch((err)=>{
      console.warn(err)
    });

    StatusBar.hide().catch((err)=>{
      console.warn(err)
    })

  }

  initializeApp() {


  }
}
