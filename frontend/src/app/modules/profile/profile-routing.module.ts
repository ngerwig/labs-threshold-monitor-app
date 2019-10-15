import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ROUTE_PATHS as RouteConfig } from '../../config/route.config';
import { SettingsComponent } from './components/settings/settings.component';
import { RegisteredStatesComponent } from '../../shared/components/registered-states/registered-states.component';
import { ProfileComponent } from '../profile/components/profile/profile.component';

const routes: Routes = [

    { path: '', component: ProfileComponent, 
    children: [
        { path: RouteConfig.PRFL.SETTINGS, component: SettingsComponent },
        { path: RouteConfig.PRFL.REGISTERED_STATES, component: RegisteredStatesComponent },
        { path: '', redirectTo: `${RouteConfig.PRFL.SETTINGS}`, pathMatch: 'full'},
    ] },

];
@NgModule({
    declarations: [],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
