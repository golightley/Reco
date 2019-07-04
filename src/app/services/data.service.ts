import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'

import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private storage:Storage) { }

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


