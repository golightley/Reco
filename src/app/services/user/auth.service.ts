import { LoadingService } from './../loading-service';
import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { reject } from 'q';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private loadingService: LoadingService
  ) {}

    // login by email
    async loginWithEmail(email: string, password: string) {
      const result = await this.loadingService.doFirebase(async() => {
        return new Promise<any> ((resolve, reject) => {
          firebase.auth().signInWithEmailAndPassword(email, password).then(res => {
            resolve(res);
          }).catch(error => {
            reject(error);
          });
        });
      });
      return result;
    }

    // login by facebook credential
    async loginWithFacebookToken(facebookCredential: any) {
      const result = await this.loadingService.doFirebase(async() => {
        return new Promise<any> ((resolve, reject) => {
          firebase.auth().signInWithCredential(facebookCredential)
            .then((newUserCredential: firebase.auth.UserCredential) => {
            // login success
            console.log('[Facebook sign succeed]: response=> ', newUserCredential);
            // register user to userProfile collection
            const user = newUserCredential.user;
            const handleName = user.displayName.replace(' ', '_');
            firebase.firestore()
              .doc(`/userProfile/${user.uid}`)
              .set({
                handle: handleName,
                email: user.email,
                photoURL: user.photoURL,
                loginType: 'facebook',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            resolve(user);
          }).catch(error => {
            console.error('[Facebook sign failed]: error=> ', error);
            reject(error);
          });
        });
      });
      return result;
    }

    // register email
    async registerEmail(email: string, password: string): Promise<any> {
      const result = await this.loadingService.doFirebase(async() => {
        return new Promise<any> ((resolve, reject) => {
          firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then((newUserCredential: firebase.auth.UserCredential) => {
              firebase
                .firestore()
                .doc(`/userProfile/${newUserCredential.user.uid}`)
                .set({
                  email,
                  loginType: 'email',
                  createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                resolve(newUserCredential);
            })
            .catch(error => {
              console.log('[Register Email]: error=> ', error);
              reject(error);
            });
        });
      });
      return result;
    }

    // register username
    async registerUsername(userId: string, handle: string): Promise<any> {
      const handleName = handle.replace(' ', '_');
      const result = await this.loadingService.doFirebase(async() => {
        return new Promise<any> ((resolve, reject) => {
          firebase
            .firestore()
            .collection('userProfile')
            .where('handle', '==', handleName)
            .get().then(async function (res) {
              if (res.size === 0) {
                // update user profile
                firebase
                  .firestore()
                  .collection('userProfile')
                  .doc(userId).update({
                    handle: handleName
                }).then(res => {
                  resolve('success');
                }).catch(error => {
                    console.log('[Register Username]: error=> ', error);
                    reject(error);
                });
              } else {
                resolve('duplicate');
              }
            }).catch(error => {
              console.log('[Register Username]: error=> ', error);
              reject(error);
            });
        });
      });
      return result;
    }

    resetPassword(email: string): Promise<void> {
      return firebase.auth().sendPasswordResetEmail(email);
    }

    logoutUser(): Promise<void> {
      return firebase.auth().signOut();
    }

    getUsersWithName() {
      const users: any[] = [];
      // pull each question from firebase
      return new Promise<any>((resolve, reject) => {
        firebase.firestore().collection('userProfile').get()
          .then((recs) => {
            recs.forEach((doc) => {
              users.push(doc);
            });
            resolve(users);
          }, err => reject(err));
      });
    }


    // this functino adds or removes a user 
    toggleUserFollow(user) {
      // add follow_by to user who is being followed
      let userProfileRef = firebase.firestore().collection('userProfile').doc(user.id);
      let userId = firebase.auth().currentUser.uid;

      console.log('toggleUserFollow:UserId '+ userId)
      // Atomically add a new region to the 'regions' array field.
      userProfileRef.update({
          followed_by: firebase.firestore.FieldValue.arrayUnion(userId)
      });

      // add following to user who is being followed
      userId = firebase.auth().currentUser.uid;
      userProfileRef = firebase.firestore().collection('userProfile').doc(userId);

      console.log('toggleUserFollow:UserId '+ userId);
      // Atomically add a new region to the 'regions' array field.
      userProfileRef.update({
          following: firebase.firestore.FieldValue.arrayUnion(user.id)
      });

      this.addUserToRecos(user.id);

      // // Atomically remove a region from the 'regions' array field.
      // washingtonRef.update({
      //     regions: firebase.firestore.FieldValue.arrayRemove('east_coast')
      // });

    }

    addUserToRecos(user:any){
      firebase.firestore().collection('recommendations')
      .where('user','==',user)
      .get()
      .then((recs) => {
        recs.forEach((doc) => {
          var updateReco = firebase.firestore().collection('recommendations').doc(doc.id);
          updateReco.update({
            following: firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
        });
        });
      }, err => reject(err));
    }

    getUsersFolliowing(){
      var docRef = firebase.firestore().collection('userProfile').doc(firebase.auth().currentUser.uid)

      return new Promise<any>((resolve, reject) => {

      docRef.get().then(function(doc) {
          if (doc.exists) {
              console.log('Document data:', doc.data().following);
              resolve(doc.data().following);

          } else {
              // doc.data() will be undefined in this case
              console.log('No such document!');
          }
      }).catch(function(error) {
          console.log('Error getting document:', error);
      });
    });

  }

  
}