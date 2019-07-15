import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { reject } from 'q';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

    loginUser(email:string, password:string): Promise<firebase.auth.UserCredential> {

      return firebase.auth().signInWithEmailAndPassword(email, password);
    }

    signupUser(email: string, password: string, handle:string): Promise<any> {
      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((newUserCredential: firebase.auth.UserCredential) => {
          firebase
            .firestore()
            .doc(`/userProfile/${newUserCredential.user.uid}`)
            .set({ email,handle });
        })
        .catch(error => {
          console.error(error);
          throw new Error(error);
        });
    }

    resetPassword(email:string): Promise<void> {
      return firebase.auth().sendPasswordResetEmail(email);
    }

    logoutUser():Promise<void> {
      return firebase.auth().signOut();
    }

    getUsersWithName() {
      const users: any[] = [];
      // pull each question from firebase
      return new Promise<any>((resolve, reject) => {
        // firebase.firestore().collection('recommendations').where('questionId', '==', questionID).get()
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
    toggleUserFollow(user){


      // add follow_by to user who is being followed
      var userProfileRef = firebase.firestore().collection("userProfile").doc(user.id);
      var userId = firebase.auth().currentUser.uid

      console.log("toggleUserFollow:UserId "+userId)
      // Atomically add a new region to the "regions" array field.
      userProfileRef.update({
          followed_by: firebase.firestore.FieldValue.arrayUnion(userId)
      });

      // add following to user who is being followed
      var userId = firebase.auth().currentUser.uid
      var userProfileRef = firebase.firestore().collection("userProfile").doc(userId);

      console.log("toggleUserFollow:UserId "+userId)
      // Atomically add a new region to the "regions" array field.
      userProfileRef.update({
          following: firebase.firestore.FieldValue.arrayUnion(user.id)
      });

      this.addUserToRecos(user.id)

      // // Atomically remove a region from the "regions" array field.
      // washingtonRef.update({
      //     regions: firebase.firestore.FieldValue.arrayRemove("east_coast")
      // });

    }

    addUserToRecos(user:any){
      firebase.firestore().collection('recommendations')
      .where("user","==",user)
      .get()
      .then((recs) => {
        recs.forEach((doc) => {
          var updateReco = firebase.firestore().collection("recommendations").doc(doc.id);
          updateReco.update({
            following: firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
        });
        });
      }, err => reject(err));
    }

    getUsersFolliowing(){
      var docRef = firebase.firestore().collection("userProfile").doc(firebase.auth().currentUser.uid)

      return new Promise<any>((resolve, reject) => {

      docRef.get().then(function(doc) {
          if (doc.exists) {
              console.log("Document data:", doc.data().following);
              resolve(doc.data().following);

          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
          }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
    });

  }

  
}