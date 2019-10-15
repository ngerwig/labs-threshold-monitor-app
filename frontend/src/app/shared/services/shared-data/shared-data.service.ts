import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Url } from 'src/environments/environment';
import apiUrl from '../../../config/api-url.config.json';
import { map } from 'rxjs/operators';
//import { LoggerService } from 'src/app/modules/core/services/logger/logger.service.js';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  states = [];
  constructor(private http: HttpClient) {
     //this.fetchAllStates();
   }
   //This function will make a API call for getting the all states
   fetchAllStates(){
     if(!(this.states && this.states.length)){
      return this.http.get(Url.baseUrl + apiUrl.URLS.COMMON.ALL_STATES).pipe(map((response: any)=>{
         //this.loggerService.logResponse(response, "all-states");
          if (response.is_success) {
            this.states = response.data;
          }
          return response.data;
      }))
    }else{
      return this.states;
    }
  }
}
