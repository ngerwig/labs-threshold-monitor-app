import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName } from '@angular/forms';
import { RoutingService } from '../../../core/services/routing/routing.service';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/modules/core/components/modal/modal.component';
import constants from '../../../../config/constants.json';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { ExcelToJson } from '../../services/excel-to-json.service';
import { Router, NavigationExtras } from "@angular/router";
import { TaxationDataService } from '../../services/taxation-data/taxation-data.service';
import { LoaderService } from 'src/app/modules/core/services/loader/loader.service';
import { PreviousRouteService } from 'src/app/modules/core/services/previous-route/previous-route.service';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import url from '../../../../config/api-url.config.json';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { DataService } from '../../../core/services/data/data.service';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';

@Component({
  selector: 'vtx-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent implements OnInit, AfterContentInit {
  previousUrl;
  consts = constants;
  dragAndDropText: string = this.consts.MSG_IMPORT_DATA_DRAG_AND_DROP_TEXT;
  fileName: string;
  noFileChosen: boolean;
  displayFileIcon: boolean;
  fileType: string;
  showImportNotification: Boolean = true;
  showUploadNotification: Boolean = true;
  selectedFile;
  disableInfoIconDownload: boolean = true;
  showNotificationBoxDownload: boolean = true;
  disableInfoIconUpload: boolean = true;
  showNotificationBoxUpload: boolean = true;

  templateForm = new FormGroup({
    fileType: new FormControl('CSV')
  })

  impTest;

  constructor(
    private excelToJson: ExcelToJson,
    private dashBoardService: DashboardService,
    private routingService: RoutingService,
    private ngbModalService: NgbModal,
    private authService: AuthenticationService,
    private router: Router,
    private taxationDataService: TaxationDataService,
    private previousRouteService:  PreviousRouteService,
    private utilityService: UtilityService,
    private loader:LoaderService,
    private dataService: DataService,
    private loggerService: LoggerService,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.putFocusOnFirstElement();
  }
  ngAfterContentInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    this.putFocusOnFirstElement();
    
  }
  /**This function will put the focus on first 
   * element of the page after navigation
   */
  putFocusOnFirstElement(){
    //if( this.previousUrl === `/${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.THRESHOLD_SUMMARY}`){
      this.utilityService.putFocusOnElementOnNavigation("import-data-title");
   // }
  }

  downloadFile() {

    let link = document.createElement("a");
    if (this.templateForm.value.fileType == "CSV") {
      link.download = "ThresholdMonitorImportTemplate.csv";
      link.href = "assets/ThresholdMonitorImportTemplate.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (this.templateForm.value.fileType == "XLS") {
      link.download = "ThresholdMonitorImportTemplate.xls";
      link.href = "assets/ThresholdMonitorImportTemplate.xls";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      link.download = "ThresholdMonitorImportTemplate.xlsx";
      link.href = "assets/ThresholdMonitorImportTemplate.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  }
  navigateToContactUs() {
    this.routingService.goToContactUs();
  }

  dropHandler(ev) {

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.files.length == 1) {
      this.fileName = ev.dataTransfer.files[0].name;
      this.selectedFile = ev.dataTransfer.files[0];
      this.dragAndDropText = this.fileName;
      this.displayFileIcon = true;
      this.noFileChosen = false;
    } else {
    }
  }

  dragOverHandler(ev) {
    ev.preventDefault();
  }
  goToStateGuide() {
    this.routingService.goToPage(`${RouteConfig.STATE_GUIDES}`);
    this.authenticationService.setItem("dashboardLandingPage","IMPORT_DATA");
  }

  chooseFile(event) {
    this.dragAndDropText = event.target.files[0].name;
    this.fileName = event.target.files[0].name;
    this.selectedFile = event.target.files[0];
    this.displayFileIcon = true;
    this.noFileChosen = false;

  }

  onProceed() {
    this.fileType = this.fileName ? this.fileName.substr(this.fileName.lastIndexOf('.') + 1) : "";
    if (this.fileType && (this.fileType == 'xls' || this.fileType == 'csv' || this.fileType == 'xlsx')) {
      this.loader.show();
      this.excelToJson.convert(this.selectedFile).toPromise().then(data => {
        try {
          data = data.map((row, index) => {
            if (row.monthYear === undefined) {
              row.monthYear = "";
            }
            if (row.stateCode === undefined) {
              row.stateCode = "";
            }
            if (row.transactionsValue === undefined) {
              row.transactionsValue = "";
            }
            if (row.salesValue === undefined) {
              row.salesValue = "";
            }
            let monthYear = new Date(row.monthYear);
            let year = monthYear.getFullYear();
            if (!isNaN(year)) {
              monthYear.setMinutes(monthYear.getMinutes() + monthYear.getTimezoneOffset());
              year = monthYear.getFullYear();
            }
            //if(isNaN(year)){
            //Not a valid date.
            //throw("Date is invalid at row:"+(index+1));
            //}
            let month = monthYear.getMonth() + 1;
            let date = monthYear.getDate();
            let yearMonth;
            //Check whether date is parsed properly or default date is created.
            if ((year == 1970 && month == 1 && date == 1) || isNaN(year)) {
              yearMonth = row.monthYear;
            } else {
              yearMonth = year + '-' + (month > 9 ? month : '0' + month);
            }
            return {
              'stateCode': row.stateCode,
              'salesValue': row.salesValue,
              'transactionsValue': row.transactionsValue,
              'monthYear': yearMonth
            }
          });
          const body = {
            url: (`${url.URLS.DASHBOARD.POST_UPLOAD_FILE_NAME}?userId=${this.authService.currentUserValue.userId}&file=${this.fileName}`),
          };
          this.dataService.post(body).subscribe((res) => {
            if (res.is_success) {
              this.loggerService.logResponse(res, "File Info added successfully");
              this.dashBoardService.setTaxDataFromImport(data);
              this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.TAXATION_DATA}`);
            }
          }, (err) => {
            this.loggerService.logResponse(err, "Error in adding File Info");
          });
          this.loader.hide();
        } catch (e) {
          //Show error message.
          alert(e);
        }

      });
      // this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.REGISTERED_STATES}`)
    } else if (!this.fileName) {
      this.noFileChosen = true;
    } else {
      this.taxationDataService.showPopUpForInvalidFormatFile();
    }
  }
  async getThresholdSummaryData() {
    return await this.dashBoardService.userTaxationData();
  }
  navigateToAddTaxationData() {
    let userTaxationData = this.getThresholdSummaryData();
    userTaxationData.then((data) => {
      if (data.taxData.length) {
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.THRESHOLD_SUMMARY}`);
      } else {
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}`);
      }
    });
    //this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}`);
  }


  infoIconFunctionDownload(event){
    event.target.blur();
    this.disableInfoIconDownload = false;
    this.showNotificationBoxDownload = false;
    this.utilityService.putFocusOnElementOnNavigation("imp-notification-icon");
  }

  showNotificationDownload() {
    this.disableInfoIconDownload = true;
    this.showNotificationBoxDownload = true;
    this.utilityService.putFocusOnElementOnNavigation("notification__inner");
  }

  infoIconFunctionUpload(event) {
    event.target.blur();
    this.disableInfoIconUpload = false;
    this.showNotificationBoxUpload = false;
    this.utilityService.putFocusOnElementOnNavigation("upload-info");
  }

  showNotificationUpload() {
    this.disableInfoIconUpload = true;
    this.showNotificationBoxUpload = true;
    this.utilityService.putFocusOnElementOnNavigation("notification__inner");
  }

}
