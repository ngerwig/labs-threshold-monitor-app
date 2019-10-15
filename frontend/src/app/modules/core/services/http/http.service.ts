
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import * as _ from 'lodash';
import { throwError, of, Observable } from 'rxjs';
import { Url } from 'src/environments/environment';


interface RequestParam {
    url: string;
    param?: HttpParams;
    header?: object;
    data?: object;
}

@Injectable({providedIn:'root'})
export class HttpService {
    headers: object;
    public baseUrl;
    constructor(public http: HttpClient) {
        this.baseUrl = Url.baseUrl;
    }

    get(requestParam: RequestParam): Observable<any> {
        const httpOptions = {
            headers: (requestParam.header as any) ? (requestParam.header as any) : this.getHeader(),
        };
        return this.http.get(this.baseUrl + requestParam.url, { params : requestParam.param, observe: 'response' });
    }

    post(requestParam: RequestParam): Observable<any> {
        const httpOptions = {
            headers: (requestParam.header as any) ? (requestParam.header as any) : this.getHeader()
        };
        return this.http.post(this.baseUrl + requestParam.url, requestParam.data, httpOptions);
    }

    put(requestParam: RequestParam): Observable<any> {
        const httpOptions = {
            headers: (requestParam.header as any) ? (requestParam.header as any) : this.getHeader(),
            params: (requestParam.param as any)
        };
        return this.http.put(this.baseUrl + requestParam.url, requestParam.data, httpOptions);
    }

    patch(requestParam: RequestParam): Observable<any> {
        return this.http.patch(this.baseUrl + requestParam.url, requestParam.data);
    }

    delete(requestParam: RequestParam): Observable<any> {
        return this.http.delete(this.baseUrl + requestParam.url);
    }

    postMultiPartFile(requestParam: RequestParam): Observable<any> {
        return this.http.post(this.baseUrl + requestParam.url, requestParam.data);
    }

    private getHeader() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'X-Consumer-ID': 'X-Consumer-ID',
            // 'X-Device-ID': 'X-Device-ID',
            'ts': moment().format()
        };
    }
}
