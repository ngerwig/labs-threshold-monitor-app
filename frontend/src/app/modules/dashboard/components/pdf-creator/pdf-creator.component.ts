import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import * as jsPDF from 'jspdf';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { DatePipe } from '@angular/common';
import { ThresholdStatus } from '../../services/rules-engine.service';
import { IMAGES } from './export-report-pdf-consts';
import url from '../../../../config/api-url.config.json';
import { Url } from 'src/environments/environment';
import { DataService } from 'src/app/modules/core/services/data/data.service';
import { LoaderService } from 'src/app/modules/core/services/loader/loader.service';

declare var $;

enum ThresholdStatusString {
    CROSSED = "Threshold crossed",
    NEARING = "Threshold nearing",
    SAFE = "Threshold safe",
    NA = "N/A"
}

enum ThresholdStatusToStringMap {
    THRESHOLD_CROSSED = "Threshold crossed",
    THRESHOLD_NEARING = "Threshold nearing",
    THRESHOLD_SAFE = "Threshold safe",
    NOT_AVAILABLE = "N/A"
}

@Component({
  selector: 'vtx-pdf-creator',
  templateUrl: './pdf-creator.component.html',
  styleUrls: ['./pdf-creator.component.scss'],
  providers: [DatePipe]
})
export class PdfCreatorComponent implements OnInit, OnDestroy {

  @Input() importDataProp;
  importData;
  clickSubscription;
  constructor(
    private dashBoardService: DashboardService, 
    private authService: AuthenticationService, 
    private datePipe: DatePipe,
    private dataService: DataService,
    private loader: LoaderService) { }

  ngOnInit() {
    this.clickSubscription = this.dashBoardService.reportClick.subscribe((val)=>{
      try{
        this.loader.show();
        this.generatePdf(val);
        this.loader.hide();
      }catch(e){
        console.log(e);
        this.loader.hide();
      }
      
    });
    this.importData = JSON.parse(JSON.stringify(this.dashBoardService.userImportedTaxationData));
  }

  ngOnDestroy(){
    this.clickSubscription.unsubscribe();
  }

  generatePdf(reportFor){
    var calculationDate = this.datePipe.transform(new Date(this.importData.lastUpdatedOn), 'dd MMM, yyyy');//'10 Sep, 2019'
    let importedDate = new Date(this.importData.lastUpdatedOn);
    var dtImported = this.datePipe.transform(importedDate, 'MMMM d, yyyy');//'September 5, 2019'
    var name = this.authService.currentUserValue.userName;
    var email = this.authService.currentUserValue.userEmail;
    var txtDisclaimer = `
    The Vertex Threshold Monitor assists business who may be impacted by the June 2018 South Dakota vs. Wayfair Supreme Court decision and subsequent sales tax law changes across various states in the United States. As a result of this decision, many states have instituted economic nexus rules that require businesses to collected and remit sales tax in the event that they have sold goods or services to residents of the state in question, even if the business does not have a physical presence in the state. This tool is focused on economic nexus rules only, and does not provide any guidance as it relates to physical presence, business relationships, or other activities.


    ALL MATERIALS ARE PROVIDED "AS IS" AND WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY. VERTEX SPECIFICALLY DISCLAIMS ANY REPRESENTATIONS OR WARRANTIES THAT ANY GOVERNMENTAL INFORMATION (INCLUDING, BUT NOT IMITED TO, INFORMATION REGARDING TAX RATES OR THE APPLICABILITY OF CERTAIN TAXES) ARE ACCURATE, CURRENT, OR APPLICABLE TO YOU OR YOUR BUSINESS.


    Further, Vertex does not warrant the accuracy or completeness of any of the Materials. The Materials and related graphics published within this application may include technical inaccuracies or typographical errors. Vertex may change any of the Materials at any time without notice. The materials may be out of date, and Vertex makes no commitment to update the Materials.`;

    let thresholdData = this.importData.taxData;
    let thresholdDataLength = thresholdData.length;
    let thresholdCalculatedLength=0;
    for(let i=0;i<thresholdDataLength;i++){
      if(thresholdData[i].thresholdStatus != ThresholdStatus.NA){
        thresholdCalculatedLength++;
      }
    }
    var thresholdStateCount = ''+thresholdCalculatedLength;
    var thresholdCrossed = 0;
    var thresholdNearing = 0;
    var thresholdSafe = 0;
    this.importData.taxData.forEach((item)=>{
      switch(item.thresholdStatus){
        case ThresholdStatus.CROSSED: thresholdCrossed++;
            break;
        case ThresholdStatus.NEARING: thresholdNearing++;
            break;
        case ThresholdStatus.SAFE: thresholdSafe++;
            break;
      }
    });
    let registeredStates = this.dashBoardService.allRegisteredStates;
    let allStates = this.authService.currentUserValue.allStates;
    var stateSelected = [];
    var stateListArray = [];
    var stateListForProps = [];

    allStates.forEach(item=>{
      stateListArray.push(item.stateName);
      if(registeredStates.indexOf(item.stateCode)>-1){
        stateSelected.push(item.stateName);
      }
    });
    stateSelected.sort();
    stateListArray.sort();

    var imgLogo = IMAGES.logoImg;
    var pieChartImage;

    var canvasImg = $("#threshold-pie-chart-canvas-1")[0];
    if (canvasImg !== undefined) {
      pieChartImage = canvasImg.toDataURL("image/png");
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });




