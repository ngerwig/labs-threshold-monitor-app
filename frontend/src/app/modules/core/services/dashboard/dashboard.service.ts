import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { LoggerService } from '../logger/logger.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { RoutingService } from '../routing/routing.service';
import { RulesEngine } from 'src/app/modules/dashboard/services/rules-engine.service';

import { Url } from 'src/environments/environment';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { DEFAULT_VALUES } from '../../../../config/default-values';

import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public userImportedTaxationData;

  public taxData;
  public userDetails;

  public currentSelectedStateTaxationDataSubject = new Subject<any>();
  public currentSelectedStateTaxationData = {};

  public selectedStatesArraySubject = new Subject<any>();
  public selectedStatesArray = [];
  public selectedFilteredStatesArray = [];
  public allStatesSelected: boolean = true;
  private rulesData = [];

  public allRegisteredStatesSubject;
  public allRegisteredStates = [];
  public sendReportMail = false;

  selectedStatesArray$ = this.selectedStatesArraySubject.asObservable();
  selectedStatesArraySubs;
  public reportClick = new Subject<any>();
  public usMapData = '';
  public usMapDataGenerated = new Subject<any>();

  constructor(private loggerService: LoggerService,
    private httpClient: HttpClient,
    private authenticationService: AuthenticationService,
    private ruleEngineService: RulesEngine,
    private routingService: RoutingService) {
      // initializing registered states when profile or import data is not visited
      this.authenticationService.allRegisteredStatesSubject.subscribe((registeredStates) => {
        this.allRegisteredStates = registeredStates;
      });

      this.usMapDataGenerated.subscribe(()=>{
        if (this.sendReportMail) {
          this.sendReportMail = false;
          this.reportClick.next('forPost');
        }
      });
     }

  ngOnInit() {
    /* saving user details required to fetch taxation data from API*/
    this.loggerService.logResponse(this.userDetails, "userDetails");
    this.selectedStatesArraySubs = this.selectedStatesArraySubject.subscribe((value) => {
      this.selectedStatesArray = value;
    });
    this.currentSelectedStateTaxationDataSubject.subscribe((value) => {
      this.currentSelectedStateTaxationData = value;
    });
    // updating registered states when registered states in profiles is changed or data is imported
    this.authenticationService.allRegisteredStatesSubject.subscribe((registeredStates) => {
      this.allRegisteredStates = registeredStates;
    });
  }

  async fetchSavedImportedData() {
    /* this function makes an api call to fetch data after saving the imported data
      @returns promise of http get call
     */
    this.userDetails = this.authenticationService.currentUserValue;
    let url = `${Url.baseUrl}/dashboard/getTaxationData?userId=${this.userDetails.userId}`;
    if (!(this.taxData && this.taxData.length)) {
      let response: any = await this.httpClient.get(url).toPromise();
      if (response.is_success) {
        this.taxData = response.data;
        return this.taxData;
      } else {
        return [];
      }
    } else {
      return this.taxData;
    }
  }

  setUserImportedData(importedData) {
    this.userImportedTaxationData = importedData;
  }

  setTaxData(val) {
    this.taxData = val;
  }

  setTaxDataFromImport(data) {
    this.taxData = data.map((item, index) => {
      return {
        stateCode: item.stateCode,
        monthYear: item.monthYear,
        salesValue: item.salesValue,
        transactionsValue: item.transactionsValue,
        rowId: index + 1,
        errors: {
          "fieldErrors": {},
          "measurementError": ""
        }
      }
    });
  }

  private fetchTaxationData() {
    /* this function makes an api call to fetch taxation data after completion of import phase
      @returns promise of http get call
     */
    this.userDetails = this.authenticationService.currentUserValue;
    let url = `${Url.baseUrl}/dashboard/getImportedData?userId=${this.userDetails.userId}`
    return this.httpClient.get(url).toPromise();
  }

  async userTaxationData(rulesData?) {
    /* gets called from threshold-summary after riulesdata is feched from API in the component

    */
    let currentUser = this.authenticationService.currentUserValue;
    let thresholdNearingLevel;
    if (currentUser && currentUser.userProfile && currentUser.userProfile.userCustomNotification) {
      thresholdNearingLevel = currentUser.userProfile.userCustomNotification.thresholdNearingLevel;
    }
    thresholdNearingLevel = thresholdNearingLevel ? thresholdNearingLevel : DEFAULT_VALUES.THRESHOLD_NEARING;
    this.rulesData = await this.ruleEngineService.getRules();
    let response: any = await this.fetchTaxationData();
    if (response.is_success) {
      this.userImportedTaxationData = response.data;
      this.userImportedTaxationData.taxData = this.ruleEngineService.getUpdatedStatus(response.data.taxData, thresholdNearingLevel, this.allRegisteredStates);
      this.selectedStatesArray = this.generateSelectedStatesArray(this.userImportedTaxationData.taxData);
      this.selectedStatesArray.sort(this.sortStatesArrayByStateName);
      this.selectedStatesArraySubject.next(this.selectedStatesArray);
      this.updateCurrentSelectedStateTaxationData();
      return this.userImportedTaxationData;
    } else {
      this.selectedStatesArraySubject.next([]);
      this.currentSelectedStateTaxationDataSubject.next({});
      return [];
    }
  }

  fetchTaxationDataOnEdit() {
    /* this function makes an api call to fetch taxation data after completion of import phase
      @returns promise of http get call
     */
    let userDetails = this.authenticationService.currentUserValue;
    let url = `${Url.baseUrl}/dashboard/dataForEdit?userId=${userDetails.userId}`
    return this.httpClient.get(url).toPromise();
  }

  generateSelectedStatesArray(array) {
    if (array) {
      array.forEach((stateDetails) => {
        let rulesData = this.rulesDataForState(stateDetails.state.stateCode);
        stateDetails['checked'] = true;
        stateDetails['filtered'] = true;
        stateDetails['ruleData'] = rulesData;
        stateDetails.periodWiseValues.sort(this.sortPeriodWiseDataByMonth);
      });
      array.sort(this.sortStatesArrayByStateName);
      return array;
    } else return [];
  }

  updateCurrentSelectedStateTaxationData(stateCode?) {
    let selectedState;
    let currentSelectedState = {};
    selectedState = stateCode ? this.getTaxationDataForStatecode(stateCode) : this.findFirstSelectedState();
    if (selectedState) {
      let rulesData = this.rulesDataForState(selectedState.state.stateCode);
      this.loggerService.logResponse(rulesData, "rulesData");
      if (rulesData) {
        currentSelectedState['stateCode'] = selectedState.state.stateCode;
        currentSelectedState['stateName'] = selectedState.state.stateName;
        currentSelectedState['actualSales'] = +selectedState.totalUserSalesValue;
        currentSelectedState['actualTransaction'] = +selectedState.totalUserTransactionsValue;
        currentSelectedState['taxationPeriod'] = selectedState.taxationPeriod;
        currentSelectedState['thresholdStatus'] = selectedState.thresholdStatus;
        currentSelectedState['salesThreshold'] = +rulesData.salesTransaction.thresholdSales;
        currentSelectedState['transactionThreshold'] = +rulesData.salesTransaction.thresholdTransactions;
        currentSelectedState['isSalesOptional'] = !rulesData.salesTransaction.salesRequired;
        currentSelectedState['isTransactionOptional'] = !rulesData.salesTransaction.transactionRequired;
        currentSelectedState['ruleData'] = rulesData;
        this.currentSelectedStateTaxationDataSubject.next(currentSelectedState);
      } else {
        currentSelectedState = null;
        this.currentSelectedStateTaxationDataSubject.next(currentSelectedState);
      }
    } else {
      currentSelectedState = null;
      this.currentSelectedStateTaxationDataSubject.next({});
    }
  }

  getTaxationDataForStatecode(stateCode) {
    return this.selectedStatesArray.find((stateDetails) => {
      return stateDetails.state.stateCode === stateCode;
    })
  }

  findFirstSelectedState() {
    this.selectedStatesArray = this.selectedStatesArray.sort(this.sortStatesArrayByStateName);
    return this.selectedStatesArray.find((stateData) => {
      return stateData['checked'] && stateData['filtered'];
    });
  }

  filterTaxationDataByStates(stateData) {
    if (stateData === "") {
      this.allStatesSelected = !this.allStatesSelected;
      let checkedValue = this.allStatesSelected;

      this.selectedStatesArray.forEach(function (state) {
        state['checked'] = checkedValue;
      });
    } else {
      this.selectedStatesArray.forEach((statedata) => {
        if (stateData.state.stateCode === statedata.state.stateCode) {
          statedata['checked'] = !stateData['checked'];
        }
      });
    }
    this.selectedStatesArray.sort(this.sortStatesArrayByStateName);
    this.selectedStatesArraySubject.next(this.selectedStatesArray);
    this.updateCurrentSelectedStateTaxationData();
    this.loggerService.logResponse(this.selectedStatesArray, "filterTaxationDataByStates-> this.selectedStatesArray : DashboardService");
  }

  filterTaxationDataByThresholdStatus(status) {
    if (status != 'all') {
      this.selectedStatesArray.forEach((stateDetails) => {
        stateDetails.filtered = stateDetails.thresholdStatus === status ? true : false;
      })
    } else {
      this.selectedStatesArray.forEach((stateDetails) => {
        stateDetails.filtered = true;
      })
    }
    this.selectedStatesArray.sort(this.sortStatesArrayByStateName);
    this.selectedStatesArraySubject.next(this.selectedStatesArray);
    this.updateCurrentSelectedStateTaxationData();
    this.loggerService.logResponse(this.selectedStatesArray, "filterTaxationDataByStates-> this.selectedStatesArray : DashboardService")
  }

  async getRulesData() {
    this.rulesData = await this.ruleEngineService.getRules();
    this.loggerService.logResponse(this.rulesData, "getRules()");
    return this.rulesData;
  }

  rulesDataForState(stateCode) {
    if (this.rulesData) {
      return this.rulesData.find((stateData) => {
        return stateData.stateCode === stateCode;
      })
    } else {
      return null;
    }
  }

  sortStatesArrayByStateName(stateA, stateB) {
    let stateNameA = stateA.state.stateName;
    let stateNameB = stateB.state.stateName;
    let returnValue = (stateNameA < stateNameB) ? -1 : (stateNameA > stateNameB ? 1 : 0);
    return returnValue;
  }

  sortPeriodWiseDataByMonth(stateA, stateB) {
    stateA = moment(stateA.taxMonth).format('YYYYMM');
    stateB = moment(stateB.taxMonth).format('YYYYMM');
    let returnValue = (stateA < stateB) ? -1 : (stateA > stateB ? 1 : 0);
    return returnValue;
  }

  navigateToDashboardLandingPage() {
    let userValidationResponse = this.authenticationService.getItem("dashboardLandingPage");
    switch (userValidationResponse) {
      case 'ZERO_STATE_PAGE':
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.ADD_TAXATION_DATA}`);
        break;
      case 'DASHBOARD_PAGE':
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.THRESHOLD_SUMMARY}`);
        break;
      case 'EDIT_TAX_DATA_PAGE':
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.TAXATION_DATA}`);
        break;
      case 'EDIT_REGISTERED_STATES_PAGE':
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.REGISTERED_STATES}`);
        break;
      case 'IMPORT_DATA':
        this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.IMPORT_DATA}`);
        break;
    }
  }

  unsubscribeSelectedStatesArray() {
    if (this.selectedStatesArraySubs) {
      this.selectedStatesArraySubs.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.currentSelectedStateTaxationDataSubject) {
      this.currentSelectedStateTaxationDataSubject.unsubscribe();
    }
    if (this.selectedStatesArraySubject) {
      this.selectedStatesArraySubject.unsubscribe();
    }
  }

}
