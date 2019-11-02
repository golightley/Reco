import { FriendService } from 'src/app/services/friend.service';
import { LoadingService } from './loading-service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { generateUUID } from 'src/app/utils/common';
import { async } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class ExplorerService {

  public eventListRef: firebase.firestore.CollectionReference;

  constructor(
    private storage: Storage,
    private loadingService: LoadingService,
    private friendService: FriendService
  ) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.eventListRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/eventList`);
      }
    });

  }

  // update recommendation with current user
  async updateRecommendations(recoIds) {
    const recoIdArray = recoIds.split(',');
    await this.loadingService.doFirebaseWithoutLoading(async () => {
      return new Promise<any>(async (resolve, reject) => {
        const promissArr = recoIdArray.map( async recoId => {
            const recoRef = firebase.firestore().collection('recommendations').doc(recoId);
            await recoRef.update({
                user: firebase.auth().currentUser.uid
            });
            console.log('updated recommendation, id => ' + recoId);
          });
        Promise.all(promissArr)
        .then(result => {
            console.log('*********** End update all recommendation *************');
            resolve();
        }, reject);
      });
    });
  }

  // if isAskReco is true, it will be created without user
  async createNewRecommendation(
      askRecoId: string, name: string, city: string, notes: string, location: any, googlePlaceId: any, googleTypes: any,
      placeWebsite: any, placePhone: any, pictureDataUrl: any, pictureDataThumbUrl: any, userId?: string) {
    // print the form results
    console.log('SERVICE.CreateNewRcommendations.FormGroup:');
    console.log(location);

    const result = await this.loadingService.doFirebase(async () => {
      return new Promise<any>(async (resolve, reject) => {
        let pictureUrl = '';
        let pictureThumbUrl = '';
        if ( pictureDataUrl === 'googlePhoto') { // if google photo, don't upload to firestore
          pictureUrl = pictureDataThumbUrl;
          pictureThumbUrl = pictureDataThumbUrl;
        } else if (pictureDataUrl) { // if not google photo, upload to firestore
          pictureUrl = await this.uploadPicture(pictureDataUrl, false);
          console.log('pictureUrl:' + pictureUrl);
          if ( pictureDataThumbUrl ) {
            pictureThumbUrl = await this.uploadPicture(pictureDataThumbUrl, true);
            if (pictureThumbUrl === '') {
              pictureUrl = await this.uploadPicture(pictureDataUrl, false);
            }
            console.log('pictureThumbUrl:' + pictureThumbUrl);
          }
        }
        firebase.firestore().collection('recommendations').add({
          name: name,
          city: city,
          notes: notes,
          location: location,
          gplaceId: googlePlaceId,
          gType: googleTypes,
          website: placeWebsite || '',
          phone: placePhone || '',
          picture: pictureUrl,
          pictureThumb: pictureThumbUrl,
          user: (askRecoId === '' && !userId) ? await firebase.auth().currentUser.uid : userId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(async docRef => {
          console.log('SERVICE.createNewRecommendation:', docRef.id);
          if (askRecoId) {
            const recoRef = firebase.firestore().collection('askForRecommendations').doc(askRecoId);
            await recoRef.update({
               sharedRecos: firebase.firestore.FieldValue.arrayUnion(docRef.id)
            });
            console.log('updated recommendation, id => ' + askRecoId);
          }
          resolve(docRef.id);
        }).catch(error => {
          console.error('SERVICE.createNewRecommendation.Error adding document: ', error);
          reject(error);
        });
      });
    });
    return result;
  }

  /**
   * Upload picture of recommendation
   */
  async uploadPicture(pictureDataUrl, isThumb) {
    return new Promise<any>((resolve, reject) => {
      const storageRef = firebase.storage().ref();
      let filename = '';
      
      if ( !isThumb ) {
        // Create name for a full image
        filename = `reco-pictures/${generateUUID(30)}.jpg`;
      } else {
        // Create name for a thumbnail image
        filename = `reco-pictures/thumb_${generateUUID(30)}.jpg`;
      }
      
      // Create a reference to reco-pictures
      const imageRef = storageRef.child(filename);
      imageRef.putString(pictureDataUrl, firebase.storage.StringFormat.DATA_URL)
        .then((snapshot) => {
          // successfully uploaded!
          snapshot.ref.getDownloadURL().then( downloadURL => {
            console.log('Uploaded Picture: url => ' + downloadURL);
            resolve(downloadURL);
          });
        }).catch(error => {
          reject(error);
        });
    });
  }


  getReccos() {
    const recsArray: any[] = [];
    // pull each question from firebase
    return new Promise<any>((resolve, reject) => {
      // firebase.firestore().collection('recommendations').where('questionId', '==', questionID).get()
      console.log('currentUser', firebase.auth().currentUser.uid);
      firebase.firestore().collection('recommendations')
        // .where('user','==',firebase.auth().currentUser.uid)
        .where('following', 'array-contains', firebase.auth().currentUser.uid)        // .where('user','==',users)
        .get()
        .then((recs) => {
          console.log('getOtherReccos in service');
          console.log(recs);

          recs.forEach((doc) => {
            recsArray.push(doc);
          });
          resolve(recsArray);
        }, err => reject(err));
    });
  }

  /**
   * Get recommendation data
   * If getType is 'all' then get all recommendation data.
   * If getType is 'mine' then get my recommendation data.
   * 
   */
  async getRecommendations(getType) {
    const recsArray: any[] = [];
    let query;
    if (getType === 'all') {
      query = firebase.firestore().collection('recommendations');

    } else if (getType === 'mine') {
      query = firebase.firestore().collection('recommendations')
        .where('user', '==', firebase.auth().currentUser.uid);
    }
    await this.loadingService.doFirebase(async () => {
      await query.get().then(async (queryData) => {
          await Promise.all(queryData.docs.map(async (rec) => {
              // get user name of recommendation
              const user = await this.friendService.getUserByID(rec.data().user);
              rec.userName = user.userName;
              rec.selected = false;
              recsArray.push(rec);
          }));
        }).catch (error => {
            return error;
        });
    });
    return recsArray;
  }

  /**
   * get recommendations and friends data of current user
   */
  async getFriendsAndRecos() {
    const recsArray: any[] = [];
    let query;
    let friendsArray: any[] = [];
    await this.loadingService.doFirebase( async () => {
      // get following friends and me
      console.log('-------get friend---------');
      friendsArray = await this.friendService.getFriends(true);
      console.log('** Get Friend Recos **');
      console.log(friendsArray);
      await Promise.all(friendsArray.map(async (friend) => {
          // console.log(' == friend loop == ');
          query = firebase.firestore().collection('recommendations').where('user', '==', friend.userId);
          await query.get().then(async (queryData) => {
            // console.log('Got recos data');
            await Promise.all(queryData.docs.map(async (rec) => {
              rec.userName = friend.userName;
              rec.photoURL = friend.photoURL;
              recsArray.push(rec);
              // console.log('friend recos push');
            }));
          });
      }));
    });
    // console.log('Return recos and friends array!');
    return {recos: recsArray, friends: friendsArray};
  }

  /**
   * get asked recos for webapp
   */
  async getSharedRecos(sharedRecoId) {
    const recsArray: any[] = [];
    let query;
    await this.loadingService.doFirebase(async () => {
      await firebase.firestore().collection('sharedRecommendations').doc(sharedRecoId).get()
        .then(async shared => {
          const recoIds = shared.data().sharedRecos;
          const photoURL = shared.data().photoURL;
          const userName = shared.data().userName;
          await Promise.all(recoIds.map(async (recoId) => {
            query = firebase.firestore().collection('recommendations').doc(recoId);
            await query.get().then(async (rec) => {
              const data = {
                id: rec.id,
                ...rec.data(),
                userName: userName,
                photoURL: photoURL
              }
              console.log(data);
              recsArray.push(data);
              console.log('shared recos push');
            })
          }));
        });

    });
    console.log('Return shared reco!');
    return { recos: recsArray };
  }



  setMyDetails(data): void {
    this.storage.set('myDetails', data);

  }

  setLocation(data): void {
    this.storage.set('location', data);
  }

  getMyDetails(): Promise<any> {
    return this.storage.get('myDetails');
  }

  getLocation(): Promise<any> {
    return this.storage.get('location');
  }

}


