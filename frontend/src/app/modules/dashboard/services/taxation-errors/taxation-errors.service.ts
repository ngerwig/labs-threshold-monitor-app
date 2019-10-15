import { Injectable } from '@angular/core';
import { TaxationDataService } from '../taxation-data/taxation-data.service';
import { RulesEngine } from '../rules-engine.service';

@Injectable({
  providedIn: 'root'
})
export class TaxationErrorsService {
  rules = [];

  constructor(private taxationDataService: TaxationDataService,private  ruleEngine :RulesEngine) {
    this.getRules();
   }
  getPatternError(data, dataKey, errorKey, msg){
    if(data[dataKey]){
      data[dataKey] = data[dataKey].toString();
      //let value = (data[dataKey].indexOf('$')) !== -1 ? data[dataKey].substring(1, data[dataKey].length).trim() : data[dataKey];
      let value;
      value = data[dataKey]//.toString().replace(/[$,\s]/g, "");
      if (value && (!this.taxationDataService.isInt(value) && dataKey === "transactionsValue") || (!this.taxationDataService.isFloat(value) && dataKey === "salesValue")){ 
        data.errors.fieldErrors[errorKey] = msg;
        //data[dataKey]="";
      }else
      delete data.errors.fieldErrors[errorKey];
    }else{
      delete data.errors.fieldErrors[errorKey];
    }
  }
  checkForRequiredCode(data, dataKey, errorKey, msg){
    if(!data[dataKey] ){//|| (data[dataKey] && dataKey === "salesValue" && data[dataKey].trim() === '$')
      data.errors.fieldErrors[errorKey] = msg;
    }else {
      delete data.errors.fieldErrors[errorKey];
    }
  }
  async getRules(){
    this.rules =  await this.ruleEngine.getRules();
  }
  getFieldErrorForSingleState(data, states){
    
   // this.rules = await this.ruleEngine.getRules().then((rules) => {
     if(!this.rules.length){
         this.getRules();
     }
      data.errors = data.errors ? data.errors : data.errors = {
        fieldErrors : {}
      };
      data.errors.measurementError = data.errors.measurementError ? data.errors.measurementError : "";
      this.checkForRequiredCode(data, "stateCode", "stateRequiredError", "State field is empty");
      this.checkForRequiredCode(data, "monthYear", "monthYearRequiredError", "Month field is empty");
      this.checkForRequiredCode(data, "salesValue", "salesValueRequiredError", "Sales value field is empty");
      this.getPatternError(data, "salesValue", "salesPatternError", "Sales Value must be an integer and/or decimal eg. 9989.02");
      this.getPatternError(data, "transactionsValue", "transactionsPatternError", "Transaction data must be an integer eg. 9989");
      this.getBillionError(data, "salesValue", "salesBillionError", "Sales value can’t exceed one billion");
      this.getBillionError(data, "transactionsValue", "transactionsBillionError", "Number of Transactions can’t exceed one billion");
      //this.checkForDuplicate(taxationData);
      this.checkForinvalidState(states, data);
      this.checkForinvalidDate(data);
      if(!data.errors.fieldErrors["inValidStateError"]){
        this.checkForWayfairMandate(data);
      }
      this.checkForTransactionRequiredFieldError(data);
      //this.getTotalErrorCount(data);
      return data;
      
    //});
  }
 
  checkForinvalidDate(data){
    if(data.monthYear){
      let monthYear = new Date(data.monthYear);
      let year = monthYear.getFullYear();
      //if(isNaN(year))
      if(isNaN(year)){
        data.errors.fieldErrors["inValidDateError"] = `Uploaded file contained invalid Month ${data.monthYear}. Month field must be Month Year format eg. Jan 2019`;
        data.monthYear= "";
      }else{
        delete data.errors.fieldErrors["inValidDateError"];
      }
    }else{
      delete data.errors.fieldErrors["inValidDateError"];
    }
  }
    checkForinvalidState(states, data){
      if(data.stateCode){
        let isInvalidState = states.find((state)=>{
            return  data.stateCode.toLowerCase() === state.stateCode.toLowerCase()
        });
        if(!(isInvalidState && isInvalidState.stateCode))
          data.errors.fieldErrors["inValidStateError"] = `Uploaded file contained invalid State (${data.stateCode}). State field must contain a valid state name or code eg. NJ/New Jersey`;
        else{
          delete data.errors.fieldErrors["inValidStateError"];
        }
      }else{
        delete data.errors.fieldErrors["inValidStateError"];
      }
    }
  getCountForFieldError(data){
    let fieldErrorsKeys = data.errors && data.errors.fieldErrors ? Object.keys(data.errors.fieldErrors) : [];
    return fieldErrorsKeys.length;
  }
  getErrorMessageText(data){
    let keys =  data.errors && data.errors.fieldErrors ? Object.keys(data.errors.fieldErrors) : [];
    let messageString = "";
    if(keys.length){
      for(let i=0; i< keys.length ; i ++ ){
        messageString += (data.errors.fieldErrors[keys[i]] + " ");
      }
    }
    if( data.errors && data.errors.measurementError)
    messageString += data.errors.measurementError;
    return messageString;
  }

