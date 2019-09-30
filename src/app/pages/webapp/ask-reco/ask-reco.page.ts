import { IonSlides } from '@ionic/angular';
import { AskrecoService } from 'src/app/services/ask-reco.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ask-reco',
  templateUrl: './ask-reco.page.html',
  styleUrls: ['./ask-reco.page.scss'],
})
export class AskRecoPage implements OnInit {
  @ViewChild('recoSlider') slider: IonSlides

  helpString: string;
  signupString: string;

  title: string;
  slideOpts: any;
  slideIndex: number;

  askUserName: string;
  askId: string;
  constructor(
    private route: ActivatedRoute,
    private askRecoService: AskrecoService
  ) { }

  ngOnInit() {
    this.initialize();
    this.slideIndex = 0;
    this.slideOpts = {
      initialSlide: 0,
      slidesPerView: 1.1
    };
  }

  async initialize() {
    this.askId = this.route.snapshot.paramMap.get('id');
    console.log('Got parameter => ' + this.askId);
    const askReco = await this.askRecoService.getAskForReco(this.askId);
    console.log(askReco);
    if (askReco) {
      this.askUserName = 'Liam';
      this.helpString = 'Help ' + this.askUserName + ' plan his trip to ' + askReco.location;
      this.signupString = 'Signup to save your Recos';
      this.title = this.helpString;
    }
  }

  // set index of slides
  setCurIndex() {
    this.slider.getActiveIndex().then(index => {
      this.slideIndex = index;
    })
  }

}
