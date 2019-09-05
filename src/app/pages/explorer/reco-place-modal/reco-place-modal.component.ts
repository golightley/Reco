import { Component, OnInit } from '@angular/core';
import { IonSlides, ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-reco-place-modal',
  templateUrl: './reco-place-modal.component.html',
  styleUrls: ['./reco-place-modal.component.scss'],
})
export class RecoPlaceModalComponent implements OnInit {

  sliderOpts = {
    zoom: {
      toggle: false
    },
    spaceBetween: 20,
    centeredSlides: true,
    loop: false,
    initialSlide: 0,
    speed: 500
  };

  placeData: any;
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.placeData = this.navParams.get('placeData');
    // console.log(this.placeData);
  }

  slidesDidLoad(slides: IonSlides) {
    slides.startAutoplay();
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      // 'data': 'test'
    });
  }
}
