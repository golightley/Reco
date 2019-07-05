import { Component, OnInit, ɵConsole } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'
import { formControlBinding } from '@angular/forms/src/directives/ng_model';
import { DataService } from '../../services/data.service'


@Component({
  selector: 'app-create-place-modal',
  templateUrl: './create-place-modal.page.html',
  styleUrls: ['./create-place-modal.page.scss'],
})

export class CreatePlaceModalPage implements OnInit {

  public myDetailsForm: FormGroup;
  modalTitle:string;
  modelId:number;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private formBuilder:FormBuilder,
    private dataService:DataService

  ) {
    this.myDetailsForm = formBuilder.group({
      name:[''],
      city:[''],
      notes:[''],
    })


   }

  ngOnInit() {
    // console.table(this.navParams);
    // this.modelId = this.navParams.data.paramID;
    // this.modalTitle = this.navParams.data.paramTitle;

    // this.dataService.getMyDetails().then((details)=>{
    //   let formControls:any = this.myDetailsForm.controls;

    //   if(details!=null){
    //     formControls.carRegistration.setValue(details.carRegistration);
    //     formControls.trailerRegistration.setValue(details.trailerRegistration)
    //     formControls.trailerDimensions.setValue(details.trailerDimensions);

    //     formControls.phoneNumber.setValue(details.phoneNumber);
    //     formControls.notes.setValue(details.notes)

    //   }
    // })
  }

  public createNewRec(newRecFormDetails:FormGroup):void{
    let formControls:any = this.myDetailsForm.controls;
    console.log(newRecFormDetails);
    console.log(formControls.name.getValue)

    this.dataService.createNewRecommendation(this.myDetailsForm);
  }

  saveForm():void{
    // this.dataService.setMyDetails(this.myDetailsForm)
    console.log(this.myDetailsForm)

  }

  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

}
