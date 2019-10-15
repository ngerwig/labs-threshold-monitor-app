import { Component, OnInit, Input, TemplateRef } from '@angular/core';
// import { runInThisContext } from 'vm';

@Component({
  selector: 'vtx-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  @Input() toolTipMessage: TemplateRef<any>;
  @Input() messageForAccesibilityId?: string;
  @Input() messageForAccesibility?: string;
  @Input() toolTipType;
  @Input() toolTipPosition;
  @Input() errorCounts;
  @Input() toolTipFieldErrors;
  @Input() toolTipMeasurementErrors
  tooltipOpen: boolean = false;
  ctx : any= {};
  constructor() { }

  ngOnInit() {
    this.ctx.fieldErrors = this.toolTipFieldErrors ? this.toolTipFieldErrors : {};
  }

  tootltipFunction(){
    this.tooltipOpen = !this.tooltipOpen;
  }
  tooltipOutClickFunction(){
    this.tooltipOpen = false;
  }
  tooltipMobileSetUp(){
    document.body.classList.add("tooltip--mobile");
  }
  tooltipMobileSetUpOutClickFunction(){
    document.body.classList.remove("tooltip--mobile")
  }

}
