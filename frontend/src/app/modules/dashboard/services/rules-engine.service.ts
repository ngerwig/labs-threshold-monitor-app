import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Url } from 'src/environments/environment';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum ThresholdStatus{
    CROSSED = "THRESHOLD_CROSSED",
    NEARING = "THRESHOLD_NEARING",
    SAFE = "THRESHOLD_SAFE",
    NA = "NOT_AVAILABLE"
}

enum ErrorMessage{
    DATA_NOT_FOUND = "Data found isn’t within the Threshold measurement period. To continue, upload data for the correct Threshold Measurement Period identified in the state’s rules and regulations. You can also update data on this page.",
    CURRENT_AND_PREV = "The Threshold Measurement Period requires data to be uploaded from previous and current calendar years. To continue. upload data for current and previous years or directly add data on this page."
}

@Injectable({ providedIn: 'root' })
export class RulesEngine{

    private ruleSet: Array<any>;
    private nearingValue = '';
    private registeredStates:Array<any>;

    constructor(private http:HttpClient){
        //Call api to get rule set.
        
    }

    private fetchRules(){
        return this.http.get(`${Url.baseUrl}/rules/threshold-policy`).toPromise();/* .subscribe(
            (res:any)=>{
                if(res.is_success){
                    this.ruleSet = res.data;
                    //return res;
                }else{
                    //Rule set loading failed. 
                }
            },
            (error)=>{
                //Rule set loading failed.
            }
        ); */
    }

    async getRules(){
        if(!this.ruleSet){
            let result:any = await this.fetchRules();
            if(result.is_success){
                this.ruleSet = result.data;
                return this.ruleSet;
            }else{
                return ;
                //Rule set loading failed. 
            }
        }else{
            return this.ruleSet;
        }
       
    }

    public monthMap = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    

    run(data: Array<any>, nearingValue, registeredStates: Array<any>){
        let result = [];
        this.registeredStates = (registeredStates)?registeredStates:[];
        this.nearingValue = (nearingValue)?nearingValue:80;
        for(let state of this.ruleSet){
            let matchingStatesData = data.filter((row :any)=> row.stateCode===state.stateCode);
            if(matchingStatesData.length){
                let dataAfterStateRules  = null;
                if(state.is_calendar_year && state.calendarYear.current && state.calendarYear.prior){
                    dataAfterStateRules = this.runPreviousCurrentCalendarYear(matchingStatesData, state);
                } else if(state.is_calendar_year && state.calendarYear.prior && !state.calendarYear.current){
                    dataAfterStateRules = this.runPreviousCalendarYear(matchingStatesData, state);
                }else if(state.is_prior_duration){
                    dataAfterStateRules = this.runPreviousMonths(matchingStatesData, state);
                }else if(state.is_prior_ending_month){
                    dataAfterStateRules = this.runPreviousMonthsWithEndingDate(matchingStatesData, state);
                }else if(state.is_quarter){
                    dataAfterStateRules = this.runPreviousQuarters(matchingStatesData, state);
                }else if(state.is_federal_year){
                    //This is for wisconsin state.
                    dataAfterStateRules = this.runPreviousCurrentCalendarYear(matchingStatesData, state);
                }
                
                if(dataAfterStateRules){
                    result = [ ...result, ...dataAfterStateRules];
                }
            }
        }

        //check for errors in the result
        let resultWithErrors = result.filter((row)=>{
            if(row.errors && row.errors.measurementError){
                return true;
            }
        });

        if(resultWithErrors.length){
            return {
                data: resultWithErrors,
                hasError: true
            }
        }else{
            return {
                data: result,
                hasError: false
            }
        }
    }

    getUpdatedStatus(data: Array<any>, nearingValue, registeredStates: Array<any>){
        this.registeredStates = (registeredStates)?registeredStates:[];
        this.nearingValue = (nearingValue)?nearingValue:80;
        data.forEach(item=>{
            let stateCode = item.state.stateCode;
            let totalSales = item.totalUserSalesValue;
            let totalTransactions = item.totalUserTransactionsValue;
            let stateRules;
            for(let state of this.ruleSet){
                if(stateCode===state.stateCode){
                    stateRules = state;
                    break;
                }
            }
            if(stateRules){
                let updatedStatus = this.thresholdStatusOfData(stateRules,{totalSales,totalTransactions});
                this.registeredStates.forEach((stateCode)=>{
                    if(stateCode === stateRules.stateCode){
                        updatedStatus = ThresholdStatus.NA;
                    }
                });
                item.thresholdStatus = updatedStatus;
            }
        });
        return data;
    }

