import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatesGuideComponent } from './components/states-guide/states-guide.component';
import { StatesGuideRoutingModule } from './states-guide-routing.module';
import { CoreModule } from '../core/core.module';
import { ReactiveFormsModule } from '@angular/forms';




@NgModule({
  declarations: [StatesGuideComponent],
  imports: [
    CommonModule,
    StatesGuideRoutingModule,
    CoreModule,
    ReactiveFormsModule
  ]
})
export class StatesGuideModule { }
