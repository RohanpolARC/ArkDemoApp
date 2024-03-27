import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';

@Injectable()
export class GridConfigService {

  gridApi: GridApi
  adaptableApi: AdaptableApi

  constructor(
    private dataSvc: DataService
  ) { }

  AMOUNT_COLUMNS = [
    'marketValueLatest'
    ,'marketValueLast'
    ,'mvDeltaExisting'
    ,'mvDeltaNew'
    ,'marketValueIssueLatest'
    ,'marketValueIssueLast'
    ,'mvIssueDeltaExisting'
    ,'mvIssueDeltaNew'
    ,'faceValue'
    ,'faceValueFunded'
    ,'faceValueFundedSD'
    ,'costValue'
    ,'costValueFunded'
    ,'costValueFundedSD'
    ,'marketValueFunded'
    ,'marketValueFundedSD'
    ,'faceValueIssue'
    ,'faceValueIssueFunded'
    ,'faceValueIssueFundedSD'
    ,'costValueIssue'
    ,'costValueIssueFunded'
    ,'costValueIssueFundedSD'
    ,'marketValueIssue'
    ,'marketValueIssueFunded'
    ,'marketValueIssueFundedSD'
  ]

  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES]

  columnDefs: ColDef[] = [
    { field:'positionId', type: 'abColDefNumber' },
    { field:'marketValueLatest', type: 'abColDefNumber' },
    { field:'marketValueLast', type: 'abColDefNumber' },
    { field:'mvDeltaExisting', type: 'abColDefNumber', headerName: 'MV Delta Existing' },
    { field:'mvDeltaNew', type: 'abColDefNumber', headerName: 'MV Delta New' },
    { field:'marketValueIssueLatest', type: 'abColDefNumber' },
    { field:'marketValueIssueLast', type: 'abColDefNumber' },
    { field:'mvIssueDeltaExisting', type: 'abColDefNumber', headerName: 'MV Issue Delta Existing' },
    { field:'mvIssueDeltaNew', type: 'abColDefNumber', headerName: 'MV Issue Delta New' },
    { field:'markLatest', type: 'abColDefNumber' },
    { field:'markLast', type: 'abColDefNumber' },
    { field:'markDeltaExisting', type: 'abColDefNumber' },
    { field:'markDeltaNew', type: 'abColDefNumber' },
    { field:'issuerShortName', type: 'abColDefString'},
    { field:'asset', type: 'abColDefString' },
    { field:'assetId', type: 'abColDefNumber' },
    { field:'fund', type: 'abColDefString' },
    { field:'fundHedging', type: 'abColDefString' },
    { field:'portfolioName', type: 'abColDefString' },
    { field:'portfolioType', type: 'abColDefString' },
    { field:'valuationMethod', type: 'abColDefString' },
    { field:'ccyName', type: 'abColDefString' },
    { field:'fundCcy', type: 'abColDefString' },
    { field:'fundAdmin', type: 'abColDefString' },
    { field:'assetTypeName', type: 'abColDefString' },
    { field:'benchmarkIndex', type: 'abColDefString' },
    { field:'maturityDate', type: 'abColDefDate' },
    { field:'faceValue', type: 'abColDefNumber' },
    { field:'faceValueFunded', type: 'abColDefNumber' },
    { field:'faceValueFundedSD', type: 'abColDefNumber' },
    { field:'costValue', type: 'abColDefNumber' },
    { field:'costValueFunded', type: 'abColDefNumber' },
    { field:'costValueFundedSD', type: 'abColDefNumber' },
    { field:'marketValueFunded', type: 'abColDefNumber' },
    { field:'marketValueFundedSD', type: 'abColDefNumber' },
    { field:'faceValueIssue', type: 'abColDefNumber' },
    { field:'faceValueIssueFunded', type: 'abColDefNumber' },
    { field:'faceValueIssueFundedSD', type: 'abColDefNumber' },
    { field:'costValueIssue', type: 'abColDefNumber' },
    { field:'costValueIssueFunded', type: 'abColDefNumber' },
    { field:'costValueIssueFundedSD', type: 'abColDefNumber' },
    { field:'marketValueIssue', type: 'abColDefNumber' },
    { field:'marketValueIssueFunded', type: 'abColDefNumber' },
    { field:'marketValueIssueFundedSD', type: 'abColDefNumber' }
  ]

  gridOptions: GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
    columnDefs: this.columnDefs,
    enableRangeSelection: true,
    sideBar: true,
    headerHeight: 30,
    rowHeight: 30,
    rowGroupPanelShow: 'always',
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      rowGroup: false,
      enableRowGroup: true,
      enableValue: true,
      enablePivot: true
    },
    suppressAggFuncInHeader: true
  }

  adaptableOptions: AdaptableOptions = {
    ...CommonConfig.ADAPTABLE_OPTIONS,
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    autogeneratePrimaryKey: true,
    primaryKey: '',
    userName: this.dataSvc.getCurrentUserName(),
    adaptableId: 'MV Delta Id',
    adaptableStateKey: 'MV Delta Key',
    gridOptions: this.gridOptions,
    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
    teamSharingOptions: {
      enableTeamSharing: true,
      persistSharedEntities: presistSharedEntities.bind(this), 
      loadSharedEntities: loadSharedEntities.bind(this)
    },

    userInterfaceOptions: {
      customDisplayFormatters: [
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', this.AMOUNT_COLUMNS),
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat', ['markLatest' ,'markLast' ,'markDeltaExisting' ,'markDeltaNew'])
      ]
    },

    predefinedConfig: {
      Dashboard: {
        Revision: 1,
        ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
        IsCollapsed: true,
        Tabs: [{
          Name: 'Layout', Toolbars: ['Layout']
        }],
        IsHidden: false, DashboardTitle: ' '
      },
      FormatColumn: {
        Revision: 3,
        FormatColumns: [
          BLANK_DATETIME_FORMATTER_CONFIG(['maturityDate']), 
          DATE_FORMATTER_CONFIG_ddMMyyyy(['maturityDate']), 
          AMOUNT_FORMATTER_CONFIG_Zero(['markLatest' ,'markLast' ,'markDeltaExisting' ,'markDeltaNew'], 2, ['amountZeroFormat']),
          AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['markLatest' ,'markLast' ,'markDeltaExisting' ,'markDeltaNew'], 4),
          CUSTOM_FORMATTER(this.AMOUNT_COLUMNS, 'amountFormatter')
        ]
      },
      Layout: {
        Revision: 2,
        CurrentLayout: 'Basic',
        Layouts:[
          {
            Name: 'Basic',
            Columns: [ ...this.columnDefs.filter(c => !c.hide).map(c => c.field)],
            RowGroupedColumns: [ 'issuerShortName', 'asset' ],
            AggregationColumns: {
              'marketValueLatest'         : 'sum',
              'marketValueLast'           : 'sum',
              'mvDeltaExisting'           : 'sum',
              'mvDeltaNew'                : 'sum',
              'marketValueIssueLatest'    : 'sum',
              'marketValueIssueLast'      : 'sum',
              'mvIssueDeltaExisting'      : 'sum',
              'mvIssueDeltaNew'           : 'sum'
            }
          }
        ]
      },
      StatusBar: {
        Revision: 1,
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
