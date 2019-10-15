import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { RoutingService } from '../../../core/services/routing/routing.service';

@Component({
  selector: 'vtx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() modeNoProceedButton? : boolean = true;
  @Input() modeNoSaveButton? : boolean = true;
  @Output() proceedHandler: EventEmitter<any> = new EventEmitter();
  @Output() saveHandler = new EventEmitter();
  @Output() cancelHandler = new EventEmitter();

  constructor(private routingService: RoutingService) { }

  ngOnInit() {
  }

  onProcced() {
    this.proceedHandler.emit(null);
  }
  onSave(){
    this.saveHandler.emit(null);
  }
  onCancel(){
    this.cancelHandler.emit(null);
  }
}
