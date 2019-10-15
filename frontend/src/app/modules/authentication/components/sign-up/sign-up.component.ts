import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras, NavigationEnd } from '@angular/router';

import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { RoutingService } from '../../../core/services/routing/routing.service';

import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { HttpService } from 'src/app/modules/core/services/http/http.service';
import url from '../../../../config/api-url.config.json';
import Constants from '../../../../config/constants.json';
import {DEFAULT_VALUES} from '../../../../config/default-values';

@Component({
  selector: 'vtx-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, AfterContentInit {
  // messages = messageText;
  constants = Constants;
  signUpForm: FormGroup;
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  isSignUpFormSubmitted: boolean = false;
  nameInvalid: boolean = false;
  passwordsDoNotMatch: boolean = false;
  invalidCreds: boolean = false;

  nameError: boolean = false;
  nameErrorMessage: string = '';
  emailError: boolean = false;
  emailErrorMessage: string = '';
  passwordError: boolean = false;
  passwordErrorMessage: string = '';
  confirmPwdError: boolean = false;
  confirmPwdErrorMessage: string = '';
  showPasswordInput: boolean = true;
  showPasswordConfirmInput: boolean = true;
  passtype = 'password';
  passtypeConfirm = 'password';
  checkPassword = true;
  checkConfirmPassword = true;
  @ViewChild('userCreatePassword',{static: false}) passwordField: ElementRef;
  @ViewChild('userConfirmPassword',{static: false}) passwordConfirmField: ElementRef;
  

  constructor(private formBuilder: FormBuilder, private router: Router,
     private routingService: RoutingService, private loggerService:LoggerService,
     private utilityService:UtilityService, private httpService:HttpService) {
    //const firstFocusableElementOnPage = document.getElementById('heading-label');
    
    this.createSignUpform();
    
  }

  ngOnInit() {
    }
  ngAfterContentInit(){
    this.utilityService.putFocusOnElementOnNavigation("sign-up-heading");
  }
  nameChanged(){
    this.nameError = false;
  }

  verifyName(){
    setTimeout(()=>{
      if(this.signUpForm.controls.userName.invalid){
        if(this.signUpForm.controls.userName.pristine || this.signUpForm.controls.userName.errors.required){
          this.nameErrorMessage = this.constants.MSG_COMMON_NAME_REQUIRED;
        }else if(this.signUpForm.controls.userName.dirty){
          this.nameErrorMessage = 'Please enter a valid name.';
        }
        this.nameError = true;
      }
    }, 100);
  }

  emailChanged(){
    this.emailError = false;
  }

  verifyEmail(){
    setTimeout(()=>{
      if(this.signUpForm.controls.userEmailId.invalid){
        if(this.signUpForm.controls.userEmailId.pristine|| this.signUpForm.controls.userEmailId.errors.required){
          this.emailErrorMessage = this.constants.MSG_COMMON_EMAIL_REQUIRED;
        }else if(this.signUpForm.controls.userEmailId.dirty){
          this.emailErrorMessage = 'Incorrect email address, please try again';
        }
        this.emailError = true;
      }
    }, 100);
  }


  passwordChanged(){
    this.passwordError = false;
  }

  verifyPassword(){
    if(this.checkPassword){
    setTimeout(()=>{
      if(this.signUpForm.controls.userCreatePassword.invalid){
        if(this.signUpForm.controls.userCreatePassword.pristine || this.signUpForm.controls.userCreatePassword.errors.required){
          this.passwordErrorMessage = this.constants.MSG_COMMON_PWD_REQUIRED;
          document.querySelector('.new-password').classList.remove('additional-info');
        }else if(this.signUpForm.controls.userCreatePassword.dirty){
          this.passwordErrorMessage = 'Passwords must be at least 8 characters, and contain at least one of each of the following: an uppercase letter, a lowercase letter, a number, and a special character (e.g., !@#$%^&*)';
          document.querySelector('.new-password').classList.add('additional-info');
        }
        this.passwordError = true;
      }
    }, 100);
  }else{
    this.checkPassword = true;
    document.querySelector('.new-password').classList.remove('additional-info');
  }
  }

  confirmPwdChanged(){
    this.confirmPwdError = false;
  }

  verifyConfirmPassword(){
    setTimeout(()=>{
      if(this.signUpForm.controls.userConfirmPassword.pristine || (this.signUpForm.controls.userConfirmPassword.errors && this.signUpForm.controls.userConfirmPassword.errors.required)){
        this.confirmPwdErrorMessage = this.constants.MSG_COMMON_CONFIRM_PWD_REQUIRED;
        this.confirmPwdError = true;
      }else if(this.signUpForm.controls.userConfirmPassword.value !== this.signUpForm.controls.userCreatePassword.value){
        this.confirmPwdErrorMessage = 'The passwords do not match.';
        this.confirmPwdError = true;
      }
      
    }, 100);
  }

  verifyAllFields(){
    this.verifyName();
    this.verifyEmail();
    this.verifyPassword();
    this.verifyConfirmPassword();
  }

  createSignUpform() {
    this.signUpForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      userEmailId: ['', [Validators.required, Validators.email, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.EMAIL)]],
      userCreatePassword: ['',[Validators.required, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]],
      userConfirmPassword: ['',[Validators.required, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]]
    },{ updateOn: 'blur' }); // to validate form on blur
  }
  validateUserDetails() {
    this.isSignUpFormSubmitted = true;
    if (this.signUpForm.valid) {
      this.loggerService.logStatus("form is valid","Sign-Up");

      // form is valid but the passwords do not match
      this.isSignUpFormSubmitted = false;
      this.passwordsDoNotMatch = this.signUpForm.controls.userCreatePassword.value == this.signUpForm.controls.userConfirmPassword.value ? false : true; //set flag if password/email is wrong
      if (!this.passwordsDoNotMatch){
        const reqBody = {
          url: url.URLS.USER_LOGIN.SIGNUP,
          data: {
            userName :this.signUpForm.controls.userName.value,
            userEmail : this.signUpForm.controls.userEmailId.value.toLowerCase(),
            password :this.signUpForm.controls.userCreatePassword.value
          }
          }
        this.loggerService.logResponse(reqBody.data,"sign up req body");
        return this.httpService.post(reqBody).subscribe((res)=>{
          this.loggerService.logResponse(res, "sign-up api response");

          if(res.is_success){
            // successful registration, route to account verification
            let navigationExtras: NavigationExtras = {
              queryParams: { 'userEmail': this.signUpForm.controls.userEmailId.value.toLowerCase() }
            };
            let route_path = `/${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.ACCNT_VERIFICATION}`
            this.routingService.goToPage(route_path,navigationExtras);
          }else{
            // check is user is already registered
            if(res.customErrorCode == this.constants.ERR_COMMON_EMAIL_ALREADY_EXIST){
              this.emailErrorMessage = 'This email address already exists.';
              this.emailError = true;
            }
          }
        }, (err)=>{
          this.loggerService.logResponse(err, "sign-up api response");
          return err;
        });
        
      }else{
        this.confirmPwdErrorMessage = 'The passwords do not match.';
        this.confirmPwdError = true;
      }

      
    } else {
      this.loggerService.logStatus("form is Invalid","Sign-Up");
      this.verifyAllFields();
      this.utilityService.focusOnFirstInvalidInput(); // focus first wrong element on submit
    }
  }

  signIn(){
    this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}/${RouteConfig.AUTH.SIGN_IN}`);
  }

  showPassword(event) {
    this.showPasswordInput = !this.showPasswordInput;
    if(this.showPasswordInput){
      this.passtype = 'password';
    }else{
      this.passtype = 'text';
    }
    this.checkPassword = false;
    setTimeout(()=>{
      this.passwordField.nativeElement.focus();
      this.checkPassword = true;
    },0);
  }

  showPasswordConfirm(event) {
    this.showPasswordConfirmInput = !this.showPasswordConfirmInput;
    if(this.showPasswordConfirmInput){
      this.passtypeConfirm = 'password';
    }else{
      this.passtypeConfirm = 'text';
    }
    this.checkConfirmPassword = false;
    setTimeout(()=>{
      this.passwordConfirmField.nativeElement.focus();
      this.checkConfirmPassword = true;
    },0);
  }

}
