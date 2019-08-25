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

  public users: any = [];
  page: string;
  followings: any[] = [];
  suggestions: any[] = [];
  searchedUsers: any[] = [];
  query: string;

  constructor(
    private formBuilder: FormBuilder,
    private friendService: FriendService,
    private authService: AuthService,
    ) {
   }

  ngOnInit() {
    this.page = 'suggestion';
    this.query = '';
  }

  // get facebook friends
  async getSuggestions() {
    this.suggestions = await this.friendService.getSuggestion();
    // console.log('Suggestion list', this.suggestions);
  }

  // get following user list
  async getFollowings() {
    this.followings = await this.friendService.getFollowings();
    // console.log('Friend list', this.followings);
  }

  // click top bar
  async segmentChanged($event) {
    this.page = $event.detail.value;
    if (this.page === 'following') {
      await this.getFollowings();
    } else {
      await this.getSuggestions();
    }
  }

  // follow user
  async followUser(userId, index) {
    const returnId = await this.friendService.followUser(userId);
    if ( returnId ) {
      this.suggestions.splice(index, 1);
      console.log('Followed selected user');
    } else {
      console.log('Error occurred when follow user!');
    }
  }

  // un-follow user
  async unFollowUser(userId, index) {
    const returnId = await this.friendService.unFollowUser(userId);
    if ( returnId ) {
      this.followings.splice(index, 1);
      console.log('Un-followed selected user');
    } else {
      console.log('Error occurred when un-follow user!');
    }
  }

  // search user
  async searchFriend(keyword) {
    // this.searchedUsers = await this.friendService.searchUsers(keyword);
    console.log(this.query);
    /* if (this.query.length > 0) {
      console.log(this.query);
    } */
  }

  focusSearchBar() {

  }

  cancelSearchBar() {

  }

  /* toggleUserFollow(user){
    console.log("Friends.ToggleUserFollow has been clicked");
    console.log(user);
    this.authService.toggleUserFollow(user);
  } */


}
