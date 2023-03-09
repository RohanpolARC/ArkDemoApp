import { ColDef } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { amountFormatter, dateFormatter, dateTimeFormatter } from 'src/app/shared/functions/formatter';

@Injectable({
  providedIn: 'root'
})
export class FeePresetsService {

  DATE_COLUMNS = ['startDate',
  'financingEndDate',
  'financingStartDate',
  'financingStage1EndDate',
  'financingStage2EndDate',
  'holdingDate',
  'investmentDate']

  AMOUNT_COLUMNS = [
    'commitment',
    'currentCapitalCalled',
    'financingCommitment',
    'otherExpensesFixed',
    'maxCapitalDeploymentPerMonth',
    'financingMaxCapitalDeploymentPerMonth'
  ]

  DATETIME_COLUMNS = [
    'createdOn',
    'modifiedOn'
  ]

  NON_AMOUNT_2DEC_COLUMNS= [
    'financingStage1Ratio',
    'financingStage2Ratio',
    'financingStage3Ratio',
    'holdback',
    'catchupRate',
    'hurdleRate',
    'mgmtFeesRate',
    'otherExpenseRate',
    'perfFeesRate',
    'undrawnCommitFeesRate'
  ]

  columnDefs: ColDef[] = [
    { field: 'fundName', headerName: 'Fee Preset' },
    { field: 'commitment' ,type:'abColDefNumber', valueFormatter:amountFormatter},
    { field: 'currentCapitalCalled' ,type:'abColDefNumber', valueFormatter:amountFormatter},
    { field: 'startDate', cellClass: 'dateUK',type:'abColDefDate',valueFormatter:dateFormatter },
    { field: 'curveCurrency' },
    { field: 'curveName' },
    { field: 'entity' },
    
    { field: 'financingCommitment' ,type:'abColDefNumber'},
    { field: 'financingEndDate', cellClass: 'dateUK' ,type:'abColDefDate',valueFormatter:dateFormatter },
    { field: 'financingMaxCapitalDeploymentPerMonth' ,type:'abColDefNumber'},
    { field: 'financingStartDate', cellClass: 'dateUK' ,type:'abColDefDate',valueFormatter:dateFormatter },
    
    { field: 'financingStage1Ratio',type:'abColDefNumber' },
    { field: 'financingStage2Ratio' ,type:'abColDefNumber'},
    { field: 'financingStage3Ratio',type:'abColDefNumber' },
    { field: 'financingStage1EndDate', cellClass: 'dateUK' ,type:'abColDefDate',valueFormatter:dateFormatter },
    { field: 'financingStage2EndDate', cellClass: 'dateUK' ,type:'abColDefDate',valueFormatter:dateFormatter },

    { field: 'holdback',type:'abColDefNumber' },
    { field: 'holdingDate', cellClass: 'dateUK' ,type:'abColDefDate',valueFormatter:dateFormatter },
    { field: 'maxCapitalDeploymentPerMonth' ,type:'abColDefNumber' },
    { field: 'reinvestInterest'},

    { field: 'catchupRate',type:'abColDefNumber' },
    { field: 'hasCatchup' },
    { field: 'hurdleCompoundingYears' },
    { field: 'hurdleRate' ,type:'abColDefNumber'},
    { field: 'includeMgmtFee' },
    { field: 'includeOtherExpense' },
    { field: 'investmentDate', cellClass: 'dateUK' ,type:'abColDefDate',valueFormatter:dateFormatter },
    { field: 'isMgmtFeesPaidAtEnd' },
    { field: 'isPerfFeesPaidAtEnd' },
    { field: 'isQuarterEndMgmtFees' },
    { field: 'mgmtFeesRate',type:'abColDefNumber' },
    { field: 'otherExpenseRate',type:'abColDefNumber' },
    { field: 'perfFeesRate',type:'abColDefNumber' },
    { field: 'undrawnCommitFeesRate' ,type:'abColDefNumber'},

    { field: 'overrideExpected' },
    { field: 'useFXHedgingCashflows' },
    { field: 'otherExpensesFixed' ,type:'abColDefNumber'},

    // { field: 'isParallel' },
    { field: 'modifiedBy' },
    { field: 'modifiedOn',type:'abColDefDate', cellClass: 'dateUK',valueFormatter:dateFormatter },
    { field: 'createdBy' },
    { field: 'createdOn',type:'abColDefDate',valueFormatter:dateFormatter },
].map(col => { 
  col['tooltipField'] = col.field;
  return col;  
});


  constructor(private http: HttpClient) { }

  public getFundInvestmentData(fund: string){
    if(fund){
      return this.http.get(`${APIConfig.FEE_PRESET_INVESTMENT_GET_API}`, {
        params: {
          fundName: fund
        }
      })
    }
    else {
      return this.http.get(`${APIConfig.FEE_PRESET_INVESTMENT_GET_API}`);
    }
  }

  public getFundFeeData(fund?: string){
    if(fund){
      return this.http.get(`${APIConfig.FEE_PRESET_DATA_GET_API}`, {
        params: {
          fundName: fund
        }
      })
    }
    else{
      return this.http.get(`${APIConfig.FEE_PRESET_DATA_GET_API}`)
    }
  }

  public putFundInvestmentData(model){
    return this.http.post(APIConfig.FEE_PRESET_INVESTMENT_PUT_API, model)
  }

  public putFundFeeData(model){
    return this.http.post(APIConfig.FEE_PRESET_DATA_PUT_API, model)
  }
}