        var doc = new jsPDF({
          orientation: 'potrait',
          unit: 'mm',
          format: 'letter',
          putOnlyUsedFonts:true,
          compress: true,
          precision: 2
         });
         
        // doc.addPage();
        doc.page = 1; // use this as a counter.
        var pgHeight = doc.internal.pageSize.height;
        var pgWidth = doc.internal.pageSize.width;
        let footer = () => {
            var pg = doc.page < 10 ? '0' + doc.page : '' + doc.page;
            doc.setTextColor(41, 39, 39);
            doc.setFontSize(7);
            doc.text(7, 270, 'Copyright © 2019 Vertex, Inc. All rights reserved.');
            if (doc.page > 1) {
                doc.setTextColor(41, 39, 39);
                doc.setFontSize(7);
                doc.text(150, 270, 'Threshold Report | Calculation Date - ' + calculationDate);
                doc.setDrawColor(0);
                doc.setFillColor(227, 227, 227);
                doc.rect(208, 266.5, 5, 5, 'F');
                doc.setFontSize(8);
                doc.setTextColor(80, 78, 78);
                doc.text(209, 270, pg); //print number bottom right
            }
            doc.page++;
        }
        // COVER PAGE
        doc.addImage(imgLogo, 'PNG', 54, 108, 42, 8, undefined, 'FAST');
        doc.setFontSize(36);
        doc.setTextColor(0, 47, 91);
        doc.setFontType('bold');
        doc.text(54, 131, 'State Threshold');
        doc.text(54, 144, 'Report');
        doc.setFontSize(16);
        doc.setTextColor(0, 132, 57);
        // doc.setFontType('bold');
        doc.text(54, 155, 'Calculation Date - ' + dtImported);
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.setFontType('normal');
        doc.text(54, 165, 'www.thresholdmonitor.vertex.com');
        doc.setFontSize(12);
        doc.text(54, 188, name + ' | ' + email);

        doc.polygon = function (points, scale, style, closed) {
          var x1 = points[0][0];
          var y1 = points[0][1];
          var cx = x1;
          var cy = y1;
          var acc = [];
          for (var i = 1; i < points.length; i++) {
              var point = points[i];
              var dx = point[0] - cx;
              var dy = point[1] - cy;
              acc.push([dx, dy]);
              cx += dx;
              cy += dy;
          }
          this.lines(acc, x1, y1, scale, style, closed);
        }

        doc.setFillColor(119, 182, 60);
        // light green line
        doc.polygon([[173, 27], [180, 19], [180, 170], [173, 177]], [1.0, 1.0], 'F');
        doc.setFillColor(0, 82, 131);
        // dark blue line
        doc.polygon([[173, 177], [180, 170], [pgWidth, 170], [pgWidth, 177]], [1.0, 1.0], 'F');

