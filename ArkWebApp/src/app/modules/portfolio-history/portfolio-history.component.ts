import { Component, OnInit } from '@angular/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { Observable, Subscription} from 'rxjs';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
} from '@adaptabletools/adaptable/types';
import {DataService} from '../../core/services/data.service'
import {BtnCellRenderer} from './btn-cell-renderer.component'
import {PortfolioHistoryService} from '../../core/services/PortfolioHistory/portfolio-history.service'

import {MatDialog } from '@angular/material/dialog';
import {DialogDeleteComponent} from './dialog-delete/dialog-delete.component';

import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { dateFormatter, dateTimeFormatter, amountFormatter, nonAmountNumberFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { ColDef, GridOptions, Module } from '@ag-grid-community/core';
import { ActionColumnContext } from '@adaptabletools/adaptable-angular-aggrid';

let adapTableApi: AdaptableApi;

@Component({
  selector: 'app-portfolio-history',
  templateUrl: './portfolio-history.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './portfolio-history.component.scss']
})


export class PortfolioHistoryComponent implements OnInit {

  rowData: Observable<any[]>;

  modules: Module[] = CommonConfig.AG_GRID_MODULES

  public gridOptions: GridOptions;
  public getRowNodeId;
  public userName: String;
  public dialogRef;
  public rowGroupPanelShow;
  public defaultColDef;
  public sideBar;
  public frameworkComponents;
  public autoGroupColumnDef;

  public subscriptions: Subscription[] = [];

  columnDefs: ColDef[] = [
  { headerName: "Position Id", field: 'positionId',hide: true, type:'abColDefNumber' },
  { headerName: "Asset Id", field: 'assetId',hide: true, type:'abColDefNumber'},
  { headerName: "Issuer Short Name ",field: 'issuerShortName',enableValue: true, type:'abColDefString' },
  { headerName: "Asset",field : 'asset',enableValue: true, type:'abColDefString' },
  { headerName: "Fund",field : 'fund', type:'abColDefString' },
  { headerName: "Fund Hedging", field: 'fundHedging', type:'abColDefString' },
  { headerName: "Fund Ccy",  field: 'fundCcy', type:'abColDefString' },
  { headerName: "As Of Date ", field: 'asOfDate',  valueFormatter: dateFormatter, cellClass: 'dateUK' ,hide: true, type:'abColDefDate' },
  { headerName: "Trade Date", field: 'tradeDate', rowGroup: true, hide: true, valueFormatter: dateFormatter, cellClass: 'dateUK' , type:'abColDefDate' },
  { headerName: "Type", field : 'typeDesc', type:'abColDefString'},
  { headerName: "Settle Date", field: 'settleDate',  valueFormatter: dateFormatter, cellClass: 'dateUK' , type:'abColDefDate' },
  { headerName: "Position Ccy", field: 'positionCcy', type:'abColDefString'},
  { headerName: "Amount",field : 'amount',enableValue: true ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
  { headerName: "Par Amount", field: 'parAmount' ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
  { headerName: "ParAmountLocal",field : 'parAmountLocal' ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName: "FundedParAmountLocal",field : 'fundedParAmountLocal' ,  valueFormatter: amountFormatter, type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName: "CostAmountLocal",field : 'costAmountLocal',  valueFormatter: amountFormatter , type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName: "FundedCostAmountLocal",field : 'fundedCostAmountLocal',  valueFormatter: amountFormatter , type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
  { headerName: "Edited Going In Rate",field: 'fxRateBaseEffective',editable:true , type:'abColDefNumber', cellClass: 'ag-right-aligned-cell', valueFormatter: nonAmountNumberFormatter},
  { headerName: "Modified By",  field: 'modifiedBy', type:'abColDefString'},
  { headerName: "Modified On",  field: "modifiedOn", valueFormatter: dateTimeFormatter, type:'abColDefDate', cellClass: 'dateUK'},
  {
    headerName:"",
    field: 'actionNew',
    cellRenderer: 'btnCellRenderer',
    pinned: 'right',
    width: 40,
    type:'abColDefObject'
  },
  { headerName: "GIR Edited", field:'isEdited', type:'abColDefString'},
  { headerName: 'GIR Override', field: 'isOverride', type: 'abColDefString' },
  { headerName: 'GIR Source', field: 'girSource', type: 'abColDfString' },
  { headerName: 'GIR SourceID', field: 'girSourceID', type: 'abColDefNumber', valueFormatter: nonAmountNumberFormatter },
  { field:'uniqueID', type:'abColDefNumber'},
  { field: 'pgh_FXRateBaseEffective', headerName: 'Effective Going In Rate', valueFormatter: nonAmountNumberFormatter, cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'}
];

  constructor(
    private portfolioHistoryService: PortfolioHistoryService,
    public dialog: MatDialog, 
    private dataSvc: DataService) {

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
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey: true,
      context: {
        adaptableApi: adapTableApi
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
    };

    this.defaultColDef = {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      filter: true
    };

    this.autoGroupColumnDef = {
      sort: 'desc',
      sortable: true,
    };

    this.sideBar = 'columns';
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderer
    }
    this.rowGroupPanelShow = 'always';


  }


  ngOnInit(): void {
    this.rowData = this.portfolioHistoryService.getPortfolioHistory()
      .pipe(
        map((historyData: any[]) => historyData.map(row => {
          row['isEdited'] = row['isEdited'] ? 'Yes' : 'No';
          row['isOverride'] = row['isOverride'] ? 'Yes' : 'No';
          return row;
        }))
      )
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  public adaptableOptions: AdaptableOptions = {
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    primaryKey: "uniqueID",
    userName: this.dataSvc.getCurrentUserName(),
    adaptableId: "Portfolio History",
    adaptableStateKey: `Portfolio State Key`,

    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,


    layoutOptions: {
      autoSaveLayouts: true,
    },

    teamSharingOptions: {
      enableTeamSharing: true,
      setSharedEntities: setSharedEntities.bind(this),
      getSharedEntities: getSharedEntities.bind(this)
    },

    actionOptions:{
      actionColumns:[
        {
          columnId: 'ActionDelete',
          friendlyName: 'Delete',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {

              let dialogRef = this.dialog.open(DialogDeleteComponent,{
                data: {
                  rowData: context.rowNode?.data,
                  adapTableApi: adapTableApi
                }});
              this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
                if(dialogRef.componentInstance.isSuccess)
                  this.gridOptions.api?.refreshCells({ force: true, rowNodes: [context.rowNode], columns: ['fxRateBaseEffective', 'isEdited', 'modifiedOn', 'modifiedBy', 'isOverride', 'girSource', 'girSourceID'] })
              }));
            },
            icon:{
              src: '../assets/img/trash.svg',
              style: {
                height: 25, width: 25
              }
            }
          },
        },
      ]
    },
    generalOptions: {

      /* Adaptable calls this on grid init */
      /* Custom comparator for descending order */  
      customSortComparers: [
        {
          scope: {
            ColumnIds: ['tradeDate']
          },
          comparer: (valueA: Date, valueB: Date) => {
            if(valueA > valueB)
              return 1;
            else if(valueA < valueB)
              return -1;
            else
              return 0; 
          }
        }
      ]
    },

    predefinedConfig: {
      Dashboard: {
        Revision: 1,
        ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
        IsCollapsed: true,
        Tabs: [{
          Name:'Layout',
          Toolbars: ['Layout'],
        }],
        DashboardTitle: ' '
      },
      QuickSearch: {
        QuickSearchText: '',
        Style: {
          BackColor: '#ffff00',
          ForeColor: '#808080',
        },
      
      },
    
      Layout:{
        Revision: 2,
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
            'pgh_FXRateBaseEffective',
            'amount',
            'parAmount',
            'parAmountLocal',
            'fundedParAmountLocal',
            'costAmountLocal',
            'fundedCostAmountLocal',
            'assetId',
            'modifiedBy',
            'modifiedOn',
            'isEdited',
            'isOverride',
            'girSource',
            'girSourceID',
            'actionNew',
            'ActionDelete',
          ],
          PinnedColumnsMap: {
            actionNew: 'right',
            ActionDelete: 'right',
          },
          RowGroupedColumns: ['tradeDate', 'fundCcy', 'positionCcy'],
          ColumnWidthMap:{
            ActionDelete: 50,
          },
          ColumnFilters: [{
            ColumnId: 'typeDesc',
            Predicate: {
              PredicateId: 'Values',
              Inputs: ['Borrowing', 'Buy Trade']
            }
          }],        
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

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adapTableApi = adaptableApi;
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    // use AdaptableApi for runtime access to Adaptable
  };

}
