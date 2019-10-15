import { Component, OnInit, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { NavigationExtras, ActivatedRoute } from '@angular/router';

import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { RoutingService } from 'src/app/modules/core/services/routing/routing.service';
import { LoaderService } from 'src/app/modules/core/services/loader/loader.service';

import { ExportModalComponent } from 'src/app/modules/dashboard/components/export-modal/export-modal.component';

import { ROUTE_PATHS } from '../../../../config/route.config';
import { IMAGES } from '../../../../config/images';
import { DEFAULT_VALUES } from '../../../../config/default-values';
import url from '../../../../config/api-url.config.json';
import moment from 'moment';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { DataService } from 'src/app/modules/core/services/data/data.service';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';

declare var $;

@Component({
  selector: 'vtx-threshold-summary',
  templateUrl: './threshold-summary.component.html',
  styleUrls: ['./threshold-summary.component.scss']
})
export class ThresholdSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  thresholdRegulationsStatus;
  public page_section;
  public HTML_Width;
  public HTML_Height;
  public top_left_margin;
  public PDF_Width;
  public PDF_Height;
  public canvas_image_width;
  public canvas_image_height;
  public sendReportMail = false;
  public pdfUrl: string;

  RouteConfig = ROUTE_PATHS;
  images = IMAGES;

  filterApplied = 'all';
  isSelectAll = true;
  exportListStatus = false;

  totalStatesCount;
  selectedStatesCount;

  taxationData;
  taxationDataForAllImportedStates;
  currentSelectedStateTaxData;
  selectedStatesArray = this.taxationDataForAllImportedStates;
  selectedFilteredStatesArray;
  regulationsData;

  currentSelectedStateTaxationDataSubject;
  selectedStatesArraySubject;

  isStatesDropDownDesktopOpen = false;
  isStatesDropDownOpen = false;
  isThresholdDropDownOpen = false;
  isExportListOpen = false;
  isMobileMenuOpen = false;
  assestPath = '';

  constructor(
    private loggerService: LoggerService,
    private dashboardService: DashboardService,
    private routingService: RoutingService,
    private ngbModalService: NgbModal,
    private loaderService: LoaderService,
    private authenticationService: AuthenticationService,
    private utilityService: UtilityService,
    private dataService: DataService) { }

  async ngOnInit() {
    window.scrollTo(0, 0);
    this.regulationsData = await this.dashboardService.getRulesData();
    this.loggerService.logResponse(this.regulationsData);
    this.getTaxationData(this.regulationsData);
  }
  public ngAfterViewInit() {
    this.dashboardService.currentSelectedStateTaxationDataSubject.subscribe((value) => {
      this.currentSelectedStateTaxData = value;
    });
    this.selectedStatesArraySubject = this.dashboardService.selectedStatesArraySubject;
    this.selectedStatesArraySubject.subscribe((data) => {
      this.selectedStatesArray = data;
      this.selectedFilteredStatesArray = [];
      data.forEach((state) => {
        if (state.checked && state.filtered) {
          this.selectedFilteredStatesArray.push(state);
        }
      });
    });
    /* this.addCssToMap(); */
    //this.createReportData();
  }

  public createReportData() {
    console.log("Create report called!");
    this.sendReportMail = this.dashboardService.sendReportMail;

    var printContents = $('#pdf1').clone().find('script').remove().end().html();
    // const chart = $('.pie-chart__container').clone().find('script').remove().end().html();

    // get all <links> and remove all the <script>'s from the header that could run on the new window
    var allLinks = $('head').clone().find('script').remove().end().html();
    // -webkit-print-color-adjust to keep colors for the printing version
    var keepColors = '<style>body {-webkit-print-color-adjust: exact !important; }</style>';
    const htmlString = '<html><head>' + keepColors + allLinks + '</head><body>' + printContents + '</body></html>'
    const resultData = {
      data: {
        fileContent: htmlString
      },
      url: url.URLS.REPORT.PDF_REPORT
    };
    if (this.sendReportMail) {
      this.dashboardService.reportClick.next('forPost');
      this.dashboardService.sendReportMail = false;
    }
  }
  isFilterApplied(filter) {
    return this.filterApplied === filter;
  }

  thresholdStatusCount(status) {
    this.totalStatesCount = 0;
    this.selectedStatesCount = 0;
    if (this.selectedStatesArray) {
      this.totalStatesCount = this.selectedStatesArray.length;
      this.selectedStatesArray.forEach((state) => {
        if (state.thresholdStatus === status) {
          this.selectedStatesCount += 1;
        }
      })
    }
    if (this.selectedStatesCount === this.totalStatesCount) {
      return `(${this.totalStatesCount})`;
    }
    return `(${this.selectedStatesCount} / ${this.totalStatesCount})`;
  }

  getSelectedStatesCount(type?) {
    this.totalStatesCount = 0;
    this.selectedStatesCount = 0;
    if (this.selectedStatesArray) {
      this.totalStatesCount = this.selectedStatesArray.length;
      if (type === 'dropdown') {
        this.selectedStatesArray.forEach((state) => {
          if (state['checked']) {
            this.selectedStatesCount += 1;
          }
        });
      } else {
        this.selectedStatesArray.forEach((state) => {
          if (state['checked'] && state['filtered']) {
            this.selectedStatesCount += 1;
          }
        });
      }
    }
    if (this.selectedStatesCount === this.totalStatesCount) {
      this.isSelectAll = true;
      this.dashboardService.allStatesSelected = true;
      return this.totalStatesCount;
    }
    this.isSelectAll = false;
    this.dashboardService.allStatesSelected = false;
    return `${this.selectedStatesCount} / ${this.totalStatesCount}`;
  }

  async getTaxationData(rulesData) {
    this.taxationData = await this.dashboardService.userTaxationData(rulesData);
    this.taxationDataForAllImportedStates = this.taxationData.taxData;
    this.loggerService.logResponse(this.taxationData, "this.taxationData");
    
    // if (this.dashboardService.sendReportMail) {
    //   this.dashboardService.sendReportMail = false;
    //   this.dashboardService.reportClick.next('forPost');
    // }
  }

  selectAllStates() {
    this.dashboardService.filterTaxationDataByStates("");
  }

  getFilteredStatesMsg() {
    let msg = `All Threshold Status - ${this.totalStatesCount} State(s)`
    if (this.filterApplied === 'THRESHOLD_CROSSED') {
      msg = `Threshold Crossed ${this.thresholdStatusCount('THRESHOLD_CROSSED')}`
    } else if (this.filterApplied === 'THRESHOLD_NEARING') {
      msg = `Threshold Nearing ${this.thresholdStatusCount('THRESHOLD_NEARING')}`
    } else if (this.filterApplied === 'THRESHOLD_SAFE') {
      msg = `Threshold Nearing ${this.thresholdStatusCount('THRESHOLD_SAFE')}`
    }
    return msg;
  }

  filterStatesByTransactionStatus(thresholdStatus) {
    this.filterApplied = thresholdStatus;
    this.dashboardService.filterTaxationDataByThresholdStatus(thresholdStatus);
  }

  selectStatesFromDropDown(stateData, event) {
    event.stopPropagation();
    this.dashboardService.filterTaxationDataByStates(stateData);
  }

  updateGraphForCurrentState(stateCode) {
    this.dashboardService.updateCurrentSelectedStateTaxationData(stateCode);
  }

  navigateToPage(routePath) {
    this.routingService.goToPage(routePath);
    if (this.RouteConfig.STATE_GUIDES === routePath) {
    this.authenticationService.setItem("dashboardLandingPage","DASHBOARD_PAGE");
    }
  }

  navigateToEditTaxationData() {
    let editTaxationData = [];

    for (let i = 0; i < this.taxationData.taxData.length; i++) {
      let data = this.taxationData.taxData[i];
      let state = data.state.stateCode;
      for (let k = 0; k < data.periodWiseValues.length; k++) {
        let monthData = data.periodWiseValues[k];
        editTaxationData.push({
          'stateCode': state,
          'salesValue': monthData.salesValue,
          'transactionsValue': monthData.transactionsValue,
          'monthYear': monthData.taxMonth
        });
      }
    }
    /* navigate to taxationData component with is edit true */
    if (editTaxationData.length) {
      this.dashboardService.setTaxData(editTaxationData);
      let navigationExtras: NavigationExtras = {
        queryParams: { 'title': "edit" }
      };
      this.routingService.goToPage(`${this.RouteConfig.DBRD.DASHBOARD}/${this.RouteConfig.DBRD.TAXATION_DATA}`, navigationExtras);
    }
  }
  exportDropDown(event) {
    if (this.isExportListOpen) {
      this.closeAllDropDowns();
    } else {
      this.closeAllDropDowns();
      this.isExportListOpen = true;
      event.stopPropagation();
    }
  }
  closeExportMenu(){
    this.isExportListOpen = false;
    this.utilityService.putFocusOnElementOnNavigation("export-btn");
  }
  filterByStatesdropDownDesktop(event) {
    if (this.isStatesDropDownDesktopOpen) {
      this.closeAllDropDowns();
    } else {
      this.closeAllDropDowns();
      this.isStatesDropDownDesktopOpen = true;
      event.stopPropagation();
    }
  }

  filterByThresholdDropDown(event) {
    if (this.isThresholdDropDownOpen) {
      this.closeAllDropDowns();
    } else {
      this.closeAllDropDowns();
      this.isThresholdDropDownOpen = true;
      event.stopPropagation();
    }
  }

  filterByStatesDropDown(event) {
    if (this.isStatesDropDownOpen) {
      this.closeAllDropDowns();
    } else {
      this.closeAllDropDowns();
      this.isStatesDropDownOpen = true;
      event.stopPropagation();
    }
  }
  mobileMenu(event) {
    if (this.isMobileMenuOpen) {
      this.closeAllDropDowns();
    } else {
      this.closeAllDropDowns();
      this.isMobileMenuOpen = true;
      event.stopPropagation();
    }
  }

  closeAllDropDowns() {
    this.isStatesDropDownDesktopOpen = false;
    this.isStatesDropDownOpen = false;
    this.isMobileMenuOpen = false;
    this.isThresholdDropDownOpen = false;
    this.isExportListOpen = false;
  }

  @HostListener('document:click', ['$event']) outsideClick(event) {
    this.closeAllDropDowns();
  }

  isStateFocused(stateTaxData) {
    let stateCode = stateTaxData && stateTaxData.state ? stateTaxData.state.stateCode : null;
    if (stateCode && this.currentSelectedStateTaxData && (this.currentSelectedStateTaxData.stateCode === stateCode)) {
      return DEFAULT_VALUES.CLASSES.IS_SELECTED;
    } return '';
  }

  selectStateFromDropDown(stateData) {
    this.loggerService.logStatus(`selected statecode -> ${stateData.state.stateCode}`, "Dashboard: threshold-summary");
    this.dashboardService.updateCurrentSelectedStateTaxationData(stateData.state.stateCode);
  }

  getThresholdStatusImageSrc(status) {
    if (status) {
      return IMAGES[status];
    }
  }

  public calculatePDF_height_width(selector, index) {
    this.page_section = $(selector);
    this.HTML_Width = this.page_section.width();
    this.HTML_Height = this.page_section.height();
    this.top_left_margin = 10.154167;
    this.PDF_Width = this.HTML_Width - (this.top_left_margin);
    this.PDF_Height = (this.PDF_Width * 1.2) - (this.top_left_margin);
    this.canvas_image_width = this.HTML_Width;
    this.canvas_image_height = this.HTML_Height;
  }

  public addFooter(pdf, pageNumber, margin) {
    //Add footer with page number
    var footerText = "Copyright © 2019 Vertex, Inc. All rights reserved.                                                                                                    Threshold Report | Calculation Date - " + moment().format('DD MMM YYYY');
    pdf.setFontSize(7);

    //rectangle
    pdf.setFillColor(227, 227, 227);
    pdf.rect(pdf.internal.pageSize.getWidth() - margin - 5.291667, pdf.internal.pageSize.getHeight() - margin, 5, 5, 'F');
    //page number
    pdf.setTextColor(0, 0, 0);
    pdf.text(pdf.internal.pageSize.getWidth() - margin - 4.15, pdf.internal.pageSize.getHeight() - margin + 3.15, pageNumber);
    //copyright
    pdf.setTextColor(0, 0, 0);
    pdf.text(margin, pdf.internal.pageSize.getHeight() - (margin / 2), footerText);
  }


  /*addCssToMap() {
    var props = ["fill", "stroke", "stroke-width", "stroke-linejoin", "outline"]

    document.querySelectorAll(".states-map-pdf g,.states-map-pdf polyline").forEach(function (item, index) {
      var cstyle = getComputedStyle(item);
      props.forEach(function (prop) {
        item.setAttribute(prop, cstyle[prop]);
      })
      item.removeAttribute("class");
    })
  }*/

  public pdfGeneration() {
    this.dashboardService.reportClick.next('reportClicked');
    return;
    this.exportListStatus = !this.exportListStatus;
    this.loaderService.show();
    let loaderService = this.loaderService;
    let pdf;
    var that = this;
    /* this.calculatePDF_height_width("#coverPage1", 0); */
    pdf = new jspdf(
      {
        orientation: 'p',
        unit: 'mm',
        format: 'letter',
        putOnlyUsedFonts: true,
        compress: true
      }
    );

    let pdfWidth = pdf.internal.pageSize.getWidth();
    let pdfHeight = pdf.internal.pageSize.getHeight();
    /*
    PDF-DOC-pt||595.28X841.89
    PDF-DOC-mm||210.0015555555555X297.0000833333333 */

    html2canvas($("#coverPage1")[0], { scale: 1 }).then(function (canvas) {
      that.calculatePDF_height_width("#coverPage11", 0);
      var imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, 'PNG', that.top_left_margin, that.top_left_margin, that.HTML_Width, that.HTML_Height);
      that.addFooter(pdf, '01', that.top_left_margin);

      html2canvas($("#disclaimer1")[0], { scale: 1 }).then(function (canvas) {
        that.calculatePDF_height_width("#disclaimer11", 1);
        var imgData = canvas.toDataURL("image/png", 1.0);
        pdf.addPage(that.PDF_Width, that.PDF_Height);
        pdf.addImage(imgData, 'PNG', that.top_left_margin, that.top_left_margin, that.HTML_Width, that.HTML_Height);
        that.addFooter(pdf, '02', that.top_left_margin);

        html2canvas($("#summary")[0], { scale: 1 }).then(function (canvas) {
          that.calculatePDF_height_width("#summary1", 2);
          /* that.addCssToMap(); */
          var imgData = canvas.toDataURL("image/png", 1.0);
          pdf.addPage(that.PDF_Width, that.PDF_Height);
          pdf.addImage(imgData, 'PNG', that.top_left_margin, that.top_left_margin, that.HTML_Width, that.HTML_Height);
          that.addFooter(pdf, '03', that.top_left_margin);

          html2canvas($("#reg-states")[0], { scale: 1 }).then(function (canvas) {
            that.calculatePDF_height_width("#reg-states1", 2);
            var imgData = canvas.toDataURL("image/png", 1.0);
            pdf.addPage(that.PDF_Width, that.PDF_Height);
            pdf.addImage(imgData, 'PNG', that.top_left_margin, that.top_left_margin, that.HTML_Width, that.HTML_Height);
            that.addFooter(pdf, '04', that.top_left_margin);
            $('.state-details').each(function (index) {
              html2canvas(this, { scale: 1 }).then(function (canvas) {
                that.calculatePDF_height_width("#reg-states1", 0);
                let imgData = canvas.toDataURL("image/png", 1.0);
                pdf.addPage(that.PDF_Width, that.PDF_Height);
                pdf.addImage(imgData, 'PNG', that.top_left_margin, that.top_left_margin, that.HTML_Width, that.HTML_Height);
                let pageNum = '';
                if (index + 5 < 10) {
                  pageNum = '0' + (index + 5);
                } else {
                  pageNum = '' + (index + 5);

                }

                that.addFooter(pdf, pageNum, that.top_left_margin);

                // if(index===0){
                //   pdf.addPage(that.PDF_Width, that.PDF_Height);
                //   pdf.addImage(imgData, 'PNG', that.top_left_margin, that.top_left_margin, that.HTML_Width, that.HTML_Height);

                // }


                if ($('.state-details').length - 1 === index) {
                  setTimeout(function () {
                    //Save PDF Doc	
                    // pdf.save('ThresholdMonitorReport.pdf');
                    pdf.save('ThresholdMonitorReport' + (this.taxationData ? moment(this.taxationData.lastUpdatedOn).format('MMDDYYYY') : moment().format('MMDDYYYY')) + '.pdf');
                    loaderService.hide();
                  }, 1000);
                }
              });
            });
          });
        });
      });
    });
  }


  openModal() {
    const modelRef = this.ngbModalService.open(ExportModalComponent, {
      centered: true
    });
    modelRef.componentInstance.taxData = {
      data: this.taxationData
    };
  }
  public printPdf() {
    this.dashboardService.reportClick.next('reportClicked');
    return;
    
    const newDescription = 'ThresholdMonitorReport' + moment(this.taxationData.lastUpdatedOn).format('MMDDYYYY');
    if (document.title == 'Vertex Tax Monitoring') {
      document.title = newDescription;
    }
    $('meta[name="description"]').attr("content", newDescription);

    var canvasImg = $("#threshold-pie-chart-canvas-1")[0];
    if (canvasImg !== undefined) {
      $("#threshold-pie-chart-canvas-1").parent().append('<img id="threshold-pie-chart-img-1" src="' + canvasImg.toDataURL("image/png") + '"/>');
      $("#threshold-pie-chart-canvas-1").remove();
    }

    var printContents = $('#pdf1').clone().find('script').remove().end().html();
    // const chart = $('.pie-chart__container').clone().find('script').remove().end().html();

    // get all <links> and remove all the <script>'s from the header that could run on the new window
    var allLinks = $('head').clone().find('script').remove().end().html();
    // -webkit-print-color-adjust to keep colors for the printing version
    var keepColors = '<style>body {-webkit-print-color-adjust: exact !important; }</style>';


    // console.log('<html><head><link rel="stylesheet" href="/app/print-pdf.scss" type="text/css" /></head><body class="pdf" onload="window.print()">' + printContents + '</body></html>');

    // open a new window
    var popupWin = window.open('', '_blank');
    // ready for writing
    popupWin.document.open();


    // writing
    // to print straigthaway
    popupWin.document.write('<html><head>' + keepColors + allLinks + '</head><body>' + printContents + '</body></html>');
    // close for writing
    popupWin.document.close();
  }
  openPdfModal() {
    this.exportListStatus = !this.exportListStatus;
    // document.body.classList.add('pdf-report-modalOpen');
  }

  ngOnDestroy() {
    /*if (this.dashboardService.currentSelectedStateTaxationDataSubject) {
      this.dashboardService.currentSelectedStateTaxationDataSubject.unsubscribe();
    }
    if (this.dashboardService.selectedStatesArraySubject) {
      this.dashboardService.selectedStatesArraySubject.unsubscribe();
    } */
    this.dashboardService.unsubscribeSelectedStatesArray();
  }

  /***
   * a11y accessibility for dashboard
   */

  /**
   * a11y for select all checkbox
  */
  a11ySelectAllCheckBox(ev) {
    const keyCode = ev.keyCode;
    if (keyCode === 32) {
      this.selectAllStates();
    }
  }

  /**
    * a11y for close select state filter
   */
  a11yCloseSelectFilter(ev, el) {
    this.isStatesDropDownDesktopOpen = false;
    if(el){
      el.focus();
    }
  }

  /**
    * a11y for select state checkbox
   */
  a11ySelectStateCheckBox(ev, stateData) {
    const keyCode = ev.keyCode;
    if (keyCode === 32) {
      this.dashboardService.filterTaxationDataByStates(stateData);
      ev.preventDefault();
    }
  }
}