        doc.setFillColor(0, 132, 57);
        // dark green line
        doc.polygon([[19, 177], [26, 170], [173, 170], [173, 177]], [1.0, 1.0], 'F');
        doc.setFillColor(0, 124, 198);
        // light blue line
        doc.polygon([[173, 177], [180, 177], [180, pgHeight], [173, pgHeight]], [1.0, 1.0], 'F');

        footer();
        doc.addPage();

        // DISCLAIMER PAGE
        doc.setTextColor(44, 44, 44);
        doc.setFontSize(28);
        doc.text(24, 26, 'Disclaimer')
        doc.setFontSize(10);
        doc.text(24, 36, doc.splitTextToSize('' + txtDisclaimer, 167))
        footer();
        doc.addPage();

        // SUMMARY PAGE
        doc.setTextColor(44, 44, 44);
        doc.setFontSize(28);
        doc.text(24, 26, 'Summary')
        doc.setFontSize(10);
        doc.text(24, 36, doc.splitTextToSize('Here is the threshold distribution summary of your taxation data that you imported and calculated on ' + dtImported + '. Information is shown based on the Threshold Status for each of the state.', 167))
        doc.setLineWidth(0.5);
        doc.setDrawColor(233, 233, 233);
        doc.line(22, 50, 190, 50);
        doc.line(22, 120, 190, 120);
        doc.line(106, 60, 106, 110);
        doc.setDrawColor(112, 112, 112);
        doc.circle(30, 62, 6);

        if(pieChartImage){
          doc.addImage(pieChartImage, 'PNG', 90, 66, 89, 44.5, undefined, 'FAST');
        }

        doc.setFontSize(10);
        doc.text(40, 61, doc.splitTextToSize('Number of states in which Threshold was calculated', 56))
        doc.text(115, 61, doc.splitTextToSize('Threshold Distribution in percentage', 73))
        doc.setTextColor(0, 0, 0);
        doc.text(52, 75, 'Threshold crossed');
        doc.text(52, 85, 'Threshold nearing');
        doc.text(52, 95, 'Threshold safe');

        doc.setDrawColor(0)
        doc.setFillColor(255, 70, 19)
        doc.roundedRect(40, 70, 8, 7, 1, 1, 'F')

        doc.setDrawColor(0)
        doc.setFillColor(212, 117, 0)
        doc.roundedRect(40, 80, 8, 7, 1, 1, 'F')

        doc.setDrawColor(0)
        doc.setFillColor(0, 138, 0)
        doc.roundedRect(40, 90, 8, 7, 1, 1, 'F')
        doc.setTextColor(59, 57, 57);
        doc.setFontSize(14)
        doc.setFontType('bold');
        doc.text(thresholdStateCount, 30, 63.5, 'center');
        doc.setTextColor(255, 255, 255);
        doc.text(''+thresholdCrossed, 44, 75, 'center');
        doc.text(''+thresholdNearing, 44, 85, 'center');
        doc.text(''+thresholdSafe, 44, 95, 'center');

        //render states map here.
        doc.addImage(this.dashBoardService.usMapData, 'PNG', 10, 130, 182, 99, undefined, 'FAST');

        doc.setFontSize(10);
        doc.setTextColor(44, 44, 44);
        doc.setFontType('normal');
        doc.text(doc.splitTextToSize('Map depicts threshold for all the states where your business is running. Each of the threshold statutes are estimated based on the thresholds per sales value and number of transactions for each individual state.', 132), pgWidth / 2, pgHeight - 22, 'center')
        footer();
        doc.addPage();

        // LIST OF STATE PAGE
        doc.setTextColor(44, 44, 44);
        doc.setFontSize(28);
        doc.text(24, 26, doc.splitTextToSize('State(s) in which your business has a physical presence’', 167))
        doc.setFontSize(10);
        doc.text(24, 46, doc.splitTextToSize('For the state(s) in which your business has a business presence, tax calculation is independent of any threshold value. So for those states, there is no Threshold data calculated in this report.', 167))


