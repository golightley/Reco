import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';

import { HttpClientModule } from  '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), 
    IonicStorageModule.forRoot(), 
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FirestoreSettingsToken, useValue: {} }

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
