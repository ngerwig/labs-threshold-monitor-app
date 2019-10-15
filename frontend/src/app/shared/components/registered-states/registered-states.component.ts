import { Component, OnInit, OnDestroy, AfterViewInit, AfterContentInit } from '@angular/core';
import { RoutingService } from '../../../modules/core/services/routing/routing.service';
import { ROUTE_PATHS as RouteConfig } from 'src/app/config/route.config';
import { FormGroup } from '@angular/forms';
import { HttpService } from 'src/app/modules/core/services/http/http.service';
import url from '../../../config/api-url.config.json';
import { take, map } from 'rxjs/operators';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { DataService } from 'src/app/modules/core/services/data/data.service';
import { AuthenticationService } from '../../../modules/core/services/authentication/authentication.service';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/modules/core/components/modal/modal.component';
import Consts from '../../../config/constants.json';
import { RulesEngine } from 'src/app/modules/dashboard/services/rules-engine.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { ComponentCanDeactivate } from 'src/app/modules/dashboard/guards/taxation-data-can-deactivate/component-can-deactivate';
import { TaxationDataService } from 'src/app/modules/dashboard/services/taxation-data/taxation-data.service';
import { PreviousRouteService } from 'src/app/modules/core/services/previous-route/previous-route.service';
import { DEFAULT_VALUES } from '../../../config/default-values';


@Component({
  selector: 'vtx-registered-states',
  templateUrl: './registered-states.component.html',
  styleUrls: ['./registered-states.component.scss']
})
export class RegisteredStatesComponent extends ComponentCanDeactivate implements OnInit,AfterContentInit, OnDestroy {
  private allRegisteredStatesSubjectSubscription: Subscription;
  private dataSubjectSubscription: Subscription;
  private tempDataSubjectSubscription: Subscription;
  routePath = RouteConfig;
  constants = Consts;
  taxationData;
  rules;
  public profileSettingsPage = `${RouteConfig.PRFL.PROFILE}/${RouteConfig.PRFL.SETTINGS}`;
  allStates: Array<object> = [];
  selectedStates: Array<string> = [];
  selectedStatesTemp: Array<string> = [];
  selectedStatesTempExtend: Array<string> = [];
  disableInfoIcon: boolean = true;
  showNotificationBox: boolean = true;
  sortedArrayAllStates: Array<object> = [];
  registeredStatesTitle: string = Consts.HEADER_REGISTERED_STATES;
  registeredStatesNotification: string = Consts.MSG_DASHBOARD_REGISTERED_STATES_NOTIFICATION;
  previousUrl = "";
  registeredStatesForm = new FormGroup({});



  constructor(private routingService: RoutingService, private httpService: HttpService, private loggerService: LoggerService,
    private dataService: DataService, private authService: AuthenticationService,
    private ruleEngine: RulesEngine, private dashBoardService: DashboardService,
    private utilityService: UtilityService, private router: Router,
    private previousRouteService: PreviousRouteService,
    private ngbModalService: NgbModal, private taxationDataService: TaxationDataService,
    private authenticationService: AuthenticationService) {
    super();
    
  }
  async getSavedTaxationData() {
    this.taxationData = await this.dashBoardService.fetchSavedImportedData();
  }
  ngOnInit() {
    
    this.getAllRules();
    this.getSavedTaxationData();
    this.allRegisteredStatesSubjectSubscription = this.authService.$allRegisteredStatesSubject.subscribe(val => {
      this.selectedStates = val;
    });

    this.dataSubjectSubscription = this.authService.$dataSubject.subscribe(val => {
      this.selectedStatesTemp = val;
      this.selectedStatesTempExtend = this.selectedStatesTemp.concat(this.selectedStates);
      this.selectedStatesTemp = Array.from(new Set(this.selectedStatesTempExtend));
    });

    this.tempDataSubjectSubscription = this.authService.$tempDataSubject.subscribe(() => {
      this.selectedStatesTemp = this.selectedStates;
    })


    this.utilityService.scrollTop();
    this.allStates = this.authService.currentUserValue.allStates;
    this.sortedArrayAllStates = this.allStates.sort((a, b) => a['stateName'].localeCompare(b['stateName']))

    this.authService.fetchAllRegisteredStates();
    this.getfetchSavedImportedData();
    this.previousUrl = this.previousRouteService.getPreviousUrl();
  }
  putFocusOnFirstElement(){
    if( this.previousUrl === '/profile/settings'){
      this.utilityService.putFocusOnElementOnNavigation("reg-states-back");
    }
  }

