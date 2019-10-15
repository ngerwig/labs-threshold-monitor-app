import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService extends HttpService {
  /**
   * reference of Data service.
   */
  public http: HttpClient;

  // fetchStatesData(): Observable<Object>{
  //   return this.http.get()
  // }

  constructor(http: HttpClient) {
    super(http);
  }

}
