import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnDestroy } from '@angular/core';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import moment from 'moment';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import Constants from "../../../../config/constants.json";

@Component({
  selector: 'vtx-summary-data-table',
  templateUrl: './summary-data-table.component.html',
  styleUrls: ['./summary-data-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SummaryDataTableComponent implements OnInit, OnDestroy {

  @Output() updateCurrentState = new EventEmitter<string>();
  @Input() getSelectedStatesCount : string;
  thresholdDataStatus: boolean = true;
  thresholdRegulationsStatus: boolean = false;
  dropDownStatus1: boolean = false;
  dropDownStatus2: boolean = false;
  selectedStateRegulationData;
  selectedStatesArray = [];
  currentSelectedState;
  constants = Constants;

  currentSelectedStateTaxationDataSubject;
  selectedStatesArraySubject;
  isSelectedArrayEmpty: boolean = false;
  disableInfoIcon: any;
  showNotificationBox: boolean;

  constructor(private loggerService:LoggerService, private utilityService: UtilityService, private dashboardService: DashboardService) {
    this.currentSelectedStateTaxationDataSubject = this.dashboardService.currentSelectedStateTaxationDataSubject;
    this.currentSelectedStateTaxationDataSubject.subscribe((value)=>{
      this.currentSelectedState = value;
    });
    this.selectedStatesArraySubject = this.dashboardService.selectedStatesArraySubject;
    this.selectedStatesArraySubject.subscribe((data)=>{
      this.selectedStatesArray = [];
      data.map((stateData)=>{ // for each
        if(stateData['checked'] && stateData['filtered']){
          this.selectedStatesArray.push(stateData);
        }
      });
      this.isSelectedArrayEmpty = this.utilityService.isArrayEmpty(this.selectedStatesArray);
    })
    if(this.currentSelectedState){ // remove
    }
   }

   ngOnInit() {}
  
  getTaxationPeriod(startMonth, endMonth){
    startMonth = this.utilityService.formatDate(startMonth);
    endMonth = this.utilityService.formatDate(endMonth);
    if(startMonth == endMonth){
        return startMonth;
    }else {
        return `${startMonth} - ${endMonth}`;
    }
  }

   formatDate(date){
    return this.utilityService.formatDate(date);
   }

   formatSales(value,currency?) {
    return this.utilityService.digitFormatter(value,currency);
  }

  formatEffectiveDate(date){
    if(date){
      return moment(date).format('MM/DD/YYYY');
    }
  }
  getThresholdClass(status){
    if (status == 'THRESHOLD_CROSSED'){
        return 'button-status-crossed';
    }else if(status == 'THRESHOLD_NEARING'){
        return 'button-status-nearing';
    }else if(status == 'THRESHOLD_SAFE'){
        return 'button-status-safe';
    }else{
        return '';
    }
  }
   isStateFocused(stateCode){
     if(stateCode){
      if(this.currentSelectedState && (this.currentSelectedState.stateCode == stateCode)){
        return 'isFocused active-state';
      }else{
       return '';
      }
     }return 'isFocused active-state';
   }

   formatThresholdStatus(status){
    if(status){
      return this.utilityService.formatThresholdStatus(status);
    }else{
      return "";
    }
   }

   getThresholdStatusImageSrc(status){
       let imageName = status.toLowerCase();
       var imageSrc = `../../../../../assets/images/svg/${imageName}.svg`
        return imageSrc;
   }


  selectState(stateCode) {
    /* function is called when user clicks on a state in map
    emits state code value to taxation-summary component to display graph for the state
    caputures event and passes state code
    @params events
    @returns emits stateCode 
    */
    // document.getElementsByClassName('selectedStateData')focus();
    this.loggerService.logStatus(`state selected-> ${stateCode}` + 'Dashboard: Summary data table');
    this.updateCurrentState.emit(stateCode);
  }

  filterThresholdData(event){
    this.thresholdRegulationsStatus = false;
    this.thresholdDataStatus = true;
  }
  filterThresholdRegulations(event) {
    if(this.currentSelectedState){ //remove
    }
    this.thresholdDataStatus = false;
    this.thresholdRegulationsStatus = true;
  }

  expendTable($event,parent) {
    this.toggleAriaExpanded($event.currentTarget);
    const tr = this.getTRData(parent);
    parent.classList.toggle('active'); 
    this.setActiveToggleClass(tr);
  }

  /**
   * TODO: Toggle the aria expended true/false when user click the plus icon
   * @param el - plus icon button
   */
  toggleAriaExpanded(el){
    const elAttribute = el.getAttribute('aria-expanded');
    if(elAttribute === "true"){
      el.setAttribute('aria-expanded', false);
    }else{
      el.setAttribute('aria-expanded', true);
    }
  }
  
  /**
   * TODO: Toggle the aria hidden true/false when user click the plus icon
   * @param el - plus icon button
   */
  toggleAriahidden(el){
    const elAttribute = el.getAttribute('aria-hidden');
    if(elAttribute === "true"){
      el.setAttribute('aria-hidden', false);
    }else{
      el.setAttribute('aria-hidden', true);
    }
  }


  getTRData(data){
    const attrName = 'data-collapsible-table';
    let trArray = [];
    for(let i=0;i<data.children.length;i++){
      if(data.children[i].hasAttribute(attrName)){
            trArray.push(data.children[i]);
          }
    }
    return trArray;
  }

  setActiveToggleClass(data){
    data.forEach(element => {
      const elAttribute = element.getAttribute('aria-hidden');
      element.classList.toggle('active');
      // switch aria-hidden from true to false for a11y
      if(elAttribute === "true"){
        element.setAttribute('aria-hidden', false);
      }else{
        element.setAttribute('aria-hidden', true);
      }
    });
  }

  infoIconFunction(event){
    event.target.blur();
    this.disableInfoIcon = false;
    this.showNotificationBox = false;
    this.utilityService.putFocusOnElementOnNavigation("summery-notification-info");
  }
  
  showNotification(){
    this.disableInfoIcon = true;
    this.showNotificationBox = true;
    this.utilityService.putFocusOnElementOnNavigation("notification__inner");
  }
  formatShortInfo(shortInfo){
    return `Threshold Triggering Collection Obligation : ${shortInfo}`
  }
  ngOnDestroy(){
      // if(this.currentSelectedStateTaxationDataSubject){
    //   this.currentSelectedStateTaxationDataSubject.unsubscribe();
    // }
    // if(this.selectedStatesArraySubject){
    //   this.selectedStatesArraySubject.unsubscribe();
    // }
    this.dashboardService.unsubscribeSelectedStatesArray();
  }
}
