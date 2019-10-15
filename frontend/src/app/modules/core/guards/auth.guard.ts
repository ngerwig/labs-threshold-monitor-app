import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ROUTE_PATHS } from '../../../config/route.config';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      if (this.authenticationService.isUserSignedIn) {
        //user authorised
          return true;
      }

      // not logged in so redirect to login page with the return url
      this.router.navigate([ROUTE_PATHS.AUTH.AUTHENTICATION], { queryParams: { returnUrl: state.url }});
      return false;
  }
  
}
