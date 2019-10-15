import { Component, OnInit, ElementRef, ViewEncapsulation, Output, EventEmitter, Input, AfterContentInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from '../../services/utility/utility.service';

@Component({
  selector: 'vtx-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit {
  @Output() onSuccess: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Input() modalData;

  
  constructor(private el: ElementRef, public activeModal: NgbActiveModal,private utilityService: UtilityService) { }

  ngOnInit() { }
  successHandler(){
    this.activeModal.close(true);
    this.onSuccess.emit();
  }
  cancelHandler(){
    this.activeModal.close(false);
    if(this.modalData.focusOnCancel){
      this.utilityService.putFocusOnElementOnNavigation(this.modalData.focusOnCancel);
    }
    this.onCancel.emit();
  }
}
