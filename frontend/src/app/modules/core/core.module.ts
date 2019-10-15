import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from './services/authentication/authentication.service';
import { LoggerService } from './services/logger/logger.service';
import { HttpService } from './services/http/http.service';
import { HeaderComponent } from './components/header/header.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ModalComponent } from './components/modal/modal.component';
import { ListAccessibilityDirective } from './directives/list-accessibility/list-accessibility.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { NotificationComponent } from './components/notification/notification.component';
import { FooterComponent } from './components/footer/footer.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { MonthPickerComponent } from './components/month-picker/month-picker.component';
import { FormsModule } from '@angular/forms';
import { ExportModalComponent } from '../dashboard/components/export-modal/export-modal.component';
import { AccessibilityArrowDirective } from './directives/accessibility-arrow/accessibility-arrow.directive';
import { TableAccessiblityDirective } from './directives/table-accessiblity/table-accessiblity.directive';


@NgModule({
  declarations: [HeaderComponent, UserProfileComponent, ModalComponent, ListAccessibilityDirective,
       LoaderComponent, NotificationComponent, FooterComponent, TooltipComponent, MonthPickerComponent,
       ExportModalComponent,
       AccessibilityArrowDirective,
       TableAccessiblityDirective],
  imports: [
    CommonModule,
    FormsModule
  ],
  //providers: [AuthenticationService, LoggerService, HttpService],
  exports:[HeaderComponent, UserProfileComponent, LoaderComponent, FooterComponent, TooltipComponent, ModalComponent, NotificationComponent, MonthPickerComponent, AccessibilityArrowDirective, TableAccessiblityDirective],
  entryComponents: [ExportModalComponent]
})
export class CoreModule { }