  async getfetchSavedImportedData() {
    this.taxationData = await this.dashBoardService.fetchSavedImportedData();
  }

  navigateToPage() {

    this.routingService.goToPage(this.profileSettingsPage);
  }
  canDeactivate(): boolean {
    return this.taxationDataService.saveIsPending;
  }

  addStateCode(event) {
    if (event.target.checked) {
      this.selectedStates.push(event.target.value);
    } else {
      const filteredStates = this.selectedStates.filter(el => {
        if (el !== event.target.value) { return true; }
      });
      this.selectedStates = filteredStates;
    }
  };

  addStateCodeTemp(event) {
    if (event.target.checked) {
      this.selectedStatesTemp.push(event.target.value);
    } else {
      const filteredTempStates = this.selectedStatesTemp.filter(el => {
        if (el !== event.target.value) { return true; }
      });
      this.selectedStatesTemp = filteredTempStates;
    }
  }

  saveRegisteredStates() {
    const reqBody = {
      url: url.URLS.PROFILE.REGISTERED_STATES,
      data: {
        "states": this.selectedStates
      }
    };
    this.loggerService.logResponse(reqBody.data, "registered states req body");
    this.loggerService.logResponse(reqBody.url, "registered states req url");
    this.dataService.put(reqBody).
      subscribe((res) => {
        this.loggerService.logResponse(res, "Registered states");
        if (res.is_success) {
          this.taxationDataService._saveStatus.next(false);
          this.loggerService.logResponse(res, "states registered successfully");
          this.routingService.goToPage(`${RouteConfig.PRFL.PROFILE}/${RouteConfig.PRFL.SETTINGS}`);
        } else if (!res.is_success) {
          if (res.customErrorCode)
            this.loggerService.logStatus("something went wrong");
        }
      }, (err) => {
        this.loggerService.logResponse(err, "Error in Registered states");
      });
  }
  navigateToProfileSettings() {
    this.routingService.goToPage(`${RouteConfig.PRFL.PROFILE}/${RouteConfig.PRFL.SETTINGS}`)
  }

  typecheck(val) {
    if (this.selectedStates && this.selectedStates.length) {
      return this.selectedStates.includes(val);
    } else {
      return false;
    }
  }

  typecheckTemp(val) {
    if (this.selectedStatesTemp && this.selectedStatesTemp.length) {
      return this.selectedStatesTemp.includes(val);
    }
    else {
      return false;
    }
  }

  onSubmit() {

  }

