import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { DataService } from 'src/app/core/services/data.service';
import { getDateFromStr } from 'src/app/shared/functions/utilities';
import { CapitalActivityModel, INAVQuarterly } from 'src/app/shared/models/CapitalActivityModel';
import { APIReponse } from 'src/app/shared/models/GeneralModel';
import { UPLOAD_TEMPLATE } from '../bulk-upload/upload/upload.component';

@Injectable()
export class UploadService {
  selectedTemplate: UPLOAD_TEMPLATE = 'Activities';
  validationMessage$: Observable<string>
  disableSubmit$: Observable<boolean>
  saveState: 'PENDING' | 'SUCCESS' | 'FAILURE'
  getSaveState(): 'PENDING' | 'SUCCESS' | 'FAILURE' {
    return this.saveState;
  }
  constructor(private capitalActivitySvc: CapitalActivityService,
    private dataSvc: DataService) {
    this.init();
  }
  
  private isFileValid = new BehaviorSubject<boolean>(false);
  isFileValid$ = this.isFileValid.asObservable();
  updateIsFileValid(isFileValid: boolean){
    this.isFileValid.next(isFileValid);
  }

  private actionSuccessful = new BehaviorSubject<boolean>(false);
  actionSuccessful$ = this.actionSuccessful.asObservable();
  updateActionSuccessful(success: boolean){
    this.actionSuccessful.next(success)
  }
  
  private submitBtnClick = new Subject<boolean>();
  submitBtnClick$ = this.submitBtnClick.asObservable();
  updateSubmitBtnClick(click: boolean){
    this.submitBtnClick.next(click);
  }

  private loadedFileData = new BehaviorSubject<any[]>([]);
  loadedFileData$ = this.loadedFileData.asObservable();
  updateLoadedFileData(loadedData: any[]){
    this.loadedFileData.next(loadedData);
  }

  init(){
    
    this.disableSubmit$ = combineLatest([this.actionSuccessful$, this.isFileValid$]).pipe(
      map(([actionSuccessful, isFileValid]) => {
        if(actionSuccessful)
          return true;
        if(!isFileValid)
          return true;
        if(!actionSuccessful && isFileValid)
          return false;
        return true;
      })
    )

    this.validationMessage$ = this.submitBtnClick$.pipe(
      switchMap(() => combineLatest([this.isFileValid$, this.loadedFileData$, this.actionSuccessful$]).pipe(
        take(1),
        switchMap(([isFileValid, loadedFileData, actionSuccessful]) => {

          if(!isFileValid){
            this.saveState = 'FAILURE';
            return of('Invalid file');
          }

          if(!actionSuccessful){
            if(this.selectedTemplate === 'Activities'){
              let activities: CapitalActivityModel[] = loadedFileData?.map(activity => this.translateToCapitalActivityModel(activity));
              return this.uploadBulkCapitalActivities(activities);  
            }
            else if(this.selectedTemplate === 'NAV Quarterly'){
              let quarterlies: INAVQuarterly[] = loadedFileData?.map(quarterly => this.translateToNAVQuarterly(quarterly));
              return this.uploadNAVQuarterlies(quarterlies);
            }
          }

          return of('')
        })
      )),
    )
  }

  private uploadBulkCapitalActivities(activities: CapitalActivityModel[]): Observable<string> {
    return this.capitalActivitySvc.bulkPutCapitalActivity(activities).pipe(
      take(1),
      map((response: APIReponse) => {
        let isSuccess: boolean = response.isSuccess;
        this.updateActionSuccessful(isSuccess);
        this.updateActionSuccessful(isSuccess);
        if(isSuccess){
          this.saveState = 'SUCCESS'
          return 'Successfully uploaded the activities in bulk'
        }
        else {
          this.saveState = 'FAILURE'
          return 'Failed to upload the activities'
        }
      })
    )
  }

  private uploadNAVQuarterlies(quarterlies: INAVQuarterly[]): Observable<string> {
    return this.capitalActivitySvc.putNAVQuarterly(quarterlies).pipe(
      take(1),
      map((response: APIReponse) => {
        let isSuccess: boolean = response.isSuccess;
        this.updateActionSuccessful(isSuccess);
        if(isSuccess){
          this.saveState = 'SUCCESS'
        }
        else {
          this.saveState = 'FAILURE'
        }

        return response.returnMessage;
      })
    )
  }

  translateToCapitalActivityModel(row: any): CapitalActivityModel  {
    let m: CapitalActivityModel = <CapitalActivityModel>{};

    m.valueDate = getDateFromStr(row['Cash Flow Date'], 'DD/MM/YYYY');
    m.callDate = getDateFromStr(row['Call Date'], 'DD/MM/YYYY');
    m.narrative = row['Narative (optional)'];
    m.capitalType = row['Capital Type'];
    m.capitalSubType = row['Capital Subtype'];
    m.fundHedging = row['Fund Hedging'];
    m.totalAmount = Number(row['Amount (in Fund Ccy)']);
    m.asset = row['Asset (optional)'];
    m.fundCcy = row['Fund Currency'];
    m.wsoAssetID = Number(row['Wso Asset ID'] || 0);
    m.createdBy = m.modifiedBy = this.dataSvc.getCurrentUserName();
    m.createdOn = m.modifiedOn = new Date();
    m.source = 'ArkUI - template';
    m.sourceID = 3;

    return m;
  }

  translateToNAVQuarterly(row: any): INAVQuarterly {
    let m: INAVQuarterly = <INAVQuarterly>{};

    m.fundHedging = row['Fund Hedging'];
    m.quarterEnd = getDateFromStr(row['Quarter End'], 'DD/MM/YYYY');
    m.navPerFS = row['NAV per FS'];
    m.deferredLoanOriginationFeeIncome = row['Deferred loan origination fee income'];
    m.currentPeriodRebates = row['Current Period Rebates'];
    m.organisationalCostsUnamortised = row['Organisational costs unamortised'];
    m.subscriptionCostsUnamortised = row['Subscription costs & leverage costs unamortised'];
    m.carriedInterestProvision = row['Carried Interest Provision '];
    m.rebateITD = row['Rebate ITD'];
    m.advancedTax = row['Advanced Tax'];
    m.netForwardContractMovementsITD= row['Net forward contract movements ITD'];
    m.totalForeignExchangeMovementsITD= row['Total foreign exchange movements ITD'];
    m.totalOperatingExpITD= row['Total Operating exp (excluded GPS) ITD'];
    m.GPSITD= row['GPS ITD'];
    m.username = this.dataSvc.getCurrentUserName();

    return m;
  }
}