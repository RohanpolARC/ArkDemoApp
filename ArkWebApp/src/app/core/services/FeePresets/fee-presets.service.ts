import { ColDef } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { amountFormatter, dateFormatter, dateTimeFormatter } from 'src/app/shared/functions/formatter';

@Injectable({
  providedIn: 'root'
})
export class FeePresetsService {

  columnDefs: ColDef[] = [
    { field: 'fundName', headerName: 'Fee Preset' },
    { field: 'commitment', valueFormatter: amountFormatter },
    { field: 'currentCapitalCalled', valueFormatter: amountFormatter },
    { field: 'startDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'curveCurrency' },
    { field: 'curveName' },
    { field: 'entity' },
    
    { field: 'financingCommitment' },
    { field: 'financingEndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'financingMaxCapitalDeploymentPerMonth' },
    { field: 'financingStartDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    
    { field: 'financingStage1Ratio' },
    { field: 'financingStage2Ratio' },
    { field: 'financingStage3Ratio' },
    { field: 'financingStage1EndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'financingStage2EndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },

    { field: 'holdback' },
    { field: 'holdingDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'maxCapitalDeploymentPerMonth' },
    { field: 'reinvestInterest' },

    { field: 'catchupRate' },
    { field: 'hasCatchup' },
    { field: 'hurdleCompoundingYears' },
    { field: 'hurdleRate' },
    { field: 'includeMgmtFee' },
    { field: 'includeOtherExpense' },
    { field: 'investmentDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'isMgmtFeesPaidAtEnd' },
    { field: 'isPerfFeesPaidAtEnd' },
    { field: 'isQuarterEndMgmtFees' },
    { field: 'mgmtFeesRate' },
    { field: 'otherExpenseRate' },
    { field: 'perfFeesRate' },
    { field: 'undrawnCommitFeesRate' },

    { field: 'overrideExpected' },
    { field: 'useFXHedgingCashflows' },
    { field: 'otherExpensesFixed' },

    // { field: 'isParallel' },
    { field: 'modifiedBy' },
    { field: 'modifiedOn', valueFormatter: dateTimeFormatter, cellClass: 'dateUK' },
    { field: 'createdBy' },
    { field: 'createdOn', valueFormatter: dateTimeFormatter },
].map(col => { 
  col['tooltipField'] = col.field;
  return col;  
});


  constructor(private http: HttpClient) { }

  public getFundInvestmentData(fund: string){
    return this.http.get(`${APIConfig.FEE_PRESET_INVESTMENT_GET_API}`, {
      params: {
        fundName: fund
      }
    })
  }

  public getFundFeeData(fund?: string){
    return this.http.get(`${APIConfig.FEE_PRESET_DATA_GET_API}`, {
      params: {
        fundName: fund
      }
    })
  }

  public putFundInvestmentData(model){
    return this.http.post(APIConfig.FEE_PRESET_INVESTMENT_PUT_API, model)
  }

  public putFundFeeData(model){
    return this.http.post(APIConfig.FEE_PRESET_DATA_PUT_API, model)
  }
}