import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/modules/core/components/modal/modal.component';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import url from '../../../../config/api-url.config.json';
import { Router } from '@angular/router';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { DataService } from 'src/app/modules/core/services/data/data.service';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { RoutingService } from 'src/app/modules/core/services/routing/routing.service.js';
import constants from '../../../../config/constants.json';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service.js';
import { PreviousRouteService } from 'src/app/modules/core/services/previous-route/previous-route.service.js';

import {DEFAULT_VALUES} from '../../../../config/default-values';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy, AfterContentInit {
  // messages = messageText;
  public profileForm: FormGroup;
  public hideButton: Boolean = true;
  public passwordInvalid: Boolean = false;
  public showRegStateTooltip: Boolean = false;
  public emailInvalid: Boolean = false;
  public emailId: string;
  public nameUpdated: Boolean = false;
  public showChangePasswordBtn: Boolean = true;
  public displayFields: Boolean = false;
  public closeEmailNotification = false;
  public emailReadonly: Boolean = false;
  public passwordForEmailInvalid = false;
  public ispasswordFormSubmitted: Boolean = false;
  public userData;
  public newEmail;
  previousUrl;
  public hidePasswordForm: Boolean = false;
  public showPasswordNotification: Boolean = false;
  public userName: string;
  public backendErrorForPasswordChange: Boolean = false;
  public samePasswordNotAllowed: Boolean = false;
  public emailAlreadyExists: Boolean = false;
  public dbError: Boolean = false;
  public emailUpdateInProgress: any;
  public constants = constants;
  public dropdownArray: Array<object> = [
    {
      data: '50',
      value: '50%'
    },
    {
      data: '60',
      value: '60%'
    },
    {
      data: '70',
      value: '70%'
    },
    {
      data: '80',
      value: '80%'
    },
    {
      data: '90',
      value: '90%'
    }
  ];
  public frequencyArray: Array<object> = [
    {
      data: 'WEEKLY',
      value: 'Weekly'
    },
    {
      data: 'BIWEEKLY',
      value: 'Bi-Weekly'
    },
    {
      data: 'MONTHLY',
      value: 'Monthly'
    },
    {
      data: 'QUARTERLY',
      value: 'Quarterly'
    }
  ];

  constructor(private formBuilder: FormBuilder,
    private previousRouteService: PreviousRouteService, private dataService: DataService, private loggerService: LoggerService,
    private router: Router, private authService: AuthenticationService, private ngbModalService: NgbModal,
    private routingService: RoutingService, private utilityService: UtilityService) { }
  passwordError: boolean = false;
  passwordErrorMessage: string = '';
  confirmPwdError: boolean = false;
  confirmPwdErrorMessage: string = '';
  currentPwdError: boolean = false;
  currentPwdErrorMessage: string = '';
  nameError: Boolean = false;
  nameErrorMessage: string = "";
  currentPasswordForEmailError: Boolean = false;
  currentPasswordForEmailMessage: string = '';
  emailError: Boolean = false;
  emailMessage: string = '';


  nameChanged() {
    this.nameError = false;
  }
  displayRegStateInfo(event) {
    event.stopPropagation();
    this.showRegStateTooltip = !this.showRegStateTooltip;
  }
  verifyName() {
    setTimeout(() => {
      if (this.profileForm.controls.name.invalid) {
        if (this.profileForm.controls.name.pristine || this.profileForm.controls.name.errors.required) {
          this.nameErrorMessage = constants.MSG_COMMON_NAME_REQUIRED;
        } else if (this.profileForm.controls.name.dirty) {
          this.nameErrorMessage = 'Please enter a valid name.';
        }
        this.nameError = true;
      }
    }, 100);
  }

  emailChanged() {
    this.emailError = false;
  }

  verifyEmail() {
    setTimeout(() => {
      if (this.profileForm.controls.email.invalid) {
        if (this.profileForm.controls.email.pristine || this.profileForm.controls.email.errors.required) {
          this.emailMessage = constants.MSG_COMMON_EMAIL_REQUIRED;
        } else if (this.profileForm.controls.email.dirty) {
          this.emailMessage = 'Incorrect email address, please try again';
        }
        this.emailError = true;
      }
    }, 100);
  }
  currentPasswordForEmailChanged() {
    this.currentPasswordForEmailError = false;
  }

  verifycurrentPasswordForEmail() {
    setTimeout(() => {
      if (this.profileForm.controls.currentPasswordForEmail.invalid) {
        if (this.profileForm.controls.currentPasswordForEmail.pristine || this.profileForm.controls.currentPasswordForEmail.errors.required) {
          this.currentPwdErrorMessage = 'Current password is required';
        } else if (this.profileForm.controls.currentPasswordForEmail.dirty) {
          this.currentPwdErrorMessage = 'Incorrect password. Would you like to reset the password?';
        }
        this.currentPasswordForEmailError = true;
      }
    }, 100);
  }
  currentPasswordChanged() {
    this.currentPwdError = false;
  }

  verifyCurrentPassword() {
    setTimeout(() => {
      if (this.profileForm.controls.currentPassword.invalid) {
        if (this.profileForm.controls.currentPassword.pristine || this.profileForm.controls.currentPassword.errors.required) {
          this.currentPwdErrorMessage = 'Current password is required';
        } else if (this.profileForm.controls.currentPassword.dirty) {
          this.currentPwdErrorMessage = 'Incorrect password. Would you like to reset the password?';
        }
        this.currentPwdError = true;
      }else{
        this.currentPwdError = false;
      }
    }, 100);
  }
  passwordChanged() {
    this.passwordError = false;
  }

  verifyNewPassword() {
    setTimeout(() => {
      if (this.profileForm.controls.newPassword.invalid) {
        if (this.profileForm.controls.newPassword.pristine || this.profileForm.controls.newPassword.errors.required) {
          this.passwordErrorMessage = 'New password is required';
          document.querySelector('.new-password').classList.remove('additional-info');
        } else if (this.profileForm.controls.newPassword.dirty) {
          this.passwordErrorMessage = constants.MSG_COMMON_PWD_REQUIREMENT;
          document.querySelector('.new-password').classList.add('additional-info');
        }
        this.passwordError = true;
      }else{
        this.passwordError = false;
        document.querySelector('.new-password').classList.remove('additional-info');
      }
    }, 100);
  }

  confirmPwdChanged() {
    this.confirmPwdError = false;
  }

  verifyConfirmPwd() {
    // setTimeout(()=>{
    if (this.profileForm.controls.confirmNewPassword.pristine || (this.profileForm.controls.confirmNewPassword.errors && this.profileForm.controls.confirmNewPassword.errors.required)) {
      this.confirmPwdErrorMessage = 'Confirm new password is required';
      this.confirmPwdError = true;
    } else if (this.profileForm.controls.confirmNewPassword.value !== this.profileForm.controls.newPassword.value) {
      this.confirmPwdErrorMessage = 'The passwords do not match.';
      this.confirmPwdError = true;
    }else{
      this.confirmPwdError = false;
    }
    // }, 100);
  }
  verifyAllUpdateEmailFormFeild() {
    this.verifyName();
    this.verifyEmail();
    this.verifycurrentPasswordForEmail();
  }
  verifyAllFields() {
    this.verifyNewPassword();
    this.verifyConfirmPwd();
    this.verifyCurrentPassword();
  }
  /**
   * creation and initialization of profile form
   *
   * @memberof ProfileSettingsComponent
   */
  ngOnInit() {
    this.emailUpdateInProgress = this.authService.getItem('emailUpdateInProgress');
    this.authService.currentUser.subscribe(userVal => {
      if (userVal) {
        this.userData = userVal;
      }
    });
    this.emailReadonly = this.userData.userProfile.emailUpdateInProgress;
    this.newEmail = this.userData.userProfile.newEmail;
    this.createProfileForm();
    this.setValueToForm();
    this.previousUrl = this.previousRouteService.getPreviousUrl();
  }
  putFocusOnFirstElement() {
    if (this.previousUrl === '/profile/registered-states') {
      this.utilityService.putFocusOnElementOnNavigation("res-state");
    }
  }
  setValueToForm() {
    this.emailId = this.userData.userProfile.email;
    this.userName = this.userData.userProfile.name;
    this.profileForm.controls.email.setValue(this.emailId);
    this.profileForm.controls.name.setValue(this.userData.userProfile.name);
    if (this.userData.userProfile.userCustomNotification) {
      this.profileForm.controls.taxRule.setValue(this.userData.userProfile.userCustomNotification.taxRule);
      this.profileForm.controls.reminderUploadData.setValue(this.userData.userProfile.userCustomNotification.reminderUploadData);
      this.profileForm.controls.thresholdNearing.setValue(this.userData.userProfile.userCustomNotification.thresholdNearing);
      this.profileForm.controls.thresholdCrossed.setValue(this.userData.userProfile.userCustomNotification.thresholdCrossed);
    } else {
      this.profileForm.controls.thresholdNearingFrequency.setValue(this.frequencyArray[2]['data']);
      this.profileForm.controls.reminderUploadDataFrequency.setValue(this.frequencyArray[2]['data'], { onlySelf: true });
      this.profileForm.controls.taxRuleFrequency.setValue(this.frequencyArray[2]['data'], { onlySelf: true });
      this.profileForm.controls.thresholdNearingLevel.setValue(this.dropdownArray[3]['data'], { onlySelf: true });
    }
    this.setThresholdNearingLevel();
    this.setTaxRuleFrequency();
    this.setThresholdNearingFrequency();
    this.setReminderUploadDataFrequency();

  }
  setThresholdNearingLevel() {
    if (this.userData.userProfile.userCustomNotification.thresholdNearingLevel === 0) {
      this.profileForm.controls.thresholdNearingLevel.setValue(this.dropdownArray[3]['data'], { onlySelf: true });
    } else {
      this.profileForm.controls.thresholdNearingLevel.setValue(this.userData.userProfile.userCustomNotification.thresholdNearingLevel, { onlySelf: true });
    }
  }
  setThresholdNearingFrequency() {
    if (this.userData.userProfile.userCustomNotification.thresholdNearingFrequency === 0) {
      this.profileForm.controls.thresholdNearingFrequency.setValue(this.frequencyArray[2]['data']);
    } else {
      this.profileForm.controls.thresholdNearingFrequency.setValue(this.userData.userProfile.userCustomNotification.thresholdNearingFrequency);
    }
  }
  setTaxRuleFrequency() {
    if (this.userData.userProfile.userCustomNotification.taxRuleFrequency == 0) {
      this.profileForm.controls.taxRuleFrequency.setValue(this.frequencyArray[2]['data'], { onlySelf: true });
    } else {
      this.profileForm.controls.taxRuleFrequency.setValue(this.userData.userProfile.userCustomNotification.taxRuleFrequency, { onlySelf: true });
    }
  }
  setReminderUploadDataFrequency() {
    if (this.userData.userProfile.userCustomNotification.reminderUploadDataFrequency == 0) {
      this.profileForm.controls.reminderUploadDataFrequency.setValue(this.frequencyArray[2]['data'], { onlySelf: true });
    } else {
      this.profileForm.controls.reminderUploadDataFrequency.setValue(this.userData.userProfile.userCustomNotification.reminderUploadDataFrequency, { onlySelf: true });
    }
  }
  createProfileForm() {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(DEFAULT_VALUES.VALIDATIONS.EMAIL)]],
      currentPasswordForEmail: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]],
      currentPassword: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]],
      newPassword: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(DEFAULT_VALUES.VALIDATIONS.PASSWORD)]],
      thresholdNearingLevel: ['', Validators.required],
      thresholdCrossed: ['', Validators.required],
      thresholdNearing: ['', Validators.required],
      thresholdNearingFrequency: ['', Validators.required],
      taxRule: ['', Validators.required],
      taxRuleFrequency: ['', Validators.required],
      reminderUploadData: ['', Validators.required],
      reminderUploadDataFrequency: ['', Validators.required]
    }, { updateOn: 'blur' });

  }
  /**
   * calls update email api by passing user object
   *
   * @memberof ProfileSettingsComponent
   */
  updateEmail() {
    this.emailAlreadyExists = false;
    const object = {
      newEmail: this.profileForm.controls['email'].value,
      currentPassword: this.profileForm.controls['currentPasswordForEmail'].value
    };
    const body = {
      data: object,
      url: url.URLS.PROFILE.EMAIL
    };
    // calling update email api
    if (this.profileForm.controls.email.valid
      && this.profileForm.controls.currentPasswordForEmail.valid && !this.userData.userProfile.emailUpdateInProgress) {
      this.profileForm.controls.email.disabled;
      this.dataService.put(body).subscribe(data => {
        if (data.is_success) {
          this.authService.setItem('emailUpdateInProgress', true);
          this.emailUpdateInProgress = this.authService.getItem('emailUpdateInProgress');
          this.userData.userProfile.email = this.profileForm.controls['email'].value;
          this.updateProfileData(this.userData);
          // this.closeEmailNotification = false;
          this.emailReadonly = true;
          this.loggerService.logResponse(`response from backend--${data}`, `Profile-settings->updateEmail`);
          // this.closeEmailNotification = false;
          this.hideButton = true;
          this.newEmail = this.profileForm.controls['email'].value;
          this.profileForm.controls['email'].setValue(this.emailId);
          this.utilityService.putFocusOnElementOnNavigation('profileEmail');
        } else {
          if (data.customErrorCode && data.customErrorCode === constants.ERR_PROFILE_PASSWORD_NOT_MATCHES) {
            this.passwordForEmailInvalid = true;
            this.currentPwdErrorMessage = "Incorrect password. Would you like to reset the password?";
          }
          if (data.customErrorCode && data.customErrorCode === constants.ERR_COMMON_EMAIL_ALREADY_EXIST) {
            this.emailAlreadyExists = true;
            this.emailMessage = "Email already exists. Please try again.";
          }
          if (data.customErrorCode && data.customErrorCode === 'DB_UPDATE_ERROR') {
            this.dbError = true;
            this.emailMessage = "Failed to update. Please try again.";

          }
        }
      }, (error) => {
        this.loggerService.logResponse(`error from backend--${error}`, `Profile-settings->updateEmail`);
        return error;
      });
    } else {
      this.emailInvalid = true;
    }
  }
  /**
   *
   *
   * @param {*} newEmail
   * @memberof ProfileSettingsComponent
   */
  public matchEmail(newEmail) {
    if (this.emailId === newEmail.target.value) {
      this.hideButton = true;
    } else {
      this.hideButton = false;
    }
  }
  /**
   *
   *
   * @memberof ProfileSettingsComponent
   */
  public updateName() {
    if (this.profileForm.controls.name.valid && this.userName !== this.profileForm.controls.name.value) {
      const body = {
        data: {
          'userName': this.profileForm.controls.name.value
        },
        url: `${url.URLS.PROFILE.USERNAME}`
      };
      this.dataService.put(body).subscribe((data) => {
        this.nameUpdated = true;
        this.loggerService.logResponse(`response from backend--${data}`, `Profile-settings->updateName`);
        if (data['is_success'] === true) {
          this.userData.userProfile.name = this.profileForm.controls.name.value;
          this.updateProfileData(this.userData);
          this.nameUpdated = true;
          setTimeout(() => {
            this.nameUpdated = false;
          }, 4000);
        } else {
          this.nameUpdated = false;
        }
      }, (error) => {
        this.loggerService.logResponse(`error from backend--${error}`, `Profile-settings->updateName`);
        return error;
      });
    } else {
      return;
    }
  }
  public navigateToRegisteredStates(event) {
    event.stopPropagation();
    this.router.navigate([`/${RouteConfig.PRFL.PROFILE}/${RouteConfig.PRFL.REGISTERED_STATES}`]);
  }
  isSameParrword() {
    if (this.profileForm.controls['newPassword'].value === this.profileForm.controls['currentPassword'].value) {
      this.samePasswordNotAllowed = true;
    } else {
      this.samePasswordNotAllowed = false;
    }
  }
  /**
   *
   *
   * @returns
   * @memberof ProfileSettingsComponent
   */
  public updateNewPassword() {
    this.ispasswordFormSubmitted = true;
    this.utilityService.focusOnFirstInvalidInput();
    if (this.profileForm.controls.currentPassword.valid && this.profileForm.controls.newPassword.valid
      && this.profileForm.controls.confirmNewPassword.valid && !this.confirmPwdError) {
      this.ispasswordFormSubmitted = false;
      const body = {
        data: {
          currentPassword: this.profileForm.controls.currentPassword.value,
          newPassword: this.profileForm.controls.newPassword.value,
        },
        url: url.URLS.PROFILE.PASSWORD
      };
      this.dataService.put(body).subscribe(data => {
        if (data.is_success) {
          this.showPasswordNotification = true;
          this.hidePasswordForm = true;
          this.utilityService.putFocusOnElementOnNavigation('currentPassword');
        } else {
          if (data.customErrorCode && data.customErrorCode === constants.ERR_PROFILE_PASSWORD_NOT_MATCHES) {
            this.backendErrorForPasswordChange = true;
          }
          if (data.customErrorCode && data.customErrorCode === 'SAME_OLD_NEW_PASS') {
            this.samePasswordNotAllowed = true;
          }
        }
      }, (err) => {
        this.loggerService.logResponse(`error from backend--${err}`, `Profile-settings->updateNewPassword`);
        return err;
      });
    } else {
      this.verifyAllFields();
      return;
    }
  }
  public clearPasswordForm() {
    this.profileForm.controls.currentPassword.reset();
    this.profileForm.controls.newPassword.reset();
    this.profileForm.controls.confirmNewPassword.reset();
    this.backendErrorForPasswordChange = false;
    this.passwordError = false;
    this.currentPwdError = false;
    this.confirmPwdError = false;
    
  }
  changePassword(){
    this.showChangePasswordBtn=false;
    this.hidePasswordForm=false;
    this.clearPasswordForm();
    this.utilityService.putFocusOnElementOnNavigation("currentPassword");
  }
  cancelChangePwd(){
    this.samePasswordNotAllowed = false;
    this.showChangePasswordBtn=true;
    this.utilityService.putFocusOnElementOnNavigation("pfl-change-pwd");
  }
  public cancelEmailForm() {
    this.passwordForEmailInvalid = false;
    this.profileForm.controls.email.setValue(this.emailId);
    this.hideButton = true;
    this.profileForm.controls['currentPasswordForEmail'].reset();
    this.utilityService.putFocusOnElementOnNavigation('profileEmail');
  }
  public updateNotifications(key, value) {
    const reqBody = {
      url: url.URLS.PROFILE.NOTIFICATION,
      data: {
        [key]: value,
        updatedFieldName: key
      }
    };
    this.dataService.put(reqBody).subscribe((data) => {
      this.loggerService.logResponse(`response from backend--${data}`, `Profile-settings->updateNotifications`);
      if (data.is_success === true) {
        this.userData.userProfile.userCustomNotification[key] = value;
        this.updateProfileData(this.userData);
      } else {
        return;
      }
    }, (err) => {
      this.loggerService.logResponse(`error from backend--${err}`, `Profile-settings->updateNotifications`);
      return err;
    });
  }

  onKeydownUpdateNotifications(key, data) {
    this.profileForm.controls[key].setValue(!data.checked);
    this.updateNotifications(key, data.checked);
  }
  public deactivateAccount() {
    const reqBody = {
      url: url.URLS.PROFILE.DEACTIVATE
    };
    this.dataService.get(reqBody).subscribe(response => {
      this.loggerService.logResponse(`response from backend--${response}`, `Profile-settings->updateNotifications`);
      this.authService.signout().subscribe((response) => {
        this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}`);
      });
    }, (err) => {
      this.loggerService.logResponse(`error from backend--${err}`, `Profile-settings->updateNotifications`);
    });
  }

  confirmDeactivation() {
    const modelRef = this.ngbModalService.open(ModalComponent, {
      centered: true
    });
    modelRef.componentInstance.modalData = {
      header: "Deactivate Account",
      modalContent: constants.MSG_PROFILE_DEACTIVATE_MESSAGE,
      okText: "Deactivate",
      focusOnCancel:"deactivate-btn",
      cancelText: "Cancel",
      isCancelVisible: true
    }
    modelRef.componentInstance.onSuccess.subscribe(() => {
      this.deactivateAccount();
    })
  }
  confirmResetEmail() {
    if (this.profileForm.controls.name.valid && this.profileForm.controls.email.valid
      && this.profileForm.controls.currentPasswordForEmail.valid) {
      const resetEmailModelRef = this.ngbModalService.open(ModalComponent, {
        centered: true
      });
      resetEmailModelRef.componentInstance.modalData = {
        header: "Update Email",
        modalContent: constants.MSG_PROFILE_RESET_EMAIL_MESSAGE,
        okText: "Okay",
        focusOnCancel: "",
        cancelText: "Cancel",
        isCancelVisible: true
      }
      resetEmailModelRef.componentInstance.onSuccess.subscribe(() => {
        this.updateEmail();
      });
    } else {
      this.verifyAllUpdateEmailFormFeild();
      this.utilityService.focusOnFirstInvalidInput();
    }
  }
  ngAfterContentInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      setTimeout(() => {
        this.putFocusOnFirstElement();
    });
  }
  public updateProfileData(data) {
    this.authService.updateUserCurrentObject(data);
  }
  public closeNotification() {
    this.closeEmailNotification = true;
  }
  public ngOnDestroy() {
    // if (this.authService.currentUserValue) {
    //   this.authService.currentUserValue.unsubscribe();
    // }
  }
}
