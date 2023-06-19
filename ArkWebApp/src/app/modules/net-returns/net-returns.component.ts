import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { NetReturnsService } from 'src/app/core/services/NetReturns/net-returns.service';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { SsrsReportPopupComponent } from 'src/app/shared/modules/ssrs-report-viewer/ssrs-report-popup/ssrs-report-popup.component';

@Component({
  selector: 'app-net-returns',
  templateUrl: './net-returns.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './net-returns.component.scss']
})
export class NetReturnsComponent implements OnInit {

  subscriptions: Subscription[] =[]


  asOfDate$: Observable<string> = this.netReturnsSvc.currentSearchDate.pipe(
    tap((asOfDate: string) => {
      this.asOfDate = asOfDate
    })
  )
  calcMethod$: Observable<string> = this.netReturnsSvc.currentCalcMethod.pipe(
    tap((calcMethod: string) => {
      this.calcMethod = calcMethod
    })
  )
  cashflowType$: Observable<string> = this.netReturnsSvc.currentCashflowType.pipe(
    tap((cashflowType: string) => {
      this.cashflowType = cashflowType
    })
  )
  fundHedging$: Observable<string> = this.netReturnsSvc.currentfundHedgingValues.pipe(
    tap((fundhedging: string) => {
      this.fundHedging = fundhedging
    })
  )
  saveNetReturns$: Observable<any> = this.netReturnsSvc.currentSaveNetReturns.pipe(
    tap((saveNetReturns:any)=>{
      this.saveNetReturns = saveNetReturns
    })
  )

  closeTimer$ = new Subject<any>();
  cashflows: any[] = []
  smy: any[] = []

  asOfDate: string
  calcMethod: string
  fundHedging: string
  cashflowType: string
  saveNetReturns:any
  isDisabled:boolean = true

  constructor(private netReturnsSvc: NetReturnsService,
              private filterSvc: GeneralFilterService,
              private dataSvc: DataService,
              private dialog: MatDialog
  ) {   }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>sub.unsubscribe())
  }

  rowData$: Observable<any>//: Observable<{cashflowCount: number, RunID: string, smry: any[], cashflows: any[]}>

  onRunReport(){
    if(this.isDisabled){
      this.dataSvc.setWarningMsg("Please run the calculations first.","Dismiss","ark-theme-snackbar-warning");
      return
    }
    let ReportParams:any  ={
      asOfDate:this.asOfDate,
      fundHedging:this.fundHedging,
      cashflowType:this.cashflowType,
      calculationType:this.calcMethod
    }
    const dialogRef = this.dialog.open(SsrsReportPopupComponent,{ 
      data: {
        reportName:"NetReturns",
        ReportParams:ReportParams
        },
        width: '95vw',
        height: '95vh',
        maxWidth:'100vw'
      })
  }



  ngOnInit(){


    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id===231){
          this.netReturnsSvc.changeSearchDate(getMomentDateStr(data.value))
        }else if(data.id === 232){
          this.netReturnsSvc.changeFundHedgingValues(data.value?.[0]?.value)
        }else if(data.id ===233){
          this.netReturnsSvc.changeCalcMethod(data.value?.[0]?.value)
        }else if(data.id === 234){
          this.netReturnsSvc.changeCashflowType(data.value?.[0]?.value)
        }else if(data.id === 235){
          this.netReturnsSvc.changeSaveNetReturns(data.value)
        }
        
      }
    }))
      

    // Recreated declarative rxjs stream manipulation.

    this.rowData$ = this.dataSvc.filterApplyBtnState.pipe(
      filter((isHit: boolean) => isHit),
      switchMap((isHit) => {
        this.isDisabled = true
        let m = {
          asOfDate: this.asOfDate,
          calcMethod: this.calcMethod,
          fundHedging: this.fundHedging,
          cashflowType: this.cashflowType,
          saveNetReturns: this.saveNetReturns,
          runBy: this.dataSvc.getCurrentUserName()
        }
        return  this.netReturnsSvc.calculateNetIRR(m).pipe(
          switchMap(resp => {
            const pollingEndpoint: string = resp?.['statusQueryGetUri'];
            return interval(3000).pipe(
              takeUntil(this.closeTimer$),
              switchMap(
                () => this.netReturnsSvc.getIRRStatus(pollingEndpoint).pipe(
                map((pollResp) => { return { 
                  ...{ 
                      summary: pollResp?.['output']?.['Summary'], 
                      cashflows: pollResp?.['output']?.['Cashflows']  
                    }
                  , 'runtimeStatus': pollResp?.['runtimeStatus'] 
                }}),
                tap((pollResp) => {
                  if(['Terminated', 'Completed', 'Failed'].includes(pollResp?.['runtimeStatus'])){
                    this.closeTimer$.next();
                    this.isDisabled = false  
                  }
                }))              
                
              )
            )
          })
        )
      })
    )
  }
}