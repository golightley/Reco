import { Component, OnInit, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-reco-card',
  templateUrl: './reco-card.component.html',
  styleUrls: ['./reco-card.component.scss'],
})
export class RecoCardComponent implements OnInit {
  _cardIndex: number;
  _askUserName: any;
  addButtonLabel: any;

  autocompleteService: any;
  service: any;
  placesService: any;
  queryPlace: string = '';
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any;
  googlePlaceId: string;
  googleTypes: any;
  
  picture: SafeResourceUrl;
  toast: any;
  originalPicture: string;
  pictureDataUrl; string;
  pictureDataThumbUrl: string;
  ThumbnailSize = 500;
  PictureSize = 1500;
  limitFileSize = 1024; // KB

  name: string = '';
  city: string = '';
  notes: string = '';

  cardTitle = [
    'Your first Reco',
    'Your second Reco',
    'Save your recos'
  ];

  @Input()
  set cardIndex(val: number) {
    this._cardIndex = val;
  }
  @Input()
  set askUserName(val: any) {
    this._askUserName = val;
  }

  constructor() { }

  ngOnInit() {
    this.addButtonLabel = 'Add to ' + this._askUserName + '\'s Map';
  }

}
