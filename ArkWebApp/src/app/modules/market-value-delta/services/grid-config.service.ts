import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ChartToolPanelsDef, ColDef, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
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

  createChart(){
    console.log("chart")
    this.gridApi?.createRangeChart({
        cellRange: {
          rowStartIndex: 0,
          rowEndIndex: 0,
          columns: ["marketValueLatest","marketValueLast","mvDeltaExisting"],
        },
        chartType: "bar"
      });
  }

  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES,GridChartsModule]

  columnDefs: ColDef[] = [
    { field:'positionId', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueLatest', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueLast', type: 'abColDefNumber',  chartDataType: "series" },
    { field:'mvDeltaExisting', type: 'abColDefNumber', headerName: 'MV Delta Existing', chartDataType: "series" },
    { field:'mvDeltaNew', type: 'abColDefNumber', headerName: 'MV Delta New', chartDataType: "series" },
    { field:'marketValueIssueLatest', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueIssueLast', type: 'abColDefNumber', chartDataType: "series" },
    { field:'mvIssueDeltaExisting', type: 'abColDefNumber', chartDataType: "series", headerName: 'MV Issue Delta Existing' },
    { field:'mvIssueDeltaNew', type: 'abColDefNumber', chartDataType: "series", headerName: 'MV Issue Delta New' },
    { field:'markLatest', type: 'abColDefNumber', chartDataType: "series" },
    { field:'markLast', type: 'abColDefNumber', chartDataType: "series" },
    { field:'markDeltaExisting', type: 'abColDefNumber', chartDataType: "series" },
    { field:'markDeltaNew', type: 'abColDefNumber', chartDataType: "series" },
    { field:'issuerShortName', type: 'abColDefString', chartDataType: "category"},
    { field:'asset', type: 'abColDefString', chartDataType: "category" },
    { field:'assetId', type: 'abColDefNumber', chartDataType: "series" },
    { field:'fund', type: 'abColDefString', chartDataType: "category" },
    { field:'fundHedging', type: 'abColDefString', chartDataType: "category" },
    { field:'portfolioName', type: 'abColDefString', chartDataType: "category" },
    { field:'portfolioType', type: 'abColDefString', chartDataType: "category" },
    { field:'valuationMethod', type: 'abColDefString', chartDataType: "category" },
    { field:'ccyName', type: 'abColDefString', chartDataType: "category" },
    { field:'fundCcy', type: 'abColDefString', chartDataType: "category" },
    { field:'fundAdmin', type: 'abColDefString', chartDataType: "category" },
    { field:'assetTypeName', type: 'abColDefString', chartDataType: "category" },
    { field:'benchmarkIndex', type: 'abColDefString', chartDataType: "category" },
    { field:'maturityDate', type: 'abColDefDate', chartDataType: "category" },
    { field:'faceValue', type: 'abColDefNumber', chartDataType: "series" },
    { field:'faceValueFunded', type: 'abColDefNumber', chartDataType: "series" },
    { field:'faceValueFundedSD', type: 'abColDefNumber', chartDataType: "series" },
    { field:'costValue', type: 'abColDefNumber', chartDataType: "series" },
    { field:'costValueFunded', type: 'abColDefNumber', chartDataType: "series" },
    { field:'costValueFundedSD', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueFunded', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueFundedSD', type: 'abColDefNumber', chartDataType: "series" },
    { field:'faceValueIssue', type: 'abColDefNumber', chartDataType: "series" },
    { field:'faceValueIssueFunded', type: 'abColDefNumber', chartDataType: "series" },
    { field:'faceValueIssueFundedSD', type: 'abColDefNumber', chartDataType: "series" },
    { field:'costValueIssue', type: 'abColDefNumber', chartDataType: "series" },
    { field:'costValueIssueFunded', type: 'abColDefNumber', chartDataType: "series" },
    { field:'costValueIssueFundedSD', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueIssue', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueIssueFunded', type: 'abColDefNumber', chartDataType: "series" },
    { field:'marketValueIssueFundedSD', type: 'abColDefNumber', chartDataType: "series" },
    { field:'action', type: 'abSpecialColumn' },
    // {
    //   colId: 'action',
    //   type: ['abSpecialColumn'],
    //   headerTooltip: 'Waterfall Chart'
    //   },
  ]
  public popupParent: HTMLElement | null = document.body;

  public chartToolPanelsDef: ChartToolPanelsDef = {
    defaultToolPanel: 'settings',
  };

  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    rowGroup: false,
    enableRowGroup: true,
    enableValue: true,
    enablePivot: true
  }

  gridOptions: GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
    columnDefs: this.columnDefs,
    enableRangeSelection: true,
    sideBar: {
      toolPanels: [
        'columns',
        'filters',
        {
          id: 'adaptable',
          toolPanel: 'AdaptableToolPanel',
          labelDefault: 'My Grid',
          labelKey: 'adaptable',
          iconKey: 'menu',
          width: 300,
          minWidth: 300,
          maxWidth: 500,
        },
      ],
    },
  
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
    suppressAggFuncInHeader: true,
    enableCharts: true,
    popupParent : this.popupParent,
    chartToolPanelsDef: this.chartToolPanelsDef
  }

  adaptableOptions: AdaptableOptions = {
    ...CommonConfig.ADAPTABLE_OPTIONS,

    autogeneratePrimaryKey: true,
    primaryKey: '',
    userName: this.dataSvc.getCurrentUserName(),
    adaptableId: 'MV Delta Id',
    adaptableStateKey: 'MV Delta Key',
    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
    teamSharingOptions: {
      enableTeamSharing: true,
      persistSharedEntities: presistSharedEntities.bind(this), 
      loadSharedEntities: loadSharedEntities.bind(this)
    },

    formatColumnOptions: {
      customDisplayFormatters: [
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', this.AMOUNT_COLUMNS),
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat', ['markLatest' ,'markLast' ,'markDeltaExisting' ,'markDeltaNew'])
      ]
    },
    entitlementOptions: {
      moduleEntitlements: [
        {adaptableModule: 'ToolPanel', accessLevel: 'ReadOnly'},
      ],
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
        Revision: 4,
        CurrentLayout: 'Default',
        Layouts:[
          {
            Name: 'Default',
            Columns: [ "positionId","marketValueLatest","marketValueLast","mvDeltaExisting","mvDeltaNew","ccyName","marketValueIssueLatest","marketValueIssueLast","mvIssueDeltaExisting","mvIssueDeltaNew","markLatest","markLast","markDeltaExisting","markDeltaNew","issuerShortName","asset","assetId","fund","fundHedging","portfolioName","portfolioType","fundCcy","assetTypeName","maturityDate","action"],
            RowGroupedColumns: [ "valuationMethod","issuerShortName","asset" ],
            AggregationColumns: {
              "marketValueLatest":"sum",
              "marketValueLast":"sum",
              "mvDeltaExisting":"sum",
              "mvDeltaNew":"sum",
              "ccyName":"first",
              "marketValueIssueLatest":"sum",
              "marketValueIssueLast":"sum",
              "mvIssueDeltaExisting":"sum",
              "mvIssueDeltaNew":"sum",
              "markLatest":"avg",
              "markLast":"avg",
              "markDeltaExisting":"avg"
            },
            ColumnSorts:[{
              ColumnId:"asset",
              SortOrder:"Desc"
            }],
            EnablePivot: false,
            ColumnFilters: [{
              ColumnId : "marketValueLatest",
              Predicate : {
                PredicateId : "NotBetween",
                Inputs : [-0.1,0.1]
              }
            }],
            SuppressAggFuncInHeader : true,
            PinnedColumnsMap: { 
              action: 'right'
            },
          }
        ]
      },
      StatusBar: {
        Revision: 1,
        StatusBars: [
          {
            Key: 'Center Panel',
            StatusBarPanels: ['GridFilter']
          },
          {
            Key: 'Right Panel',
            StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
          },
        ],
      }
    },

    actionColumnOptions: {
      actionColumns: [
        {
          columnId: 'action',
          friendlyName: 'action',
          actionColumnButton: [
            {
              label: '',
              icon: {
                src: '../assets/img/bar_chart.svg',
                style: {height: 25, width: 25}
              },
              hidden: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
              ) => {
                return false
              },
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
              ) => {
               

                 console.log("Action")

              },
            },
          ],
        }
      ],
    },
  }

}
