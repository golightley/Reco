import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'
import { DataService } from '../services/data.service'
import { formControlBinding } from '@angular/forms/src/directives/ng_model';

// for the modal 
import { ModalController } from '@ionic/angular';
import { CreatePlaceModalPage } from '../pages/create-place-modal/create-place-modal.page'

@Component({
  selector: 'app-my-details',
  templateUrl: './my-details.page.html',
  styleUrls: ['./my-details.page.scss'],
})
export class MyDetailsPage implements OnInit {

  dataReturned:any;
  recArray: any = [];
  results:any = [];


  constructor(private dataService:DataService,public modalController: ModalController) {
   }

   // create the modal 
   async openModal() {
    const modal = await this.modalController.create({
      component: CreatePlaceModalPage,
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title"
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


   getRecommendations(){
    this.dataService.getReccos().then((recsArray)=>{

      recsArray.forEach(data => {
        this.results.push(data);
      });
      console.log("MyDetailsPage.GetReccomandations: Results");
      console.log(this.results[0].data())
      
    })

  }

  ngOnInit() {
    this.getRecommendations();
  }

}
