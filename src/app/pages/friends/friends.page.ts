import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'
import { FriendService } from 'src/app/services/friend.service';
import { AuthService } from '../../services/user/auth.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {

  public FriendsForm: FormGroup;
  public users:any = [];

  constructor(
    private formBuilder: FormBuilder,
    private friendService: FriendService,
    private authService: AuthService,
    ) {

    // initialize the form 
    this.FriendsForm = formBuilder.group({
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

      console.log("Friends.NgOnIt.AuthService.GetUsersWithName... function returned the following result")
      console.log(this.users)


    });




    /* this.friendService.getFriends().then((details)=>{
      let formControls:any = this.FriendsForm.controls;
      
      if(details!=null){
          formControls.gateAccessCode.setValue(details.gateAccessCode);
          formControls.ammenetiesCode.setValue(details.ammenetiesCode);
          formControls.wifiPassword.setValue(details.wifiPassword);
          formControls.depature.setValue(details.depature);
          formControls.notes.setValue(details.notes);


         
      }
    }) */

  }

  logout(){

    this.authService.logoutUser();

  }

  toggleUserFollow(user){
    console.log("Friends.ToggleUserFollow has been clicked");
    console.log(user);
    this.authService.toggleUserFollow(user);
  }

  saveForm():void {
    //this.friendService.setCampDetails(this.FriendsForm.value)

  }

}
