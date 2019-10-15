import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ROUTE_PATHS as RouteConfig } from '../../config/route.config';
import { ImportDataComponent } from './components/import-data/import-data.component';
import { AddTaxationDataComponent } from './components/add-taxation-data/add-taxation-data.component';
import { TaxationDataComponent } from './components/taxation-data/taxation-data.component';
import { ThresholdSummaryComponent } from './components/threshold-summary/threshold-summary.component';
import { RegisteredStatesComponent } from 'src/app/shared/components/registered-states/registered-states.component';

import { StateResolver } from 'src/app/shared/resolvers/state-resolver/state-resolver';
import { TaxationDataCanDeactivateGuard } from './guards/taxation-data-can-deactivate/taxation-data-can-deactivate.guard';
import { TaxationDataResolver } from 'src/app/shared/resolvers/taxation-data-resolver/taxation-data.resolver';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: AddTaxationDataComponent },
      { path: RouteConfig.DBRD.ADD_TAXATION_DATA, component: AddTaxationDataComponent },
      { path: RouteConfig.DBRD.IMPORT_DATA, component: ImportDataComponent },
      { path: RouteConfig.DBRD.THRESHOLD_SUMMARY, component: ThresholdSummaryComponent, resolve: { taxationData: TaxationDataResolver } },
      { path: RouteConfig.DBRD.REGISTERED_STATES, component: RegisteredStatesComponent, canDeactivate: [TaxationDataCanDeactivateGuard] },
      {
        path: RouteConfig.DBRD.TAXATION_DATA, component: TaxationDataComponent,
        resolve: { states: StateResolver }, canDeactivate: [TaxationDataCanDeactivateGuard]
      },
      { path: '**', redirectTo: `${RouteConfig.DBRD.TAXATION_DATA}`, pathMatch: 'full' },
    ]
  },

]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
