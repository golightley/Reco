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
  keywordUserName: string;
  focusedSearchBar: boolean;

  constructor(
    private friendService: FriendService
    ) {
   }

  ngOnInit() {
    this.page = 'suggestion';
    this.keywordUserName = '';
    this.focusedSearchBar = false;
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
  async followUser(userId, index, isSuggestion?) {
    const returnId = await this.friendService.followUser(userId);
    if ( returnId ) {
      if ( isSuggestion ) {
        this.suggestions.splice(index, 1);
      } else {
        this.searchedUsers.splice(index, 1);
      }
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
  async searchFriend() {
    console.log(this.keywordUserName);
    if (this.keywordUserName.length > 1) {
      this.searchedUsers = await this.friendService.searchUsers(this.keywordUserName);
      console.log(this.searchedUsers);
    } else {
      this.searchedUsers = [];
    }
  }

  // Emitted when the search input has focus.
  focusSearchBar() {
    console.log('focused search bar');
    this.focusedSearchBar = true;
  }
  // Emitted when the cancel button is clicked.
  cancelSearchBar() {
    this.focusedSearchBar = false;
  }


}
