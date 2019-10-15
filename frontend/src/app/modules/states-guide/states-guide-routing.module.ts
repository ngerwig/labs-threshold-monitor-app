import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatesGuideComponent } from './components/states-guide/states-guide.component';

const routes: Routes = [
  { path: '', component: StatesGuideComponent },

]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatesGuideRoutingModule { }
