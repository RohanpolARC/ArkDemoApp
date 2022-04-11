import { Component, Inject, OnInit } from '@angular/core';
import {
  ColDef,
  GridApi,
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { HttpClient } from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import * as moment from 'moment'
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
  ActionColumnButtonContext,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import {DataService} from '../../core/services/data.service'
import {BtnCellRenderer} from './btn-cell-renderer.component'
import {PortfolioHistoryService} from '../../core/services/PortfolioHistory/portfolio-history.service'

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogDeleteComponent} from './dialog-delete/dialog-delete.component';

import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { dateFormatter, dateTimeFormatter, amountFormatter } from 'src/app/shared/functions/formatter';

let adapTableApi: AdaptableApi;

@Component({
  selector: 'app-portfolio-history',
  templateUrl: './portfolio-history.component.html',
  styleUrls: ['./portfolio-history.component.scss']
})


export class PortfolioHistoryComponent implements OnInit {

  rowData: any[];

  modules: Module[] = [ClientSideRowModelModule,RowGroupingModule,ColumnsToolPanelModule,MenuModule,SetFilterModule, ExcelExportModule];

  public gridOptions: GridOptions;
  public getRowNodeId;
  public userName: String;
  public dialogRef;
  public rowGroupPanelShow;
  public defaultColDef;
  public sideBar;
  public frameworkComponents;
  public autoGroupColumnDef;

  private gridApi;
  private gridColumnApi;

  public subscriptions: Subscription[] = [];

  columnDefs = [
  { headerName:"Position Id",field: 'positionId',hide: true, type:'abColDefNumber' },
  { headerName:"Asset Id",field: 'assetId',hide: true, type:'abColDefNumber'},
  { headerName:"Issuer Short Name",field: 'issuerShortName',enableValue: true, type:'abColDefString' },
  { headerName:"Asset",field: 'asset',enableValue: true, type:'abColDefString' },
  { headerName:"Fund",field: 'fund',  autosize:true, type:'abColDefString' },
  { headerName:"Fund Hedging",field: 'fundHedging', type:'abColDefString' },
  { headerName:"Fund Ccy", field: 'fundCcy', type:'abColDefString' },
  { headerName:"As Of Date", field: 'asOfDate',  valueFormatter: dateFormatter,hide: true, type:'abColDefDate' },
  { headerName:"Trade Date",field: 'tradeDate', rowGroup: true, SortOrder: 'Desc', hide: true, valueFormatter: dateFormatter, type:'abColDefDate' },
  { headerName:"Type", field: 'typeDesc', type:'abColDefString'},
  { headerName:"Settle Date",field: 'settleDate',  valueFormatter: dateFormatter, type:'abColDefDate' },
  { headerName:"Position Ccy",field: 'positionCcy', type:'abColDefString'},
  { headerName:"Amount",field: 'amount',enableValue: true ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
  { headerName:"Par Amount",field: 'parAmount' ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
  { headerName:"ParAmountLocal",field: 'parAmountLocal' ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName:"FundedParAmountLocal",field: 'fundedParAmountLocal' ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName:"CostAmountLocal",field: 'costAmountLocal',  valueFormatter: amountFormatter , type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName:"FundedCostAmountLocal",field: 'fundedCostAmountLocal',  valueFormatter: amountFormatter , type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName:"Going In Rate",field: 'fxRateBaseEffective',editable:true , type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName:"Modified By", field: 'modifiedBy', type:'abColDefString'},
  { headerName:"Modified On", field: "modifiedOn", valueFormatter: dateTimeFormatter, type:'abColDefDate'},
  {
    headerName:"",
    field: 'actionNew',
    cellRenderer: 'btnCellRenderer',
    pinned: 'right',
    width: 40,
    autoSize:true,
    type:'abColDefObject'
  },
  { headerName: "GIR Edited", field:'isEdited', type:'abColDefBoolean'},
  { field:'uniqueID', type:'abColDefNumber'},
];



  constructor(private http: HttpClient,private portfolioHistoryService: PortfolioHistoryService,public dialog: MatDialog, private dataService: DataService) { 


    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent' },
        ],
      },
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true
      
    //  rowData: this.rowData,
     // onGridReady: this.onGridReady,
    };