    /* get the start and end moths from the provided list*/
    private getStartAndEndMonth(monthsList){
        monthsList = monthsList.sort((a,b)=>a - b);
        let mpStart = monthsList[0];
        let mpEnd = monthsList[monthsList.length-1];

        mpStart = ''+(mpStart.getFullYear())+'-'+ this.getMonth(mpStart);
        mpEnd = ''+(mpEnd.getFullYear())+'-'+ this.getMonth(mpEnd);

        return {
            "startMonth": mpStart,
            "endMonth": mpEnd
        }
    }

    private getMonth(date){
        let month = date.getMonth()+1;
        return month = ''+((month<10)?('0'+month):month);
    }

    private thresholdDataWithStatus(thresholdStatus, state, taxationPeriod, totals, data){
        //Check state is registered or not.
        this.registeredStates.forEach((stateCode)=>{
            if(stateCode === state.stateCode){
                thresholdStatus = ThresholdStatus.NA;
            }
        });
        data = data.map((dataRow)=>{
            return {
                "taxMonth": dataRow.monthYear,
                "salesValue": dataRow.salesValue,
                "transactionsValue": dataRow.transactionsValue
              }
        });
       return [
           {
                thresholdStatus,
                state: {
                    'stateCode': state.stateCode
                },
                totalUserSalesValue: totals.totalSales,
                totalUserTransactionsValue: totals.totalTransactions,
                periodWiseValues: data,
                taxationPeriod
           }
       ];
    }

    private thresholdStatusOfData(state, totals){
        let thresholdSalesAmount = parseInt(state.salesTransaction.thresholdSales);
        let thresholdTransactionsValue = parseInt(state.salesTransaction.thresholdTransactions);
        let bothRequired = state.salesTransaction.bothRequired;
        let transactionRequired = state.salesTransaction.transactionRequired;
        let nearingValue = parseInt(this.nearingValue)/100;
        if(bothRequired){
            //Threshold calculation if sales and transaction are required and both the values crosses threshold.
            if(totals.totalSales > thresholdSalesAmount && totals.totalTransactions > thresholdTransactionsValue){
                //Threshold crossed for measurement period.
                return ThresholdStatus.CROSSED;
            }else if(totals.totalSales > (thresholdSalesAmount*nearingValue) && totals.totalTransactions > (thresholdTransactionsValue*nearingValue)){
                //Threshold nearing for measurement period.
                return ThresholdStatus.NEARING;
            }else{
                //Threshold safe for measurement period.
                return ThresholdStatus.SAFE;
            }

        }else if(!transactionRequired){
            //Threshold calculation if transaction is optional and sales crosses the threshold.
            if(totals.totalSales > thresholdSalesAmount ){
                //Threshold crossed for measurement period.
                return ThresholdStatus.CROSSED;
            }else if(totals.totalSales > (thresholdSalesAmount*nearingValue)){
                //Threshold nearing for measurement period.
                return ThresholdStatus.NEARING;
            }else{
                //Threshold safe for measurement period.
                return ThresholdStatus.SAFE;
            }
        }else{
            //Threshold calculation if sales and transaction is required and any one of the value crosses the threshold.
            if(totals.totalSales > thresholdSalesAmount || totals.totalTransactions > thresholdTransactionsValue){
                //Threshold crossed for measurement period.
                return ThresholdStatus.CROSSED;
            }else if(totals.totalSales > (thresholdSalesAmount*nearingValue) || totals.totalTransactions > (thresholdTransactionsValue*nearingValue)){
                //Threshold nearing for measurement period.
                return ThresholdStatus.NEARING;
            }else{
                //Threshold safe for measurement period.
                return ThresholdStatus.SAFE;
            }
        }
        
    }

    private stateDataWithErrors(stateData, errorMessage){
        return stateData.map((row)=>{
            row.errors = row.errors ? row.errors : {};
            row.errors.measurementError = errorMessage;
            return row;
        });
    }

    private getTotals(data){
        return data.reduce((totals, row)=>{
            totals.totalSales += parseFloat(row.salesValue);
            totals.totalTransactions += parseInt(row.transactionsValue);
            return totals
        },{totalSales: 0, totalTransactions: 0});
    }

