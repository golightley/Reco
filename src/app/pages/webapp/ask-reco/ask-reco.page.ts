import { IonSlides } from '@ionic/angular';
import { AskrecoService } from 'src/app/services/ask-reco.service';
import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var google;

@Component({
  selector: 'app-ask-reco',
  templateUrl: './ask-reco.page.html',
  styleUrls: ['./ask-reco.page.scss'],
})
export class AskRecoPage implements OnInit {
  @ViewChild('recoSlider') slider: IonSlides;

  helpString: string;
  signupString: string;

  title: string;
  slideOpts: any;
  slideIndex: number;

  askUserName: string;
  askId: string;

  autocompleteService: any;
  placeService: any;

  constructor(
    private route: ActivatedRoute,
    private askRecoService: AskrecoService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.initialize();
    this.initGoogleMap();
  }

  async initialize() {
    // init asked reco ids
    this.askRecoService.setAskedRecoId('');

    // init slide
    this.slideIndex = 0;
    this.slideOpts = {
      initialSlide: 0,
      slidesPerView: 1.1
    };

    // get ask info from parameter
    this.askId = this.route.snapshot.paramMap.get('id');
    console.log('Got parameter => ' + this.askId);
    const askReco = await this.askRecoService.getAskForReco(this.askId);
    console.log(askReco);
    if (askReco) {
      this.askUserName = askReco.userName;
      this.helpString = `Help ${this.askUserName} plan his trip to ${askReco.location}`;
      this.signupString = 'Signup to save your Recos';
      this.title = this.helpString;
    }
  }

  initGoogleMap() {
    const div = this.renderer.createElement('div');
    div.id = 'googleDiv';
    try {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placeService = new google.maps.places.PlacesService(div);
      console.log('Loaded Google AutoComplete service');
    } catch {
      console.log('Error to load google service');
    }
  }

  // set index of slides
  setCurIndex() {
    this.slider.getActiveIndex().then(index => {
      this.slideIndex = index;
    });
  }

}
