import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';

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

  // create shared recommendation for share via sms.
  async createShareReco(selRecos, user) {
    const uid = firebase.auth().currentUser.uid;
    const result = await this.loadingService.doFirebase(async () => {
      return new Promise<any>(async (resolve, reject) => {
          firebase.firestore().collection('sharedRecommendations').add({
            user: uid,
            userName: user.handle,
            photoURL: user.photoURL || '',
            sharedRecos: selRecos,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(docRef => {
            console.log('SERVICE.createShareReco:', docRef.id);
            resolve(docRef.id);
          }).catch(error => {
            console.error('SERVICE.createShareReco.Error adding document: ', error);
            reject(error);
          });
      });
    });
    return result;
  }


  // delete reco 
  async deleteReco(recoId) {
    const result = await this.loadingService.doFirebase(async () => {
      return new Promise<any>(async (resolve, reject) => {
          firebase.firestore().collection("recommendations").doc(recoId).delete().then(function() {
            console.log("Document successfully deleted!");
            resolve();

        }).catch(function(error) {
          console.error("Error removing document: ", error);
          reject(error);
        });

      });
    });
    return result;
  }

  // create ask for a recommendation
  async createAskForReco(location, user) {
    if (!user) {
      return;
    }
    const result = await this.loadingService.doFirebase(async () => {
      return new Promise<any>(async (resolve, reject) => {
          firebase.firestore().collection('askForRecommendations').add({
            user: user.uid,
            userName: user.handle,
            location: location,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(docRef => {
            console.log('SERVICE.createAskForReco:', docRef.id);
            resolve(docRef.id);
          }).catch(error => {
            console.error('SERVICE.createAskForReco.Error adding document: ', error);
            reject(error);
          });
      });
    });
    return result;
  }
}



