import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ROUTE_PATHS as RouteConfig } from './config/route.config';
import { AuthGuard } from './modules/core/guards/auth.guard';
import { SigninGuard } from './modules/core/guards/signin.guard';

const routes: Routes = [
  { 
    path: RouteConfig.AUTH.AUTHENTICATION,  
    loadChildren: () => import('./modules/authentication/authentication.module').then(mod => mod.AuthenticationModule),
    canActivate: [SigninGuard]
  },
  { 
    path: RouteConfig.DBRD.DASHBOARD,  
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(mod => mod.DashboardModule),
    canActivate: [AuthGuard]
  },
  { path: RouteConfig.STATE_GUIDES,
    loadChildren: () => import('./modules/states-guide/states-guide.module').then(mod => mod.StatesGuideModule),
    canActivate: [AuthGuard]
  },
  { path: RouteConfig.PRFL.PROFILE,
    loadChildren: () => import('./modules/profile/profile.module').then(mod => mod.ProfileModule),
    canActivate: [AuthGuard]
  },
  { path: '',   redirectTo: `${RouteConfig.AUTH.AUTHENTICATION}`, pathMatch: 'full' },
  { path: '**', redirectTo: `${RouteConfig.AUTH.AUTHENTICATION}`, pathMatch: 'full' }

];
@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
