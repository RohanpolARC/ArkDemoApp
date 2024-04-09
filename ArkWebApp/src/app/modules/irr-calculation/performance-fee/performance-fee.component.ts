import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { LoadStatus, ParentTabType, PerfFeesCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-performance-fee',
  templateUrl: './performance-fee.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './performance-fee.component.scss']
})
export class PerformanceFeeComponent implements OnInit {

  @Input() calcParams: PerfFeesCalcParams;
  @Input() parentTab: ParentTabType;
  @Input() childTabIndex: number;
  @Output() status = new EventEmitter<LoadStatus>();

  feeSmy: any[] | null
  feeCashflows: any[] | null

  loadingStatus: LoadStatus = 'Loading';
  runID: string
  asOfDate: string
  feePreset: string
  positionIDs: number[]
  modelID: number
  closeStream: Subject<void> = new Subject<void>();
  number : number
  ParentTabType: ParentTabType

  constructor(public feeCalcSvc: FeeCalculationService,
    private irrCalcSvc: IRRCalcService) { }

  ngOnInit(): void {
    this.irrCalcSvc.cashflowLoadStatusEvent.pipe(takeUntil(this.closeStream)).subscribe(
      e => {

        if(e.runID === this.runID && e.status === 'Loaded'){
          this.closeStream.next();
          
          this.feeCalcSvc.fetchFeeCashflows(this.asOfDate, this.feePreset, this.positionIDs, this.calcParams.runID);

          this.feeCalcSvc.isCalculationLoaded.pipe(first()).subscribe(d => {
            this.loadingStatus = 'Loaded';
            this.feeSmy = d.feeSmy;
            this.feeCashflows = d.feeCashflows;
      
            if(this.feeCashflows != null && this.feeCashflows?.length > 0)
              this.status.emit('Loaded')
            else this.status.emit('Failed')
          })      
        }
        else if(e.runID === this.runID && e.status === 'Failed'){
          this.closeStream.next();
          this.status.emit('Failed')
        }
      }
    )
  }

  ngOnDestroy(){
    // Terminate fee calc instance
    this.feeCalcSvc
    .terminateInstance(this.feeCalcSvc.terminateUri).pipe(first()).subscribe();
  }

  ngOnChanges(changes: SimpleChanges){
    this.runID = this.calcParams.runID;

    this.asOfDate = this.calcParams.asOfDate;
    this.feePreset = this.calcParams.feePreset;
    this.positionIDs = this.calcParams.positionIDs;
    this.modelID = this.calcParams.modelID;

  }

}
