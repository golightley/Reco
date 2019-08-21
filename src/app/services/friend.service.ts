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

  // get friends of user
  async getFriends() {
    const friendsArray: any[] = [];
    // no loading bar
    const userId = firebase.auth().currentUser.uid;
    await this.loadingService.doFirebaseWithoutLoading( async () => {
        await firebase.firestore().collection('userProfile').doc(userId).get().then( async docUser => {
            if ( docUser.data().following ) {
              // resolve(docUser.data().following);
              await Promise.all(docUser.data().following.map(async (friendId) => {
                  // get friend details
                  const friend = await this.getUserByID(friendId);
                  friend.selected = false;
                  friendsArray.push(friend);
                }));
            }
          }).catch (error => {
            console.log('[Get Friends] error => ' + error);
            return error;
          });
    });
    console.log('finish get firends');
    return friendsArray;
  }

    // return username and photoURL by user id
    async getUserByID(userId: string) {
      return new Promise<any> ((resolve, reject) => {
        firebase.firestore().collection('userProfile').doc(userId).get().then(docUser => {
          // if handle is exists then username is handle, else username is email
          let userName = docUser.data().email;
          let photoURL = '';
          if ( docUser.data().handle ) {
            userName = docUser.data().handle;
          }
          if (docUser.data().photoURL) {
            photoURL = docUser.data().photoURL;
          }
          const user = {
            userId,
            userName,
            photoURL
          };
          resolve(user);
        }).catch(error => {
          console.log('[Get User Info] error = ' + error);
          reject(error);
        });
      });
    }


}