        let createStateList = ()=> {
            var limitHorizontal = 0;
            var limitVertical = 0;
            var imgData = IMAGES.tickMark;
            stateListArray.forEach(function (state, i) {
                doc.setTextColor(64, 62, 62);
                doc.setFontSize(10);
                doc.text(30 + (limitHorizontal * 60), 65 + (limitVertical * 10), state);
                doc.setDrawColor(64, 62, 62);
                if (stateSelected.indexOf(state) > -1) {
                    doc.addImage(imgData, 'JPEG', 24.2 + (limitHorizontal * 60), 61 + (limitVertical * 10), 5, 5, 'checkmark', 'FAST');
                }
                doc.rect(25 + (limitHorizontal * 60), 62.5 + (limitVertical * 10), 3, 3);//D

                if (limitVertical == 16) {
                    limitHorizontal++;
                    limitVertical = 0;
                } else {
                    limitVertical++
                }
            })
        }
        createStateList();
        footer();
        doc.addPage();

        // STATE SPECIFIC PAGE

        let renderStatePage = (stateDetails, stateIndex, totalStates) => {
            var statePolicy = stateDetails.ruleData;
            var thresholdLabel = ThresholdStatusToStringMap[stateDetails.thresholdStatus];
            var startMonth = new Date(stateDetails.taxationPeriod.startMonth);
            startMonth.setMinutes(startMonth.getMinutes()+startMonth.getTimezoneOffset());
            var endMonth = new Date(stateDetails.taxationPeriod.endMonth);
            endMonth.setMinutes(endMonth.getMinutes()+endMonth.getTimezoneOffset());
            stateListForProps.push(stateDetails.state.stateName);
            var dtPeriod;
            if(startMonth.toDateString()==endMonth.toDateString()){
              dtPeriod = this.datePipe.transform(startMonth, 'MMM yyyy');
            }else{
              dtPeriod = this.datePipe.transform(startMonth, 'MMM yyyy')+' - '+this.datePipe.transform(endMonth, 'MMM yyyy');
            }
            var salesValue = parseFloat(stateDetails.totalUserSalesValue);
            var transactionValue = stateDetails.totalUserTransactionsValue?parseInt(stateDetails.totalUserTransactionsValue):0;
            var thresholdSalesValue = parseFloat(statePolicy.salesTransaction.thresholdSales);
            var thresholdTransactionValue = statePolicy.salesTransaction.thresholdTransactions?parseInt(statePolicy.salesTransaction.thresholdTransactions):0;

            doc.setTextColor(44, 44, 44);
            doc.setFontSize(9);
            doc.text(24, 17, 'State '+ stateIndex +' of '+totalStates);
            doc.setFontSize(28);
            doc.text(24, 26, stateDetails.state.stateName);
            if (thresholdLabel === ThresholdStatusToStringMap.THRESHOLD_CROSSED) {
                doc.setFillColor(255, 70, 19);
            } else if (thresholdLabel === ThresholdStatusToStringMap.THRESHOLD_NEARING) {
                doc.setFillColor(212, 117, 0);
            } else {
                doc.setFillColor(0, 138, 0);
            }
            doc.roundedRect(155, 20, 35, 6, 3, 3, 'F')
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.text(thresholdLabel, 172.5, 24, 'center');

            doc.setLineWidth(0.5);
            doc.setDrawColor(150, 150, 150); // draw red lines
            doc.line(22, 35, 190, 35);
            doc.line(22, 56, 190, 56);

            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(22, 44, 'Period');
            doc.text(70, 44, 'Sales value');
            doc.text(110, 44, 'Transactions');

            doc.setFontSize(11);
            doc.text(22, 49, dtPeriod);
            doc.text(70, 49, '' + formatter.format(salesValue));
            if(statePolicy.salesTransaction.transactionRequired){
              doc.text(110, 49, '' + transactionValue);
            }else{
              doc.text(110, 49, 'N/A');
            }

            let renderGraph = (graphType) => {
                var chartX = 22;
                var chartY = 100;
                var chartWidth = 70;
                var chartHeight = 30;
                var axisShift = 0;
                var thresholdPositionX = 0;
                var barChartValue = 0;
                var xAxisLabel;
                var thresholdValue;
                var totalValue;
                doc.setLineWidth(0.1);

                if (graphType === 'transactions') {
                    chartX = 118;
                    chartY = 100;
                    doc.setLineWidth(0.1);
                    doc.line(106, 65, 106, 105);
                    //doc.setLineWidth(0.5);
                    // has to be calculated
                    xAxisLabel = 'Transactions Plot';
                    thresholdValue = thresholdTransactionValue;
                    totalValue = transactionValue;
                    //  ............... //
                } else {
                    // has to be calculated
                    xAxisLabel = 'Sales Value Plot';
                    thresholdValue = thresholdSalesValue;
                    totalValue = salesValue;
                    //  ............... //
                }


                if (totalValue > thresholdValue) {
                    barChartValue = chartWidth;
                    if(totalValue==0){
                      thresholdPositionX = 0;
                    }else{
                      thresholdPositionX = (thresholdValue / totalValue) * chartWidth;
                    }
                } else {
                    thresholdPositionX = chartWidth;
                    if(thresholdValue==0){
                      barChartValue = 0;
                    }else{
                      barChartValue = Math.abs((totalValue / thresholdValue) * chartWidth);
                    }
                    if (totalValue < 0) {
                        axisShift = barChartValue;
                    }
                }

                if (graphType !== 'transactions') {
                    thresholdValue = formatter.format(thresholdSalesValue);
                    totalValue = formatter.format(salesValue);
                }


                //x-axis
                doc.line(chartX, chartY, chartX + chartWidth, chartY);
                //y-axis
                doc.line(chartX + axisShift, chartY, chartX + axisShift, chartY - chartHeight);
                //threshold-axis
                doc.setDrawColor(255, 0, 0); // draw red lines
                // doc.setLineDash([1, 1], 0);
                doc.line(chartX + thresholdPositionX, chartY, chartX + thresholdPositionX, chartY - chartHeight);
                doc.setDrawColor(150, 150, 150); // draw red lines
                //bar-chart
                doc.setFillColor(0, 162, 191);
                doc.rect(chartX, chartY - 2.5 - chartHeight / 2, barChartValue, 5, 'F');
                //chart labels
                doc.setFontSize(8);
                doc.setTextColor(61, 64, 82);
                doc.setFontType('bold');
                doc.text(xAxisLabel, chartX + chartWidth / 2, chartY + 4, 'center');
                doc.setFontSize(9);
                doc.setFontType('normal');
                doc.text('Threshold', chartX + thresholdPositionX, chartY - 6 - chartHeight, 'center');
                doc.text('' + thresholdValue, chartX + thresholdPositionX, chartY - 2 - chartHeight, 'center');
                doc.setFontSize(8);
                doc.setTextColor(38, 37, 37);

                var strAlign = 'left';
                if (barChartValue > chartWidth / 2) {
                    barChartValue = barChartValue - 3;
                    strAlign = 'right';
                    doc.setTextColor(255, 255, 255);
                }
                doc.text('' + totalValue, chartX + 1 + barChartValue, chartY + 1 - chartHeight / 2, strAlign);
                //doc.text(chartX + 1 + barChartValue, chartY + 1 - chartHeight / 2, '' + totalValue);
            }
            renderGraph('');
            if(statePolicy.salesTransaction.transactionRequired){
              renderGraph('transactions');
            }
            doc.setLineWidth(0.5);
            doc.setDrawColor(150, 150, 150);
            doc.line(22, 112, 190, 112);


            doc.setFontSize(13);
            doc.setTextColor(0, 0, 0);
            doc.text(22, 124, 'Remote Seller Nexus Rules');

            doc.setLineWidth(1);
            doc.setDrawColor(230, 226, 226);
            doc.line(24, 130, 24, 153);

            /*doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFontType('bold');
            doc.text(27, 133, 'Effective date:');
            doc.text(27, 140, 'Measurement Period:');
            doc.text(27, 147, 'Thresholds Triggering Collection Obligation:');
            var effectiveDate = this.datePipe.transform(statePolicy.effectiveDate, 'M/d/yyyy');
            doc.setFontType('normal');
            doc.text(52, 133, ''+effectiveDate);
            doc.text(64, 140, ''+statePolicy.thresholdMeasurementRuleName);
            doc.text(103, 147, ''+statePolicy.shortInfo);*/
            // doc.text(doc.splitTextToSize('                                                                             More than $100,000 or 200 or more separate sales transactions', 159), 27, 147)
            var descriptionHTML = this.statePolicyDescriptionHTML(statePolicy);
            // doc.fromHTML(
            //     '<font size="2.5" face="sans-serif" color="black"><b>Thresholds Triggering Collection Obligation:</b> More than $100,000 or 200 or more separate sales transactions</font>',
            //     26,
            //     141,
            //     {
            //         'width': 159
            //     });
            doc.fromHTML(
              descriptionHTML,
              26,
              129,
              {
                  'width': 159
              });

            footer();
            doc.addPage();
        }

