import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { RulesEngine } from './services/rules-engine.service';
import { USStatesMapComponent } from './components/us-states-map/us-states-map.component';
import { StateGraphComponent } from './components/state-graph/state-graph.component';
import { SummaryDataTableComponent } from './components/summary-data-table/summary-data-table.component';
import { ThresholdSummaryComponent } from './components/threshold-summary/threshold-summary.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ImportDataComponent } from './components/import-data/import-data.component';
import { AddTaxationDataComponent } from './components/add-taxation-data/add-taxation-data.component';
import { TaxationDataComponent } from './components/taxation-data/taxation-data.component';
import {CoreModule} from '../core/core.module';
import {ProfileModule} from '../profile/profile.module';
import { ExcelToJson } from './services/excel-to-json.service';
import { StateResolver } from 'src/app/shared/resolvers/state-resolver/state-resolver';
import { LoggerService } from '../core/services/logger/logger.service';
import { SharedDataService } from 'src/app/shared/services/shared-data/shared-data.service';
import { USCurrencyPipe } from './pipes/currency/uscurrency.pipe';
import { ExportToPdfComponent } from './components/export-to-pdf/export-to-pdf.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { TaxationDataResolver } from 'src/app/shared/resolvers/taxation-data-resolver/taxation-data.resolver';
import { PdfCreatorComponent } from './components/pdf-creator/pdf-creator.component';




@NgModule({
  declarations: [
    DashboardComponent,
    ImportDataComponent,
    AddTaxationDataComponent,
    TaxationDataComponent,
    USStatesMapComponent,
    StateGraphComponent,
    SummaryDataTableComponent,
    ThresholdSummaryComponent,
    USCurrencyPipe,
    ExportToPdfComponent,
    PdfCreatorComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    ChartsModule,
    ProfileModule
  ],
  providers: [NgbActiveModal]
  //providers: [RulesEngine, StateResolver, LoggerService, SharedDataService, ExcelToJson]
})
export class DashboardModule { }
