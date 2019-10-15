import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uSCurrency'
})
export class USCurrencyPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let sales = value ?value .trim():"";
    if(sales && !(sales.indexOf('$') !== -1)){
      sales = Math.round(parseFloat(sales));
      return `$ ${sales}`;
    }
    else if((sales === '$')){
      return '';
    }
    
    return sales;
  }

}
