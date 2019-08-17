import { Component } from '@angular/core';
import { Plugins }   from '@capacitor/core';

import { Platform } from '@ionic/angular';

import * as firebase from 'firebase/app';
import { firebaseConfig } from '../app/credentials';

// import { SplashScreen } from '@ionic-native/splash-screen/ngx';


const { SplashScreen, StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor() {

    firebase.initializeApp(firebaseConfig);


    SplashScreen.hide().catch((err) => {
      console.warn(err);
    });

    StatusBar.hide().catch((err) => {
      console.warn(err);
    });
  }

  initializeApp() {


  }
}
