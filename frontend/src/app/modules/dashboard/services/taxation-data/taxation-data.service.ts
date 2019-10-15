import { Injectable } from '@angular/core';
import { HttpService} from '../../../core/services/http/http.service';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import  apiUrl from '../../../../config/api-url.config.json';
import { ROUTE_PATHS as routeUrl } from '../../../../config/route.config'
import { ModalComponent } from 'src/app/modules/core/components/modal/modal.component';
import { AuthenticationService } from "../../../core/services/authentication/authentication.service"
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { RoutingService } from 'src/app/modules/core/services/routing/routing.service';
import { TaxationDataUndoRedoService } from '../taxation-data-undo-redo.service';


@Injectable({
  providedIn: 'root'
})
export class TaxationDataService {
  saveIsPending;
  userId: string;
  _saveStatus = new Subject();
  taxationData:[];
  constructor(private httpService: HttpService, private loggerService : LoggerService,
    private ngbModalService : NgbModal, private authenticationService: AuthenticationService,
    private dashBoradService: DashboardService, private routingService : RoutingService,
    private undoRedoService: TaxationDataUndoRedoService) { 
      if(authenticationService.currentUserValue){
        this.userId = authenticationService.currentUserValue.userId;
      }
      this._saveStatus.subscribe((status)=>{
      this.saveIsPending = status;
      /* if(this.saveIsPending){
        this.showConfirmationPopForCancelImport();
      } */
    })
  }
  
  showConfirmationPopForCancelImport(successCallback?){
    const modelRef = this.ngbModalService.open(ModalComponent, {
      centered: true
    });
    modelRef.componentInstance.modalData = {
      header: "Cancel Import",
      modalContent: "If you cancel now, you may lose data that has not been completely imported or saved. Are you sure you want to cancel?",
      okText: "Yes",
      cancelText: "No",
      focusOnCancel:"footer-cancel-btn",
      isCancelVisible : true
    }
    modelRef.componentInstance.onSuccess.subscribe(() => {
        this.removeFromLocalStorage();
        this.cancelImport();
    })
  }

  showPopUpForErrors(count){
    const modelRef = this.ngbModalService.open(ModalComponent, {
      centered: true
    });
    modelRef.componentInstance.modalData = {
      header: "Error(s) Found!",
      modalContent: `All errors must be fixed before continuing to the next step.`,
      okText: "Ok",
      focusOnCancel:"footer-proceed-btn",
      cancelText: "Cancel",
      isCancelVisible : false
    }
    modelRef.componentInstance.onSuccess.subscribe(() => {
      ///this.activeModal.close('Close click');
    })
  }

  showPopUpForInvalidFormatFile(){
    const modelRef = this.ngbModalService.open(ModalComponent, {
      centered: true
    });
    modelRef.componentInstance.modalData = {
      header: "Invalid Format Of File",
      modalContent: "File format isn’t supported. Supported format: .csv, .xlsx and .xls.",
      okText: "Ok",
      focusOnCancel:"footer-proceed-btn",
      isCancelVisible: false
    }
    modelRef.componentInstance.onSuccess.subscribe((value) => {

    })
  }

  showPopUpForCancellAllRegisteredStates(){}

  isInt(number){
    let regx =/^-?[0-9]+$/;
    return regx.test(number);
  }

  isFloat(number){
    let regx =/^[+-]?\d+(\.\d{1,})?$/;
    return regx.test(number);
  }

  getRowData(rowCount){
    return {
      stateCode: '',
      monthYear: '',
      transactionsValue: "",
      salesValue: "",
      errors: {
        "fieldErrors": {},
        "measurementError": ""  
      },
      rowId: rowCount
    }
  }
  saveTaxationData(removeExtrasFromTaxationData, actionUrl, taxationData?){
    //this.taxationData = taxationData;
    this.userId = this.authenticationService.currentUserValue.userId;
    this.dashBoradService.setTaxData(removeExtrasFromTaxationData(taxationData));
    let reqObj = {
      url: apiUrl.URLS.DASHBOARD.SAVE_TAXATION_DATA,
      data: {
        "userId": this.userId,
        "taxData": removeExtrasFromTaxationData(taxationData)
      }
    }
    this.httpService.post(reqObj).subscribe((res)=>{
      if(res.is_success){
        this._saveStatus.next(false);
        this.authenticationService.setItem("dashboardLandingPage",actionUrl);
        this.loggerService.logResponse(res, "Taxation data saved successfully");
      }else{
        //Handle Error
        this.loggerService.logResponse(res, "Error is saving taxation data");
      }
    });
  }
  async getThresholdSummaryData(){
    return  await this.dashBoradService.userTaxationData();
  }
  async cancelImport(){
    this.userId = this.authenticationService.currentUserValue.userId;
    this._saveStatus.next(false);
    let reqObj = {
      url: `${apiUrl.URLS.DASHBOARD.CANCEL_TAXATION_DATA}/${this.userId}`,
    }
    this.httpService.delete(reqObj).subscribe((res)=>{
      if(res.is_success || res.customErrorCode === "NO_DATA_PRESENT_TO_DELETE"){
        this.loggerService.logResponse(res, "Taxation data deleted successfully");
        let userTaxationData = this.getThresholdSummaryData();
        userTaxationData.then((data)=>{
          if(data.taxData.length){
            this.authenticationService.setItem("dashboardLandingPage","DASHBOARD_PAGE");
            this.routingService.goToPage(`${routeUrl.DBRD.DASHBOARD}/${routeUrl.DBRD.THRESHOLD_SUMMARY}`);
          }else{
            this.authenticationService.setItem("dashboardLandingPage","ZERO_STATE_PAGE");
            this.routingService.goToPage(`${routeUrl.DBRD.DASHBOARD}`);
          }
          this.dashBoradService.setTaxData([]);
        })
      }else{
        //Handle Error
        this.loggerService.logResponse(res, "Error is deleting taxation data");
      }
    });
  }

  removeFromLocalStorage(){
    this.authenticationService.removeItem("taxationData");
    this.undoRedoService.removeFromLocalSorage();
    this.undoRedoService.clearUndoRedo();
  }

  
  
}
