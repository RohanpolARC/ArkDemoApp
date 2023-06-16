import { ColDef, GridOptions, GridReadyEvent, IAggFuncParams, Module, ValueFormatterParams } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { MonthlyReturnsService } from 'src/app/core/services/MonthlyReturns/monthly-returns.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { amountFormatter } from 'src/app/shared/functions/formatter';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { MonthlyReturnsCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { getNodes } from '../../capital-activity/utilities/functions';
import { LoadStatusType } from '../portfolio-modeller/portfolio-modeller.component';

@Component({
  selector: 'app-monthly-returns',
  templateUrl: './monthly-returns.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './monthly-returns.component.scss'],
  providers: []
})
export class MonthlyReturnsComponent implements OnInit {

  @Input() calcParams: MonthlyReturnsCalcParams;
  @Output() status = new EventEmitter<LoadStatusType>();
  
  subscriptions: Subscription[] = []
  columnDefsMonthlyRets: ColDef[]
  gridOptionsMonthlyRets: GridOptions
  monthlyReturns

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  modelName: string
  baseMeasure: string
  asOfDate: string
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

  constructor(private monthlyReturnSvc: MonthlyReturnsService,
    private dtPipe: DatePipe,
  ) { }

  ngOnChanges(changes: SimpleChanges){

    let params = changes.calcParams.currentValue;
    this.baseMeasure = params?.['baseMeasure'];
    this.modelName = params?.['modelName'];
    this.asOfDate = params?.['asOfDate'];
    
    params['baseMeasureID'] = 3;
    this.subscriptions.push(this.monthlyReturnSvc.getMonthlyReturns(params).subscribe({
      next: (data: any[]) => {
        this.status.emit('Loaded')

        let monthlyReturns = []
        data?.forEach(ret => {
          let row = { ...ret, ...ret?.['mReturns'] }
          delete row['mReturns'];

          monthlyReturns.push(row)
        })

        this.monthlyReturns = monthlyReturns        
      },
      error: (error) => {
        console.error(`Failed to get returns : ${error}`)
        this.monthlyReturns = []
        this.status.emit('Failed')
      }
    }))

  }

  dateFormatter(params: ValueFormatterParams): string{
    return this.dtPipe.transform(params.value, 'MMM-yy');
  }

  aggFuncs = {
    'Return': (params: IAggFuncParams) => {

      let childData: any[] = getNodes(params.rowNode, [])

      let sumPnL: number  = childData.reduce((n, {monthlyPnL}) => n + monthlyPnL, 0)
      let sumBaseMeasure: number = childData.reduce((n, {baseMeasure}) => n + baseMeasure, 0)

      if(sumBaseMeasure === 0)
        return 0.00
      else 
        return Number(Number(sumPnL / sumBaseMeasure));
      
    },
    'Sum': (params: IAggFuncParams) => {
      if(params.column.getColId() === 'monthlyPnL' || params.column.getColId() === 'baseMeasure'){
        return params.values.reduce((a, b) => Number(a) + Number(b), 0)
      }
    }
  }

  // Not using shared percentFormatter since it doesnt apply on grouped cells
  percentFormatter(params: ValueFormatterParams){
    return `${Number(params.value * 100).toFixed(2)}%`;
  }

  ngOnInit(): void {

    this.columnDefsMonthlyRets = [
      { field: 'asofDate', valueFormatter: this.dateFormatter.bind(this), headerName: 'As Of Date', rowGroup: true, allowedAggFuncs: [], cellClass: 'dateUK' },
      { field: 'issuerShortName', allowedAggFuncs: [] },
      { field: 'monthlyPnL', valueFormatter: amountFormatter, headerName: 'Monthly P&L', aggFunc: 'Sum', allowedAggFuncs: ['Sum'] },
      { field: 'baseMeasure', valueFormatter: amountFormatter, aggFunc: 'Sum', allowedAggFuncs: ['Sum'] },
      { field: 'returns', valueFormatter: this.percentFormatter, aggFunc: 'Return', allowedAggFuncs: ['Return'] },
      // { field: 'cumulativeReturn', valueFormatter: this.percentFormatter, aggFunc: 'Return', allowedAggFuncs: ['Return'] },
      { field: 'accFeesEur', valueFormatter: amountFormatter, aggFunc: 'sum', headerName: 'Fees' },
      { field: 'accInterestEur', valueFormatter: amountFormatter, aggFunc: 'sum', headerName: 'Interest' },
    ]

    this.gridOptionsMonthlyRets = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefsMonthlyRets,
      suppressAggFuncInHeader: true,
      rowData: this.monthlyReturns,
      autoGroupColumnDef: {
        sort: 'desc'
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      aggFuncs: this.aggFuncs,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        lockPosition: true,
        enableValue: true
      },
      rowGroupPanelShow: 'always',
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
      },
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }

}
