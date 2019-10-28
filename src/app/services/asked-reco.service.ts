import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { AuthService } from './user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AskedRecoService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(
    // private headers: HttpHeaders,
    private loadingService: LoadingService,
    private authService: AuthService,
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
    const recsArray: any[] = [];
    let query;
    const result = await this.loadingService.doFirebase(async () => {
      return new Promise<any>(async (resolve, reject) => {
          await firebase.firestore().collection('askForRecommendations').doc(askId).get()
          .then(async asked => {
            console.log('SERVICE.getAskForReco:', asked.id);
            const recoIds = asked.data().sharedRecos;
            if (recoIds) {
              await Promise.all(recoIds.map(async (recoId) => {
                query = firebase.firestore().collection('recommendations').doc(recoId);
                await query.get().then(async (rec) => {
                  if (rec.data().user) {
                    const user = await this.authService.getCurrentUser(rec.data().user);
                    const userName = user.handle || '';
                    const userPhoto = user.photoURL || '';
                    if (rec.data()) {
                      const data = {
                        id: rec.id,
                        userName,
                        userPhoto,
                        ...rec.data()
                      };
                      recsArray.push(data);
                    }
                  }
                });
              }));
            }
            const returnData = {
              recsArray,
              ...asked.data()
            };
            resolve(returnData);
          }).catch(error => {
            console.error('SERVICE.getAskForReco.Error getting document: ', error);
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



