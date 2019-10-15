import { Component, OnInit, ViewEncapsulation, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/shared/services/shared-data/shared-data.service';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { RulesEngine } from '../../services/rules-engine.service';
import consts from "../../../../config/constants.json";
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { ROUTE_PATHS as routeUrl} from '../../../../config/route.config';
import { TaxationDataService } from '../../services/taxation-data/taxation-data.service';
import { RoutingService } from '../../../core/services/routing/routing.service';

import { ComponentCanDeactivate } from '../../guards/taxation-data-can-deactivate/component-can-deactivate';
import { UsCurrencyService } from '../../services/us-currency/us-currency.service';
import { LoaderService } from 'src/app/modules/core/services/loader/loader.service';
import { TaxationDataUndoRedoService } from '../../services/taxation-data-undo-redo.service';
import { TaxationErrorsService } from '../../services/taxation-errors/taxation-errors.service';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';

interface TaxData {
    stateCode: string,
    monthYear: string,
    transactionsValue: string,
    salesValue: string,
    errors?: {
      "fieldErrors": {},
      "measurementError": string  
    },
    rowId?: number
}

@Component({
  selector: 'vtx-taxation-data',
  templateUrl: './taxation-data.component.html',
  styleUrls: ['./taxation-data.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TaxationDataComponent extends ComponentCanDeactivate implements OnInit, OnDestroy, AfterViewInit  {
  taxationDataHeader :string;
  constants = consts;
  errorMessageString: string;
  pageTitle: string = "";
  tableToggle: boolean[] = [];
  sortedTaxationData = [];
  //taxationData =  [];
  disableInfoIcon: boolean =true;
  rules : any;
  totalErrorCount = 0;
  totalFieldCount = 0;
  routeParamSubscriber: any;
  routeDataSubscriber: any;
  stateList = [];
  updatedTaxationData : any;
  actionsToggle: boolean = false;
  selectedRows = [];
  isMergeDisabled = true;
  isDeleteDisabled = true;
  rowCount: number = 0;
  taxationData: TaxData[] =  [];
  showNotificationBox: boolean =true;
  undoRedoButtons;
  constructor(private activatedRoute: ActivatedRoute,
     private sharedDataService:SharedDataService,
    private loggerService: LoggerService, private ruleEngine : RulesEngine, private utilityService: UtilityService,
    private dashBoardService: DashboardService, private routingService: RoutingService,
    private taxationDataService : TaxationDataService,private usCurrency: UsCurrencyService,
    private loaderService: LoaderService, private taxationErrorService : TaxationErrorsService,
    private undoRedoService: TaxationDataUndoRedoService, private authenticationService: AuthenticationService) {
      super();
      this.routeParamSubscriber = this.activatedRoute.queryParams.subscribe(params => {
        this.pageTitle = params['title'] ? params['title'] : "";
        this.taxationDataHeader = params['isEdit']? consts.HEADER_EDIT_TAXATION_DATA: this.taxationDataHeader;
      });
      this.undoRedoButtons = this.undoRedoService.undoRedoButtons;
      this.loaderService.show();
  }

  ngAfterViewInit(){
  this.loaderService.hide();
  }
  getSingleStateErrorAndCount(data, index){
    this.taxationDataService._saveStatus.next(true);
    let stateData = this.taxationErrorService.getFieldErrorForSingleState(data, this.stateList);
    this.taxationData[index] = stateData;
    this.checkForDuplicate(this.taxationData);
    this.getTotalErrorCount();
    this.saveToLocalStorage();
    this.checkForDeleteAndMergeButton();
  }

  setHeader(){
  this.activatedRoute.queryParams.subscribe(params => { 
    //Get All the rules from rule engine
    if(!this.taxationData.length){
        if(this.pageTitle === "add"){
          this.taxationDataHeader = consts["LABEL_AXATION_DATA_HEADER_ADD"];
        }else if(this.pageTitle === "edit" || params['isEdit']){
          this.taxationDataHeader = consts["LABEL_AXATION_DATA_HEADER_EDIT"];
        }
    }else {
      this.taxationDataHeader = `${consts["LABEL_AXATION_DATA_HEADER_SUMMARY"]}`;
    } 
  });
  }
  canDeactivate():boolean{
      return this.taxationDataService.saveIsPending;
  }
  checkForFieldError(taxationData, state?){
      this.updatedTaxationData = taxationData.map((data: any, index)=>{
      delete data.errors;
      this.rowCount++;
      data.rowId = this.rowCount;
      data.transactionTooltipRequired = true;
      let stateData = this.taxationErrorService.getAllErrorForSingleState(data, this.rules,this.stateList, state);
      this.checkForDuplicate(taxationData);
      taxationData[index] = stateData;
      this.checkForDeleteAndMergeButton();
      this.getTotalErrorCount();
      
    });
  }
  getErrorCount(data){
    this.errorMessageString = this.taxationErrorService.getErrorMessageText(data);
    return this.taxationErrorService.getErrorCount(data);
  }
  getSortedDataAccordingToError(){
    let len = this.taxationData.length;
    let indices = new Array(len);
    for (let i = 0; i < len; ++i) indices[i] = i;
    let changedIndices = indices.sort((a,b):number=>{
      a = this.taxationData[a];
      b = this.taxationData[b];
      return this.errorSort(a, b);
    });
    this.taxationData.sort(this.errorSort);
    this.undoRedoService.updateUndoIndices(changedIndices);
    this.saveToLocalStorage();
  }

  errorSort(a,b):number{
    if((a.errors && (a.errors.fieldErrors && Object.keys(a.errors.fieldErrors).length)  || (a.errors && a.errors.measurementError !== ""))
        && (b.errors && (b.errors.fieldErrors && Object.keys(b.errors.fieldErrors).length==0) && (b.errors && b.errors.measurementError===""))
      ){
        return -1;
      }else if((b.errors && (b.errors.fieldErrors && Object.keys(b.errors.fieldErrors).length)  || (b.errors && b.errors.measurementError !== ""))
      && (a.errors && (a.errors.fieldErrors && Object.keys(a.errors.fieldErrors).length==0) && (a.errors && a.errors.measurementError===""))
      ){
        return 1;
      }else if(a.stateCode < b.stateCode){
        return -1;
      }else if(a.stateCode > b.stateCode){
        return 1;
      }else{
        return 0;
      }
  }

  ngOnInit() {
    this.getAllRules();
    this.getAllStates();
    this.setHeader();
    this.taxationDataService._saveStatus.next(false);
  }
  /**
   * This function will get the last saved data by the user
   */
  async getfetchSavedImportedData(){
      let data :TaxData[] = [];
      let localStoredData;
      //If taxation data is in localstorage get data from here
      try{
        localStoredData = JSON.parse(this.authenticationService.getItem("taxationData"));
      }catch(e){}
      if(localStoredData){
        //If taxation data is in localstorage check for undo redo data in locastorage
        this.undoRedoService.setUndoRedoFromLocalStorage();
        data = localStoredData;
      }else{
        this.undoRedoService.clearUndoRedo();
      }
      if(!data.length){
        if(this.pageTitle.toLowerCase() === 'edit'){
          //If user is navigating to edit taxation data call edit data API
          let resData:any = await this.dashBoardService.fetchTaxationDataOnEdit();
          data = resData.data ? resData.data : [];
        } else{
          data = await this.dashBoardService.fetchSavedImportedData();
        }
      }
      //After getting the data from API sort the data
      //let sortedArray = this.utilityService.sortBy(data, "stateCode");
      this.taxationData.push(...data);
      if(this.taxationData.length){
        this.setHeader();
      }
      if((this.pageTitle === "add" || !this.pageTitle) && !this.taxationData.length){
        this.rowCount;
        //If user nvigates to add data manually page add one row with empty data
        this.taxationData[0] = this.taxationDataService.getRowData(this.rowCount);
      }else{
        this.checkForFieldError(this.taxationData, "init");
        this.getSortedDataAccordingToError();
      }
      
   
  }
  ngOnDestroy(){
    this.routeDataSubscriber.unsubscribe();
    this.routeParamSubscriber.unsubscribe();
  }
  /**
   * This Function will give the total count for the errors 
   * For all the states
   */
  getTotalErrorCount(){
    this.totalErrorCount = 0;
    this.totalFieldCount = 0;
    this.taxationData.map((data: any, index)=>{
      let totalFieldCount= this.taxationErrorService.getCountForFieldError(data);
      let totalErrorCount = this.taxationErrorService.getErrorCount(data);
      this.totalFieldCount += totalFieldCount;
      this.totalErrorCount += totalErrorCount;
    });
  }
  /**
   * @param  {} index
   * @param  {} item
   */
  trackByRowId(index, item) {
    if(!item) return null;
    return item.rowId;
  }
  onProceedHandler(){
    this.checkForFieldError(this.taxationData);
    this.getTotalErrorCount();
    if(!this.totalFieldCount){ 
      let measurementData = this.ruleEngine.run(this.taxationData, 80, []);
      if(measurementData.hasError && measurementData.data.length){
        measurementData.data.map((data)=> {
          if(this.taxationData[data.rowId])
            this.taxationData[data.rowId].errors.measurementError = data.errors.measurementError;
        })
        this.getTotalErrorCount();
      }else{
        this.taxationDataService.saveTaxationData(this.removeExtrasFromTaxationData, "EDIT_REGISTERED_STATES_PAGE", this.taxationData);
        this.taxationDataService._saveStatus.next(false);
        this.taxationDataService.removeFromLocalStorage();
        this.routingService.goToPage(`${routeUrl.DBRD.DASHBOARD}/${routeUrl.DBRD.REGISTERED_STATES}`);
        this.totalErrorCount = 0;
        this.totalFieldCount = 0;
      }
    }if(this.totalErrorCount){
      window.scrollTo(0,0);
      this.taxationDataService.showPopUpForErrors(this.totalErrorCount);
      this.getSortedDataAccordingToError();
    }
  }

  saveToLocalStorage(){
    this.authenticationService.setItem("dashboardLandingPage","EDIT_TAX_DATA_PAGE");
    this.authenticationService.setItem("taxationData",JSON.stringify(this.taxationData));
    this.undoRedoService.saveToLocalStorage();
  }

  //This function will get all the rules from the rule engine
  //provided by users in excel
  async getAllRules(){
    this.rules = await this.ruleEngine.getRules();
    this.getfetchSavedImportedData();
  }
  getAllStates(){
    this.loggerService.logResponse(this.activatedRoute.snapshot.data)
    this.routeDataSubscriber = this.activatedRoute.data.subscribe((res)=>{
      this.stateList = this.utilityService.sortBy(res.states, "stateName");
    })

  }
  onCollapse(event, index) {
    this.tableToggle[index] = !this.tableToggle[index];
  }
  onActionsCollapse(event) {
    event.stopPropagation();
    this.actionsToggle = !this.actionsToggle;
  }
  @HostListener('document:click', ['$event'])outsideClick(event){	
    this.actionsToggle = false;
  }
  @HostListener('document:keyup', ['$event'])keyUp(event){	
    if(event.key === "Escape") {
      this.actionsToggle = false;
    }
  }
  addRow(){
    this.rowCount++;
    this.taxationData.unshift(this.taxationDataService.getRowData(this.rowCount));
    let undoObject = {action:"addrow",data:[]};
    let rowIndex = 0;
    let rowData = JSON.stringify(this.taxationData[rowIndex]);
    undoObject.data.push({rowIndex,rowData});
    this.undoRedoService.addToUndo(undoObject);
    this.saveToLocalStorage();
    //Scroll to bottom.
    window.scrollTo(0,0);
  }
  mergeSelected(ev:Event){
    ev.stopPropagation();
    this.actionsToggle = !this.actionsToggle;
    if(this.selectedRows.length>1){
      let isSameStateAndMonth = true;
      let state = this.selectedRows[0].stateCode;
      let monthYear = this.selectedRows[0].monthYear;
      monthYear = new Date(monthYear);
      for(let i=0; i<this.selectedRows.length; i++){
        let rowMonthYear = new Date(this.selectedRows[i].monthYear);
        let rowState = this.selectedRows[i].stateCode;
        if(!(rowState != "" && state == rowState && this.selectedRows[i].monthYear!="" && monthYear.toDateString() == rowMonthYear.toDateString())){
          isSameStateAndMonth = false;
          break;
        }
      }
      if(isSameStateAndMonth){
        //sort selected rows by index.
        this.selectedRows.sort((a,b)=>{
          return this.taxationData.indexOf(a) - this.taxationData.indexOf(b);
        });
        //merge rows.
        let undoObject = {action:"merge",data:[],result:{}};
        let rowIndex = this.taxationData.indexOf(this.selectedRows[0]);
        let rowData = JSON.stringify(this.taxationData[rowIndex]);
        undoObject.data.push({rowIndex,rowData});

        let resultIndex = this.taxationData.indexOf(this.selectedRows[0]);
        let indexRow:TaxData = this.taxationData[resultIndex];

        for(let i=1;i<this.selectedRows.length;i++){
          if(this.taxationData.find(x=>x==this.selectedRows[i])){
              indexRow.salesValue = this.addFloatValues(indexRow.salesValue, this.selectedRows[i].salesValue).toString();
              indexRow.transactionsValue = this.addIntValues(indexRow.transactionsValue, this.selectedRows[i].transactionsValue);

              let rowIndex = this.taxationData.indexOf(this.selectedRows[i]);
              let rowData = JSON.stringify(this.taxationData[rowIndex]);
              undoObject.data.push({rowIndex,rowData});
              this.taxationData.splice(rowIndex,1);
          }
        }
        let resultData = JSON.stringify(this.taxationData[resultIndex]);
        undoObject.result = {resultIndex,resultData};
        this.undoRedoService.addToUndo(undoObject);
        delete indexRow.errors.fieldErrors["duplicateError"];
        this.taxationErrorService.getAllErrorForSingleState(indexRow, this.rules, this.stateList,"");
       // this.taxationErrorService.getErrorMessageText(indexRow);
        this.getTotalErrorCount();
        this.saveToLocalStorage();
        this.selectedRows = [];
        this.unSelectCheckBox();
        this.checkForDeleteAndMergeButton();
      }else{
        //Show error. Month or states dont match.
      }

    }else{
      //Show error
    }
    
  }

  unSelectCheckBox(){
    document.querySelectorAll('.custom__cb input:checked').forEach((chBox:HTMLInputElement)=>{
      chBox.checked = false;
    });
  }

  addFloatValues(op1, op2){
    op1 = op1||0;
    op2 = op2||0;
    let sum = parseFloat(op1)+parseFloat(op2);
    return sum.toFixed(2).toString();
  }

  addIntValues(op1, op2){
    op1 = op1||0;
    op2 = op2||0;
    let sum = parseInt(op1)+parseInt(op2);
    return sum.toString();
  }

  checkForDuplicate(taxationData){
    let uniqueEntry = {};
    taxationData.forEach((item, index)=>{
      let stateAndMonth;
      if(item.stateCode && item.monthYear){
        stateAndMonth = item.stateCode.toString()+item.monthYear.toString();
        if(uniqueEntry[stateAndMonth]){
          //Duplicate found
          if(item.errors && item.errors.fieldErrors){
            item.errors.fieldErrors["duplicateError"] = "Duplicate entry(s)! We found other entrie(s) with same state and month. Please delete, merge or edit the entry(s)";
          }
          let indexItem = uniqueEntry[stateAndMonth];
          if(indexItem.errors && indexItem.errors.fieldErrors){
            indexItem.errors.fieldErrors["duplicateError"] = "Duplicate entry(s)! We found other entrie(s) with same state and month. Please delete, merge or edit the entry(s)";
          }
        }else{
          if(item.errors && item.errors.fieldErrors){
            delete item.errors.fieldErrors["duplicateError"];
          }
          uniqueEntry[stateAndMonth] = item;
        }
      }else{
        if(item.errors && item.errors.fieldErrors){
          delete item.errors.fieldErrors["duplicateError"];
        }
      }
    });
   
  }

  deleteSelected(ev:Event){
    ev.stopPropagation();
    this.actionsToggle = !this.actionsToggle;
    //If rows are selected.
    if(this.selectedRows.length){
      //sort selected rows by index.
      this.selectedRows.sort((a,b)=>{
        return this.taxationData.indexOf(a) - this.taxationData.indexOf(b);
      });
      //Remove selected rows from the taxationData array.
      let undoObject = {action:"delete",data:[]};
      for(let i=0;i<this.selectedRows.length;i++){
        if(this.taxationData.find(x=>x==this.selectedRows[i])){
            let rowIndex = this.taxationData.indexOf(this.selectedRows[i]);
            let rowData = JSON.stringify(this.taxationData[rowIndex]);
            this.taxationData.splice(rowIndex,1);
            undoObject.data.push({rowIndex,rowData});
            this.getTotalErrorCount();
        }
      }
      this.undoRedoService.addToUndo(undoObject);
      this.saveToLocalStorage();
      this.selectedRows = [];
      this.checkForDeleteAndMergeButton();
    }
  }

  checkBoxChanged(item){
    //Add or remove selected rows from the selectedRows array.
      if(this.selectedRows.find(x=>x==item)){
        this.selectedRows.splice(this.selectedRows.indexOf(item),1)
      }else{
        this.selectedRows.push(item);
      }
      this.checkForDeleteAndMergeButton();
  }

  checkForDeleteAndMergeButton(){
    if(this.selectedRows.length>0){
      this.isDeleteDisabled = false;
    }else{
      this.isDeleteDisabled = true;
    }
    if(this.selectedRows.length>1){
      let isSameStateAndMonth = true;
      let state = this.selectedRows[0].stateCode;
      let monthYear = this.selectedRows[0].monthYear;
      monthYear = new Date(monthYear);
      for(let i=0; i<this.selectedRows.length; i++){
        let rowMonthYear = new Date(this.selectedRows[i].monthYear);
        let rowState = this.selectedRows[i].stateCode;
        if(!(rowState!= "" && state == rowState && this.selectedRows[i].monthYear!="" && monthYear.toDateString()==rowMonthYear.toDateString())){
          isSameStateAndMonth = false;
          break;
        }
      }
      if(isSameStateAndMonth){
        this.isMergeDisabled = false;
      }else{
        this.isMergeDisabled = true;
      }

    }else{
      this.isMergeDisabled = true;
    }

  }

  onSalesVaueFocus(stateTaxationData){
    stateTaxationData.salesValue = this.usCurrency.formatToOriginol(stateTaxationData.salesValue);
  }
  removeExtrasFromTaxationData(taxationData){
    let updatedTaxationData = taxationData.map((data)=>{
      let salesValue = data.salesValue;
      return {
        "stateCode": data.stateCode,
        "salesValue": salesValue,//.toString().replace(/[$,\s]/g, ""),//(salesValue.indexOf('$') !== -1)? salesValue.substring(1, salesValue.length).trim() : salesValue,
        "transactionsValue": data.transactionsValue,
        "monthYear": data.monthYear
      }
    });
    return updatedTaxationData;
  }
  checkTaxationErrorPresent(stateTaxationData){
    return stateTaxationData.errors && stateTaxationData.errors.fieldErrors;
  }
  changeSavePendingStatus(){
    this.taxationDataService._saveStatus.next(false);
  }
  //This function will get call on cancel button
  onCancelHandler(){
    //if(this.taxationDataService.saveIsPending){
      this.taxationDataService.showConfirmationPopForCancelImport();
      this.taxationDataService._saveStatus.next(false);
    //}
  }
  cancelImport(){
    this.taxationDataService.cancelImport();
  }
  //This function will get call on click of save button 
  onSaveHandler(){
    this.taxationDataService.saveTaxationData(this.removeExtrasFromTaxationData,"EDIT_TAX_DATA_PAGE", this.taxationData);
    this.taxationDataService._saveStatus.next(true);
    this.totalErrorCount = 0;
    this.totalFieldCount = 0;
  }

  infoIconFunction(event){
    event.target.blur();
    this.disableInfoIcon = false;
    this.showNotificationBox = false;
    this.utilityService.putFocusOnElementOnNavigation("tax-data-info");
  }

  showNotification(){
    this.disableInfoIcon = true;
    this.showNotificationBox = true;
    this.utilityService.putFocusOnElementOnNavigation("notification__inner");
  }

  goToStateGuide(){
    this.routingService.goToPage(`${routeUrl.STATE_GUIDES}`);
    this.authenticationService.setItem("dashboardLandingPage","EDIT_TAX_DATA_PAGE");
  }

  monthChanged(newValue, row, index){
    
    this.saveInputChangeForUndo(newValue, row , 'monthYear');
    row.monthYear = newValue;
    //this.getAllErrorForSingleState(row);
    this.getSingleStateErrorAndCount(row, index);
    /*this.taxationErrorService.getAllErrorForSingleState(row, this.rules,this.stateList);
    this.taxationErrorService.getFieldErrorForSingleState(row, this.stateList);
    this.errorMessageString = this.taxationErrorService.getErrorMessageText(row);
    this.checkForDuplicate(this.taxationData);
    this.getTotalErrorCount();*/
  }

  saveInputChangeForUndo(updatedValue, row, field){
    let undoObject = {action:"edit",data:[]};
    let rowIndex = this.taxationData.indexOf(row);
    let oldValue = this.taxationData[rowIndex][field].toString();
    let newValue = updatedValue;
    undoObject.data.push({rowIndex, field, oldValue, newValue});
    this.undoRedoService.addToUndo(undoObject);
  }

  undoClick(){
    let data = this.undoRedoService.undo(this.taxationData);
    if(data){
      this.taxationErrorService.getFieldErrorForSingleState(data, this.stateList);
    }
    this.checkForDuplicate(this.taxationData);
    this.getTotalErrorCount();
    this.changeSavePendingStatus();
    this.saveToLocalStorage();
  }

  redoClick(){
    let data = this.undoRedoService.redo(this.taxationData);
    if(data){
      this.taxationErrorService.getFieldErrorForSingleState(data, this.stateList);
    }
    this.checkForDuplicate(this.taxationData);
    this.getTotalErrorCount();
    this.changeSavePendingStatus();
    this.saveToLocalStorage();
  }

}