  getErrorCount(data){
    let count = 0,
    fieldErrorsKeys = this.getCountForFieldError(data),
    measurementError = data.errors && data.errors.measurementError ? data.errors.measurementError : "";
    if(fieldErrorsKeys){
      count += fieldErrorsKeys;
    }if(measurementError)
      count += 1;
    return count;
  }
 
  getAllErrorForSingleState(data, rules, states, state?){
    this.rules = rules;
    let stateData = this.getFieldErrorForSingleState(data, states);
    /*if(state !== "init")
      this.taxationDataService._saveStatus.next(true);*/
    return stateData;
  }

  getBillionError(data, dataKey, errorKey, msg){
    if(data[dataKey]){
      data[dataKey] = data[dataKey].toString();
      let value = parseFloat(data[dataKey]);//.replace(/[$,\s]/g, ""));
      if (value && value > 1000000000)
        data.errors.fieldErrors[errorKey] = msg;
      else
      delete data.errors.fieldErrors[errorKey];
    }
  }

  checkForWayfairMandate(data){
    let isFound = false;
    let futureEffectiveDate = false;
    let hasThreshold = false;
    if(this.rules && this.rules.length){
      this.rules.forEach((state)=>{
        if(state.stateCode === data.stateCode){
          let date = new Date();
          date = new Date(date.getFullYear(),date.getMonth());
          let effectiveDate = new Date(state.effectiveDate);
          effectiveDate = new Date(effectiveDate.getFullYear(),effectiveDate.getMonth());
          if(date<effectiveDate){
            futureEffectiveDate = true;
          }
          if(state.salesTransaction.thresholdSales !== null || state.salesTransaction.thresholdTransactions !== null){
            hasThreshold = true;
          }
          if(!futureEffectiveDate && hasThreshold){
            isFound = true;
          }
        }else{

        }
      });
    }
    if(data.stateCode && !isFound){
      data.errors.fieldErrors = {};
      if(futureEffectiveDate){
        data.errors.fieldErrors["wayFair"] = "Wayfair mandate is not yet effective for the state you selected. Please delete or change the state.";
      }else if(!hasThreshold){
        data.errors.fieldErrors["wayFair"] = "The state you selected does not have a Wayfair mandate. Please delete or change the state.";
      }
    }else{
      delete data.errors.fieldErrors["wayFair"];
    }
  }

  //This function will check if transaction field is required
  // or not on the basis of rules
  checkForTransactionRequiredFieldError(data){
    if(!(data.errors && data.errors.fieldErrors && data.errors.fieldErrors["wayFair"]) && data.stateCode){
      delete data.errors.fieldErrors.transactionsValueRequiredError;
      delete data.errors.fieldErrors.zeroStateSalesValueError
      delete data.errors.fieldErrors.zeroStateTransactionValueError
      if(this.rules && this.rules.length){
        for(let i=0; i < this.rules.length; i ++){
          if((data.stateCode === this.rules[i].stateCode)){
            data.transactionTooltipRequired = true;
            if( this.rules[i].salesTransaction.transactionRequired){
              data.transactionTooltipRequired = false;
            if(!data.transactionsValue){
                data.transactionRequired = true;
                data.errors.fieldErrors.transactionsValueRequiredError = "Transaction field is empty";
                break;
              }else{ 
                data.transactionRequired = false;
              // break;
              }
            } 
            //if(!data.errors.fieldErrors.transactionsValueRequiredError){
              if(parseInt(data.salesValue, 10) === 0 && data.transactionsValue && parseInt(data.transactionsValue, 10) !== 0){
                data.errors.fieldErrors.zeroStateSalesValueError = "Sales value is required and can’t be 0";
                break;
              }else if(!data.errors.fieldErrors.transactionsValueRequiredError && data.salesValue && parseInt(data.salesValue, 10) !== 0 &&  parseInt(data.transactionsValue , 10) === 0){
                data.errors.fieldErrors.zeroStateTransactionValueError = "Transactions data  is required and can’t be 0";
                break;
              }
            //}
          }else{
            delete data.errors.fieldErrors.transactionsValueRequiredError;
            data.transactionRequired = false;
            delete data.errors.fieldErrors.zeroStateSalesValueError;
          }
        }
      }
    }else{
      data.transactionTooltipRequired = false;
    }
  }
}
