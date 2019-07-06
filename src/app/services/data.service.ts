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

  async createNewRecommendation(name:string,city:string,notes:string,location:any) {
    // print the form results 
    console.log("DATASERVICE.CreateNewRcommendations.FormGroup:")
    console.log(location);

    try{
      await firebase.firestore().collection('recommendations').add({
        name: name,
        city: city,
        notes: notes,
        location:location,
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


