import { AuthService } from './../../services/user/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-me',
  templateUrl: './me.page.html',
  styleUrls: ['./me.page.scss'],
})
export class MePage implements OnInit {
  email: string;


  constructor(
    private authService: AuthService
  ) { 
   var currentUser:any  = this.authService.getMyUserName();
   console.log(currentUser)
    this.email = currentUser.email;


  }

  ngOnInit() {
  }

  logout(){

    this.authService.logoutUser();

  }
}


