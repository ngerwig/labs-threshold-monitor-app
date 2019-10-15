import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { HttpService } from 'src/app/modules/core/services/http/http.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { RoutingService } from 'src/app/modules/core/services/routing/routing.service';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { map, tap } from 'rxjs/operators';
import { DataService } from 'src/app/modules/core/services/data/data.service';
import { HttpClient, HttpRequest, HttpResponse, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Url } from 'src/environments/environment';
import textConsts  from '../../../../config/constants.json';
import {DEFAULT_VALUES} from '../../../../config/default-values';

@Component({
  selector: 'vtx-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit,AfterContentInit {

  resetPasswordForm: FormGroup;
  isResetPwdFormSubmitted: boolean = false;
  authToken: string = '';
  skip: boolean = false;
  textConstsObj = textConsts;
  passwordError: boolean = false;
  passwordErrorMessage: string = '';
  confirmPwdError: boolean = false;
  confirmPwdErrorMessage: string = '';
  pwdChangeErr: boolean = false;
  resetPwdHeader: string = '';

  queryParams;

  passwordChanged(){
    this.passwordError = false;
  }

  verifyPassword(){
    setTimeout(()=>{
      if(this.resetPasswordForm.controls.newPassword.invalid){
        if(this.resetPasswordForm.controls.newPassword.pristine || this.resetPasswordForm.controls.newPassword.errors.required){
          this.passwordErrorMessage = 'New password is required';
        }else if(this.resetPasswordForm.controls.newPassword.dirty){
          this.passwordErrorMessage = textConsts.MSG_COMMON_PWD_REQUIREMENT;
        }
        this.pwdChangeErr = false;
        this.passwordError = true;
      }
    }, 100);
  }

  confirmPwdChanged(){
    this.confirmPwdError = false;
  }

  verifyConfirmPwd(){
    setTimeout(()=>{
        if(this.resetPasswordForm.controls.confirmPassword.pristine || (this.resetPasswordForm.controls.confirmPassword.errors && this.resetPasswordForm.controls.confirmPassword.errors.required)){
          this.confirmPwdErrorMessage = 'Confirm new password is required';
          this.confirmPwdError = true;
        }else if(this.resetPasswordForm.controls.confirmPassword.value !== this.resetPasswordForm.controls.newPassword.value){
          this.confirmPwdErrorMessage = 'The passwords do not match.';
          this.confirmPwdError = true;
        }
    }, 100);
  }

  verifyAllFields(){
    this.verifyPassword();
    this.verifyConfirmPwd();
  }

  constructor(private formBuilder: FormBuilder,
    private authService : AuthenticationService,
    private router: Router, private routingService: RoutingService,
     private loggerService: LoggerService, private utilityService: UtilityService, private httpService: HttpService, private authenticationService: AuthenticationService, private activatedRoute: ActivatedRoute, private dataService: DataService, private httpClient: HttpClient) {
      //const firstFocusableElementOnPage = document.getElementById('fr-pwd-heading');
      this.utilityService.focusOnElement('fr-pwd-heading');
      this.queryParams = this.activatedRoute.queryParams.subscribe(params => {
      this.authToken = params['auth-token'];
      this.skip = params['skip']
    });
    this.createResetPasswordForm();
  }

  ngOnInit() {
    this.authService.removeUserSignInDetails();
    if(this.skip){
      this.resetPwdHeader = this.textConstsObj.HEADER_SET_PWD;
    }else{
      this.resetPwdHeader = this.textConstsObj.HEADER_RESET_PWD;
    }
  }
  ngAfterContentInit(){
    this.utilityService.putFocusOnElementOnNavigation("fr-pwd-heading");
  }

  createResetPasswordForm() {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]]
    }, { updateOn: 'blur' });
  }
  checkResetPwdFormSubmit(){
    if(this.isResetPwdFormSubmitted){
      this.resetPassword();
    }
  }
  resetPassword() {
    this.isResetPwdFormSubmitted = true;
    this.loggerService.logResponse(this.isResetPwdFormSubmitted, 'reset-password');
    if (this.resetPasswordForm.valid) {

      if(this.resetPasswordForm.controls.confirmPassword.value === this.resetPasswordForm.controls.newPassword.value){
          this.isResetPwdFormSubmitted = false;
          let data = {
              password: this.resetPasswordForm.controls.newPassword.value
            }
          let header = new HttpHeaders({ 'auth-token': this.authToken });
          this.loggerService.logResponse(data, "reset pwd req body");
          let resetUrl = `${Url.baseUrl}/reset-password-account`;
          this.httpClient.put<any>(resetUrl, data , { headers: header }).
            subscribe((res) => {
              this.loggerService.logResponse(res, "reset-pwd");
              if (res.is_success) {
                this.loggerService.logResponse(res, "reset password success");
               // this.authService.signout();
               this.pwdChangeErr = false;
                let navigationExtras: NavigationExtras = {
                  queryParams: { 'isPwdReset': true}
                };
                this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`,navigationExtras);
              } else {
                if (res.customErrorCode == 'SAME_OLD_NEW_PASS'){
                  this.pwdChangeErr = true;
                  this.passwordErrorMessage = textConsts.MSG_CURRENT_AND_OLD_PWD_SAME;
                  this.loggerService.logResponse("old and new passwords cannot be same", "forgot password");
                }else{
                  this.loggerService.logResponse(res.customErrorCode, "forgot password");
                }
              }
            }, (err) => {
              this.loggerService.logResponse(err, "reset password");
            });
      }else{
        this.confirmPwdErrorMessage = 'The passwords do not match.';
        this.confirmPwdError = true;
      }
    } else {
      this.isResetPwdFormSubmitted = true;
      this.verifyAllFields();
    }
  }

  skipResetPassword(){
    this.loggerService.logResponse("reset password skipped","Reset password ");
    if(this.skip){
      //this.authService.signout();
      this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}`);
    }
  }

  ngOnDestroy(){
    if(this.queryParams){
      this.queryParams.unsubscribe()
    }
  }

}