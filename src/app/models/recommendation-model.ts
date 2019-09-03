export class RecommendationModel {
  id: string;
  name: string;
  city: string;
  notes: any[];
  lat: number;
  lng: number;
  distance: number;
  userNames: any[];
  userIds: any[];
  pictures: any[];
  pictureThumbs: any[];
  visible: boolean;
  gtype: any[];
  
  constructor(id: string, name: string, city: string, lat: number, lng: number, gtype: any[], distance: number,
              userNames: any[], userIds: any[], notes: any[], pictures: any[], pictureThumbs: any[], visible: boolean) {
    this.id = id;
    this.name = name;
    this.city = city;
    this.notes = notes;
    this.lat = lat;
    this.lng = lng;
    this.distance = distance;
    this.userNames = userNames;
    this.userIds = userIds;
    this.pictures = pictures;
    this.pictureThumbs = pictureThumbs;
    this.visible = visible;
    this.gtype = gtype;
  }
}
