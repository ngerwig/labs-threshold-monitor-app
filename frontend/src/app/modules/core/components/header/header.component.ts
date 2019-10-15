import { Component, OnInit, OnChanges, SimpleChanges, Input, HostListener } from '@angular/core';
import { RoutingService } from '../../services/routing/routing.service';
import { Router, RouterStateSnapshot, NavigationStart } from '@angular/router';
import { ROUTE_PATHS as RouteConfig} from '../../../../config/route.config';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { TaxationDataService } from 'src/app/modules/dashboard/services/taxation-data/taxation-data.service';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { UtilityService } from '../../services/utility/utility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // routePath = ROUTE_PATHS;
  state : RouterStateSnapshot;
  logInStatus: boolean;
  userData;
  showList: boolean = false;
  navToggle: boolean = false;
  isProfileOpen: boolean = false;
  inAuthenicationState: boolean = false;
  constructor(private routingService: RoutingService,
    private dashBoardService: DashboardService,
    private utilityService: UtilityService, private router: Router, private authService: AuthenticationService, private taxationDataService: TaxationDataService) { 
    this.checkForAuthenticationUrl();
  }
  navigateToDashBoard(){
    this.dashBoardService.navigateToDashboardLandingPage();
    // if(!this.checkURLDashboard(this.router.url))
    //   this.routingService.goToPage(RouteConfig.DBRD.DASHBOARD);
  };
  navigateToStatesGuide(){
    if(!this.checkURLStateGuide())
      this.routingService.goToPage(RouteConfig.STATE_GUIDES);
  };
  navigateToContactUs() {
    this.routingService.goToContactUs();
  };
  showListItems(){
    this.showList=!this.showList
  };
  profileOpen(event){
    this.isProfileOpen = !this.isProfileOpen;
    event.stopPropagation();
  }

  ngOnInit() {
    this.state = this.router.routerState.snapshot;
    this.authService.currentUser.subscribe(userVal => {
      if (userVal && !this.state.url.includes('authentication')) {
        this.logInStatus = true;
        this.userData = userVal;
      } else {
        this.logInStatus = false;
      }
    });
   }
  public checkForAuthenticationUrl(){
    this.router.events
    .subscribe((event:NavigationStart) => {
      if(event instanceof NavigationStart){
        if(event.url.includes('authentication')){
          this.inAuthenicationState = true;
        }else{
          this.inAuthenicationState = false;
        }
      }
    });
  }
  public logout() {
    this.authService.signout().subscribe((response)=>{
      this.taxationDataService._saveStatus.next(false);
      this.dashBoardService.setTaxData([]);
      this.dashBoardService.setUserImportedData([]);
      this.dashBoardService.setUserImportedData([]);
      this.routingService.goToPage(`${RouteConfig.AUTH.AUTHENTICATION}`);
    });
  }
  public gotoProfile() {
    this.routingService.goToPage(`${RouteConfig.PRFL.PROFILE}`);
  }

  public toggleListItems(event: Event){	
    this.showList = !this.showList;	
    event.stopPropagation();	
  }	

  @HostListener('document:click', ['$event'])outsideClick(event){	
    this.showList = false;	
    this.navToggle = false;
    this.isProfileOpen = false;
  }
  closeMenus(){	
    this.showList = false;	
    this.navToggle = false;
    this.isProfileOpen = false;
    this.utilityService.putFocusOnElementOnNavigation("profile-icon");
  }

  navbarToggle(event) {
    this.navToggle = !this.navToggle; 
    this.isProfileOpen = false;
    event.stopPropagation();
  }
  checkURLDashboard(){
    if(this.router.url.includes(`/${RouteConfig.DBRD.DASHBOARD}`)) {
      return  true;
    }return false;
  }
  checkURLStateGuide(){
    if(this.router.url===(`/${RouteConfig.STATE_GUIDES}`)) {
      return true;
    }return false;
  }
  checkURLProfile(){
    if(this.router.url.includes(`/${RouteConfig.PRFL.PROFILE}`)) {
      return true;
    }return false;
  }

}
