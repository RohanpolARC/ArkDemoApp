import { Component, OnInit } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { filter, first, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-valuation',
  templateUrl: './valuation.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './valuation.component.scss']
})
export class ValuationComponent implements OnInit {

  asofdate: AsOfDateRange;        // Date currently used by the grid. Updated only after hitting apply.
  asofdateIn: AsOfDateRange;      // Date currently set on the filter panel.
  funds: string[]
  benchmarkIndexes: { [index: string]: any }
  marktypes: string[];

  showLoadingOverlayReq: { show:  'Yes' | 'No' }
  clearEditingStateReq:  { clear: 'Yes' | 'No' }
  getReviewingAssets: { get: 'Yes' | 'No' }
  setAllAssetsForReviewReq: { set: 'Yes' | 'No' }
  getFilteredMTMAssetsReq: { get: 'Yes' | 'No' }

  reviewedAssets: any[]

  modelValuations$: Observable<any[]>
  closeTimer$ = new Subject<any>();

  runValuationInProgress: boolean;

  constructor(
    private valuationSvc: ValuationService,
    private dataSvc: DataService  
  ) { }

  rowData$: Observable<any[]> = this.dataSvc.filterApplyBtnState.pipe(
    filter((isHit: boolean) => 
      isHit && !!this.asofdate && !!this.funds?.length && !!this.marktypes?.length
    ),
    tap((isHit) => { 
      this.asofdate = this.asofdateIn;    // Update date for grid only when hit apply
      this.showLoadingOverlayReq = { show: 'Yes' }

      this.valuationSvc.getSpreadBenchmarkIndex(this.asofdate.end, null).pipe(first()).subscribe({
        next: (indexes: any[]) => {
          
          let spreadIndexes = {};
          for(let i: number = 0; i < indexes.length; i+= 1){
            let bmindex: string = indexes[i]?.['securityName'];
            if(!spreadIndexes.hasOwnProperty(bmindex))
              spreadIndexes[bmindex] = indexes[i];
          }

          this.benchmarkIndexes = spreadIndexes;
        },
        error: (error) => {
          console.error(`Failed to load spread benchmark indexes`);
        }
      })
    }),
    switchMap((isHit) => {
      return this.valuationSvc.getValuationData(this.asofdate, this.funds?.join(','), this.marktypes?.join(',')).pipe(
        tap((data: any[]) => {
          console.log(data);
        })
      )
    })
  )

  asOfDate$: Observable<AsOfDateRange>;
  funds$: Observable<string[]>;
  markTypes$: Observable<string[]>;

  ngOnInit(): void {
    
    this.asOfDate$ = this.valuationSvc.currentSearchDateRange.pipe(
      filter((asOfDate: AsOfDateRange) => !!asOfDate),
      tap((asOfDate: AsOfDateRange) => {
        this.asofdateIn = asOfDate

        // Only allowing setting grid date for initial load
        if(!this.asofdate){
          this.asofdate = asOfDate
        }
      })
    )

    this.funds$ = this.valuationSvc.currentfundValues.pipe(
      filter((funds: string[]) => !!funds?.length),
      tap((funds: string[]) => { 
        this.funds = funds;
      })
    )

    this.markTypes$ = this.valuationSvc.currentMarkTypes.pipe(
      filter((marktypes: string[]) => !!marktypes?.length),
      tap((marktypes: string[]) => {
        this.marktypes = marktypes;
      })
    )

    this.dataSvc.getUniqueValuesForField('BenchMark Index').pipe(take(1)).subscribe(d => {
      this.benchmarkIndexes = d.map((bmidx) => bmidx.value)
    })
  }

  clearEditingState(){
    this.clearEditingStateReq = { clear: 'Yes' }
  }

  getFilteredMTMAssets(assetIDs: number[]){
    this.triggerRunValuation(assetIDs)
  }
  
  reviewingAssets(assets: { assetID: number, markType: string, overrideDate: Date /*YYYY-MM-DD */ }[]){
    assets = assets.map(asset => { return { ...asset, modifiedBy: this.dataSvc.getCurrentUserName() } })

    if(!assets.length){
      this.dataSvc.setWarningMsg(`Nothing to be pushed to WSO`, `Dismiss`, `ark-theme-snackbar-normal`)
      return;
    }

    this.valuationSvc.putReviewingAssets(assets).pipe(first()).subscribe({
      next: (feed: any[]) => {
        console.log(feed);
        this.reviewedAssets = feed;

        for(let i: number = 0; i < feed.length; i+= 1){
          if(feed[i]['status'] === 'Failed'){
            this.dataSvc.setWarningMsg(`Failed to push marks for all. Please check audit logs for more information`, `Dismiss`, `ark-theme-snackbar-error`)
            return;
          }
        }

        this.dataSvc.setWarningMsg(`Pushed all marks to WSO`, `Dismiss`, `ark-theme-snackbar-success`)
      },
      error: (error) => {
        console.error(`Failed to review the assets: {error}`);
      }
    })   
  }

  triggerRunValuation(assetIDs: number[]){

    if(this.runValuationInProgress){
      this.dataSvc.setWarningMsg(`Please wait for the triggered valuation process to finish`, `Dismiss`, `ark-theme-snackbar-warning`)
      return;
    }
    else{
      let msg: string = '';
      if(assetIDs.length === 1)
        msg = `Running model valuation for assetID ${assetIDs[0]}`;
      else if(assetIDs.length > 1)
        msg = `Running model valuation for assets`;
      else if(assetIDs.length === 0){
        this.dataSvc.setWarningMsg(`No underlying Mark to market assets to run model valuation.`, `Dismiss`, `ark-theme-snackbar-warning`)
      }
      this.dataSvc.setWarningMsg(msg, `Dismiss`, `ark-theme-snackbar-normal`);
    }

    let m: {
      asOfDate: string;
      assetID: number[];
    } = {
      asOfDate: this.asofdate.end,     // We use the current date for calculating the model valuation
      assetID: assetIDs
    }

    this.modelValuations$ = this.valuationSvc.runModelValuations(m).pipe(
      switchMap(resp => {
        const pollingEndpoint: string = resp?.['statusQueryGetUri'];
        
        this.runValuationInProgress = true

        return interval(3000).pipe(
          takeUntil(this.closeTimer$),
          switchMap(() => this.valuationSvc.getStatus(pollingEndpoint).pipe(
            map((pollResp: any) => {
              return { 
                'valuation': pollResp?.['output']?.['ValuationObject'], 
                'runtimeStatus': pollResp?.['runtimeStatus'] 
              }
            }),
            tap((pollResp) => {
              if(['Terminated', 'Completed', 'Failed'].includes(pollResp?.['runtimeStatus'])){
                this.closeTimer$.next();
                this.runValuationInProgress = false
              }
            }),
            map((pollResp) => {
              return pollResp.valuation;
            })
          ))
        )
      })
    )
  }

  onPushtoWSO(){
    this.getReviewingAssets = {
      get: 'Yes'
    }
  }

  onSelectAllForReview(){
    this.setAllAssetsForReviewReq = {
      set: 'Yes'
    }
  }

  onTriggerModelValuation(){
    this.getFilteredMTMAssetsReq = {
      get: 'Yes'
    }
  }
}