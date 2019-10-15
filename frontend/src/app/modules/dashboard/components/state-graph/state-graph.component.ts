import { Component, OnInit, Input } from '@angular/core';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import Constants from '../../../../config/constants.json';
// import * as chart from 'chart.js';
// import * as ChartDataLabels from 'chartjs-plugin-datalabels';
// var $ = require('jquery');
declare var $;

@Component({
  selector: 'vtx-state-graph',
  templateUrl: './state-graph.component.html',
  styleUrls: ['./state-graph.component.scss']
})
export class StateGraphComponent implements OnInit {

  constants = Constants;
  currentSelectedStateTaxData;
  currentSelectedStateTaxationDataSubject;
  isSalesCrossed: boolean = false;
  isTransactionCrossed: boolean = false;
  salesGraphBarWidth;
  transactionGraphBarWidth;
  salesThresholdIndicatorPosition;
  salesThresholdIndicatorLabelPosition;
  transactionThresholdIndicatorPosition;
  transactionThresholdIndicatorLabelPosition;
  salesYaxisPosition;
  transactionYaxisPosition;

  graphMaxWidth: number = 160; //width property set in CSS for graph (in px)
  graphLabelMaxWidth = 160 * .70; //width of element in CSS

  constructor(private loggerService: LoggerService, private utilityService: UtilityService, private dashboardService: DashboardService) {  
  }

  ngOnInit() {
    this.currentSelectedStateTaxationDataSubject = this.dashboardService.currentSelectedStateTaxationDataSubject.subscribe((value) => {
      this.currentSelectedStateTaxData = this.utilityService.isObjectEmpty(value) ? null : value;
      this.createSalesAndTransactionGraph();
    });
  }
  checkIfRegistered() {
    const andn = this.currentSelectedStateTaxData && this.currentSelectedStateTaxData.thresholdStatus == "NOT_AVAILABLE"
    if (this.currentSelectedStateTaxData && this.currentSelectedStateTaxData.thresholdStatus == "NOT_AVAILABLE") {
      return true;
    }
    else {
      return false;
    }
  }
  createSalesAndTransactionGraph() {
    /* 
    Check if sales or transaction is optional of the state
    Set position of bar and threshold line for required graph 
    */
    if (!this.checkIfRegistered()) { // remove one if
      if (this.currentSelectedStateTaxData) {
        if (!this.currentSelectedStateTaxData.isSalesOptional) {
          let sales = this.setGraphValues(this.currentSelectedStateTaxData.actualSales, this.currentSelectedStateTaxData.salesThreshold);
          this.salesGraphBarWidth = sales.graphBarWidth;
          this.salesThresholdIndicatorPosition = sales.thresholdIndicatorPosition;
          this.isSalesCrossed = sales.limitCrossed;
          this.salesThresholdIndicatorLabelPosition = sales.thresholdIndicatorLabelPosition;
          this.salesYaxisPosition = sales.yAxisPosition;
        }
        if (!this.currentSelectedStateTaxData.isTransactionOptional) {
          let transaction = this.setGraphValues(this.currentSelectedStateTaxData.actualTransaction, this.currentSelectedStateTaxData.transactionThreshold);
          this.transactionGraphBarWidth = transaction.graphBarWidth;
          this.transactionThresholdIndicatorPosition = transaction.thresholdIndicatorPosition;
          this.isTransactionCrossed = transaction.limitCrossed;
          this.transactionThresholdIndicatorLabelPosition = transaction.thresholdIndicatorLabelPosition;
          this.transactionYaxisPosition = transaction.yAxisPosition;
        }
      }
    }

  }
  setGraphValues(actualValue, thresholdValue) {
    /* this function calculates widtth of graph bar and treshold indicator line
      takes actual value and threshold value and sets uses max width of the graph to calculate points
      @params actualValue : number - actual value of a state
      @params thresholdValue : number - threshold value of a state
    */
    let graphBarWidth = '0%';
    let thresholdIndicatorPosition = '0%';
    let thresholdIndicatorLabelPosition = '0%';
    let limitCrossed = false;
    let yAxisPosition ='0%';
    let isActualValueNegative = actualValue<0? true : false;
    // actualValue = Math.abs(actualValue);
    if (actualValue > thresholdValue) {
      graphBarWidth = '100%';
      thresholdIndicatorPosition = Math.floor((thresholdValue * 100) / actualValue) + '%';
      thresholdIndicatorLabelPosition = Math.floor((thresholdValue * 64) / actualValue) + '%';
      limitCrossed = true;
    } else {
      graphBarWidth = Math.abs(Math.floor((actualValue * 100) / thresholdValue)) + '%';
      thresholdIndicatorPosition = '100%';
      thresholdIndicatorLabelPosition = '64%';
      if(isActualValueNegative){
        actualValue = Math.abs(actualValue);
        graphBarWidth = ((actualValue*100)/(actualValue+thresholdValue)) +'%';
        yAxisPosition = graphBarWidth;
      }
      if((parseInt(graphBarWidth.split('%')[0]))>50){
        limitCrossed = true;
      }
    }
    return { graphBarWidth, thresholdIndicatorPosition, limitCrossed, thresholdIndicatorLabelPosition, yAxisPosition };
  }


  formatSales(value, currency?) {
    return this.utilityService.digitFormatter(value, currency);
  }

  getTaxationPeriod() {
    if (this.currentSelectedStateTaxData && this.currentSelectedStateTaxData.taxationPeriod) {
      let startMonth = this.formatDate(this.currentSelectedStateTaxData.taxationPeriod.startMonth);
      let endMonth = this.formatDate(this.currentSelectedStateTaxData.taxationPeriod.endMonth);
      if (startMonth == endMonth) {
        return startMonth;
      }
      return `${startMonth} - ${endMonth}`;
    }
  }

  formatDate(date) {
    return this.utilityService.formatDate(date);
  }

  SalesCrossed(){ // remove
    let barValue = $("#salesBarValue").width();
    let barWidth= $('#salesBar').width();
    if( barValue>barWidth || ((barValue+barWidth)>=this.graphMaxWidth)){
      return true;
    }else return false;
  }

  ngOnDestroy() {
    // if(this.currentSelectedStateTaxationDataSubject){
    //   this.currentSelectedStateTaxationDataSubject.unsubscribe();
    // }
  }
}