        for(let i=0,j=0;i<thresholdDataLength;i++){
          if(thresholdData[i].thresholdStatus != ThresholdStatus.NA){
            renderStatePage(thresholdData[i], j+1, thresholdCalculatedLength);
            j++;
          }
        }

        // LAST PAGE
        var pgHeight = doc.internal.pageSize.height;
        var pgWidth = doc.internal.pageSize.width;
        doc.setFontSize(12);
        doc.setTextColor(13, 13, 13);
        doc.text('Threshold Calculation Date - '+dtImported, pgWidth / 2, 153, 'center');
        doc.setTextColor(49, 101, 145);
        doc.setFontSize(10);
        doc.text('www.thresholdmonitor.vertex.com', pgWidth / 2, 160, 'center');
        doc.setLineWidth(0.5);
        doc.setDrawColor(209, 207, 207);
        doc.line(51, 176, pgWidth - 51, 176);

        doc.setTextColor(0, 0, 0);
        doc.text('For assistance with registration to file state taxes,', pgWidth / 2, 189, 'center');
        doc.text('contact Vertex at the link below.', pgWidth / 2, 195, 'center');
        doc.text('Contact Number: (844) 321-3346', pgWidth / 2, 208, 'center');
        doc.setTextColor(49, 101, 145);
        doc.text('https://www.vertexinc.com/', pgWidth / 2, 201, 'center');

