import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ChartToolPanelsDef, ColDef, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { GridChartsModule } from"@ag-grid-enterprise/charts-enterprise";
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
        // chartType: "bar",
        chartType: "waterfall"
      });
  }

  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES,GridChartsModule]

  columnDefs: ColDef[] = [
    { field:'marketValues', headerName: 'Market Value Category' ,type: 'abColDefString' },
    { field:'chartingValues', type: 'abColDefNumber' },
    { field: 'displayValues', headerName: 'Values', type: 'abColDefNumber'},
    { field: 'markValues', headerName: 'Mark Value Category', type: 'abColDefString'},
    { field: 'mark', type: 'abColDefNumber'},
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
    exportOptions: {
      ...CommonConfig.GENERAL_EXPORT_OPTIONS,
    },
    
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
      Layout:{
        Revision: 4.3,
        CurrentLayout: 'Basic Layout',
        Layouts: [{
          Name: 'Basic Layout',
          Columns: [
            'marketValues',
            'displayValues',
            'markValues',
            'mark',
            'action'
          ],
          PinnedColumnsMap:{
            'action' :'right'
          }
        }]
      },
      FormatColumn: {
        Revision: 3.1,
        FormatColumns:[
          CUSTOM_FORMATTER(['displayValues'],['amountFormatter']),
          AMOUNT_FORMATTER_CONFIG_Zero(['mark'], 2, ['amountZeroFormat']),
          AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['mark'], 4),
        ]
      },
      

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
               

                this.gridApi.createRangeChart({
                  cellRange: {
                    rowStartIndex: 0,
                    rowEndIndex: 3,
                    columns: ["marketValues","chartingValues"],
                  },
                  chartType: "waterfall"
                })!;

              },
            },
          ],
        }
      ],
    },
  }

}
