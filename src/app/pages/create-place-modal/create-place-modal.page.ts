import { Component, OnInit, ɵConsole, Renderer2, Inject } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms'
import { formControlBinding } from '@angular/forms/src/directives/ng_model';
import { DataService } from '../../services/data.service'
import { RestService } from '../../services/rest.service'
import { DOCUMENT } from '@angular/common';

declare var google: any;

@Component({
  selector: 'app-create-place-modal',
  templateUrl: './create-place-modal.page.html',
  styleUrls: ['./create-place-modal.page.scss'],
})

export class CreatePlaceModalPage implements OnInit {

  public myDetailsForm: FormGroup;
  modalTitle:string;
  modelId:number;
  autocompleteService: any;
  service:any;
  placesService: any;
  query: string = '';
  places: any = [];
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any;  
  googlePlaceId:string;
  googleTypes:any;
  placePhone:any;
  placeWebsite:string;
  public name:string  = "";
  public city:string  = "";
  public notes:string = "";
  script:any;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private formBuilder:FormBuilder,
    private dataService:DataService,
    private restService:RestService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private _document
  ) {}

  ngOnInit() {
    let div = this.renderer.createElement('div');
    div.id  = 'googleDiv';

     console.log("CreatePlaceMOdal.NgOnInit: Google Variable status");
     console.log(google)
     console.log("CreatePlaceMOdal.NgOnInit: Google AutoComplete status");
     console.log(this.autocompleteService)
    try{
      this.autocompleteService = new google.maps.places.AutocompleteService()
      this.service = new google.maps.places.PlacesService(div);
    }catch{
      
    }
  }



  ionViewDidLoad(): void {
        let div = this.renderer.createElement('div');
        div.id  = 'googleDiv';
        this.autocompleteService = new google.maps.places.AutocompleteService()
        this.autocompleteService = new google.maps.places.PlacesService(div)
        // this.searchDisabled = false;
}

  searchPlace(){

    console.log("Searchplace")

    this.saveDisabled = true;

    if(this.query.length > 0 && !this.searchDisabled) {

        let config = {
            types: ['establishment'],
            // types: ['geocode'],
            input: this.query
        }

          this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
          console.log("CreateModalPage.SearchPlace.Autocomplete")
          console.log(predictions)
          console.log(status)

            if(status == google.maps.places.PlacesServiceStatus.OK && predictions){

                this.places = [];

                predictions.forEach((prediction) => {
                    this.places.push(prediction);
                });
            }

        });

    } else {
        this.places = [];
    }

}

selectPlace(place){

  this.places = [];

  let location = {
      lat: null,
      lng: null,
      name: place.name,
      city:null
  };

  this.service.getDetails({placeId: place.place_id}, (details) => {
          console.log("CreatePlaceModal.SelectPlace")
          console.log(details)
          console.log(details.address_components[3].short_name)
          location.name = details.name;
          location.lat  = details.geometry.location.lat();
          location.lng  = details.geometry.location.lng();
          location.city = details.address_components[3].short_name;
          this.saveDisabled = false;

          this.query = location.name;
          this.city = location.city;
          this.googlePlaceId = details.place_id;
          this.googleTypes =details.types;
          this.placeWebsite = details.website;
          this.placePhone = details.international_phone_number;

          this.location = location;
          console.log(this.location)

      // });

  });

}


  public createNewRec():void{

    this.dataService.createNewRecommendation(this.query,this.city,this.notes,this.location,this.googlePlaceId,this.googleTypes,this.placeWebsite,this.placePhone);
    this.closeModal()

  }

  saveForm():void{
    this.dataService.setMyDetails(this.myDetailsForm)
    console.log(this.myDetailsForm)

  }

  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

}