        var imgData = IMAGES.lastPageImage;

        doc.addImage(imgData, 'PNG', 0, 0, pgWidth, 118, undefined, 'FAST');
        doc.setFillColor(255, 255, 255);
        doc.triangle(-5, 118, pgWidth, 93, pgWidth, 118, 'F')

        footer();

        doc.setProperties({
          title: 'Threshold Monitor Report',
          subject: 'Threshold Monitor Report calculated on '+dtImported,		
          author: name,
          keywords: 'SELECTED STATES: \n'+stateListForProps.join(', '),
          creator: 'Vertex Inc.'
        });

        var reportdate = this.datePipe.transform(new Date(), 'MMddyyyy');
        if(reportFor == 'forPost'){
          var file =  doc.output('blob', 'ThresholdMonitorReport.pdf');
          var fd = new FormData();
          fd.append('file', file, `ThresholdMonitorReport${reportdate}.pdf`);
          const reqBody = {
            url: url.URLS.REPORT.PDF_REPORT,
            data: fd
          };
          this.dataService.postMultiPartFile(reqBody).subscribe((res)=>{
            if(res.is_success){
              console.log('Report sent successfully to server!');
            }
          });
        }else{
          doc.save(`ThresholdMonitorReport${reportdate}.pdf`);
        }
       //url.URLS.REPORT.PDF_REPORT 
  }

  statePolicyDescriptionHTML(state){
    var effectiveDate = this.datePipe.transform(state.effectiveDate, 'M/d/yyyy');
    var style = `font-family: sans-serif; font-size: 14px; line-height: 20px;`;
    let html = `<div>
      <div face="sans-serif">
        <div><b style='${style}'>Effective date: </b><font style='${style}'>${effectiveDate}</font></div>
        <div><b style='${style}'>Measurement Period: </b><font style='${style}'>${state.thresholdMeasurementRuleName}</font></div>
        <div><b style='${style}'>Thresholds Triggering Collection Obligation: </b><font style='${style}'>${state.shortInfo}</font></div>
      </div>
      <div>
        <br/><br/>
        <font style='${style} font-size: 15px;'>${state.longInfo}</font>
      </div>
    </div>`;

    return html;
  }

}
