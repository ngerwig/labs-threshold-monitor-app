import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportService } from '../../services/export-to-data.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { RulesEngine } from '../../services/rules-engine.service';
import * as _ from 'lodash';
import moment from 'moment';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
@Component({
  selector: 'vtx-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExportModalComponent implements OnInit {
  @Input() taxData;
  public exportData: any = [];
  public fileType: string = '.csv';
  constructor(public activeModal: NgbActiveModal, private exportService: ExportService, 
              private utilityService: UtilityService) { }

  ngOnInit() {
    for (let i = 0; i < this.taxData.data.taxData.length; i++) {
      const data = this.taxData.data.taxData[i];
      for (let j = 0; j < data.periodWiseValues.length; j++) {
        let monthData = data.periodWiseValues[j];
        this.exportData.push({
          'State Name': this.taxData.data.taxData[i]['state']['stateName'],
          'Month': moment(monthData.taxMonth).format('MMM YYYY'),
          'Sales Value': this.formatSales(monthData.salesValue, '$'),
          'Transactions': monthData.transactionsValue ? this.formatSales(monthData.transactionsValue) : 'Transactions data is not required',
          'Status': this.taxData.data.taxData[i]['thresholdStatus'] && this.taxData.data.taxData[i]['thresholdStatus'] == 'NOT_AVAILABLE' ? 'NA' :
            (this.taxData.data.taxData[i]['thresholdStatus'] == 'THRESHOLD_CROSSED' ? 'Threshold Crossed' : this.taxData.data.taxData[i]['thresholdStatus'] == 'THRESHOLD_NEARING' ?
              'Threshold Nearing' : this.taxData.data.taxData[i]['thresholdStatus'] == 'THRESHOLD_SAFE' ? 'Threshold Safe' : '')
        });
      }
    }
  }
  formatSales(value, currency?) {
    return this.utilityService.digitFormatter(value, currency);
  }

  export() {
    this.activeModal.close(true);
    if (this.fileType === '.csv') {
      this.createJSONForCSV();
    } else {
      this.exportService.exportExcel(this.exportData, 'ThresholdMonitorReport' + moment(this.taxData.data.lastUpdatedOn ? this.taxData.data.lastUpdatedOn : '').format('MMDDYYYY'), this.fileType);
    }
    this.utilityService.putFocusOnElementOnNavigation("export-btn");
  }
  cancelExport(){
    this.activeModal.close('Close click');
    this.utilityService.putFocusOnElementOnNavigation("export-btn");
  }

  createJSONForCSV() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      noDownload: false,
      headers: ["State Name", "Month", "Sales Value", "Transactions", "Status"]
    };
    const filename = 'ThresholdMonitorReport' + (this.taxData.data.lastUpdatedOn ? moment(this.taxData.data.lastUpdatedOn).format('MMDDYYYY') : '');
    new ngxCsv(this.exportData, filename, options);
  }

  getFileType(event) {
    this.fileType = event;
  }

}
