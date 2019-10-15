import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { RoutingService } from '../../../core/services/routing/routing.service';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { HttpService } from '../../../core/services/http/http.service';
import url from '../../../../config/api-url.config.json';
// import messageText  from '../../../../config/messages.json';
import constants from '../../../../config/constants.json'; 
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import {DEFAULT_VALUES} from '../../../../config/default-values';

@Component({
  selector: 'vtx-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, AfterContentInit {
  // messages = messageText;
  forgotPasswordForm: FormGroup;
  emailInvalid: boolean = false;
  isForgotPasswordFormSubmitted: boolean = false;
  invalidCreds: boolean = false;

  emailError: boolean = false;
  emailErrorMessage: string = '';
  consts = constants;

  emailChanged(){
    this.emailError = false;
  }

  verifyEmail(){
    setTimeout(()=>{
      if(this.forgotPasswordForm.controls.userEmailId.invalid){
        if(this.forgotPasswordForm.controls.userEmailId.pristine || this.forgotPasswordForm.controls.userEmailId.errors.required){
          this.emailErrorMessage = constants.MSG_COMMON_EMAIL_REQUIRED;
        }else if(this.forgotPasswordForm.controls.userEmailId.dirty){
          this.emailErrorMessage = constants.MSG_FORGOT_PASS_INCORRECT_EMAIL;
        }
        this.emailError = true;
      }
    });
  }

  createForgotPasswordform() {
    this.forgotPasswordForm = this.fb.group({
      userEmailId: ['', [Validators.required, Validators.email, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.EMAIL)]]
    },
      { updateOn: 'blur' }); // To show validations after Blur), //--
  }

  checkForgotPasswordFormSubmit(){
    if(this.isForgotPasswordFormSubmitted){
      this.validateEmail();
    }
  }

  validateEmail() {

    const body = {
      url: url.URLS.USER_LOGIN.FORGOT_PASSWORD,
      data: {
        email: this.forgotPasswordForm.controls.userEmailId.value.toLowerCase(),
      }
    } // use it in authentication service
    this.isForgotPasswordFormSubmitted = true;
    if (this.forgotPasswordForm.valid) {
      this.isForgotPasswordFormSubmitted = false;
      this.httpService.post(body).subscribe((res) => {
        this.loggerService.logStatus("Form is valid","Forgot Password");
        if (res.is_success) {
          this.routingService.enableResetPassword = true;
          let navigationExtras: NavigationExtras = {
            queryParams: { 'userEmail': this.forgotPasswordForm.controls.userEmailId.value.toLowerCase() }
          };
          this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.RESET_PWD_VERICATION}`,navigationExtras);
        } else {
          this.emailErrorMessage = constants.MSG_FORGOT_PASS_INCORRECT_NOTREG_EMAIL;
          this.emailError = true;
        }
      }, (err) => {
        this.loggerService.logResponse(err, 'Error in forgot password');
        this.emailErrorMessage = constants.MSG_FORGOT_PASS_REQ_FAILED;
          this.emailError = true;
      })


    } else {
      this.loggerService.logStatus("Form is invalid","Forgot Password");
      this.utilityService.focusOnFirstInvalidInput();
      // this.emailInvalid = this.forgotPasswordForm.controls.userEmailId.invalid;
      this.loggerService.logResponse(this.emailInvalid, "email is invalid")
    }
  };

  navigateToPage() {
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`)
  }

  constructor(private fb: FormBuilder, private router: Router,
    private utilityService: UtilityService, private routingService: RoutingService, private loggerService: LoggerService, private httpService: HttpService) { this.createForgotPasswordform(); }

ngOnInit() {
  }
  ngAfterContentInit(){
    this.utilityService.putFocusOnElementOnNavigation("forgot-header");
  }
  signIn() {
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`);
  }
}
