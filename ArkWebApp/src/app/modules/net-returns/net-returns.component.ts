import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { NetReturnsService } from 'src/app/core/services/NetReturns/net-returns.service';
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

  closeTimer$ = new Subject<any>();
  cashflows: any[] = []
  smy: any[] = []

  asOfDate: string
  calcMethod: string
  fundHedging: string
  cashflowType: string

  constructor(private netReturnsSvc: NetReturnsService,
              private dataSvc: DataService,
              private dialog: MatDialog
  ) {   }


  rowData$: Observable<any>//: Observable<{cashflowCount: number, RunID: string, smry: any[], cashflows: any[]}>

  onRunReport(){
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

    // Recreated declarative rxjs stream manipulation.

    this.rowData$ = this.dataSvc.filterApplyBtnState.pipe(
      filter((isHit: boolean) => isHit),
      switchMap((isHit) => {

        let m = {
          asOfDate: this.asOfDate,
          calcMethod: this.calcMethod,
          fundHedging: this.fundHedging,
          cashflowType: this.cashflowType
        }
        return  this.netReturnsSvc.calculateNetIRR(m).pipe(
          switchMap(resp => {
            const pollingEndpoint: string = resp?.['statusQueryGetUri'];
            return interval(3000).pipe(
              takeUntil(this.closeTimer$),
              switchMap(() => this.netReturnsSvc.getIRRStatus(pollingEndpoint).pipe(
                map((pollResp) => { return { 
                  ...{ summary: pollResp?.['output']?.['Summary'], cashflows: pollResp?.['output']?.['Cashflows']  }
                  , 'runtimeStatus': pollResp?.['runtimeStatus'] }}),
                tap((pollResp) => {
                  if(['Terminated', 'Completed', 'Failed'].includes(pollResp?.['runtimeStatus']))
                    this.closeTimer$.next();
                }))              )
            )
          })
        )
      })
    )
  }
}