import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { generateUUID } from 'src/app/utils/common';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

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


  setFriends(data): void {
    this.storage.set('worldDetails', data);
  }
  
  getFriends(): Promise<any> {
    return this.storage.get('worldDetails');
  }

}



