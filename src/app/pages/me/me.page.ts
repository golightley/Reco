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
  }

  async ngOnInit() {
    var currentUser:any  = await this.authService.getCurrentUser();
    console.log(currentUser)
    this.email = currentUser.email;
  }

  logout(){

    this.authService.logoutUser();

  }
}


