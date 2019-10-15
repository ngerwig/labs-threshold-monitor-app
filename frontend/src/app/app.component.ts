import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoggerService } from './modules/core/services/logger/logger.service';
import { LoaderService } from './modules/core/services/loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy{
  title = 'vertex-tax-monitoring-ui';
  currentPath:string ='';
  routerSubscriprtion;
  // events;
  constructor(private router:Router, private loggerService: LoggerService, private activatedRoute : ActivatedRoute, private loaderService: LoaderService){ 
    // this.events=this.router.events.subscribe((event: Event) => {
    this.routerSubscriprtion  = this.router.events.subscribe((event: Event) => {
      if(event instanceof NavigationStart){
        this.loaderService.show();
        // window.scrollTo(0, 0);
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError){
        this.loaderService.hide();
      }
      if (event instanceof NavigationEnd) {
        this.currentPath=this.router.url;
      }});        
  }
  ngOnDestroy(){
    // if(this.events){
    //   this.events.unsubscribe();
    // }
    this.routerSubscriprtion.unsubscribe();
  }

}


