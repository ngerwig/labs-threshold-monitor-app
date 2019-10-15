import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { UtilityService } from '../../services/utility/utility.service';

@Component({
  selector: 'vtx-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() showMessage: boolean;
  @Input() notificationMessage?: string;
  @Input() notificationMessageId?: string;
  @Output() showNotification: EventEmitter<any> = new EventEmitter();

  constructor(private utilityService: UtilityService) { }

  ngOnInit() {
    //this.utilityService.putFocusOnElementOnNavigation("hide-btn");
    this.notificationMessageId = `notify ${this.notificationMessageId}`
  }

  closeNotification(event) {
    this.showNotification.emit(event);
  }

}
