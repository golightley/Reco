import { IonSlides, Events } from '@ionic/angular';
import { AskedRecoService } from 'src/app/services/asked-reco.service';
import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapComponent } from 'src/app/components/google-map/google-map.component';

declare var google;

@Component({
  selector: 'app-asked-reco',
  templateUrl: './asked-reco.page.html',
  styleUrls: ['./asked-reco.page.scss'],
})
export class AskedRecoPage implements OnInit {
  @ViewChild('recoSlider') slider: IonSlides;
  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;

  helpString: string;
  signupString: string;

  title: string;
  slideOpts: any;
  slideIndex: number;

  askUserName: string;
  askId: string;
  askLat: string;
  askLng: string;

  autocompleteService: any;
  placeService: any;

  isCreatedReco: boolean;

  constructor(
    private route: ActivatedRoute,
    private askedRecoService: AskedRecoService,
    private renderer: Renderer2,
    private router: Router,
    private ev: Events
  ) {
    this.ev.subscribe('createdReco', async param => {
      this.isCreatedReco = param;
    });
   }

  ngOnInit() {
    this.initialize();
    this.initGoogleMap();
  }
  initGoogleMap(): void {
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    this.map.readyTointeract.subscribe((data) => {
      try {
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.placeService = new google.maps.places.PlacesService(div);
        console.log('!!! Loaded Google AutoComplete service');
      } catch {
        console.log('Error to load google service');
      }
    });
  }

  async initialize() {
    this.isCreatedReco = false;
    // init asked reco ids
    this.askedRecoService.setAskedRecoId('');

    // init slide
    this.slideIndex = 0;
    this.slideOpts = {
      initialSlide: 0,
      slidesPerView: 1.1
    };

    // get ask info from parameter
    this.askId = this.route.snapshot.paramMap.get('id');
    this.askLat = this.route.snapshot.paramMap.get('lat') || '40.74';
    this.askLng = this.route.snapshot.paramMap.get('lng') || '-73.99';
    console.log('Got parameter => ' + this.askId + ', ' + this.askLat + ', ' + this.askLng);
    const AskedReco = await this.askedRecoService.getAskForReco(this.askId);
    console.log(AskedReco);
    if (AskedReco) {
      this.askUserName = AskedReco.userName;
      this.helpString = `Help ${this.askUserName} plan his trip to ${AskedReco.location}`;
      this.signupString = 'Signup to save your Recos';
      this.title = this.helpString;
    }
  }

  // set index of slides
  setCurIndex() {
    this.slider.getActiveIndex().then(index => {
      this.slideIndex = index;
    });
  }

  createProfile() {
    this.router.navigate(['/webapp-user']);
  }
}
