import { Component, OnInit } from '@angular/core';
import { ExplorerService } from 'src/app/services/explorer.service';

// for the modal 
import { ModalController } from '@ionic/angular';
import { CreatePlaceModalPage } from './create-place-modal/create-place-modal.page';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {

  dataReturned:any;
  recArray: any = [];
  results:any = [];


  constructor(
    private explorerService: ExplorerService,
    public modalController: ModalController) {
   }

  ngOnInit() {
   // this.getRecommendations();
  }

  ionViewWillEnter() {
    this.getRecommendations();
  }
  
   // create the modal 
   async openModal() {
    const modal = await this.modalController.create({
      component: CreatePlaceModalPage,
      componentProps: {
        'paramID': 123,
        'paramTitle': 'Test Title'
      }
    });
 
    // wait for the modal to be dismissed 
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
        //alert('Modal Sent Data :'+ dataReturned);
      }
    });
 
    return await modal.present();
  }


   getRecommendations() {
    this.explorerService.getRecommendations('mine').then((recsArray) => {

      recsArray.forEach(data => {
        this.results.push(data);
      });
      console.log('MyTripsPage.GetReccomandations: Results');
      console.log(this.results[0].data());
    })
  }



}
