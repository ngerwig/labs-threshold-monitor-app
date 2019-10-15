import { Component, OnInit, AfterViewChecked, } from '@angular/core';
import { RulesEngine } from '../../../dashboard/services/rules-engine.service';
import { FormGroup, FormControl } from '@angular/forms';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
declare var $;



@Component({
  selector: 'vtx-states-guide',
  templateUrl: './states-guide.component.html',
  styleUrls: ['./states-guide.component.scss']
})
export class StatesGuideComponent implements OnInit, AfterViewChecked {
  rules : any;
  sortedrules : any;
  hideRuleContent:boolean[] = [];
  disableInfoIcon: boolean =true;
  showNotificationBox: boolean =true;
  stateForm: FormGroup;
  // default: string = "AL";
  

  constructor(private ruleEngine : RulesEngine, private utilityservice: UtilityService) {
    this.stateForm = new FormGroup({
      stateCodeDD: new FormControl()
    });
    this.stateForm.controls['stateCodeDD'].setValue("AL", {onlySelf: true});
  }

  ngOnInit() {
    this.getAllRules();
  }
  hideNotification(event){
    event.target.blur();
    this.disableInfoIcon = false;
    this.showNotificationBox = false;
    this.utilityservice.putFocusOnElementOnNavigation("state-info");
  }

  showNotification(){
    this.disableInfoIcon = true;
    this.showNotificationBox = true;
    this.utilityservice.putFocusOnElementOnNavigation("notification__inner");
  }
  ngAfterViewChecked(){
    $('.collapsable-table__details p').addClass('long-info');
  }

  toggle(event, parent){
    this.toggleAriaExpanded(event.currentTarget);
    const tr = this.getTRData(parent);
    this.setActiveToggleClass(tr);
  }

  getTRData(data){
    data.classList.toggle('is-expanded');
    const attrName = 'collapsable-table__row--collapsable';
    let trArrayEle = [];
    for(let i=0;i<data.children.length;i++){
      if(data.children[i].classList.value == attrName){
        trArrayEle.push(data.children[i]);
      }
    }
    return trArrayEle;
  }

  setActiveToggleClass(data){
    data.forEach(element => {
      let timeCount = 500;
      $(element).find('.collapsable-table__details').toggle(timeCount);
    });
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


  expandAllDetails(ev){
    var elementGroup = document.querySelectorAll('.collapsable-table .collapsable-table__row-group');
    this.toggleAriaExpanded(ev.currentTarget);
    elementGroup.forEach((element) => {
      element.classList.add('is-expanded');
      let timeCount = 500;
      $('.collapsable-table__details').show(timeCount);
    });
  }

  collapseAllDetails(ev){
    this.toggleAriaExpanded(ev.currentTarget);
    document.querySelectorAll('.collapsable-table .collapsable-table__row-group').forEach((element) => {
      element.classList.remove('is-expanded');
      let timeCount = 500;
      $('.collapsable-table__details').hide(timeCount);
    });
  }

  async getAllRules(){
    this.rules  = await this.ruleEngine.getRules();
    this.rules.sort(function(a,b){
      var nameA = a.stateName.toLowerCase(), nameB = b.stateName.toLowerCase()
      if (nameA < nameB)
        return -1
      
      if (nameA > nameB)
        return 1
        
      return 0
    });
    this.rules = this.rules.map((state)=>{
      let mPeriod;
      if(state.is_calendar_year && state.calendarYear.current && state.calendarYear.prior){
          mPeriod = this.ruleEngine.getMeasurementPeriodForPriousAndCurrentCalenderYear(state);
      } else if(state.is_calendar_year && state.calendarYear.prior && !state.calendarYear.current){
         mPeriod = this.ruleEngine.getMeasurementPeriodForPriousCalenderYear(state);
      }else if(state.is_prior_duration){
         mPeriod = this.ruleEngine.getMeasurementPeriodForPreviousMonths(state);
      }else if(state.is_prior_ending_month){
         mPeriod = this.ruleEngine.getMeasurementPeriodForPreviousMonthsWithEndingDate(state);
      }else if(state.is_quarter){
          mPeriod = this.ruleEngine.getMeasurementPeriodForPriousQuarters(state);
      }else if(state.is_federal_year){
          //This is for wisconsin state.
          mPeriod = this.ruleEngine.getMeasurementPeriodForPriousAndCurrentCalenderYear(state);
      }

      mPeriod.start = mPeriod.start.toLocaleString('en-US', { month: 'short' }) + ' ' + mPeriod.start.getFullYear();
      mPeriod.end = mPeriod.end.toLocaleString('en-US', { month: 'short' }) + ' ' + mPeriod.end.getFullYear();

      return {...state,mPeriod}
    });
  }
  //toggle(index){
    // toggle based on index
    //this.hideRuleContent[index] = !this.hideRuleContent[index];
  //}
  
}
