import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'
import { ExplorerService } from 'src/app/services/explorer.service';
import { AuthService } from '../../services/user/auth.service';

@Component({
  selector: 'app-world-details',
  templateUrl: './world-details.page.html',
  styleUrls: ['./world-details.page.scss'],
})
export class WorldDetailsPage implements OnInit {

  public worldDetailsForm: FormGroup;
  public users:any = [];

  constructor(
    private formBuilder: FormBuilder,
    private explorerService: ExplorerService,
    private authService: AuthService,
    ) {

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

    
    // get users for the array
    this.authService.getUsersWithName().then((recsArray)=>{

      this.users = recsArray;

      console.log("WorldDetails.NgOnIt.AuthService.GetUsersWithName... function returned the following result")
      console.log(this.users)


    });




    this.explorerService.getWorldDetails().then((details)=>{
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

  logout(){

    this.authService.logoutUser();

  }

  toggleUserFollow(user){
    console.log("WorldDetails.ToggleUserFollow has been clicked");
    console.log(user);
    this.authService.toggleUserFollow(user);
  }

  saveForm():void {
    //this.explorerService.setCampDetails(this.worldDetailsForm.value)

  }

}
