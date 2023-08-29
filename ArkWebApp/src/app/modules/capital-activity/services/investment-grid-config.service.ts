import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { InvestmentGridUtilService } from './investment-grid-util.service';

import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, CUSTOM_DISPLAY_FORMATTERS_CONFIG, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class InvestmentGridConfigService {
  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  adaptableApi: AdaptableApi;
  gridApi: GridApi
  constructor(private dataSvc: DataService,
    private gridUtilSvc: InvestmentGridUtilService,
    private dialog: MatDialog) {
      
    this.init()
  }
  init(){

    this.columnDefs = [
      { field: 'uniqueID', tooltipField: 'uniqueID', type: 'abColDefNumber'},
      { field: 'positionID', tooltipField: 'positionID', headerName: 'Position ID', type: 'abColDefNumber'},
      { field: 'cashDate', tooltipField: 'cashDate', headerName: 'Cash Date', type: 'abColDefDate', cellClass: 'dateUK'},
      { field: 'fund', tooltipField: 'fund', headerName: 'Fund', type: 'abColDefString'},
      { field: 'fundHedging', tooltipField: 'fundHedging', headerName: 'Fund Hedging', type: 'abColDefString'},
      { field: 'portfolio', tooltipField: 'portfolio', headerName: 'Portfolio', type: 'abColDefString'},
      { field: 'issuerShortName', tooltipField: 'issuerShortName', headerName: 'Issuer', type: 'abColDefString'},
      { field: 'issuerID', tooltipField: 'issuerID', headerName: 'Issuer ID', type: 'abColDefNumber'},
      { field: 'asset', tooltipField: 'asset', headerName: 'Asset', type: 'abColDefString'},
      { field: 'assetID', tooltipField: 'assetID', headerName: 'AssetID', type: 'abColDefNumber'},
      { field: 'fundCcy', tooltipField: 'fundCcy', headerName: 'Fund Ccy', type: 'abColDefString'},
      { field: 'positionCcy', tooltipField: 'positionCcy', headerName: 'Position Ccy', type: 'abColDefString'},
      { field: 'amount', tooltipField: 'amount', headerName: 'Total', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'linkedAmount', tooltipField: 'linkedAmount', headerName: 'Linked Amount', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'linkedAmountBase', tooltipField: 'linkedAmountBase', headerName: 'Linked Amount Base', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber' },
      { field: 'totalBase', tooltipValueGetter: this.gridUtilSvc.tooltipValueGetter, headerName: 'Total Base', cellClass: 'ag-right-aligned-cell', onCellClicked: this.gridUtilSvc.onTotalBaseClick.bind(this), 
        cellStyle: this.gridUtilSvc.cellStyle, type: 'abColDefNumber'},
      { field: 'totalEur', headerName: 'Total Eur', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'break', headerName: 'Break',  cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber' },
      { field: 'breakBase', headerName: 'Break Base', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber' },
      { field: 'groupBreak', headerName: 'Group Break', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber' },
      { field: 'groupBreakBase', headerName: 'Group Break Base', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber' },
      { field: 'type', type: 'abColDefString'},
      { field: 'groupID', type: 'abColDefNumber' },
      { field: 'link', tooltipField: 'link', headerName: 'Link', type: 'abColDefBoolean', checkboxSelection: true }
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      context:{},
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      allowContextMenuWithControlKey:false,
      suppressScrollOnNewData: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,

      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        filter: true
      },
      onFirstDataRendered:  (event: FirstDataRenderedEvent) => {
        autosizeColumnExceptResized(event)
      },
      groupSelectsFiltered: true,
      groupSelectsChildren: true,
      suppressRowClickSelection: true,
      rowSelection: 'multiple',
      rowHeight: 30,
      headerHeight: 30,
      groupHeaderHeight: 30,
      columnDefs: this.columnDefs
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'uniqueID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Capital Activity - Investment Cashflows',
      adaptableStateKey: `Investment CashFlow Key`,
      
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },
  
      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat',['amount','linkedAmount','totalBase','totalEur', 'linkedAmountBase', 'break', 'breakBase', 'groupBreak', 'groupBreakBase'])

        ]
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
          Revision: 18,
          Layouts:[{
            Name: 'Basic Investment Cashflow',
            Columns: [
              'positionID',
              'cashDate',
              'type',
              'fund',
              'fundHedging',
              'portfolio',
              'issuerShortName',
              'asset',
              'fundCcy',
              'positionCcy',
              'amount',
              'linkedAmount',
              'linkedAmountBase',
              'totalBase',
              'totalEur',
              'break',
              'breakBase',
              'groupBreak','groupBreakBase','groupID',
              'link'
            ],
            ColumnWidthMap:{
              'link': 50,
            },
            RowGroupedColumns: ['fundHedging', 'cashDate', 'issuerShortName', 'positionCcy', 'type'],
            PinnedColumnsMap: {
              'link': 'right'
            },
            AggregationColumns: {
              total: 'sum',
              totalBase: 'sum',
              totalEur: 'sum',
              linkedAmount: 'sum',
              linkedAmountBase: 'sum',
            }
          }]
        },
        FormatColumn:{
          Revision: 8,
          FormatColumns:[
            DATE_FORMATTER_CONFIG_ddMMyyyy(['cashDate']),

            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['amount','linkedAmount','totalBase','totalEur', 'linkedAmountBase', 'break', 'breakBase', 'groupBreak', 'groupBreakBase'],2,['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_Zero(['amount','linkedAmount','totalBase','totalEur', 'linkedAmountBase', 'break', 'breakBase', 'groupBreak', 'groupBreakBase'],2,['amountZeroFormat'])
          ]
        }  
      }
    }
  }
}