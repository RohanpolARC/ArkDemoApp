import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core';
import { NoRowsOverlayComponent } from '@ag-grid-community/core/dist/cjs/es5/rendering/overlays/noRowsOverlayComponent';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { DataService } from 'src/app/core/services/data.service';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { UtilService } from './util.service';
import { InvestorGridUtilService } from './investor-grid-util.service';

@Injectable()
export class InvestorGridConfigService {
  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  noRowsToDisplay: NoRowsCustomMessages = 'No data found.';
  constructor(private dataSvc: DataService,
    private gridUtilSvc: InvestorGridUtilService
  ) {
    this.init()
  }
  init(){

    this.columnDefs = [
      { field: 'capitalID', tooltipField: 'capitalID', headerName: 'Capital ID', type: 'abColDefNumber'},
      { field: 'callDate', tooltipField: 'callDate', headerName: 'Call Date', type: 'abColDefDate', cellClass: 'dateUK' },
      { field: 'valueDate', tooltipField: 'valueDate', headerName: 'Value Date', type: 'abColDefDate', cellClass: 'dateUK'},
      { field: 'capitalType', tooltipField: 'capitalType', headerName: 'Capital Type', type:'abColDefString'},
      { field: 'capitalSubType', tooltipField: 'capitalSubType', headerName: 'Capital Subtype', type:'abColDefString'},
      { field: 'fundHedging', tooltipField: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
      { field: 'fundCcy', tooltipField: 'fundCcy', headerName: 'Fund Ccy', type:'abColDefString'},
      // { field: 'posCcy', tooltipField: 'posCcy', headerName: 'Position Ccy', type: 'abColDefString'},
      // { field: 'fxRate', tooltipField: 'fxRate', headerName: 'FXRate',  type: 'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      // { field: 'fxRateOverride', tooltipField: 'fxRateOverride', headerName: 'FXRate Override', type: 'abColDefBoolean' },
      // { field: 'fxRateSource', tooltipField: 'fxRateSource', type: 'abColDefString' },
      { field: 'totalAmount', tooltipField: 'totalAmount', headerName: 'Total Amount', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'wsoIssuerID', tooltipField: 'wsoIssuerID', headerName: 'WSO Issuer ID',  type: 'abColDefNumber'},
      { field: 'issuerShortName', tooltipField: 'issuerShortName', headerName: 'Issuer Short Name', type:'abColDefString'},
      { field: 'wsoAssetID', tooltipField: 'wsoAssetID', headerName: 'WSO Asset ID', type: 'abColDefString'},
      { field: 'asset', tooltipField: 'asset', headerName: 'Asset', type:'abColDefString'},
      { field: 'narrative', tooltipField: 'narrative', headerName: 'Narrative', type:'abColDefString'},
      { field: 'strategy', tooltipField: 'Strategy/Currency', headerName: 'Strategy/Currency', type:'abColDefString'},
      { field: 'source', tooltipField: 'source', headerName: 'Source', type:'abColDefString'},
      { field: 'sourceID', tooltipField: 'sourceID', headerName: 'Source ID', type:'abColDefNumber'},
      { field: 'isLinked', tooltipField: 'isLinked', headerName: 'Is Linked', type:'abColDefBoolean'},
      { field: 'linkedAmount', tooltipField: 'linkedAmount', headerName: 'Linked Total Base', type:'abColDefNumber'},
      { field: 'createdOn', tooltipField: 'createdOn', headerName: 'Created On', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'createdBy', tooltipField: 'createdBy', headerName: 'Created By', type:'abColDefString'},
      { field: 'modifiedOn', tooltipField: 'modifiedOn', headerName: 'Modified On', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'modifiedBy', tooltipField: 'modifiedBy', headerName: 'Modified By', type:'abColDefString'}
    ]
    
    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      context:{},
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:false,
      suppressScrollOnNewData: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
            noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplay,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      rowHeight: 30,
      headerHeight: 30,
      groupHeaderHeight: 30,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        filter: true
      }
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'capitalID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Capital Activity - Investor Cashflows',
      adaptableStateKey: `Capital Activity Key`,

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      searchOptions: {
        clearSearchesOnStartUp: true
      },

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },
  
      actionOptions: {
        actionColumns: [
          {
            columnId: 'Edit',
            actionColumnButton: {
              onClick: this.gridUtilSvc.editActionColumn.bind(this.gridUtilSvc),
              icon: {
                src: '../assets/img/edit.svg',
                style: {
                  height: 25, width: 25
                }
              },
            },
          }
        ]
      },

      userInterfaceOptions:{
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat',['totalAmount','linkedAmount']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nonAmountNumberFormatter',['fxRate']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nullOrZeroFormatter',['wsoIssuerID','wsoAssetID','sourceID'])
          ],
      },
  
      predefinedConfig: {
        Dashboard: {
          Revision: 3,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 7,
          CurrentLayout: 'Basic Capital Activity',
          Layouts: [{
            Name: 'Basic Capital Activity',
            Columns: [
              'callDate',
              'valueDate',
              'capitalType',
              'capitalSubType',
              'fundHedging',
              'issuerShortName',
              'asset',
              'fundCcy',
              'totalAmount',
              'wsoAssetID',
              'narrative',
              'source',
              'isLinked',
              'linkedAmount',
              'capitalID',
              'strategy',
              'Edit',
            ],
            RowGroupedColumns: [],
            ColumnWidthMap:{
              Edit: 50,
            },
            PinnedColumnsMap: {
              Edit: 'right',
            },
  
          }]
        },
        FormatColumn:{
          Revision:6,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['callDate','valueDate','createdOn','modifiedOn']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['callDate','valueDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['createdOn','modifiedOn']),
            CUSTOM_FORMATTER(['wsoIssuerID','wsoAssetID','sourceID'],['nullOrZeroFormatter']),
            CUSTOM_FORMATTER(['fxRate'],['nonAmountNumberFormatter']),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['totalAmount','linkedAmount'],2,['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_Zero(['totalAmount','linkedAmount'],2,['amountZeroFormat']),

          ]
        },
        StatusBar: {
          Revision: 2,
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
        }
      }
    }
  }
}