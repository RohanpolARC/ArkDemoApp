import { Component, OnInit } from '@angular/core';
import { Observable, Subscription} from 'rxjs';
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

import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { ColDef, GridOptions, Module } from '@ag-grid-community/core';
import { ActionColumnContext} from '@adaptabletools/adaptable-angular-aggrid';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

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
  { headerName: "As Of Date ", field: 'asOfDate',  cellClass: 'dateUK' ,hide: true, type:'abColDefDate' },
  { headerName: "Trade Date", field: 'tradeDate', rowGroup: true, hide: true, cellClass: 'dateUK' , type:'abColDefDate' },
  { headerName: "Type", field : 'typeDesc', type:'abColDefString'},
  { headerName: "Settle Date", field: 'settleDate',  cellClass: 'dateUK' , type:'abColDefDate' },
  { headerName: "Position Ccy", field: 'positionCcy', type:'abColDefString'},
  { headerName: "Amount",field : 'amount',enableValue: true , type:'abColDefNumber' },
  { headerName: "Par Amount", field: 'parAmount' , type:'abColDefNumber' },
  { headerName: "ParAmountLocal",field : 'parAmountLocal' , type:'abColDefNumber'},
  { headerName: "FundedParAmountLocal",field : 'fundedParAmountLocal' , type:'abColDefNumber'},
  { headerName: "CostAmountLocal",field : 'costAmountLocal', type:'abColDefNumber'},
  { headerName: "FundedCostAmountLocal",field : 'fundedCostAmountLocal', type:'abColDefNumber'},
  { headerName: "Edited Going In Rate",field: 'fxRateBaseEffective', type:'abColDefNumber'},
  { headerName: 'Edited Going In Rate Method', field:'fxRateEffectiveMethod',type:'abColDefString'},
  { headerName: "Modified By",  field: 'modifiedBy', type:'abColDefString'},
  { headerName: "Modified On",  
    field: "modifiedOn", 
    type:'abColDefDate', 
    cellClass: 'dateUK',
    valueGetter:dateNullValueGetter
  },
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
  { headerName: 'GIR Source', field: 'girSource', type: 'abColDefString' },
  { headerName: 'GIR SourceID', field: 'girSourceID', type: 'abColDefNumber' },
  { headerName: 'GIR Date', field:'girDate',type:'abColDefDate'},
  { headerName: 'GIR Editable', field:'isEditable',type:'abColDefBoolean'},
  { field:'uniqueID', type:'abColDefNumber'},
  { field: 'pgh_FXRateBaseEffective', headerName: 'Effective Going In Rate', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'}
];
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

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
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },

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

    userInterfaceOptions:{
      customDisplayFormatters: [
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat',['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal'])
        ],
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
      Export: {
        CurrentReport: 'Portfolio History',
        CurrentDestination: 'Excel'
      },

      Layout:{
        Revision: 6,
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
            'fxRateEffectiveMethod',
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
            'girDate',
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
      },

      FormatColumn: {
        Revision: 23,
        FormatColumns: [
          
          BLANK_DATETIME_FORMATTER_CONFIG(['asOfDate', 'tradeDate', 'settleDate', 'modifiedOn','girDate']),
          DATE_FORMATTER_CONFIG_ddMMyyyy(['asOfDate', 'tradeDate', 'settleDate','girDate']),
          DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn']),
          AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['fxRateBaseEffective', 'pgh_FXRateBaseEffective'], 8),
          AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal'] ),
          AMOUNT_FORMATTER_CONFIG_Zero(['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal','fxRateBaseEffective', 'pgh_FXRateBaseEffective'],2,['amountZeroFormat'])
        ]
      }
    }
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adapTableApi = adaptableApi;
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    // use AdaptableApi for runtime access to Adaptable
  };

}