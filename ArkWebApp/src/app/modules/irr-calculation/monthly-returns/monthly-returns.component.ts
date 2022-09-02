import { ColDef, GridOptions, GridReadyEvent, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { MonthlyReturnsService } from 'src/app/core/services/MonthlyReturns/monthly-returns.service';
import { amountFormatter, dateFormatter, percentFormatter } from 'src/app/shared/functions/formatter';
import { MonthlyReturnsCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-monthly-returns',
  templateUrl: './monthly-returns.component.html',
  styleUrls: ['./monthly-returns.component.scss'],
  providers: []
})
export class MonthlyReturnsComponent implements OnInit {

  @Input() calcParams: MonthlyReturnsCalcParams;
  @Output() status = new EventEmitter<string>();
  
  subscriptions: Subscription[] = []
  columnDefsMonthlyRets: ColDef[]
  columnDefsIssuerRets: ColDef[]
  gridOptionsMonthlyRets: GridOptions
  gridOptionsIssuerRets: GridOptions
  issuerReturns
  monthlyReturns

  constructor(private monthlyReturnSvc: MonthlyReturnsService,
    private dtPipe: DatePipe
  ) { }

  ngOnChanges(changes: SimpleChanges){
    console.log(changes)

    let params = changes.calcParams.currentValue;
    params['baseMeasureID'] = 3;
    this.subscriptions.push(this.monthlyReturnSvc.getMonthlyReturns(params).subscribe({
      next: (data: any[]) => {
        this.status.emit('Loaded')

        // Issuer Returns

        let issuerReturns = [];
        data?.['issuerReturns'].forEach(ret => {
          console.log(ret)
          let row = { ...ret, ...ret?.['mReturns'] }
          delete row['mReturns'];

          issuerReturns.push(row);
        })

        this.issuerReturns = issuerReturns

        let monthlyReturns = [];
        data?.['monthlyReturns'].forEach(ret => {
          let row = { ...ret, ...ret?.['mReturns'] }
          delete row['mReturns'];

          monthlyReturns.push(row);
        })

        this.monthlyReturns = monthlyReturns
      },
      error: (error) => {
        this.status.emit('Failed')
      }
    }))

  }

  dateFormatter(params: ValueFormatterParams): string{

    console.log(this.dtPipe.transform(params.value, 'MMM-yy'))
    return this.dtPipe.transform(params.value, 'MMM-yy');
  }

  ngOnInit(): void {
    console.log("Inside Monthly Returns component");

    this.columnDefsMonthlyRets = [
      { field: 'asofDate', valueFormatter: this.dateFormatter.bind(this), headerName: 'As Of Date', sort: 'desc' },
      { field: 'monthlyPnL', valueFormatter: amountFormatter, headerName: 'Monthly P&L' },
      { field: 'baseMeasure', valueFormatter: amountFormatter },
      { field: 'returns', valueFormatter: percentFormatter },
      // { field: 'accFeesEur', valueFormatter: amountFormatter },
      // { field: 'accInterestEur', valueFormatter: amountFormatter },
    ]
    this.columnDefsIssuerRets = [
      { field: 'issuerShortName' },
      { field: 'monthlyPnL', valueFormatter: amountFormatter, headerName: 'Monthly P&L' },
      { field: 'baseMeasure', valueFormatter: amountFormatter },
      { field: 'returns', valueFormatter: percentFormatter },
      { field: 'accFeesEur', valueFormatter: amountFormatter },
      { field: 'accInterestEur', valueFormatter: amountFormatter },
    ]

    this.gridOptionsMonthlyRets = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefsMonthlyRets,
      suppressAggFuncInHeader: true,
      rowData: this.monthlyReturns,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        lockPosition: true
      },
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
      }
    }

    this.gridOptionsIssuerRets = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefsIssuerRets,
      suppressAggFuncInHeader: true,
      rowData: this.issuerReturns,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        lockPosition: true
      },
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
      }
    }
  }

}
