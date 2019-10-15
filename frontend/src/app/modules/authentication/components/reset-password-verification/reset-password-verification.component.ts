import { Component, OnInit, AfterContentInit } from '@angular/core';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Url } from 'src/environments/environment';
import { RoutingService } from 'src/app/modules/core/services/routing/routing.service';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import constants from '../../../../config/constants.json'
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
@Component({
  selector: 'vtx-reset-password-verification',
  templateUrl: './reset-password-verification.component.html',
  styleUrls: ['./reset-password-verification.component.scss']
})
export class ResetPasswordVerificationComponent implements OnInit, AfterContentInit {
  emailAddress = "";
  expired: boolean = false;
  authToken: string;
  consts = constants;

  queryParams;
  constructor(private loggerService: LoggerService, private activatedRoute:ActivatedRoute,
    private utilityService: UtilityService, private httpClient:HttpClient, private routingService:RoutingService) {
     this.queryParams = this.activatedRoute.queryParams.subscribe(params => {
      this.emailAddress = params['userEmail'],
      this.expired = params['token-expired'],
      this.authToken = params['resend-token']
      //const firstFocusableElementOnPage = document.getElementById();
  });
   }

  ngOnInit() {
  }
  ngAfterContentInit(){
    this.utilityService.putFocusOnElementOnNavigation("reset-ver-link");
  }
  signIn(){
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`);
  }
  resendforgotPasswordLink(){
    this.loggerService.logResponse("resend forgot password link","Reset password");
    let header = {};
    let data = {
      email: this.emailAddress ? this.emailAddress : null
    }
      header = new HttpHeaders({ 'auth-token': this.authToken ? this.authToken : ""});
      this.loggerService.logResponse(data, "resend account verification req body");
      let resedVerificationLinkUrl = `${Url.baseUrl}/forgot-password`;
      this.httpClient.post<any>(resedVerificationLinkUrl, data , { headers: header }).
        subscribe((res) => {
          this.loggerService.logResponse(res, "resend verification link");
          this.expired = false;
          if (res.is_success) {
            this.loggerService.logResponse(res, "resend verification link success");
          /*   let navigationExtras: NavigationExtras = {
              queryParams: { 'userEmail': 'your email'}
            }; */
           // this.routingService.goToPage(`/${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.ACCNT_VERIFICATION}`,navigationExtras);
          } else if (!res.is_success) {
            if (res.customErrorCode)
              this.loggerService.logResponse(res.customErrorCode, "forgot password");
          }
        }, (err) => {
          this.loggerService.logResponse(err, "reset password");
        });
  }

  ngOnDestroy(){
    if(this.queryParams){
      this.queryParams.unsubscribe();
    }
  }
}
