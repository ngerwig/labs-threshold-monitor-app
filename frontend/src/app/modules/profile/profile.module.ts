import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../core/services/http/http.service';
import { HttpClientModule } from '@angular/common/http';
import { RegisteredStatesComponent } from '../../shared/components/registered-states/registered-states.component';
import { ProfileComponent } from './components/profile/profile.component';
import {CoreModule} from '../core/core.module';
import { PreviousRouteService } from '../core/services/previous-route/previous-route.service';


@NgModule({
  declarations: [SettingsComponent, RegisteredStatesComponent, ProfileComponent ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule
  ],
  
  
  //providers: [PreviousRouteService],
  exports: [RegisteredStatesComponent]
})
export class ProfileModule { }
