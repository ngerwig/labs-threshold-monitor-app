import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AuthenticationService } from 'src/app/modules/core/services/authentication/authentication.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import Chart from 'chart.js';
import { Label } from 'ng2-charts';
import 'chartjs-plugin-labels';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { UtilityService } from 'src/app/modules/core/services/utility/utility.service';
import { DashboardService } from 'src/app/modules/core/services/dashboard/dashboard.service';
import { RulesEngine } from '../../services/rules-engine.service';
import { Subscription } from 'rxjs';
import Constants from '../../../../config/constants.json';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { LoaderService } from 'src/app/modules/core/services/loader/loader.service';
declare var $;
import { Url } from 'src/environments/environment';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
@Component({
  selector: 'vtx-export-to-pdf',
  templateUrl: './export-to-pdf.component.html',
  styleUrls: ['./export-to-pdf.component.scss']
})
export class ExportToPdfComponent implements OnInit, AfterViewInit, OnDestroy {
  public baseUrl;
  // graph
  constants = Constants;
  currentSelectedStateTaxData;
  currentSelectedStateTaxationDataSubject;

  public taxationData;
  public emailId: string;
  public userName: string;
  public nearingPercent;
  public safePercent;
  public crossedPercent;
  public userData;
  public ruleData;
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    elements: {
      arc: {
        borderWidth: 4
      }
    },
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      xAxes: [{
        display: false
      }], yAxes: [{
        display: false
      }]
    },
    layout: {
      padding: {
        left: 50,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    legend: {
      display: false,
    },
    plugins: {
      labels: {
        render: 'percentage',
      },
      datalabels: {
        color: 'white',
        labels: {
          title: {
            font: {
              size: 15,
              weight: 'bold',
            }
          }
        },
        formatter: function(value, ctx) {
          /*var sum = 0;
          var dataArr:any = ctx.chart.data.datasets[0].data;
           dataArr.map(data => {
              sum += data;
          });
          var percentage = (value*100 / sum).toFixed(2)+"%";*/
          var percentage = '';
          if(value != 0){
            percentage = value + '%';
          }
          return percentage;
        }
      }
    }
  };
  public barChartLabels: Label[] = ['Nearing', 'Safe', 'Crossed'];
  public barChartType: ChartType = 'pie';
  public barChartPlugins = [pluginDataLabels];
  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Report' }
  ];
  public pieChartColors: Array<any> = [{
    backgroundColor: ['#d47500', '#008a00', '#ff4613']
  }];
  public allStates: Array<object> = [];
  public registeredStatesCodes: Array<string> = [];
  public selectedStates: Array<string> = [];
  public allRegisteredStates: Array<string> = [];
  private allRegisteredStatesSubjectSubscription: Subscription;
  public thresholdCount: object = {
    THRESHOLD_CROSSED: '',
    THRESHOLD_NEARING: '',
    THRESHOLD_SAFE: ''
  };
  public routeDataSubscriber;

  constructor(private authService: AuthenticationService, private utilityService: UtilityService,
    private dashboardService: DashboardService, private ruleService: RulesEngine,
    private loggerService: LoggerService, private activatedRoute: ActivatedRoute,
    public activeModal: NgbActiveModal, private loaderService: LoaderService) {
    this.baseUrl = Url.clientUrl;
    this.currentSelectedStateTaxationDataSubject = this.dashboardService.currentSelectedStateTaxationDataSubject;
    this.currentSelectedStateTaxationDataSubject.subscribe((value) => {
      this.currentSelectedStateTaxData = value;
    });
    this.authService.currentUser.subscribe(userVal => {
      if (userVal) {
        this.userData = userVal;
        this.emailId = this.userData.userProfile.email;
        this.userName = this.userData.userProfile.name;
      }
    });
  }

  ngOnInit() {
    this.getAllTaxationData();
    this.getRulesData();
    this.authService.fetchAllRegisteredStates();
    this.allRegisteredStates = this.dashboardService.allRegisteredStates;
    this.allRegisteredStatesSubjectSubscription = this.authService.$allRegisteredStatesSubject.subscribe(val => {
      this.selectedStates = val;
    });
    this.allStates = this.authService.currentUserValue.allStates;

    if (this.taxationData) {
      this.taxationData['taxData'] = this.taxationData.taxData.filter(function (obj) {
        return obj.thresholdStatus !== 'NOT_AVAILABLE';
      });
      this.taxationData['taxData'] = this.taxationData['taxData'].filter(item =>
        this.allRegisteredStates.indexOf(item.state.stateCode) == -1
      );
      this.thresholdCount = this.taxationData.taxData.reduce((p, c) => {
        var name = c.thresholdStatus;
        if (!p.hasOwnProperty(name)) {
          p[name] = 0;
        }
        p[name]++;
        return p;
      }, {});


      this.nearingPercent = this.thresholdCount['THRESHOLD_NEARING'] ?
        ((this.thresholdCount['THRESHOLD_NEARING'] / this.taxationData.taxData.length) * 100) : 0;
      this.safePercent = this.thresholdCount['THRESHOLD_SAFE'] ?
        ((this.thresholdCount['THRESHOLD_SAFE'] / this.taxationData.taxData.length) * 100) : 0;
      this.crossedPercent = this.thresholdCount['THRESHOLD_CROSSED'] ?
        ((this.thresholdCount['THRESHOLD_CROSSED'] / this.taxationData.taxData.length) * 100) : 0;
    }
    this.barChartData = [
      { data: [Math.round(this.nearingPercent), Math.round(this.safePercent), Math.round(this.crossedPercent)], label: 'Report' }
    ];
  }

  ngAfterViewInit() {
  }

  typecheck(val) {
    if (this.selectedStates && this.selectedStates.length) {
      return this.selectedStates.includes(val);
    } else {
      return false;
    }
  }

  getAllTaxationData() {
    this.loggerService.logResponse(this.activatedRoute.snapshot.data);
    this.routeDataSubscriber = this.activatedRoute.data.subscribe((res) => {
      this.taxationData = res.taxationData;
    });
    this.loggerService.logResponse(this.taxationData, '----- tax data from export------');
  }

  async getRulesData() {
    this.ruleData = await this.dashboardService.getRulesData();
    const mergeById = (a1, a2) =>
      a1.map(item1 => ({
        ...a2.find((item2) => (item2.stateCode === item1.state.stateCode)
          && item2), ...item1
      }));
    const newData = mergeById(this.taxationData.taxData, this.ruleData);
    this.taxationData.taxData = newData;
  }

  setGraphValues(actualValue, thresholdValue) {
    actualValue = +actualValue;
    thresholdValue = +thresholdValue;
    /* this function calculates widtth of graph bar and treshold indicator line
      takes actual value and threshold value and sets uses max width of the graph to calculate points
      @params actualValue : number - actual value of a state
      @params thresholdValue : number - threshold value of a state
    */
    let graphBarWidth = '0%';
    let thresholdIndicatorPosition = '0%';
    let thresholdIndicatorLabelPosition = '0%';
    let limitCrossed = false;
    let yAxisPosition = '0%';
    let isActualValueNegative = actualValue < 0 ? true : false;
    // actualValue = Math.abs(actualValue);
    if (actualValue > thresholdValue) {
      graphBarWidth = '100%';
      thresholdIndicatorPosition = Math.floor((thresholdValue * 100) / actualValue) + '%';
      thresholdIndicatorLabelPosition = Math.floor((thresholdValue * 64) / actualValue) + '%';
      limitCrossed = true;
    } else {
      graphBarWidth = Math.abs(Math.floor((actualValue * 100) / thresholdValue)) + '%';
      thresholdIndicatorPosition = '100%';
      thresholdIndicatorLabelPosition = '64%';
      if (isActualValueNegative) {
        actualValue = Math.abs(actualValue);
        graphBarWidth = ((actualValue * 100) / (actualValue + thresholdValue)) + '%';
        yAxisPosition = graphBarWidth;
      }
      if ((parseInt(graphBarWidth.split('%')[0])) > 50) {
        limitCrossed = true;
      }
    }
    return { graphBarWidth, thresholdIndicatorPosition, limitCrossed, thresholdIndicatorLabelPosition, yAxisPosition };
  }

  formatDate(date) {
    return this.utilityService.formatDate(date);
  }

  formatSales(value, currency?) {
    return this.utilityService.digitFormatter(value, currency);
  }

  // addCssToMap() {
  // var props = ["fill", "stroke", "stroke-width", "stroke-linejoin", "outline"]

  // document.querySelectorAll(".states-map-pdf g, .states-map-pdf polyline").forEach(function (item, index) {
  //   if (!item.classList.contains('state-sales-tax-map__state')) {
  //     var cstyle = getComputedStyle(item);
  //     props.forEach(function (prop) {
  //       item.setAttribute(prop, cstyle[prop]);
  //     });
  //     item.removeAttribute("class");
  //   }//.toBase64Image();
  // });
  // }

  public closeModal() {
    document.body.classList.remove('pdf-report-modalOpen');
  }

  ngOnDestroy() {
    this.allRegisteredStatesSubjectSubscription.unsubscribe();
  }

}
