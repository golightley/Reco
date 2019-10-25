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
export class AskedRecoService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(
    // private headers: HttpHeaders,
    private loadingService: LoadingService,
    private storage: Storage
  ) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.eventListRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/eventList`);
      }
    });
  }
  // get ask for a recommendation
  async getAskForReco(askId) {
    if (!askId) {
      return;
    }
    const result = await this.loadingService.doFirebase(async () => {
      return new Promise<any>(async (resolve, reject) => {
          firebase.firestore().collection('askForRecommendations').doc(askId).get()
          .then(docRef => {
            console.log('SERVICE.createAskForReco:', docRef.id);
            resolve(docRef.data());
          }).catch(error => {
            console.error('SERVICE.createAskForReco.Error adding document: ', error);
            reject(error);
          });
      });
    });
    return result;
  }

  async setAskedRecoId(data): Promise<void> {
    if (data === '') {
      this.storage.set('askRecoIds', '');
    } else {
      const ids = await this.getAskedRecoId();
      let addedIds;
      if (ids) {
        addedIds = `${ids},${data}`;
      } else {
        addedIds = `${data}`;
      }
      this.storage.set('askRecoIds', addedIds);
      console.log('Set reco ids: ' + addedIds);
    }
  }
  async getAskedRecoId(): Promise<any> {
    const ids = await this.storage.get('askRecoIds');
    return ids;
  }
}



