import { Component, OnInit } from '@angular/core';
import { RoutingService } from '../../../core/services/routing/routing.service';
import { ROUTE_PATHS as RouteConfig } from '../../../../config/route.config';
import { Router, NavigationExtras } from "@angular/router";
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import consts from '../../../../config/constants.json';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import constants from '../../../../config/constants.json';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';

@Component({
  selector: 'vtx-add-taxation-data',
  templateUrl: './add-taxation-data.component.html',
  styleUrls: ['./add-taxation-data.component.scss']
})
export class AddTaxationDataComponent implements OnInit {
  showDownloadNotification: Boolean = true;
  disableInfoIcon: boolean = true;
  showNotificationBox: boolean = true;
  consts = constants;

  constructor(private routingService: RoutingService,
    private utilityService: UtilityService, 
    private router: Router, 
    private dashboardService: DashboardService,
    private authenticationService : AuthenticationService) { }

  ngOnInit() {
    //this.dashboardService.navigateToDashboardLandingPage();
  }

  navigateToImportData() {
    this.routingService.goToPage(`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.IMPORT_DATA}`);
  }
  navigateToTaxationData() {
    // this.routingService.goToPage(`/${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.TAXATION_DATA}`);
    this.dashboardService.setTaxData([]);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "title": "add"
      }
    };
    this.router.navigateByUrl(
      this.router.createUrlTree(
        [`${RouteConfig.DBRD.DASHBOARD}/${RouteConfig.DBRD.TAXATION_DATA}`], navigationExtras
      )
    );
  }
  navigateToStatesGuide(event?){
    event.stopPropagation();
    this.routingService.goToPage(`${RouteConfig.STATE_GUIDES}`);
    this.authenticationService.setItem("dashboardLandingPage","ZERO_STATE_PAGE");
  }

  infoIconFunction(event){
    event.target.blur();
    this.disableInfoIcon = false;
    this.showNotificationBox = false;
    this.utilityService.putFocusOnElementOnNavigation("tax-notification-icon");
    //document.getElementById("tax-notification-icon").focus();
  }

  showNotification(event){
    event.stopPropagation();
    this.disableInfoIcon = true;
    this.showNotificationBox = true;
    this.utilityService.putFocusOnElementOnNavigation("notification__inner");
    //this.utilityService.putFocusOnElementOnNavigation("notification-wrapper");
  }

}
