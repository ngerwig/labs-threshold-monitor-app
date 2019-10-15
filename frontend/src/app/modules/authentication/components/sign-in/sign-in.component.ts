import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { RoutingService } from '../../../core/services/routing/routing.service';

import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { UtilityService } from '../../../core/services/utility/utility.service';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { HttpService } from 'src/app/modules/core/services/http/http.service';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';
// import messageText  from '../../../../config/messages.json';
import textConsts from '../../../../config/constants.json';
import { DataService } from '../../../core/services/data/data.service';
import { PreviousRouteService } from 'src/app/modules/core/services/previous-route/previous-route.service';
import {DEFAULT_VALUES} from '../../../../config/default-values';


@Component({
  selector: 'vtx-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, AfterContentInit {
  signInForm: FormGroup;
  previousUrl;
  emailInvalid: boolean = false;
  isSignInFormSubmitted: boolean = false;
  invalidCreds: boolean = false;
  passwordInvalid: boolean = false;
  isPwdReset: boolean = false;
  isAccntVerified: boolean = false;
  // messages = messageText;
  textConstsObj = textConsts;
  tokenInvalid: boolean = false;
  sessionExpired: boolean = false;

  emailError: boolean = false;
  emailErrorMessage: string = 'Error';
  pwdError: boolean = false;
  pwdErrorMessage: string = '';
  formError: boolean = false;
  showPasswordInput: boolean = true;
  passtype = 'password';
  checkPassword = true;
  queryParams;
  accountAlreadyVerified: boolean = false;
  @ViewChild('userPassword', { static: false }) passwordField: ElementRef;
  notificationMsg: string = '';
  isNotification: boolean = false;
  isFailureNotification: boolean = false;
  isSuccessNotification: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private previousRouteService: PreviousRouteService, 
    private router: Router, 
    private routingService: RoutingService, 
    private utilityService: UtilityService, 
    private loggerService: LoggerService, 
    private httpService: HttpService, 
    private authService: AuthenticationService, 
    private activatedRoute: ActivatedRoute, 
    private dataService: DataService
    ) {
    this.createSignInform();
    //const firstFocusableElementOnPage = document.getElementById('sign-in-heading');
    
    this.queryParams =  this.activatedRoute.queryParams.subscribe(params => {
      this.isAccntVerified = params['isAccountVerified'];
      this.isPwdReset = params['isPwdReset'];
      this.tokenInvalid = params['token-invalid'];
      this.sessionExpired = params['session-expired'];
      this.accountAlreadyVerified = params['accountAlreadyVerified'];
    });
    this.checkNotification();

  }
  ngOnInit() {
    this.previousUrl = this.previousRouteService.getPreviousUrl();
  }
  putFocusOnFirstElement(){
    if( this.previousUrl !== '/authentication/sign-in'){
      this.utilityService.putFocusOnElementOnNavigation('sign-in-heading');
    }
  }
  ngAfterContentInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    this.putFocusOnFirstElement();
  }

  checkNotification() {
    if (this.isNotification = (this.isAccntVerified || this.isPwdReset || this.tokenInvalid || this.sessionExpired || this.accountAlreadyVerified)) {
      if (this.isAccntVerified) {
        this.isSuccessNotification = true;
        this.notificationMsg = textConsts.MSG_SIGN_IN_ACCOUNT_VERIFIED
      }else if (this.isPwdReset) {
        this.isSuccessNotification = true;
        this.notificationMsg = textConsts.MSG_SIGN_IN_PASS_RESET_SUCCESS;
      }else if (this.tokenInvalid) {
        this.isFailureNotification = true;
        this.notificationMsg = textConsts.MSG_SIGN_IN_INVALID_LINK;
      }else if (this.sessionExpired) {
        this.isFailureNotification = true;
        this.notificationMsg = textConsts.MSG_SIGN_IN_SESSION_EXP;
      }else if (this.accountAlreadyVerified) {
        this.isFailureNotification = true;
        this.notificationMsg = textConsts.MSG_SIGN_IN_ACCOUNT_ALREADY_VERIFIED;
      }
    } else {
      this.isNotification = false;
      this.isSuccessNotification = false;
      this.isFailureNotification = false;
    }
  }

  emailChanged() {
    this.emailError = false;
    this.formError = false;
  }

  verifyEmail() {
    setTimeout(() => {
      if (this.signInForm.controls.userEmailId.invalid) {
        if (this.signInForm.controls.userEmailId.pristine || this.signInForm.controls.userEmailId.errors.required) {
          this.emailErrorMessage = this.textConstsObj.MSG_COMMON_EMAIL_REQUIRED;
        } else if (this.signInForm.controls.userEmailId.dirty) {
          this.emailErrorMessage = this.textConstsObj.MSG_SIGN_IN_INCORRECT_EMAIL_ID;
        }
        this.emailError = true;
      }
    }, 100);
  }

  passwordChanged() {
    this.pwdError = false;
    this.formError = false;
  }

  verifyPassword() {
    if (this.checkPassword) {
      setTimeout(() => {
        if (this.signInForm.controls.userPassword.invalid) {
          if (this.signInForm.controls.userPassword.pristine || this.signInForm.controls.userPassword.errors.required) {
            this.pwdErrorMessage = this.textConstsObj.MSG_COMMON_PWD_REQUIRED;
          } else if (this.signInForm.controls.userPassword.dirty) {
            this.pwdErrorMessage = this.textConstsObj.MSG_SIGN_IN_INCORRECT_PASSWORD;
          }
          this.pwdError = true;
        }
      }, 100);
    } else {
      this.checkPassword = true;
    }
  }

  verifyAllFields() {
    this.verifyEmail();
    this.verifyPassword();
  }

  createSignInform() {
    this.signInForm = this.formBuilder.group({
      userEmailId: ['', [Validators.required, Validators.email, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.EMAIL)]],
      userPassword: ['', [Validators.required, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]]
    },
      { updateOn: 'blur' }); // To show validations after Blur
  }

  validateUserDetails() {
    //validate username and password
    this.isSignInFormSubmitted = true;
    if (this.signInForm.valid) {
      this.isSignInFormSubmitted = false;
      this.authService.signin(this.signInForm.controls.userEmailId.value.toLowerCase(), this.signInForm.controls.userPassword.value)
        .subscribe((userValidationResponse) => {
          this.loggerService.logResponse(userValidationResponse, "sign-in");// sign-in response
          //on successful login, check if user data is present
          //if user data not present, show import data screen page
          // if user data is found show dashboard page
          //ZERO_STATE_PAGE,DASHBOARD_PAGE,  EDIT_TAX_DATA_PAGE, EDIT_REGISTERED_STATES_PAGE
          this.authService.setItem("dashboardLandingPage",userValidationResponse);
          if (userValidationResponse == 201) {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                'userEmail': this.signInForm.controls.userEmailId.value,
                'emailNotVerified': true
              }
            };
            this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.ACCNT_VERIFICATION}`, navigationExtras);
          } else {
            let returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
            if(returnUrl){
              returnUrl = returnUrl.split('?');
              let returnPath = returnUrl[0].slice(1);
              let params = this.getParamsFromReturnUrl(returnUrl[1]);
              this.routingService.goToPage(returnPath, {queryParams: params});
            }else{
              switch (userValidationResponse) {
                case 'ZERO_STATE_PAGE':
                  this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.ADD_TAXATION_DATA}`);
                  break;
                case 'DASHBOARD_PAGE':
                  this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.THRESHOLD_SUMMARY}`);
                  break;
                case 'EDIT_TAX_DATA_PAGE':
                  this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.TAXATION_DATA}`);
                  break;
                case 'EDIT_REGISTERED_STATES_PAGE':
                  this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.REGISTERED_STATES}`);
                  break;
                case 'IMPORT_DATA':
                  this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.IMPORT_DATA}`);
                  break;
              }
            }
          }
        }, (err) => {
          this.loggerService.logResponse(err, 'error in sign in');
          this.formError = true;
          // this.utilityService.focusOnFirstInvalidInput();
        }); //api call
    } else {
      // form isn't valid check which fields are invalid and show error.
      this.loggerService.logStatus("form is Invalid", "Sign-in");
      this.verifyAllFields();
      this.utilityService.focusOnFirstInvalidInput();
    }

  }
  signUp() {
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_UP}`);
  }
  forgotPassword() {
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.FORGOT_PWD}`);
  }

  showPassword(event) {
    this.showPasswordInput = !this.showPasswordInput;
    if (this.showPasswordInput) {
      this.passtype = 'password';
    } else {
      this.passtype = 'text';
    }
    this.checkPassword = false;
    setTimeout(() => {
      this.passwordField.nativeElement.focus();
      this.checkPassword = true;
    }, 0);
  }

  getParamsFromReturnUrl(returnUrlParams){
    let params = {};
    if(returnUrlParams){
      returnUrlParams = returnUrlParams.split('&');
      returnUrlParams.forEach((item)=>{
        item = item.split('=');
        params[item[0]] = item[1];
      });
    }
    return params;
  }

  ngOnDestroy() {
    if (this.queryParams) {
      this.queryParams.unsubscribe();
    }
  }

}
