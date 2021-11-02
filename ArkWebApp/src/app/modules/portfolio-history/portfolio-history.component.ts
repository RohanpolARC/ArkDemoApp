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
import {MatAccordion} from '@angular/material/expansion';
import { MatIconRegistry } from '@angular/material/icon';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
//import charts from '@adaptabletools/adaptable-plugin-charts';
import {
 // ActionColumnButtonContext,
  //AdaptableApi,
  //AdaptableButton,
  //AdaptableOptions,
  CustomToolPanelButtonContext,
  MenuContext,
  PredicateDefHandlerParams,
  ToolPanelButtonContext,
} from '@adaptabletools/adaptable-angular-aggrid';
import {
  AdaptableOptions,
  PredefinedConfig,
  AdaptableApi,
  AdaptableButton,
  ActionColumnButtonContext,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import {DataService} from '../../core/services/data.service'
import {BtnCellRenderer} from './btn-cell-renderer.component'
import {PortfolioHistoryService} from '../../core/services/PortfolioHistory/portfolio-history.service'

import Adaptable from '@adaptabletools/adaptable/agGrid';
import {AssetGIRModel} from '../../shared/models/AssetGIRModel';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogDeleteComponent} from './dialog-delete/dialog-delete.component';

import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";

let adapTableApi: AdaptableApi;

@Component({
  selector: 'app-portfolio-history',
  templateUrl: './portfolio-history.component.html',
  styleUrls: ['./portfolio-history.component.scss']
})


export class PortfolioHistoryComponent implements OnInit {

  rowData: Observable<any[]>;

  modules: Module[] = [ClientSideRowModelModule,RowGroupingModule,ColumnsToolPanelModule,MenuModule,SetFilterModule, ExcelExportModule];

  public gridOptions: GridOptions;
  private gridApi;
  private gridColumnApi;
  public getRowNodeId;
  public userName: String;
  public dialogRef;
  public rowGroupPanelShow;
  public defaultColDef;
  public sideBar;
  public frameworkComponents;
  public autoGroupColumnDef;

  public subscriptions: Subscription[] = [];
  // enables undo / redo
  public undoRedoCellEditing = true;

// restricts the number of undo / redo steps to 2
  public undoRedoCellEditingLimit = 5;

// enables flashing to help see cell changes
  public enableCellChangeFlash = true;

columnDefs = [
  { headerName:"Position Id",field: 'positionId',hide: true },
  { headerName:"Asset Id",field: 'assetId',hide: true},
  { headerName:"Issuer Short Name",field: 'issuerShortName',enableValue: true },
  { headerName:"Asset",field: 'asset',enableValue: true },
  { headerName:"Fund",field: 'fund',  autosize:true },
  { headerName:"Fund Hedging",field: 'fundHedging' },
  { headerName:"Fund Ccy", field: 'fundCcy' },
  { headerName:"As Of Date", field: 'asOfDate',  valueFormatter: this.dateFormatter,hide: true },
  { headerName:"Trade Date",field: 'tradeDate', rowGroup: true, SortOrder: 'Desc', hide: true, valueFormatter: this.dateFormatter },
  { headerName:"Type", field: 'typeDesc'},
  { headerName:"Settle Date",field: 'settleDate',  valueFormatter: this.dateFormatter },
  { headerName:"Position Ccy",field: 'positionCcy'},
  { headerName:"Amount",field: 'amount',enableValue: true ,  valueFormatter: this.amountFormatter },
  { headerName:"Par Amount",field: 'parAmount' ,  valueFormatter: this.amountFormatter },
  { headerName:"ParAmountLocal",field: 'parAmountLocal' ,  valueFormatter: this.amountFormatter},
  { headerName:"FundedParAmountLocal",field: 'fundedParAmountLocal' ,  valueFormatter: this.amountFormatter},
  { headerName:"CostAmountLocal",field: 'costAmountLocal',  valueFormatter: this.amountFormatter },
  { headerName:"FundedCostAmountLocal",field: 'fundedCostAmountLocal',  valueFormatter: this.amountFormatter },
  { headerName:"Going In Rate",field: 'fxRateBaseEffective',editable:true },
  { headerName:"Modified By", field: 'modifiedBy'},
  { headerName:"Modified On", field: "modifiedOn", valueFormatter: this.dateTimeFormatter},
  {
    headerName:"",
    field: 'actionNew',
    cellRenderer: 'btnCellRenderer',
    pinned: 'left',
    // cellRendererParams: {
    //   clicked: function(field: any) {
    //     console.log(`${field} was clicked`);
    //   }
    // },
    width: 40,
    autoSize:true
  },
  { headerName: "GIR Edited", field:'isEdited'},
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

    // enables undo / redo
this.undoRedoCellEditing = true;

// restricts the number of undo / redo steps to 5
this.undoRedoCellEditingLimit = 5;

// enables flashing to help see cell changes
this.enableCellChangeFlash = false;



  }


  ngOnInit(): void {
    this.rowData = this.portfolioHistoryService.getPortfolioHistory();

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public adaptableOptions: AdaptableOptions = {
    primaryKey: 'positionId',
    userName: "TestUser",
    adaptableId: '',
    adaptableStateKey: `Some Random State Key`,

    layoutOptions: {
      autoSaveLayouts: false,
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
                //console.log(result.message);
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
        Tabs: [],
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
        Layouts: [{
          Name: 'Basic',
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
    
      // CustomSort: {
      //   CustomSorts: [
      //     {
      //       ColumnId: 'tradeDate',
      //       SortOrder: [],
      //     },
      //   ],
      // },

    


    }
  
  }
  
  dateFormatter(params) {
    if(params.value!=undefined)
    return moment(params.value).format('DD/MM/YYYY');
    else{
      return ""
    }
  }
  
  dateTimeFormatter(params) {
    if(params.value==undefined || params.value=="0001-01-01T00:00:00")
      return ""
    else 
      return moment(params.value).format('DD/MM/YYYY HH:mm');
  }

  amountFormatter(params){
    if(params.value!=undefined&&Number(params.value)!=0)
    return Number(params.value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    else if(Number(params.value)==0) {
      return "-"
    } else{
      return ""
    }

  }
  
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // this.gridColumnApi.applyColumnState({state:[{colId: 'tradeDate', sort: 'desc'}], defaultState: {sort:'desc'},})

    // this.sortGrid(params, 'tradeDate', 'desc');
    // // const sortModel = [
    //   {colId: 'tradeDate', sort: 'desc'}
    // ];
    // this.gridApi.setSortModel(sortModel);

    // this.gridApi.setSortModel([{colId: 'tradeDate', sort: 'desc'}]);
  }

  // sortGrid(event, field, sortDir){
  //   const columnState = {
  //     state: [
  //       {
  //         colId: field,
  //         sort: sortDir
  //       }
  //     ]
  //   }
  //   event.columnApi.applyColumnState(columnState);
  // }

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
  }

  onRowEditingStarted(params) {
    params.api.refreshCells({
      columns: ["actionNew"],
      rowNodes: [params.node],
      force: true
    });
  }
  onRowEditingStopped(params) {
    params.api.refreshCells({
      columns: ["actionNew"],
      rowNodes: [params.node],
      force: true
    });
    params.api.refreshCells({
      columns: ["fxRateBaseEffective"],
      rowNodes: [params.node],
      force: true
    });
  }
  


}
