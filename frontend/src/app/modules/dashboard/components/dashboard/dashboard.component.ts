import { Component, OnInit } from '@angular/core';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';


@Component({
  selector: 'vtx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  userData;
  templateForm = this.fb.group({
    fileType: ['', Validators.required]
  });


  constructor(private loggerService: LoggerService,
    private dashBoardService : DashboardService, private fb: FormBuilder, private authService: AuthenticationService) {
    this.authService.currentUser.subscribe(userVal => {
      if (userVal) {
        this.userData = userVal;
        this.authService.allRegisteredStatesSubject.next(userVal.userProfile.registeredStates);
      }
    });
  }

  ngOnInit() {
    this.dashBoardService.navigateToDashboardLandingPage();

  }

}
