import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';
import { filter, buffer, distinctUntilChanged } from 'rxjs/operators';
import moment from 'moment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  focusElementSubject = new Subject();
  firstFocusableElementId: string;
  constructor(private router: Router,private route: ActivatedRoute) {
    //this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      //this.putFocusOnElementOnNavigation();
    //});
   }
  putFocusOnElementOnNavigation(elementId){   
    setTimeout(()=>{
      let element =  document.getElementById(`${elementId}`);
      if(element){
        element.focus();
      }
    })
  }
  focusOnFirstInvalidInput() {
    setTimeout(() => {
      let invalidFields = [].slice.call(document.getElementsByClassName('ng-invalid'));
      if (invalidFields.length)
        invalidFields[1].focus();
    }, 0)
  }
  sortBy(dataArray, field: string) {
    dataArray.sort((a: any, b: any) => {
        if (a[field] < b[field]) {
            return -1;
        } else if (a[field] > b[field]) {
            return 1;
        } else {
            return 0;
        }
    });
    return dataArray;
}

  focusOnElement(elementId) {
    let element = document.getElementById(`${elementId}`);
    if (elementId && element) {
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        element.focus();
      });
    }
  }
  getQueryParam(router, prevUrl){
   /*  this.route.queryParams.subscribe(params => {
      return params[key]; */
     // this.param2 = params['param2'];
  //});
  this.router.events.pipe(distinctUntilChanged((previous: any, current: any) => {
    if (current instanceof NavigationStart) {
                    return previous.url === current.url;
                }
  })).subscribe((e)=>{
  });
  }
  scrollTop() {
    window.scrollTo(0, 0);
  }

  isArrayEmpty(array) {
    if (typeof array !== 'undefined' && array.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  isObjectEmpty(object) {
    if (object && Object.keys(object).length === 0 && object.constructor === Object) {
      return true;
    } else return false;
  }

  formatDate(date) {
    let monthFormatArray = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let month = +moment(date, 'yyyy-mm').format('mm'); // '+' to convert string to integer
    let formattedDate = `${monthFormatArray[month - 1]} ${moment(date).format('YYYY')}`
    return formattedDate;
  }

  digitFormatter(amount, currency?) {
    let formattedAmount;
    let negativeSign = amount<0 ? '-' : '';
    if (currency) {
      let i = (parseInt(amount = Math.abs(Number(amount) || 0).toFixed(2)).toString());
      let j = (i.length > 3) ? i.length % 3 : 0;
      currency = currency ? currency : '';
      formattedAmount = currency + " " + negativeSign + (j ? i.substr(0, j) + ',' : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ',') + '.' + Math.abs(amount - +i).toFixed(2).slice(2);
    } else {
      let i = (parseInt(amount = Math.abs(Number(amount) || 0).toFixed(0)).toString());
      let j = (i.length > 3) ? i.length % 3 : 0;
      formattedAmount = negativeSign + (j ? i.substr(0, j) + ',' : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ',');
    }
    return formattedAmount;

  };

  formatThresholdStatus(status) {
    if (status == "NOT_AVAILABLE") {
      return "NA";
    }
    let string = status.toLowerCase().replace("_", " ");
    return string[0].toUpperCase() +
      string.slice(1);
  }
}
