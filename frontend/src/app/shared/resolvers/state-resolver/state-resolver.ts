import { Injectable } from '@angular/core'

import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SharedDataService } from '../../services/shared-data/shared-data.service';

@Injectable({providedIn: 'root'})
export class StateResolver implements Resolve<any> {
  constructor(private apiService: SharedDataService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.apiService.fetchAllStates();
  }
}