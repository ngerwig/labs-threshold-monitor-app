import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service';
import { HttpService } from 'src/app/modules/core/services/http/http.service';
import url from '../../../../config/api-url.config.json';
import constants from '../../../../config/constants.json';
import { Url } from 'src/environments/environment';
import { DataService } from '../../../core/services/data/data.service';
import { Subject } from 'rxjs';
import { TaxationDataService } from 'src/app/modules/dashboard/services/taxation-data/taxation-data.service';
import { DashboardService } from '../dashboard/dashboard.service.js';



@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  statesData: Array<object> = [];
  tempRegisteredStatesCodeData: Array<string> = [];
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  private currentUserSubject: BehaviorSubject<any>;
  private currentUserTokenSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  public dataSubject = new Subject<any>();
  public $dataSubject = this.dataSubject.asObservable();

  public tempDataSubject = new Subject<any>();
  public $tempDataSubject = this.tempDataSubject.asObservable();

  public allRegisteredStatesSubject = new Subject<any>();
  public $allRegisteredStatesSubject = this.allRegisteredStatesSubject.asObservable();

  constructor(private httpService: HttpService, 
    private loggerService: LoggerService,
    private http: HttpClient, 
    private dataService: DataService) {
    // get user details saved in local storage.
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public get currentUserToken(): any {
    return this.currentUserTokenSubject.value;
  }

  public get isUserSignedIn(): boolean {
    if (this.currentUserSubject.value) {
      return true;
    } else {
      return false;
    }
  }

  signin(userEmail: string, password: string): Observable<any> {
    const reqBody = {
      url: url.URLS.USER_LOGIN.SIGNIN,
      data: {
        userEmail: userEmail,
        password: password
      }
    }
    this.loggerService.logResponse(reqBody.data, "sign in req body");
    return this.http.post(Url.baseUrl + url.URLS.USER_LOGIN.SIGNIN, reqBody.data, { observe: 'response' }).
      pipe(map((response) => {
        const res: any = response.body;
        this.loggerService.logResponse(res, "sign-in ");
        if (res.is_success) {
          this.loggerService.logResponse(res, "sign-in success");

          localStorage.setItem('currentUser', JSON.stringify(res.data));
          //Get token from header or cookie.
          this.storeTokens({
            jwt: res.data.authToken.accessToken,
            refreshToken: res.data.authToken.refreshToken
          });

          this.currentUserSubject.next(res.data);
          
          return res.data.landingPageId;
          
          //return 200; // return 200 for successful sign in 
        } else {
          if (res.customErrorCode === constants.ERR_SIGN_IN_REGISTERED_BUT_EMAIL_NOT_VERIFIED || res.customErrorCode === constants.ERR_SIGN_IN_EMAIL_NOT_VERIFIED) {
            this.loggerService.logResponse("email not verified", "sign-in");
            return 201;
          } else {
            throw throwError(response);
          }
        }
      }, (err) => {
        this.loggerService.logResponse(err, "sign-in api response");
        return err;
      }));
    //   return user;
    // }));
  }

  signout() {
    // remove user from local storage to log user out
    return this.http.get(Url.baseUrl + url.URLS.USER_LOGOUT.LOGOUT, { observe: 'response' }).
    pipe(map((response)=>{
      this.removeUserSignInDetails();
    }, (err) => {
      this.loggerService.logResponse(err, "sign-out api error response");
      return err;
    }));
  }

  removeUserSignInDetails(){
    this.clearLocalStorage();
    this.currentUserSubject.next(null);
  }

  clearLocalStorage() {
    this.removeItem('currentUser');
    this.removeItem("dashboardLandingPage");
    this.removeItem('emailUpdateInProgress');
    this.removeTokens();
    localStorage.clear();
  }

  refreshToken() {
    let header = new HttpHeaders({ 'refreshToken': this.getRefreshToken() });
    return this.http.get<any>(`${Url.baseUrl}/refresh-token`, { headers: header }).pipe(tap((res) => {
      if(res.is_success){
        this.storeJwtToken(res.data.accessToken);
      }else{
        //Refresh token expired.
        this.refreshTokenExpired();
      }
    }),
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.refreshTokenExpired();
        return throwError(error);
      } else {
        return throwError(error);
      }
    }));
  }

  refreshTokenExpired(){
    this.removeUserSignInDetails();
    location.reload(true);
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  private storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeTokens(tokens) {
    localStorage.setItem(this.JWT_TOKEN, tokens.jwt);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }

  public getStates() {
    return this.currentUserValue.userProfile.registeredStates ? this.currentUserValue.userProfile.registeredStates : [];
  }

  public setStates(states) {
    this.currentUserValue.userProfile.registeredStates = states;
    // localStorage.setItem('currentUser', JSON.stringify(this.currentUserValue));
  }

  public updateUserCurrentObject(object) {
    this.currentUserSubject.next(object);
    localStorage.setItem('currentUser', JSON.stringify(object));
  }

  fetchTempRegisteredStates(): any {
    const body = {
      url: url.URLS.DASHBOARD.GET_REGISTERED_STATES_TEMP,
      param: new HttpParams().set('userId', this.currentUserValue.userId)
    };
    this.dataService.get(body).subscribe((res) => {
      if (res.body.is_success) {
        this.loggerService.logResponse(res, "getting states saved temporarily successfully");
        this.dataSubject.next(res.body.data.stateCodes);
      } else if (!res.body.is_success) {
        if (res.body.customErrorCode) {
          this.loggerService.logResponse(res, "failed to fetch registered states temporarily");
          this.tempDataSubject.next();
        }
      }
    }, (err) => {
      this.loggerService.logResponse(err, "Error in getting states saved temporarily");
    });
  }

  fetchAllRegisteredStates(): any {
    const body = {
      url: url.URLS.PROFILE.GET_REGISTERED_STATES,
      param: new HttpParams().set('userId', this.currentUserValue.userId)
    };
    this.dataService.get(body).subscribe((res) => {
      if (res.body.is_success) {
        this.loggerService.logResponse(res, "getting all registered states successfully");
        this.fetchTempRegisteredStates();
        this.allRegisteredStatesSubject.next(res.body.data.map((item) => { return item.stateCode }));
      } else if (!res.body.is_success) {
        if (res.body.customErrorCode)
          this.loggerService.logStatus("error fetching registered states","API returned custom error code");
      }
    }, (err) => {
      this.loggerService.logResponse(err, "Error in getting getting all registered states");
    });
  }

  removeItem(key){
    localStorage.removeItem(key);
  }
  getItem(key){
    return localStorage.getItem(key);
  }
  setItem(key,value){
    localStorage.setItem(key,value);
  }
}
