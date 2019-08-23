import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class MytripService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(
    private storage: Storage,
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
    return 'https://example.page.link/?link=https://www.example.com/someresource&apn=com.example.android&amv=3&ibi=com.example.ios&isi=1234567&ius=exampleapp';
  }

}