  saveRegisteredStatesTemp() {
    const reqBody = {
      url: url.URLS.DASHBOARD.REGISTERED_STATES_TEMP,
      data: {
        "userId": this.authService.currentUserValue.userId,
        "stateCodes": this.selectedStatesTemp
      }
    };
    this.dataService.post(reqBody).
      subscribe((res) => {
        this.loggerService.logResponse(res, "Temporary Registered states");
        if (res.is_success) {
          this.taxationDataService._saveStatus.next(false);
          this.authenticationService.setItem("dashboardLandingPage","EDIT_REGISTERED_STATES_PAGE");
          this.loggerService.logResponse(res, "states saved temporarily successfully");
        } else if (!res.is_success) {
          if (res.customErrorCode)
            this.loggerService.logStatus("failed to save states temporary");
        }
      }, (err) => {
        this.loggerService.logResponse(err, "Error in Registered states");
      });
  }
  async getThresholdSummaryData() {
    return await this.dashBoardService.userTaxationData();
  }
  backToDashboard() {
    const modelRef = this.ngbModalService.open(ModalComponent, {
      centered: true
    });
    modelRef.componentInstance.modalData = {
      header: "Cancel Import",
      modalContent: "If you cancel now, you may lose data that has not been completely imported or saved. Are you sure you want to cancel?",
      okText: "Yes",
      cancelText: "No",
      focusOnCancel:"footer-cancel-btn",
      isCancelVisible: true
    }
    modelRef.componentInstance.onSuccess.subscribe(() => {
      const reqBody = {
        url: `${url.URLS.DASHBOARD.CANCEL_REGISTERED_STATES_TEMP}/${this.authService.currentUserValue.userId}`,
      };
      this.dataService.delete(reqBody).
        subscribe((res) => {
          if (res.is_success || res.customErrorCode === "NO_DATA_PRESENT_TO_DELETE") {
            this.taxationDataService._saveStatus.next(false);
            this.loggerService.logResponse(res, "states removed successfully");
            let userTaxationData = this.getThresholdSummaryData();
            userTaxationData.then((data) => {
              if (data.taxData.length) {
                this.authenticationService.setItem("dashboardLandingPage","DASHBOARD_PAGE");
                this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.THRESHOLD_SUMMARY}`);
              } else {
                this.authenticationService.setItem("dashboardLandingPage","ZERO_STATE_PAGE");
                this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}`);
              }
              this.dashBoardService.setTaxData([]);
            })

          } else if (!res.is_success) {
            if (res.customErrorCode)
              this.loggerService.logStatus("State code is empty");
          }
        }, (err) => {
          this.loggerService.logResponse(err, "Error in Deleting Registered states");
        });
    })

  }
  async getAllRules() {
    this.rules = await this.ruleEngine.getRules();
  }
  proceedRegisteredStates() {
    let currentUser = this.authService.currentUserValue;
    let thresholdNearingLevel;
    if (currentUser && currentUser.userProfile && currentUser.userProfile.userCustomNotification) {
      thresholdNearingLevel = currentUser.userProfile.userCustomNotification.thresholdNearingLevel;
    }
    thresholdNearingLevel = thresholdNearingLevel ? thresholdNearingLevel : DEFAULT_VALUES.THRESHOLD_NEARING;

    let thresholdData = this.ruleEngine.run(this.taxationData, thresholdNearingLevel, this.selectedStatesTemp);
    this.dashBoardService.setUserImportedData({
      "fileName": "null",
      "lastUpdatedOn": new Date().toLocaleDateString().toString(),
      "taxData": thresholdData.data
    });

    const reqBody = {
      url: url.URLS.DASHBOARD.COMPLETE_IMPORT,
      data: {
        "registeredStates": this.selectedStatesTemp,
        "userTaxationData": thresholdData.data
      }
    };

    this.dataService.post(reqBody).
      subscribe((res) => {
        // this.loggerService.logResponse(res, "complete import Registered states");
        if (res.is_success) {
          this.loggerService.logResponse(res, "complete import Registered states");
          this.authenticationService.setItem("dashboardLandingPage","DASHBOARD_PAGE");
          this.dashBoardService.sendReportMail = true;
          this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.THRESHOLD_SUMMARY}`);
        } else if (!res.is_success) {
          if (res.customErrorCode)
            this.loggerService.logStatus("");
        }
      }, (err) => {
        this.loggerService.logResponse(err, "Error in Registered states");
      });
  }

  ngOnDestroy() {
    this.allRegisteredStatesSubjectSubscription.unsubscribe();
    this.dataSubjectSubscription.unsubscribe();
    this.tempDataSubjectSubscription.unsubscribe()
  }

  infoIconFunction(event) {
    event.target.blue();
    this.disableInfoIcon = false;
    this.showNotificationBox = false;
    this.utilityService.putFocusOnElementOnNavigation("reg-state-info");
  }

  showNotification(event) {
    this.disableInfoIcon = true;
    this.showNotificationBox = true;
    event.stopPropagation();
    this.utilityService.putFocusOnElementOnNavigation("notification__inner");
  }

  checkURLProfileRegStates() {
    if (this.router.url === (`/${RouteConfig.PRFL.PROFILE}/${RouteConfig.PRFL.REGISTERED_STATES}`)) {
      return true
    } return;
  }

  checkURLDbrdRegStates() {
    if (this.router.url === (`/${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.REGISTERED_STATES}`)) {
      return true;
    } return "";
  }
  ngAfterContentInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      setTimeout(() => {
        this.putFocusOnFirstElement();
    });
  }
  
}
