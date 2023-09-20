import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { GridUtilService } from './grid-util.service';

@Injectable()
export class GridConfigService {
  agGridModules = CommonConfig.AG_GRID_MODULES
  gridApi: GridApi
  columnDefs: ColDef[] 
  public gridOptions: GridOptions 
  public adaptableOptions: AdaptableOptions
  constructor(private dataSvc: DataService,
    private gridUtilSvc: GridUtilService) { 
      this.init()
    }
  init(){
    this.columnDefs = [
      { field: 'positionID', type: 'abColDefNumber' },
      { field: 'type', type: 'abColDefString' },
      { field: 'fees', type: 'abColDefNumber' },
      { field: 'tradeDate', type: 'abColDefDate' },
      { field: 'settleDate', type: 'abColDefDate', hide: true },
      { field: 'fund', type: 'abColDefString' },
      { field: 'fundHedging', type: 'abColDefString' },
      { field: 'issuer', type: 'abColDefString' },
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'benchmarkIndex', type: 'abColDefString' },
      { field: 'ccyName', type: 'abColDefString' },
      { field: 'portfolio', type: 'abColDefString' },
      { field: 'assetTypeName', type: 'abColDefString' },
      { field: 'maturityDate', type: 'abColDefDate' },
      { field: 'valuationMethod', type: 'abColDefString' }
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      columnDefs: this.columnDefs,
      enableRangeSelection: true,
      sideBar: true,
      headerHeight: 30,
      rowHeight: 30,
      rowGroupPanelShow: 'always',
      onGridReady: (params: GridReadyEvent) => {
        this.gridApi = params.api;
        this.gridApi.showNoRowsOverlay();
      },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        rowGroup: false,
        enableRowGroup: true,
        enableValue: true,
        enablePivot: true,
        // valueGetter: this.gridUtilSvc.valueGetter
      },
      suppressAggFuncInHeader: true
    };

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Fee Attribution Id',
      adaptableStateKey: 'Fee Attribution Key',
      gridOptions: this.gridOptions,
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', ['currentFees', 'previousFees', 'feesDelta'])
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
            BLANK_DATETIME_FORMATTER_CONFIG(['maturityDate', 'tradeDate', 'settleDate']), 
            DATE_FORMATTER_CONFIG_ddMMyyyy(['maturityDate', 'tradeDate', 'settleDate']), 
            CUSTOM_FORMATTER(['fees'], 'amountFormatter')
          ]
        },
        Layout: {
          Revision: 4,
          CurrentLayout: 'Basic',
          Layouts:[
            {
              Name: 'Basic',
              Columns: [ ...this.columnDefs.filter(c => !c.hide).map(c => c.field) ],
              RowGroupedColumns: [ 'issuerShortName', 'asset', 'type' ],
              AggregationColumns: {
                'fees': 'sum',
                'tradeDate': 'last'
              }
            }
          ]
        },
        StatusBar: {
          Revision:1,
          StatusBars: [
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