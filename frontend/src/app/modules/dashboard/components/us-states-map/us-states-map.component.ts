import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { DEFAULT_VALUES } from '../../../../config/default-values';
import html2canvas from 'html2canvas';
import canvg from 'canvg';
import { LoaderService } from 'src/app/modules/core/services/loader/loader.service';

declare var $;

@Component({
  selector: 'vtx-us-states-map',
  templateUrl: './us-states-map.component.html',
  styleUrls: ['./us-states-map.component.scss']
})
export class USStatesMapComponent implements OnDestroy {

  @Output() updateCurrentState = new EventEmitter<string>();
  @ViewChild('mapContainer', {static: false}) mapContainer: ElementRef;

  public selectedStatesArraySubject;
  public selectedStatesArray;

  public currentSelectedStateTaxationDataSubject;
  public currentSelectedStateCode: string;

  public allRegisteredStatesSubject;
  public allRegisteredStates;
  private imageCreated = false;

  constructor(private loggerService: LoggerService,
    private utilityService: UtilityService,
    private dashboardService: DashboardService,
    private authService: AuthenticationService,
    private loader: LoaderService) {
  }

  ngAfterViewInit() {

    /* subscribing to all the subjects on init */

    this.selectedStatesArraySubject = this.dashboardService.selectedStatesArraySubject;
    this.selectedStatesArraySubject.subscribe((data) => {
      this.selectedStatesArray = data;
      this.saveAsImage();
    });

    this.currentSelectedStateTaxationDataSubject = this.dashboardService.currentSelectedStateTaxationDataSubject;
    this.currentSelectedStateTaxationDataSubject.subscribe((value) => {
      if (value) {
        this.currentSelectedStateCode = value.stateCode;
      }
    });

    this.allRegisteredStatesSubject = this.authService.allRegisteredStatesSubject.subscribe((allStates) => {
      this.allRegisteredStates = allStates;
    });

  }

  saveAsImage(){
    if(this.imageCreated){
      return;
    }
    this.loader.show();
    setTimeout(()=>{
      try{
 
        var selectedState = $('#us-map g.state.isFocused');
        selectedState.removeClass('isFocused');
        var props = ["fill", "stroke", "stroke-width"];
          document.querySelectorAll("#us-map rect, #us-map g").forEach(function (item, index) {
              var cstyle = getComputedStyle(item);
              props.forEach(function (prop) {
                  if(!item.hasAttribute(prop)){
                    item.setAttribute(prop, cstyle[prop]);
                    if(prop == 'fill')
                      item.setAttribute('fillAdded', 'true');
                  }
                  
              });
              // item.removeAttribute("class");
          });
          var svg = document.getElementById('us-map').innerHTML;
          if (svg)
              svg = svg.replace(/\r?\n|\r/g, '').trim();
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, 500, 500);
          canvg(canvas, svg);
        var imgData = canvas.toDataURL('image/png');
        this.dashboardService.usMapData = imgData;
        this.dashboardService.usMapDataGenerated.next(true);
        document.querySelectorAll("#us-map rect, #us-map g").forEach(function (item, index) {
              props.forEach(function (prop) {
                if((prop == 'fill' && item.hasAttribute('fillAdded'))|| prop != 'fill'){
                  item.removeAttribute(prop);
                  item.removeAttribute('fillAdded');
                  }
              });
              // item.removeAttribute("class");
          });
          selectedState.addClass('isFocused');

          this.loader.hide();
        }catch(e){
          console.log("Error while generating map for pdf  report!");
          this.loader.hide();
        }
      }, 1000);
      this.imageCreated = true;       
  }

  setStateClass(stateCode) {

    /* function to add class for a state based on threshold status
    adds class to registered state. 
    adds class 'focusable' to the states that are imported
    only the states having class 'focusable' will be highlighted and shows graph for the same
    @params valid stateCode
    */

    let stateClass = '';
    if (stateCode) {
      if (this.isStateRegistered(stateCode)) {
        stateClass = DEFAULT_VALUES.CLASSES.NOT_AVAILABLE;
      }
      let stateData = this.isStateSelected(stateCode);
      if (stateData) {
        stateClass = `${DEFAULT_VALUES.CLASSES.IS_SELECTED} ${stateData.thresholdStatus.toLowerCase()} ${DEFAULT_VALUES.CLASSES.FOCUSABLE} `;
      }
      if (this.isStateFocused(stateCode)) {
        stateClass += DEFAULT_VALUES.CLASSES.IS_FOCUSED;
      }
    }
    return stateClass;
  }

  isStateRegistered(stateCode) {

    /* checks if a state is registered
    @params statecode
    @returns state threshold data
    */

    if (this.allRegisteredStates) {
      return this.allRegisteredStates.find((registeredStateCode) => {
        return registeredStateCode == stateCode;
      })
    }
  }

  isStateSelected(statecode) {
    /* this function checks if the state is in selectedStatesArray 
    @params valid stateCode
    @returns state data if state is in selected states array. false if not.
     */
    if (statecode && this.selectedStatesArray && !this.utilityService.isArrayEmpty(this.selectedStatesArray)) {
        return this.selectedStatesArray.find((stateData) => {
          return (stateData.state.stateCode == statecode) && stateData.checked && stateData.filtered
        });
    }
      return false;
  }

  isStateFocused(stateCode) {

    /* this function checks if the state is currentSelectedState 
    there can be only one selected state at a time.
    @params valid stateCode
    @returns true if state is currently selected else false.
     */
    return stateCode == this.currentSelectedStateCode ? true : false;
  }

  showGraph(event) {

    /* function is called when user clicks on a state in map
    emits state code value to taxation-summary component to display graph for the state
    captures event and passes state code
    @params event
    @returns emits stateCode
    */
    if (this.isStateSelected(event.currentTarget.id)) {
      this.loggerService.logStatus(`loading Graph for -> ${event.currentTarget.id}` + 'Dashboard:us-state-map');
      this.updateCurrentState.emit(event.currentTarget.id);
    }
  }

  ngOnDestroy() {

    /* unsubscribing to all subjects */

    // if (this.currentSelectedStateTaxationDataSubject) {
    //   this.currentSelectedStateTaxationDataSubject.unsubscribe();
    // }
    // if (this.selectedStatesArraySubject) {
    //   this.selectedStatesArraySubject.unsubscribe();
    // }
    // if(this.allRegisteredStatesSubject){
    //   this.allRegisteredStatesSubject.unsubscribe();
    // }

  }
}
