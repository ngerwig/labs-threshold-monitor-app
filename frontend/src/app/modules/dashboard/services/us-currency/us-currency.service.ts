import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsCurrencyService {

  constructor() { }
  formatNumber(n, isDecimal?) {
    if(isDecimal){
      n = n.replace(/\D/g, "");
      let decimal = (n!="") ? parseFloat("." + n).toPrecision(2) : "";
      return decimal.toString().replace(/0\./g, "");

    }
    // format number 1000000 to 1,234,567
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  formatToOriginol(data){
    return data.replace(/[$,\s]/g, "");
  }
  
   formatCurrency(value, blur?) {
     if(value){
    // appends $ to value, validates decimal side
    // and puts cursor back in right position.
    
    // get input value
    //let input_val = input.value;
    let input_val = value;
    // don't validate empty input
    if (input_val === "") { return; }
    
    // original length
    let original_len = input_val.length;
  
    // initial caret position 
    //let caret_pos = input.prop("selectionStart");
      
    // check for decimal
    if (input_val.indexOf(".") >= 1) {
  
      // get position of first decimal
      // this prevents multiple decimals from
      // being entered
      let decimal_pos = input_val.indexOf(".");
  
      // split number by decimal point
      let left_side = input_val.substring(0, decimal_pos);
      let right_side = input_val.substring(decimal_pos+1);
  
      // add commas to left side of number
      left_side = this.formatNumber(left_side);
  
      // validate right side
      right_side = this.formatNumber(right_side, true);
      
      // On blur make sure 2 numbers after decimal
      /* if (blur === "blur") {
        right_side += "00";
      } */
      
      // Limit decimal to only 2 digits
      right_side = right_side.substring(0, 2);
  
      // join number by .
      if(right_side){
        input_val = "$ " + left_side + "." + right_side;
      }else{
        input_val = "$ " + left_side ;
      }
      
  
    } else {
      // no decimal entered
      // add commas to number
      // remove all non-digits
      input_val = this.formatNumber(input_val);
      input_val = "$ " + input_val;
      
      // final formatting
      /* if (blur === "blur") {
        input_val += ".00";
      } */
    }
    
    // send updated string to input
    //input.value = (input_val);
   // data.salesValue = input_val;
    return input_val;
  }
  return "";
    // put caret back in the right position
    /* var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos); */
  }
}
