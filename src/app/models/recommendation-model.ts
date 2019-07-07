export class RecommendationModel {
    id: string;
    name: string;
    city: string;
    notes:string;
  
    constructor(id:string,name: string, city: string, notes: string,) {
      this.id = id;
      this.name = name;
      this.city = city;
      this.notes = notes;
    }
  }
  