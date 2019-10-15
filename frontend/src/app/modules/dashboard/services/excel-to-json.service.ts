import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ExcelToJson{
    constructor(){ }

     readFile = (blob: Blob): Observable<string> => Observable.create(obs => {
        if (!(blob instanceof Blob)) {
          obs.error(new Error('`blob` must be an instance of File or Blob.'));
          return;
        }
      
        const reader = new FileReader();
      
        reader.onerror = err => obs.error(err);
        reader.onabort = err => obs.error(err);
        reader.onload = () => obs.next(reader.result);
        reader.onloadend = () => obs.complete();
      
        return reader.readAsText(blob);
      });

    convert(file):Observable<any>{
        return Observable.create(obs=>{
            let workBook = null;
            let jsonData = null;
            const reader = new FileReader();
            let rABS = !!reader.readAsBinaryString;

            reader.onerror = err => obs.error(err);
            reader.onabort = err => obs.error(err);
            reader.onload = (event) => {
                const data = reader.result;
                try{
                    workBook = XLSX.read(data, {type: rABS ? 'binary' : 'array', raw: true});
                    workBook.SheetNames.length = workBook.SheetNames.length>1?1:workBook.SheetNames.length;
                    jsonData = workBook.SheetNames.reduce((initial, name) => {
                        const sheet = workBook.Sheets[name];
                        initial['sheet1'] = XLSX.utils.sheet_to_json(sheet, {header:["monthYear","stateCode","transactionsValue","salesValue"], range:1, raw:false});
                        return initial;
                    }, {});
                    const dataString = JSON.stringify(jsonData);
                    jsonData = jsonData['sheet1'];
                    if(jsonData == undefined || jsonData == null){
                        jsonData = [];
                    }
                    obs.next(jsonData);
                }catch(e){
                    obs.error(e);
                }
             };
            reader.onloadend = () => obs.complete();
            if(rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
            return;// reader.readAsBinaryString(file);
        });        
    }
}