import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpEvent,
    HttpResponse,
    HttpHeaders,
    HttpParams,
    HttpErrorResponse
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { tap, retry, catchError, switchMap, filter, take, finalize } from "rxjs/operators";
import { AuthenticationService } from '../services/authentication/authentication.service';
import { LoaderService } from '../services/loader/loader.service';

@Injectable({
    providedIn: "root"
})
export class Interceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private authenticationService: AuthenticationService, public loaderService: LoaderService) {}

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);
      
          return this.authenticationService.refreshToken().pipe(
            switchMap((res: any) => {
              this.isRefreshing = false;
              this.refreshTokenSubject.next(res.data.accessToken);
              return next.handle(this.addToken(request, res.data.accessToken));
            }));
      
        } else {
          return this.refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
              return next.handle(this.addToken(request, jwt));
            }));
        }
      }

    handleError(error: HttpErrorResponse) {
        if (error.status === 401) {
            // auto logout if 401 response returned from api
            this.authenticationService.removeUserSignInDetails();
            location.reload(true);
        }
        return throwError(error);
    }

    intercept( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
        if (this.authenticationService.getJwtToken() && req.url.indexOf('refresh-token') === -1) {
            req = this.addToken(req, this.authenticationService.getJwtToken());
        }
        this.loaderService.show();
        return next.handle(req).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                  return this.handle401Error(req, next);
                } else {
                  return throwError(error);
                }
            }),
            finalize(() => this.loaderService.hide())
        );
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`
          }
     });
    }
}