import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MytripService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    // private headers: HttpHeaders,
    private loadingService: LoadingService
  ) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.eventListRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/eventList`);
      }
    });
  }

  async getFdlURL(selRecos) {
    const apiKey = environment.firebase.apiKey;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('call api to create dynamic link of firebase');
    await this.loadingService.doFirebase( async () => {
      const url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`;
      const resp = await this.http
      .post(
        url,
        {
          'dynamicLinkInfo': {
            'domainUriPrefix': 'https://link.reco.com',
            'link': 'https://reco.com/recos',
            'androidInfo': {
              'androidPackageName': 'com.bowieventures.recoapp'
            },
            'iosInfo': {
              'iosBundleId': 'com.bowieventures.recoapp'
            }
          }
        },
        {
          headers
        }
      )
      .toPromise();
      console.log(resp);
      return resp;
    });
    // console.log('finish get firends');
    // return friendsArray;

  }

}



