import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../config/route.config';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  enableResetPassword: boolean = false;

  goToContactUs() {
    window.open(ROUTE_PATHS.CONTACT_US, "_blank");
  };
 
  goToPage(routePath, navigationExtras?){
    this.router.navigate([`/${routePath}`], navigationExtras)
  }

  constructor(private router: Router) { }
}
