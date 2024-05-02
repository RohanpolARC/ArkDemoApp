import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Injectable({
  providedIn: 'root'
})
export class AumReportService {

  private searchDateRangeMessage = new BehaviorSubject<any>(null);
  currentSearchDateRange = this.searchDateRangeMessage.asObservable();
  changeSearchDateRange(range: AsOfDateRange){
      this.searchDateRangeMessage.next(range);
  }
  constructor(private http: HttpClient) { }

  public getAUMReportMasterRows(){

    return of([{
        positionId : 12345
        ,issuer : 'issuer'
        ,fund : 'fund'
        ,issuerShortName	: 'isn'
        ,moveType : 'No-Move'
        ,aumLatest : 150000000
        ,aumLast : 150000000
        ,aumDiff	: 0
        ,aumSpotLatest : 150000000
        ,aumSpotLast : 0
        ,aumSpotDiff	: 0
        ,coinvestCostChange : 0
        ,smaCostChange : 0
        ,grossGPSLatest : 150000000
        ,grossGPSLast : 150000000
        ,grossGPSDiff : 150000000
        ,netGPSLatest : 	150000000
        ,netGPSLast : 150000000
        ,netGPSDiff : 150000000
        ,netOfRebateGPSLatest : 150000000
        ,netOfRebateGPSLast : 150000000
        ,netOfRebateGPSDiff : 150000000
        ,grossCostAmountEurCurrent : 150000000
        ,grossCostAmountEurLast : 150000000
        ,grossCostAmountEurDiff : 0
        ,grossFundedCostAmountEurCurrent : 150000000
        ,grossFundedCostAmountEurLast : 150000000
        ,grossFundedCostAmountEurDiff : 0
        ,costAmountEurCurrent : 150000000
        ,costAmountEurLast : 150000000
        ,costAmountEurDiff : 0
        ,fundedCostAmountEurCurrent : 150000000
        ,fundedCostAmountEurLast : 150000000
        ,fundedCostAmountEurDiff : 0
        ,costAmountLocalCurrent : 150000000
        ,costAmountLocalLast : 150000000
        ,costAmountLocalDiff : 0
        ,aumEurAdjustmentCurrent : 0
        ,aumEurAdjustmentLast : 0
        ,aumEurAdjustmentDiff : 0
        ,comment	 : 'isn'
        ,upfrontFeesCurrent : 0
        ,upfrontFeesLast : 0
        ,upfrontFeesDiff : 0
        ,issuerType : 'old'
        
    }])
  }

  public getAUMReportDetailRows(){
    return of([{
        positionId : 12345
        ,issuerShortName : 'isn'
        ,fund : 'fund'
        ,fundHedging : 'fund hedging'
        ,portfolio : 'portfolio'
        ,fundStrategy : 'strategy'
        ,issuer : 'issuer'
        ,aumLatest : 150000000
        ,aumLast : 150000000
        ,aumDiff	: 0
        ,aumSpotLatest : 150000000
        ,aumSpotLast : 0
        ,aumSpotDiff	: 0
        ,coinvestCostChange : 0
        ,smaCostChange : 0
        ,grossGPSLatest : 150000000
        ,grossGPSLast : 150000000
        ,grossGPSDiff : 	150000000
        ,netGPSLatest : 	150000000
        ,netGPSLast : 150000000
        ,netGPSDiff : 150000000
        ,netOfRebateGPSLatest : 150000000
        ,netOfRebateGPSLast : 150000000
        ,netOfRebateGPSDiff : 150000000
        ,grossCostAmountEurCurrent : 155000000
        ,grossCostAmountEurLast : 155000000
        ,grossCostAmountEurDiff : 0
        ,grossFundedCostAmountEurCurrent : 150000000
        ,grossFundedCostAmountEurLast : 150000000
        ,grossFundedCostAmountEurDiff : 0
        ,costAmountEurCurrent : 150000000
        ,costAmountEurLast : 150000000
        ,costAmountEurDiff : 0
        ,fundedCostAmountEurCurrent : 150000000
        ,fundedCostAmountEurLast : 150000000
        ,fundedCostAmountEurDiff : 0
        ,costAmountLocalCurrent : 150000000
        ,costAmountLocalLast : 150000000
        ,costAmountLocalDiff : 0
        ,aumEurAdjustmentCurrent : 0
        ,aumEurAdjustmentLast : 0
        ,aumEurAdjustmentDiff : 0
        ,comment	 : 'isn'
        ,upfrontFeesCurrent : 0
        ,upfrontFeesLast : 0
        ,upfrontFeesDiff : 0
    }])
  }

}
