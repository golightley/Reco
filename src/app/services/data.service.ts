import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(private storage:Storage) { 
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.eventListRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/eventList`);
      }
    });

  }

  async createNewRecommendation(name:string,city:string,notes:string,location:any,googlePlaceId:any,googleTypes:any,placeWebsite:any,placePhone:any) {
    // print the form results 
    console.log("DATASERVICE.CreateNewRcommendations.FormGroup:")
    console.log(location);

    try{
      await firebase.firestore().collection('recommendations').add({
        name: name,
        city: city,
        notes: notes,
        location:location,
        gplaceId:googlePlaceId,
        gType:googleTypes,
        website:placeWebsite,
        phone:placePhone,
        user: firebase.auth().currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function (docRef) {
        console.log('DATASERVICE.createNewRecommendation:', docRef.id);
      }).catch(function (error) {
        console.error('DATASERVICE.createNewRecommendation.Error adding document: ', error);
      });
    }catch (err){
      console.log("DATASERVICE.createNewRecommendation");
      console.log(err);
    }

  }


  getReccos() {
    const recsArray: any[] = [];
    // pull each question from firebase
    return new Promise<any>((resolve, reject) => {
      // firebase.firestore().collection('recommendations').where('questionId', '==', questionID).get()

      firebase.firestore().collection('recommendations')
        // .where("user","==",firebase.auth().currentUser.uid)
        .where("following", "array-contains", firebase.auth().currentUser.uid)        // .where("user","==",users)
        .get()
        .then((recs) => {
          console.log("getOtherReccos in service");
          console.log(recs);

          recs.forEach((doc) => {
            recsArray.push(doc);
          });
          resolve(recsArray);
        }, err => reject(err));
    });
  }


  public getMyRecos() {
    const recsArray: any[] = [];
    // pull each question from firebase
    return new Promise<any>((resolve, reject) => {
      // firebase.firestore().collection('recommendations').where('questionId', '==', questionID).get()

      firebase.firestore().collection('recommendations')
        .where("user","==",firebase.auth().currentUser.uid)
        // .where("user", "array-contains", firebase.auth().currentUser.uid)        // .where("user","==",users)
        .get()
        .then((recs) => {
          recs.forEach((doc) => {
            recsArray.push(doc);
          });
          resolve(recsArray);
        }, err => reject(err));
    });
  }

  setMyDetails(data):void{
    this.storage.set('myDetails',data);

  }

  setWorldDetails(data):void{
    this.storage.set('worldDetails',data);
  }

  setLocation(data):void{
    this.storage.set('location',data);
  }

  getMyDetails(): Promise <any> {
    return this.storage.get('myDetails');
  }

  getWorldDetails(): Promise <any> {
    return this.storage.get('worldDetails');
  }

  getLocation(): Promise <any> {
    return this.storage.get('location');
  }



}


