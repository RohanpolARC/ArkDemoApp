import { Injectable } from '@angular/core';
import { PortfolioHistoryGridUtilService } from './portfolio-history-grid-util.service';
import { ColDef, FirstDataRenderedEvent, Grid, GridOptions, ValueGetterParams } from '@ag-grid-community/core';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { IPropertyReader, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { PortfolioHistoryComponentReaderService } from './portfolio-history-component-reader.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BtnCellRenderer } from '../btn-cell-renderer.component';
import { AggridMatCheckboxEditorComponent } from 'src/app/shared/modules/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.component';

@Injectable()
export class PortfolioHistoryGridConfigService {

  columnDefs : ColDef[] = []
  gridOptions : GridOptions
  adaptableOptions : AdaptableOptions
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';


  constructor(
    private portfolioHistoryCompReaderService: PortfolioHistoryComponentReaderService,
    private portfolioHistoryGridUtilService : PortfolioHistoryGridUtilService,
    private dataSvc : DataService
  ) {  }


  getColumnDefs() : ColDef[] {
    this.columnDefs = [
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
      { headerName: "Modified By",  field: 'modifiedBy', type:'abColDefString'},
      { headerName: "Modified On",  
        field: "modifiedOn", 
        type:'abColDefDate', 
        cellClass: 'dateUK',
        valueGetter:dateNullValueGetter
      },
      { headerName: "Reviewed By",  field: 'reviewedBy', type:'abColDefString'},
      {field : "reviewedOn", type:'abColDefDate', cellClass:'dateUk', valueGetter:(params:ValueGetterParams)=>{
        return dateNullValueGetter(params,'reviewedOn')
      }},
      {
        headerName:"",
        field: 'actionNew',
        cellRenderer: 'btnCellRenderer',
        pinned: 'right',
        width: 40,
        type:'abColDefObject'
      },
    
      { headerName: 'GIR Override', field: 'isOverride', type: 'abColDefString' },
      { headerName: 'GIR Source', field: 'girSource', type: 'abColDefString' },
      { headerName: 'GIR SourceID', field: 'girSourceID', type: 'abColDefNumber' },
      { headerName: 'GIR Date', field:'girDate',type:'abColDefDate'},
      { headerName: 'GIR Editable', field:'isEditable',type:'abColDefBoolean'},
      { field:'uniqueID', type:'abColDefNumber'},
      { field: 'pgh_FXRateBaseEffective', headerName: 'Effective Going In Rate', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'staging_FXRateBase', headerName: 'Edited Going In Rate', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'colour', type: 'abColDefString' },
      { field: 'reason', type: 'abColDefString',width:400 },
      { headerName: "isReviewed", 
        cellRenderer: 'isReviewedCheckboxRenderer',
          cellRendererParams : () => { return this.portfolioHistoryGridUtilService.getIsReviewedCheckboxRendererParams() },
          field:'isReviewed', type:'abColDefBoolean',width:30
        },
    
    
    ];
    return this.columnDefs
  }

  getAdaptableOptions() : AdaptableOptions {
    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
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
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
  
      actionOptions:{
        actionColumns:[
          {
            columnId: 'ActionDelete',
            friendlyName: 'Delete',
            actionColumnButton: {
              onClick: this.portfolioHistoryGridUtilService.onClickActionDelete.bind(this.portfolioHistoryGridUtilService),
              icon:{
                src: '../assets/img/trash.svg',
                style: {
                  height: 25, width: 25
                }
              }
            }
          },
          {
            columnId: 'ActionInfo',
            friendlyName: 'Info',
            actionColumnButton: {
              onClick: this.portfolioHistoryGridUtilService.onClickActionInfo.bind(this.portfolioHistoryGridUtilService),
              icon:{
                src: '../assets/img/info.svg',
                style: {
                  height: 25, width: 25
                }
              }
            }
          }
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
          Revision: 14,
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
              'pgh_FXRateBaseEffective',
              'staging_FXRateBase',
              'girSource',
              'girDate',
              'reason',
              'amount',
              'parAmount',
              'parAmountLocal',
              'fundedParAmountLocal',
              'costAmountLocal',
              'fundedCostAmountLocal',
              'assetId',
              'modifiedBy',
              'modifiedOn',
              'isOverride',
              'actionNew',
              'isReviewed',
              'ActionDelete',
              'ActionInfo'
            ],
            PinnedColumnsMap: {
              actionNew: 'right',
              ActionDelete: 'right',
              isReviewed:'right',
              ActionInfo:'right'
            },
            ColumnWidthMap:{
              ActionDelete: 50,
              ActionInfo:50,
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

        StatusBar: {
          Revision:5,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['Filter']
            },
            {
              Key: 'Right Panel',
              StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
            },
          ],
        },
  
        FormatColumn: {
          Revision: 35,
          FormatColumns: [
            
            
            BLANK_DATETIME_FORMATTER_CONFIG(['asOfDate', 'tradeDate', 'settleDate', 'modifiedOn','reviewedOn','girDate']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['asOfDate', 'tradeDate', 'settleDate','girDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn','reviewedOn']),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero([ 'pgh_FXRateBaseEffective','staging_FXRateBase'], 8),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal'] ),
            AMOUNT_FORMATTER_CONFIG_Zero(['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal', 'pgh_FXRateBaseEffective','staging_FXRateBase'],2,['amountZeroFormat'])
          ]
        }
      }
    }
    return this.adaptableOptions
  }

  
  getGridOptions(): GridOptions {
    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      rowGroupPanelShow : 'always',
      autoGroupColumnDef: this.getAutoGroupColumnDef(),
      enableRangeSelection: true,
      sideBar:  true,
      suppressMenuHide: true,
      singleClickEdit: true,
      rowHeight: 35,
      groupHeaderHeight: 35,
      headerHeight: 35,
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey: true,
      // context: {
      //   adaptableApi: this.portfolioHistoryCompReaderService.getAdaptableApi(),
      //   component: this

      // },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      components:this.getFrameworkComponents(),
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    };

    return this.gridOptions;
  }

  getFrameworkComponents()  {
    let frameworkComponents = {
      btnCellRenderer: BtnCellRenderer,
      isReviewedCheckboxRenderer:AggridMatCheckboxEditorComponent

    }
    return frameworkComponents
  }

  getDefaultColDef() : ColDef {
    return {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      filter: true,
      tooltipField:'reason'
    }
  }

  getAutoGroupColumnDef() : ColDef {
    return {
      sort: 'desc',
      sortable: true,
    }
  }

}
