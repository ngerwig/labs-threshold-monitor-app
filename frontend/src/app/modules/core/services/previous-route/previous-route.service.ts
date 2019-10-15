import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {

  private previousUrl: string;
  private currentUrl: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  }

  public getPreviousUrl() {
    return this.previousUrl;
   /*  let prevRoute = '';
    let routeArray: any = this.activatedRoute.snapshot.pathFromRoot;
    for (let i = 0; i < routeArray.length - 1; i++) {
    if (routeArray[i].url._value[0].length > 0) {
        prevRoute += routeArray[i].url._value[0].path + '/';
      } 
     }
    return prevRoute.slice(0, -1); */
  }    
}