    this.defaultColDef = {
      // flex: 1,
      // minWidth: 100,
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      filter: true,
      autosize:true
    };

    this.autoGroupColumnDef = {
      sort: 'desc',
      sortable: true,
    };

    this.sideBar = 'columns';

    //this.getRowNodeId = data => data.id;

    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderer
    }

    this.rowGroupPanelShow = 'always';


  }


  ngOnInit(): void {
//    localStorage.clear();
    this.subscriptions.push(this.portfolioHistoryService.getPortfolioHistory().subscribe({
      next: data => {
        this.rowData = data;
      },
      error: error => {
        console.error("Error in fetching the data: " + error);
      }
    }));
    //this.rowData = this.portfolioHistoryService.getPortfolioHistory();

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public adaptableOptions: AdaptableOptions = {
    primaryKey: "uniqueID",
    userName: "TestUser",
    adaptableId: "",
    adaptableStateKey: `Portfolio State Key`,

    layoutOptions: {
      autoSaveLayouts: true,
    },
    // userInterfaceOptions: {
    //   showAdaptableToolPanel: true
    // }
    userInterfaceOptions:{
      actionColumns:[
        {
          columnId: 'ActionDelete',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnButtonContext>,
              context: ActionColumnButtonContext
            ) => {

              let confirmDelete:boolean = false;
              let dialogRef = this.dialog.open(DialogDeleteComponent,{
                data: {
                  rowData: context.rowNode?.data,
                  adapTableApi: adapTableApi
                }});
              this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
              }));
            },
            icon:{
              src:
              '../assets/img/trash.svg',
            }
          },
        },
      ]
    },
    generalOptions: {
      // autoSortGroupedColumns: true,

      /* Adaptable calls this on grid init */
      /* Custom comparator for descending order */  
      columnSortComparers:[{
        columnId: 'tradeDate',
        comparer: (valueA: Date, valueB: Date) => {
          if(valueA > valueB)
            return -1;
          else if(valueA < valueB)
            return 1;
          else
            return 0; 
        }
      }]
    },

    predefinedConfig: {
      Dashboard: {
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        IsCollapsed: true,
        Tabs: [{
          Name:'Layout',
          Toolbars: ['Layout']
        }]
      },
      Filter:{
        ColumnFilters: [{
          ColumnId: 'typeDesc',
          Predicate: {
            PredicateId: 'Values',
            Inputs: ['Borrowing', 'Buy Trade']
          }
        }]
      },
      FormatColumn:{
        FormatColumns: [
          {
            Scope: {
              ColumnIds: ['ActionDelete'],
            },
            HeaderName: " ",
          }
        ]
      },
      QuickSearch: {
        QuickSearchText: '',
        Style: {
          BackColor: '#ffff00',
          ForeColor: '#808080',
        },
      
      },
    
      Layout:{
        CurrentLayout: 'Basic Portfolio History',
        Layouts: [{
          Name: 'Basic Portfolio History',
          Columns: [
            'issuerShortName',
            'asset',
            'fund',
            'fundHedging',
            'settleDate',
            'typeDesc',
            'positionCcy',
            'fundCcy',
            'fxRateBaseEffective',
            'amount',
            'parAmount',
            'parAmountLocal',
            'fundedParAmountLocal',
            'costAmountLocal',
            'fundedCostAmountLocal',
            'assetId',
            'modifiedBy',
            'modifiedOn',
            'actionNew',
            'ActionDelete',
          ],
          PinnedColumnsMap: {
            actionNew: 'right',
            ActionDelete: 'right',
          },
          RowGroupedColumns: ['tradeDate'],
          
          ColumnWidthMap:{
            ActionDelete: 50,
          },
          

          ColumnSorts: [
            {
              ColumnId: 'tradeDate',
              SortOrder: 'Desc',
            },
          ],
        }]
      }
    
    }
  
  }
    
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

  }

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    adapTableApi = adaptableApi;
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

/* Close right sidebar toolpanel by default */
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

}
