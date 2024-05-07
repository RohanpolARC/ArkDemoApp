import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacilityDetailService {



  constructor(private http: HttpClient) { }

  public getFacilityDetails(funds: string[], asOfDate?: string){
    return of([
        {
          issuerShortName : 'isn'
          ,dealName : 'deal'
          ,asset : 'asset'
          ,assetID : 123
          ,assetTypeName : ''
          ,ccy : 'EUR'
          ,faceValueIssueQuantity : -345345.234
          ,costPrice : 100
          ,mark : 100
          ,maturityDate : '29/11/2017'
          ,benchMarkIndex : 100
          ,spread : 100
          ,pikMargin : 100
          ,unfundedMargin : 100
          ,floorRate : 100
          ,dealType : 100
          ,dealTypeCS : 100
          ,expectedDate : '15/01/2015'
          ,expectedPrice : 100
          ,maturityPrice : 100
          ,spreadDiscount : 100
          ,isOverride : 100
          ,edit : 100
          ,adjEBITDAatInv : 100
          ,ebitda : 100
          ,ltmRevenues : 100
          ,netLeverage : 100
          ,netLeverageAtInv : 100
          ,netLTV : 100
          ,netLTVatInv : 100
          ,revenueatInv : 100
          ,revenuePipeline : 100
          ,reportingEBITDA : 100
          ,reportingNetLeverage : 100
          ,reportingNetLeverageComment : 100
          ,assetClass : 100
          ,capStructureTranche : 100
          ,securedUnsecured : 100
          ,seniority : 100
          ,modifiedBy : 'user'
          ,modifiedOn : '2024-01-16T21:15:58.597'
        },
        {
          issuerShortName : 'isn'
          ,dealName : 'deal'
          ,asset : 'asset'
          ,assetID : 124
          ,assetTypeName : ''
          ,ccy : 'EUR'
          ,faceValueIssueQuantity : 32523523.234
          ,costPrice : 100
          ,mark : 100
          ,maturityDate : '29/11/2017'
          ,benchMarkIndex : 100
          ,spread : 100
          ,pikMargin : 100
          ,unfundedMargin : 100
          ,floorRate : 100
          ,dealType : 100
          ,dealTypeCS : 100
          ,expectedDate : '15/01/2015'
          ,expectedPrice : 100
          ,maturityPrice : 100
          ,spreadDiscount : 100
          ,isOverride : 100
          ,edit : 100
          ,adjEBITDAatInv : 100
          ,ebitda : 100
          ,ltmRevenues : 100
          ,netLeverage : 100
          ,netLeverageAtInv : 100
          ,netLTV : 100
          ,netLTVatInv : 100
          ,revenueatInv : 100
          ,revenuePipeline : 100
          ,reportingEBITDA : 100
          ,reportingNetLeverage : 100
          ,reportingNetLeverageComment : 100
          ,assetClass : 100
          ,capStructureTranche : 100
          ,securedUnsecured : 100
          ,seniority : 100
          ,modifiedBy : 'user'
          ,modifiedOn : '2024-01-16T21:15:58.597'
        },
        {
          issuerShortName : 'isn'
          ,dealName : 'deal'
          ,asset : 'asset'
          ,assetID : 125
          ,assetTypeName : ''
          ,ccy : 'EUR'
          ,faceValueIssueQuantity : 75674465.456
          ,costPrice : 100
          ,mark : 100
          ,maturityDate : '29/11/2017'
          ,benchMarkIndex : 100
          ,spread : 100
          ,pikMargin : 100
          ,unfundedMargin : 100
          ,floorRate : 100
          ,dealType : 100
          ,dealTypeCS : 100
          ,expectedDate : '15/01/2015'
          ,expectedPrice : 100
          ,maturityPrice : 100
          ,spreadDiscount : 100
          ,isOverride : 100
          ,edit : 100
          ,adjEBITDAatInv : 100
          ,ebitda : 100
          ,ltmRevenues : 100
          ,netLeverage : 100
          ,netLeverageAtInv : 100
          ,netLTV : 100
          ,netLTVatInv : 100
          ,revenueatInv : 100
          ,revenuePipeline : 100
          ,reportingEBITDA : 100
          ,reportingNetLeverage : 100
          ,reportingNetLeverageComment : 100
          ,assetClass : 100
          ,capStructureTranche : 100
          ,securedUnsecured : 100
          ,seniority : 100
          ,modifiedBy : 'user'
          ,modifiedOn : '2024-01-16T21:15:58.597'
        },
      ])
  }

}