    public getDateFromString(dateStr){
        let date = new Date(dateStr);
        date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
        return date;
    }

    private runPreviousCurrentCalendarYear(stateDataPassed, state){
        //filter state data which are from current and previous year.
        let effectiveDate = this.getDateFromString(state.effectiveDate);
        let stateData = stateDataPassed.filter((row)=>{
            let transactionDate = this.getDateFromString(row.monthYear);
            let transactionYear = transactionDate.getFullYear();
            let currentYear = new Date().getFullYear();
            return (/*transactionDate >= effectiveDate 
                && */(transactionYear === currentYear || transactionYear === currentYear -1)
                )?true:false;
        });
        //If there are no records within the threshold period.
        if(stateData.length == 0){
            return this.stateDataWithErrors(stateDataPassed, ErrorMessage.DATA_NOT_FOUND); 
        }else{
            //Calculating measurement period.
            let thresholdSalesAmount = state.salesTransaction.thresholdSales;
            let thresholdTransactionsValue = state.salesTransaction.thresholdTransactions;

            let currentYear = new Date().getFullYear();

            //Check previous year data.
            let previousYearDataMonths = [];
            let previousYearData = stateData.filter((row)=>{
                if(row.monthYear){
                    let tansactionYear = this.getDateFromString(row.monthYear).getFullYear();
                    
                    if((tansactionYear === (currentYear - 1))){
                        previousYearDataMonths.push(this.getDateFromString(row.monthYear));
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            });

            //If there is no previous year data, then user has entered current year data only.
            //show error messaage.
            if(previousYearData.length === 0 /*&& effectiveDate.getFullYear() !== currentYear*/){
                return this.stateDataWithErrors(stateDataPassed, ErrorMessage.CURRENT_AND_PREV);
            }

            //Calculate threshold crossed or not for previous year.
            let prevoiusYearTotals = this.getTotals(previousYearData);

            //If threshold crossed, then measurement period is previous year.
            let isPreviousYearCrossedThreshold = false;
            if(state.salesTransaction.bothRequired){
                if(prevoiusYearTotals.totalSales > thresholdSalesAmount && prevoiusYearTotals.totalTransactions > thresholdTransactionsValue){
                    isPreviousYearCrossedThreshold = true;
                }
            }else if(!state.salesTransaction.transactionRequired){
                if(prevoiusYearTotals.totalSales > thresholdSalesAmount){
                    isPreviousYearCrossedThreshold = true;
                }
            }else{
                if(prevoiusYearTotals.totalSales > thresholdSalesAmount || prevoiusYearTotals.totalTransactions > thresholdTransactionsValue){
                    isPreviousYearCrossedThreshold = true;
                }
            }
            if(isPreviousYearCrossedThreshold){
                //Threshold crossed for previous year data.
                
                let period = this.getStartAndEndMonth(previousYearDataMonths);
                return this.thresholdDataWithStatus(ThresholdStatus.CROSSED, state, period, prevoiusYearTotals, previousYearData);

            }else{// Measurement period is current year.
                let currentYearDataMonths = [];
                let currentYearData = stateData.filter((row)=>{
                    if(row.monthYear){
                        let tansactionYear = this.getDateFromString(row.monthYear).getFullYear();
                        if(tansactionYear === currentYear){
                            currentYearDataMonths.push(this.getDateFromString(row.monthYear));
                            return true;
                        }else{
                            return false;
                        }
                    }else{
                        return false;
                    }
                });

                //If threre are no records for current year, then send error.
                if(currentYearData.length == 0){
                    return this.stateDataWithErrors(stateData, ErrorMessage.CURRENT_AND_PREV);
                }

                //Calculate threshold crossed or not.
                let currentYearTotals = this.getTotals(currentYearData);

                let period = this.getStartAndEndMonth(currentYearDataMonths);
                let thresholdStatus = this.thresholdStatusOfData(state, currentYearTotals);
                return this.thresholdDataWithStatus(thresholdStatus, state, period, currentYearTotals, currentYearData);
            }
        }
    }

    private runPreviousCalendarYear(stateDataPassed, state){
        //filter state data which are previous years.
        let effectiveDate = this.getDateFromString(state.effectiveDate);
        let previousYearDataMonths = [];
        let previousYear = (new Date().getFullYear() - 1);
        let stateData = stateDataPassed.filter((row)=>{
            let transactionDate = this.getDateFromString(row.monthYear);
            let transactionYear = transactionDate.getFullYear();
            
            if(/*transactionDate >= effectiveDate && */transactionYear === previousYear){
                previousYearDataMonths.push(transactionDate);
                return true;
            }else{
                return false;
            }
        });

        //If there are no records within the threshold period.
        if(stateData.length == 0){
            return this.stateDataWithErrors(stateDataPassed, ErrorMessage.DATA_NOT_FOUND);
        }else{
            //Calculate threshold crossed or not.
            let previousYearTotals = this.getTotals(stateData);

            let period = this.getStartAndEndMonth(previousYearDataMonths);
            let thresholdStatus = this.thresholdStatusOfData(state, previousYearTotals);
            return this.thresholdDataWithStatus(thresholdStatus, state, period, previousYearTotals, stateData);
        }
    }

    private runPreviousMonths(stateDataPassed, state){
        //filter state data which are previous to mentioned months.
        let previousMonths = [];
        let measurementPeriod = this.getMeasurementPeriodForPreviousMonths(state);

        let mpStartDate = measurementPeriod.start;
        let mpEndDate = measurementPeriod.end;

        let stateData = stateDataPassed.filter((row)=>{
            let transactionDate = this.getDateFromString(row.monthYear);

            if(/*transactionDate >= effectiveDate && */mpStartDate<=transactionDate && transactionDate<=mpEndDate){
                previousMonths.push(transactionDate);
                return true;
            }else{
                return false;
            }
        });

         //If there are no records within the threshold period.
         if(stateData.length == 0){
            return this.stateDataWithErrors(stateDataPassed, ErrorMessage.DATA_NOT_FOUND);
        }else{
            //Calculate threshold crossed or not.
            let previousMonthsTotals = this.getTotals(stateData);

            let period = this.getStartAndEndMonth(previousMonths);
            let thresholdStatus = this.thresholdStatusOfData(state, previousMonthsTotals);
            return this.thresholdDataWithStatus(thresholdStatus, state, period, previousMonthsTotals, stateData);
        }
    }

    private runPreviousMonthsWithEndingDate(stateDataPassed, state){
        //filter state data which are previous to mentioned months considering ending month.
        let previousMonths = [];
        let measurementPeriod = this.getMeasurementPeriodForPreviousMonthsWithEndingDate(state);

        let mpStartDate = measurementPeriod.start;
        let mpEndDate = measurementPeriod.end;
        
        let stateData = stateDataPassed.filter((row)=>{
            let transactionDate = this.getDateFromString(row.monthYear);
            transactionDate = new Date(transactionDate.getFullYear(),transactionDate.getMonth());

            if(/*transactionDate >= effectiveDate && */mpStartDate<=transactionDate && transactionDate<=mpEndDate){
                previousMonths.push(transactionDate);
                return true;
            }else{
                return false;
            }
        });

         //If there are no records within the threshold period.
        if(stateData.length == 0){
            return this.stateDataWithErrors(stateDataPassed, ErrorMessage.DATA_NOT_FOUND);
        }else{
            //Calculate threshold crossed or not.
            let previousMonthsTotals = this.getTotals(stateData);

            let period = this.getStartAndEndMonth(previousMonths);
            let thresholdStatus = this.thresholdStatusOfData(state, previousMonthsTotals);
            return this.thresholdDataWithStatus(thresholdStatus, state, period, previousMonthsTotals, stateData);
        }
    }

    private runPreviousQuarters(stateDataPassed, state){
        //filter state data which are previous to mentioned quarters.
        let effectiveDate = this.getDateFromString(state.effectiveDate);
        let previousMonths = [];
        let measurementPeriod = this.getMeasurementPeriodForPriousQuarters(state);
        let mpStartDate = measurementPeriod.start;
        let mpEndDate = measurementPeriod.end;       
        
        let stateData = stateDataPassed.filter((row)=>{
            let transactionDate = this.getDateFromString(row.monthYear);
            transactionDate = new Date(transactionDate.getFullYear(),transactionDate.getMonth());

            if(/*transactionDate >= effectiveDate && */mpStartDate<=transactionDate && transactionDate<=mpEndDate){
                previousMonths.push(transactionDate);
                return true;
            }else{
                return false;
            }
        });

         //If there are no records within the threshold period.
         if(stateData.length == 0){
            return this.stateDataWithErrors(stateDataPassed, ErrorMessage.DATA_NOT_FOUND);
        }else{
            //Calculate threshold crossed or not.
            let previousMonthsTotals = this.getTotals(stateData);

            let period = this.getStartAndEndMonth(previousMonths);
            let thresholdStatus = this.thresholdStatusOfData(state, previousMonthsTotals);
            return this.thresholdDataWithStatus(thresholdStatus, state, period, previousMonthsTotals, stateData);
        }
    }

    public getMeasurementPeriodForPriousAndCurrentCalenderYear(state){
        let date = new Date();
        return {
            start: new Date(date.getFullYear()-1,0),
            end: new Date(date.getFullYear(),11)
        }
    }

    public getMeasurementPeriodForPriousCalenderYear(state){
        let date = new Date();
        return {
            start: new Date(date.getFullYear()-1,0),
            end: new Date(date.getFullYear()-1,11)
        }
    }

    public getMeasurementPeriodForPreviousMonths(state){
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        let numberOfMonths = state.priorDuration.noOfMonths;
        let priorYear = currentYear - Math.floor(numberOfMonths/12);
        let priorMonth = currentMonth+1 - (numberOfMonths%12);

        let currentMonthString = (currentMonth>9)?currentMonth:'0'+currentMonth;
        let priorMonthString = (priorMonth>9)?priorMonth:'0'+priorMonth;
        //let mpStartDate = new Date(`${priorYear}-${priorMonthString}`);
        let mpStartDate = new Date(currentYear, currentMonth - numberOfMonths);
        let mpEndDate = this.getDateFromString(`${currentYear}-${currentMonthString}`);
        return {
            start: mpStartDate,
            end: mpEndDate
        }
    }

    public getMeasurementPeriodForPreviousMonthsWithEndingDate(state){
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        let numberOfMonths = state.priorEndingMonth.noOfMonths;
        let endMonth = state.priorEndingMonth.endMonth - 1;

        let mpStartDate;
        let mpEndDate;
        
        if(currentMonth > endMonth){
            //Previous months from current year.
            mpStartDate = new Date(currentYear, (currentMonth+1)-parseInt(numberOfMonths));
            mpEndDate = new Date(currentYear, endMonth);
        }else{
            //Previous months last year.
            mpStartDate = new Date(currentYear -1, (currentMonth+1)-parseInt(numberOfMonths));
            mpEndDate = new Date(currentYear - 1, endMonth);
        }
        return {
            start: mpStartDate,
            end: mpEndDate
        }
    }

    public getMeasurementPeriodForPriousQuarters(state){
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth()+1;
        let currentYear = currentDate.getFullYear();

        let numberOfQuarters = state.quarter.quarterNumber;
        let numberOfMonths = parseInt(numberOfQuarters)*3;
        let quarterEndMonths = state.quarter.quarterEndMonths;
        quarterEndMonths = quarterEndMonths.split(',').map((a)=>{
            let start, end = parseInt(a), mid;
            mid = end - 1;
            start = end - 2;
            (start==0)?( start = 12, mid = 1):(start==-1?(start = 11,mid = 12):'');
            return {start,end, mid}
        });

        let currentQuarter;
        let previousQuarter;
        let previousQuarterEndMonth;
        let previousQuarterStartMonth;
        for(let i=0; i< quarterEndMonths.length; i++){
            if(currentMonth==quarterEndMonths[i].start || currentMonth==quarterEndMonths[i].end ||  currentMonth==quarterEndMonths[i].mid){
                currentQuarter = i;
                break;
            }
        }
        previousQuarter = (currentQuarter - 1 < 0)?quarterEndMonths.length-1:currentQuarter - 1;
        previousQuarterEndMonth = quarterEndMonths[previousQuarter].end;
        previousQuarterStartMonth = quarterEndMonths[previousQuarter].start;

        let diffToQuarterEnd = ((currentMonth-previousQuarterEndMonth)+12)%12;
        let mpStartDate = new Date();
        mpStartDate.setMonth(mpStartDate.getMonth()-diffToQuarterEnd-numberOfMonths+1);
        mpStartDate = new Date(mpStartDate.getFullYear(),mpStartDate.getMonth());
        let mpEndDate = new Date();
        mpEndDate.setMonth(mpEndDate.getMonth()-diffToQuarterEnd);
        mpEndDate = new Date(mpEndDate.getFullYear(),mpEndDate.getMonth());
        return {
            start: mpStartDate,
            end: mpEndDate
        }
    }

}