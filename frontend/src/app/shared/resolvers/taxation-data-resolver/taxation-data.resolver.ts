import { Injectable } from '@angular/core';

import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SharedDataService } from '../../services/shared-data/shared-data.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';

@Injectable({ providedIn: 'root' })
export class TaxationDataResolver implements Resolve<any> {
    constructor(private apiService: SharedDataService, private dashboardService: DashboardService) { }

    resolve(route: ActivatedRouteSnapshot) {
        return this.dashboardService.userTaxationData();
    }
}
