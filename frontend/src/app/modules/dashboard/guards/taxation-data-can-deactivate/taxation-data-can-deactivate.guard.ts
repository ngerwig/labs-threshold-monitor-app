import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import {TaxationDataService} from '../../services/taxation-data/taxation-data.service'
import { ComponentCanDeactivate } from './component-can-deactivate';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/modules/core/components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class TaxationDataCanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
  hasToDeactivate = false;
  constructor(private ngbModalService : NgbModal){

  }
  async canDeactivate(component: ComponentCanDeactivate): Promise<boolean> {
    if(component.canDeactivate()){
      if(await this.showConfirmationPopForCancelImport()){
        return true;
      }else{
        return false;
      }
    }
    return true;
  }
  showConfirmationPopForCancelImport(){
    const modelRef = this.ngbModalService.open(ModalComponent, {
      centered: true
    });
    modelRef.componentInstance.modalData = {
      header: "Confirm",
      modalContent: "You have not saved your work,are you sure you want to leave this page? ",
      okText: "Yes",
      cancelText: "No",
      focusOnCancel:"footer-save-btn",
      isCancelVisible : true
    }
    return modelRef.result;
  }
  
}
