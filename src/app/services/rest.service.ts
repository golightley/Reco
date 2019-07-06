import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})  
export class RestService {

  constructor(private http:HttpClient) {
   }

   getGooglePlace(){
     this.http.get('https://maps.googleapis.com/maps/api/place/autocomplete/xml?input=tappo&types=establishment&location=40.7128,74.0060&radius=500&key=AIzaSyCpWo2QDEEoW7KjiYobppSGoH-Un6rYhsg.com/maps/api/place/autocomplete/xml?input=tappo&types=establishment&location=40.7128,74.0060&radius=500&key=AIzaSyCpWo2QDEEoW7KjiYobppSGoH-Un6rYhsg')
     .subscribe(data =>{
       console.log(data)
     })
   }
}
