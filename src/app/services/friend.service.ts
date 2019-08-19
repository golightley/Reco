import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { ExplorerService } from './explorer.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(
    private storage: Storage,
    private loadingService: LoadingService,
    private explorerService: ExplorerService
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

  // get friends of user
  async getFriends() {
    const friendsArray: any[] = [];
    // no loading bar
    const userId = firebase.auth().currentUser.uid;
    await this.loadingService.doFirebaseWithoutLoading( async => {
        firebase.firestore().collection('userProfile').doc(userId).get().then ( async docUser => {
            if ( docUser.data().following ) {
              // resolve(docUser.data().following);
              await Promise.all(docUser.data().following.map(async (friendId) => {
                  // get friend
                  const friend = await this.explorerService.getUserByID(friendId);
                  friend.selected = false;
                  friendsArray.push(friend);
                }));
            }
          }).catch (error => {
            console.log('[Get Friends] error => ' + error);
            return error;
          });
    });
    return friendsArray;
  }



}



