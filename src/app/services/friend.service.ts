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
      result = await this.getFriends(false);
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
          // get friends
          friends = user.data().following;
          // get all users
          await firebase.firestore().collection('userProfile').where('public', '==', true).get()
            .then( async (docUsers) => {
              docUsers.forEach((doc) => {
                if (doc.data().handle) {
                  // if user isn't his friend or himself, add to suggestion
                  if ( (!friends || friends.indexOf(doc.id) === -1) && doc.id !== userId ) {
                    const d = {
                      userId: doc.id,
                      userName: doc.data().handle,
                      email: doc.data().email,
                      photoURL: doc.data().photoURL
                    };
                    suggestionUsers.push(d);
                    // console.log('Add suggestion user');
                  }
                }
              });
            }).catch (error => {
              console.log('[Get Suggestion] error => ' + error);
          });
      });
    });
    console.log('Finish get suggestion');
    return suggestionUsers;

  }

  // search un-followed users
  async searchUsers(keyword) {
    const users: any[] = [];
    const userId = firebase.auth().currentUser.uid;
    let friends: any[] = [];
    await this.loadingService.doFirebaseWithoutLoading ( async () => {
      await firebase.firestore().collection('userProfile').doc(userId).get().then( async user => {
          // get friends
          friends = user.data().following;
          // console.log('my friends', friends);
          // get all users
          await firebase.firestore().collection('userProfile')
            .where('handleToSearch', '>=', keyword.toLowerCase())
            .where('handleToSearch', '<=', keyword.toLowerCase() + '\uf8ff')
            .get()
            .then( async (docUsers) => {
              docUsers.forEach((doc) => {
                if (doc.data().handle) {
                  // if user isn't his friend or himself, add to users
                  if ( (!friends || friends.indexOf(doc.id) === -1) && doc.id !== userId ) {
                    const d = {
                      userId: doc.id,
                      userName: doc.data().handle,
                      email: doc.data().email,
                      photoURL: doc.data().photoURL
                    };
                    users.push(d);
                    console.log('Add user');
                  }
                }
              });
            }).catch (error => {
              console.log('[Search Users] error => ' + error);
          });
      });
    });
    console.log('Finish search users');
    return users;
  }

  // get friends of user
  async getFriends(withMe) {
    const friendsArray: any[] = [];
    // no loading bar
    console.log(firebase.auth().currentUser);
    const userId = firebase.auth().currentUser.uid;
    console.log('current user => ' + userId);
    await this.loadingService.doFirebaseWithoutLoading( async () => {
        await firebase.firestore().collection('userProfile').doc(userId).get().then( async docUser => {
            if (withMe) {
              // added current user data
              const user = {
                userId: docUser.id,
                userName: docUser.data().handle,
                email: docUser.data().email,
                photoURL: docUser.data().photoURL,
                selected: false
              };
              friendsArray.push(user);
            }
            if ( docUser.data().following ) {
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
        if (docUser.data().handle !== undefined) {
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
  async followUser(uid, isOpposite?) {
    let selUserId = uid;
    let userId = firebase.auth().currentUser.uid;
    if (isOpposite) {
      selUserId = firebase.auth().currentUser.uid;
      userId = uid;
    }
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



