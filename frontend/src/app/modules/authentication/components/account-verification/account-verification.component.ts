import { Component, OnInit, AfterContentInit } from '@angular/core';
import { RoutingService } from '../../../core/services/routing/routing.service';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import constants from '../../../../config/constants.json'
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { LoggerService } from '../../../core/services/logger/logger.service'
import { HttpClient, HttpRequest, HttpResponse, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Url } from 'src/environments/environment';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';


@Component({
  selector: 'vtx-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss']
})
export class AccountVerificationComponent implements OnInit, AfterContentInit {
  resetPassword: boolean = false;
  consts=constants;
  emailAddress: string = '';
  expired: boolean = false;
  authToken : string;
  queryParams;
  emailNotVerified: boolean = false;
  
  constructor(private routingService: RoutingService, private utilityService: UtilityService, private router: Router, private loggerService: LoggerService, private activatedRoute: ActivatedRoute, private httpClient:HttpClient) { 
     this.queryParams = this.activatedRoute.queryParams.subscribe(params => {
      this.emailAddress = params['userEmail'],
      this.expired = params['token-expired'],
      this.authToken = params['resend-token'],
      this.emailNotVerified = params['emailNotVerified']
  });
  }

  ngOnInit() {
    this.resetPassword = this.routingService.enableResetPassword;
    this.loggerService.logResponse(this.resetPassword, "resetPassword");
  }
  ngAfterContentInit(){
    this.utilityService.putFocusOnElementOnNavigation("acc-ver-header");
  }
  signIn(){
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`);
  }

  resendAccntVerificationLink(){
    let header = {};
    let data = {
      email: null
    }
    if(this.emailAddress){
      data = {
        email: this.emailAddress
      }
    }
    if(this.authToken){
      header = new HttpHeaders({ 'auth-token': this.authToken });
    }
      this.loggerService.logResponse(data, "resend account verification req body");
      let resedVerificationLinkUrl = `${Url.baseUrl}/resend-verification-link`;
      this.httpClient.post<any>(resedVerificationLinkUrl, data , { headers: header }).
        subscribe((res) => {
          this.loggerService.logResponse(res, "resend verification link");
          if (res.is_success) {
            this.loggerService.logResponse(res, "resend verification link success");
            // let navigationExtras: NavigationExtras = {
            //   queryParams: { 'isPwdReset': true}
            // };
            // this.routingService.goToPage(`/${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`,navigationExtras);
          } else if (!res.is_success) {
            if (res.customErrorCode)
              this.loggerService.logResponse(res.customErrorCode, "forgot password");
          }
        }, (err) => {
          this.loggerService.logResponse(err, "reset password");
        });
    this.signIn();
  }

  ngOnDestroy(){
    if(this.queryParams){
      this.queryParams.unsubscribe();
    }
  }
}
