import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ROUTE_PATHS as RouteConfig } from '../../config/route.config';
import { AuthComponent } from './components/auth/auth.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { AccountVerificationComponent } from './components/account-verification/account-verification.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ResetPasswordVerificationComponent } from './components/reset-password-verification/reset-password-verification.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: RouteConfig.AUTH.SIGN_IN, component: SignInComponent },
      { path: RouteConfig.AUTH.SIGN_UP, component: SignUpComponent },
      { path: RouteConfig.AUTH.ACCNT_VERIFICATION, component: AccountVerificationComponent },
      { path: RouteConfig.AUTH.RESET_PWD, component: ResetPasswordComponent },
      { path: RouteConfig.AUTH.FORGOT_PWD, component: ForgotPasswordComponent },
      { path: RouteConfig.AUTH.RESET_PWD_VERICATION, component: ResetPasswordVerificationComponent },
      { path: '', redirectTo: `${RouteConfig.AUTH.SIGN_IN}`, pathMatch: 'full'},
      {path: '**', redirectTo: `${RouteConfig.AUTH.SIGN_IN}`, pathMatch: 'full'}
    ]
  }
]
@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
