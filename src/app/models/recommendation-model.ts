export class RecommendationModel {
    id: string;
    name: string;
    city: string;
    notes: string;
    lat: number;
    lng: number;
    distance: number;
    userName: string;

    constructor(id: string, name: string, city: string, notes: string, lat: number, lng: number, distance: number, userName: string ) {
      this.id    = id;
      this.name  = name;
      this.city  = city;
      this.notes = notes;
      this.lat   = lat;
      this.lng  = lng;
      this.distance = distance;
      this.userName = userName;
    }
  }
