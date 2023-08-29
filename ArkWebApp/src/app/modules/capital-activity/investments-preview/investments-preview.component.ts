import { ColDef, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { amountFormatter, dateFormatter } from 'src/app/shared/functions/formatter';
import { CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';

@Component({
  selector: 'app-investments-preview',
  templateUrl: './investments-preview.component.html',
  styleUrls: ['./investments-preview.component.scss']
})
export class InvestmentsPreviewComponent implements OnInit {

  @Input() rowData: CapitalInvestment[]
  constructor() { }
  columnDefs: ColDef[] 

  gridOptions: GridOptions 

  ngOnInit(): void {
    
    this.columnDefs = [
      {field: 'positionID', headerName: 'Position ID', tooltipField: 'positionID'},
      {field: 'cashDate', headerName: 'Cash Date', valueFormatter: dateFormatter, tooltipField: 'cashDate'},
      {field: 'type', headerName: 'Type', tooltipField: 'type'},
      {field: 'amount', headerName: 'Total', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'amount'},
      {field: 'totalBase', headerName: 'Total Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'totalBase'},
      {field: 'linkedAmount', headerName: 'Linked Amount', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'linkedAmount'},
      {field: 'linkedAmountBase', headerName: 'Linked Amount Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'linkedAmountBase'},
      {field: 'break', headerName: 'Break', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'break' },
      {field: 'breakBase', headerName: 'Break Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'breakBase' },
      {field: 'groupBreak', headerName: 'Group Break', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'groupBreak'  },
      {field: 'groupBreakBase', headerName: 'Group Break Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'groupBreakBase'  },
      {field: 'positionCcy', headerName: 'Position Ccy', tooltipField: 'positionCcy'},
      {field: 'portfolio', headerName: 'Portfolio', tooltipField: 'portfolio'},
      {field: 'issuerShortName', headerName: 'Issuer', tooltipField: 'issuerShortName'},
      {field: 'asset', headerName: 'Asset', tooltipField: 'asset'},
      {field: 'groupID', headerName: 'Group ID', tooltipField: 'groupID'}
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      enableRangeSelection: true,
      tooltipShowDelay: 0,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: false,
        sortable: false,
        filter: true
      },
      rowGroupPanelShow: 'always',
      rowHeight: 30,
      headerHeight: 30,
      groupHeaderHeight: 30,
      onGridReady: (params: GridReadyEvent) => {
        params.columnApi.autoSizeAllColumns(false);
      },
    }
  }

}
