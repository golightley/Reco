import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'
import { DataService } from '../services/data.service'

@Component({
  selector: 'app-world-details',
  templateUrl: './world-details.page.html',
  styleUrls: ['./world-details.page.scss'],
})
export class WorldDetailsPage implements OnInit {

  public worldDetailsForm: FormGroup;

  constructor(private formBuilder:FormBuilder, private dataService:DataService) {

    // initialize the form 
    this.worldDetailsForm = formBuilder.group({
      gateAccessCode:[''],
      ammenetiesCode:[''],
      wifiPassword:[''],
      phoneNumber:[''],
      depature:[''],
      notes:['']
    });

   }

  ngOnInit() {
    this.dataService.getWorldDetails().then((details)=>{
      let formControls:any = this.worldDetailsForm.controls;
      
      if(details!=null){
          formControls.gateAccessCode.setValue(details.gateAccessCode);
          formControls.ammenetiesCode.setValue(details.ammenetiesCode);
          formControls.wifiPassword.setValue(details.wifiPassword);
          formControls.depature.setValue(details.depature);
          formControls.notes.setValue(details.notes);


         
      }
    })

  }

  saveForm():void {
    //this.dataService.setCampDetails(this.worldDetailsForm.value)

  }

}
