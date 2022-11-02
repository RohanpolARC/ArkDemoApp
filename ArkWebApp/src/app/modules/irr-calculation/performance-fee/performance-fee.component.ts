import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { PerfFeesCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-performance-fee',
  templateUrl: './performance-fee.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './performance-fee.component.scss']
})
export class PerformanceFeeComponent implements OnInit {

  @Input() calcParams: PerfFeesCalcParams;
  @Output() status = new EventEmitter<string>();

  feeSmy: any[] | null
  feeCashflows: any[] | null


  asOfDate: string
  feePreset: string
  positionIDs: number[]

  constructor(public feeCalcSvc: FeeCalculationService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){
    this.asOfDate = this.calcParams.asOfDate;
    this.feePreset = this.calcParams.feePreset;
    this.positionIDs = this.calcParams.positionIDs;
    
    this.feeCalcSvc.fetchFeeCashflows(this.asOfDate, this.feePreset, this.positionIDs)

    this.feeCalcSvc.isCalculationLoaded.pipe(first()).subscribe(d => {
      this.feeSmy = d.feeSmy;
      this.feeCashflows = d.feeCashflows;

      if(this.feeCashflows != null && this.feeCashflows?.length > 0)
        this.status.emit('Loaded')
      else this.status.emit('Failed')
    })
  }

}
