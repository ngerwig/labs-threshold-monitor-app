import { Injectable } from '@angular/core';

declare const window: any;

@Injectable({providedIn:'root'})
export class LoggerService {
  public env: string;

  constructor() {
    // this.env = 'dev';
  }

  logStatus(status: string, title?: string) {
    // if (
    //   this.env === 'dev' ||
    //   this.env === 'tricon-dev' ||
    //   window.enableLogs === true
    // ) {
      if (title) {
        console.log(title + ': ' + status);
      } else {
        console.log(status);
      }
      console.log(
        '*************************************************************'
      );
    // }
  }

  logResponse(res, description?: string) {
    // if (this.env === 'dev' || this.env === 'tricon-dev') {
      console.log(
        '-------------------------------------------------------------'
      );
      if (description) {
        console.log(description);
      }
      console.log(res);
      console.log('-------------------------------------------------------------');
    }
  // }
}
