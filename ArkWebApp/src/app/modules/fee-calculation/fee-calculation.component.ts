import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import {  IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-fee-calculation',
  templateUrl: './fee-calculation.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './fee-calculation.component.scss']
})

export class FeeCalculationComponent implements OnInit {

  subscriptions: Subscription[] = []
  columnDefsCFs: ColDef[]
  gridOptionsCFs: GridOptions
  adaptableOptionsCFs: AdaptableOptions
  closeTimer: Subject<void> = new Subject<void>();
  feeCashflows: any[] = []    // Fee Cashflows
  feeSmy: any[] = []    // Output summary
  gridApiCFs: GridApi

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES

  isFirstCallMade: boolean = false
  asOfDate: string; //'YYYY-MM-DD'
  entity: string;
  status: 'Loading' | 'Loaded' | 'Failed'
  constructor(
    private dataSvc: DataService,
    public feeCalcSvc: FeeCalculationService,
    private filterSvc: GeneralFilterService
  ) {}

  ngOnInit(): void {

    this.subscriptions.push(this.filterSvc.filterValueChanges.subscribe((filters: IFilterPaneParams)=>{
      if(filters){
        if(filters[421]){
          this.feeCalcSvc.changeEntityValue(filters[421].value?.[0].value)
        }
        if(filters[422]){
          this.feeCalcSvc.changeSearchDate(getMomentDateStr(filters[422].value))
        }
      }
    }))

    this.subscriptions.push(this.feeCalcSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.subscriptions.push(this.feeCalcSvc.currententityValue.subscribe(entity => {
      this.entity = entity
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.status = 'Loading'
        this.feeCalcSvc.fetchFeeCashflows(this.asOfDate, this.entity);
      }
    }))

    this.feeCalcSvc.isCalculationLoaded.subscribe(d => {
      this.feeSmy = d.feeSmy;
      this.feeCashflows = d.feeCashflows;

      this.status = 'Loaded'; 
    })

  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}