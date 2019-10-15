import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewChecked, Output, EventEmitter, OnChanges, AfterViewInit } from '@angular/core';
// import * as $ from 'jquery';
declare const require: any
var $ = require('jquery')

import '../../../../../vendors/date-picker/js/datepicker.js';
import { Subject } from 'rxjs';
import { UtilityService } from '../../services/utility/utility.service.js';

@Component({
  selector: 'vtx-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.scss']
})
export class MonthPickerComponent implements OnInit, AfterViewChecked, OnChanges {
  isInputClicked = false;
  @Input() monthYr;
  @Output() onChange = new EventEmitter();
  @ViewChild('dateField', {static: false}) dateField: ElementRef;
  dateFormatted = "";

  constructor(private utilityService: UtilityService) { }
  ngOnInit() {
    this.dateFormatted = this.getFormattedDate(this.monthYr);
  }

  ngOnChanges(){
    this.dateFormatted = this.getFormattedDate(this.monthYr);
    //this.utilityService.putFocusOnElementOnNavigation("month-year"); 
  }

  ngAfterViewChecked(): void {
    $(this.dateField.nativeElement).datepicker({
      startView: 2,
      inputFormat: ["yyyy-MM"],
      outputFormat: 'yyyy-MM',
      gainFocusOnConstruction: false,
      minMode: 'month' ,
      onUpdate: (selectedDate) => {
        $(this.dateField.nativeElement).next().focus();
        this.dateFormatted = this.getFormattedDate(selectedDate); 
        this.onChange.emit(selectedDate);
      }
    })
    .on("ab.datepicker.closed",function(){
      $(this.dateField.nativeElement).next().focus();
    })
  }
  
  getFormattedDate(date){
    let monthMap = {"01":"Jan","02":"Feb","03":"March","04":"April","05":"May","06":"June","07":"July","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"};
    if(date){
      let foramttedDate;
      date = date.split('-');
      /*date = new Date(date);
      foramttedDate = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();*/
      foramttedDate = monthMap[date[1]]+' '+date[0];
      return foramttedDate;
    }else{
      return "";
    }
  }

}
