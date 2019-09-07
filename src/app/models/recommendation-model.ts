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
  userPhotoURLs: any[];
  pictures: any[];
  pictureThumbs: any[];
  createdAts: any[];
  visible: boolean;
  gtype: any[];
  phone: string;
  website: string;
  
  constructor(id: string, name: string, city: string, lat: number, lng: number, gtype: any[], distance: number,
              userNames: any[], userIds: any[], userPhotoURLs: any[], notes: any[], pictures: any[], pictureThumbs: any[],
              createdAts: any[], phone: string, website: string, visible: boolean) {
    this.id = id;
    this.name = name;
    this.city = city;
    this.notes = notes;
    this.lat = lat;
    this.lng = lng;
    this.distance = distance;
    this.userNames = userNames;
    this.userIds = userIds;
    this.userPhotoURLs = userPhotoURLs;
    this.pictures = pictures;
    this.pictureThumbs = pictureThumbs;
    this.phone = phone;
    this.website = website;
    this.createdAts = createdAts;
    this.visible = visible;
    this.gtype = gtype;
  }
}
