import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { async } from '@angular/core/testing';

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

  // get following user in friend page
  async getFollowings() {
    let result: any[];
    await this.loadingService.doFirebase ( async () => {
      result = await this.getFriends();
    });
    return result;
  }

  // get suggestion user ( it returned all un-following users - must be change)
  async getSuggestion() {
    const suggestionUsers: any[] = [];
    const userId = firebase.auth().currentUser.uid;
    let friends: any[] = [];
    await this.loadingService.doFirebase ( async () => {
      await firebase.firestore().collection('userProfile').doc(userId).get().then( async user => {
        if ( friends = user.data().following ) {
          // get all users
          await firebase.firestore().collection('userProfile').get()
            .then( async (docUser) => {
              docUser.forEach((doc) => {
                if (doc.data().handle) {
                  // if user isn't his friend, add to suggestion
                  if ( friends.indexOf(doc.id) === -1 ) {
                    const d = {
                      userId: doc.id,
                      userName: doc.data().handle,
                      email: doc.data().email,
                      photoURL: doc.data().photoURL
                    };
                    suggestionUsers.push(d);
                    console.log('Add suggestion user');
                  }
                }
              });
            }).catch (error => {
              console.log('[Get Suggestion] error => ' + error);
            });
        }
      });
    });
    console.log('Finish get suggestion');
    return suggestionUsers;

  }

  // search user
  async searchUsers(keyword) {
    let result: any[];
    await this.loadingService.doFirebase ( async () => {
      await firebase.firestore().collection('userProfile').where('handle', '==', keyword).get().then( async docUser => {

      });
    });
    return result;
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
                  if ( friend ) {
                    friend.selected = false;
                    friendsArray.push(friend);
                  }
                }));
            }
          }).catch (error => {
            console.log('[Get Friends] error => ' + error);
            return error;
          });
    });
    console.log('Finished get friends');
    return friendsArray;
  }

  // return username and photoURL by user id
  async getUserByID(userId: string) {
    return new Promise<any> ((resolve, reject) => {
      firebase.firestore().collection('userProfile').doc(userId).get().then(docUser => {
        /* if handle is exists then username is handle, else username is email
        let userName = docUser.data().email;
        if ( docUser.data().handle ) {
          userName = docUser.data().handle;
        }*/
        if (docUser.data().handle) {
          const userName = docUser.data().handle;
          const email = docUser.data().email;
          let photoURL = '';
          if (docUser.data().photoURL) {
            photoURL = docUser.data().photoURL;
          }
          const user = {
            userId,
            userName,
            email,
            photoURL
          };
          resolve(user);
        } else {
          resolve(false);
        }
      }).catch(error => {
        console.log('[Get User Info] error = ' + error);
        reject(error);
      });
    });
  }

  // follow user
  async followUser(selUserId) {
    const userId = firebase.auth().currentUser.uid;
    console.log('Current user id ' + userId);
    console.log('Following user id ' + selUserId);

    await this.loadingService.doFirebase ( async () => {
      // add follow_by to user who is being followed
      let userProfileRef = firebase.firestore().collection('userProfile').doc(selUserId);
      await userProfileRef.update({
          followed_by: firebase.firestore.FieldValue.arrayUnion(userId)
      });

      // add following to user who is being followed
      userProfileRef = firebase.firestore().collection('userProfile').doc(userId);
      await userProfileRef.update({
          following: firebase.firestore.FieldValue.arrayUnion(selUserId)
      });
    });
    return selUserId;
  }

  // un-follow friends
  async unFollowUser(selUserId) {
    const userId = firebase.auth().currentUser.uid;
    console.log('Current user id ' + userId);
    console.log('Following user id ' + selUserId);

    await this.loadingService.doFirebase ( async () => {
      // remove follow_by to user who is being followed
      let userProfileRef = firebase.firestore().collection('userProfile').doc(selUserId);
      await userProfileRef.update({
          followed_by: firebase.firestore.FieldValue.arrayRemove(userId)
      });

      // remove following to user who is being followed
      userProfileRef = firebase.firestore().collection('userProfile').doc(userId);
      await userProfileRef.update({
          following: firebase.firestore.FieldValue.arrayRemove(selUserId)
      });
    });
    // // Atomically remove a region from the 'regions' array field.
    // washingtonRef.update({
    //     regions: firebase.firestore.FieldValue.arrayRemove('east_coast')
    // });
    return selUserId;
  }


}



