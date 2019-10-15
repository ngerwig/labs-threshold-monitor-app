import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { AuthComponent } from './components/auth/auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AccountVerificationComponent } from './components/account-verification/account-verification.component';
import { LoggerService } from '../core/services/logger/logger.service';
import { HttpService } from '../core/services/http/http.service';
import { ResetPasswordVerificationComponent } from './components/reset-password-verification/reset-password-verification.component';

@NgModule({
  declarations: [AuthComponent, SignInComponent, SignUpComponent, ForgotPasswordComponent, ResetPasswordComponent,AccountVerificationComponent, ResetPasswordVerificationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule
  ],
  //providers:[LoggerService, HttpService]
})
export class AuthenticationModule { }
