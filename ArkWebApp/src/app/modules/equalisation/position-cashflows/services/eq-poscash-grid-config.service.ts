import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions } from '@ag-grid-community/core';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class EqPoscashGridConfigService {
  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  gridApi : GridApi
  adaptableApi: AdaptableApi
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  AMOUNT_COLUMNS = [
    'total',
    'totalBase',
    'totalEur',
    'principal',
    'principalIndexed',
    'pik',
    'repayment',
    'fwdCurve',
    'interest',
    'fees',
    'pikInterest',
    'purchaseDiscount',
    'marketValue',
    'accruedInterest',
    'accruedFees',
    'totalInterest',
    'totalIncome',
    'feesCcy',
    'interestCcy',
    'repaymentCcy',
    'capitalInvestedCcy',
    'marketValueDaily',
    'marketValueDailyEur',
    'faceValue',
    'internalTradeTotal',
    'internalTradeTotalEur',
    'feesEur',
    'capitalInvestedEur',
    'capitalReturnEur',
    'incomeEur',
    'capitalInvestedBase',
    'capitalReturnBase',
    'incomeBase',
    'capitalInvested',
    'capitalReturn',
    'income'
  ]

  constructor(private dataSvc: DataService) 
  {
    this.init()
  }
  init(){

    this.columnDefs = [
      { field: 'asOfDate', tooltipField: 'asofDate', headerName: 'As of Date', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'fundGroup', tooltipField: 'fundGroup', headerName: 'Fund Group', type:'abColDefString'},
      { field: 'fund', tooltipField: 'fund', headerName: 'Fund', type:'abColDefString'},
      { field: 'issuer', tooltipField: 'issuer', headerName: 'Issuer', type:'abColDefString'},
      { field: 'assetName', tooltipField: 'assetName', headerName: 'Asset Name', type:'abColDefString'},
      { field: 'assetId', tooltipField: 'assetId', headerName: 'Asset ID', type: 'abColDefNumber'},
      { field: 'fundHedging', tooltipField: 'fundHedging', headerName: 'Fund Hedging', type: 'abColDefString'},
      { field: 'allocationKey', tooltipField: 'allocationKey', headerName: 'Allocation Key', type: 'abColDefString'},
      { field: 'positionID', tooltipField: 'positionID', headerName: 'Position ID', type: 'abColDefNumber'},
      { field: 'cashDate', tooltipField: 'cashDate', headerName: 'Cash Date', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'localToBaseFXRate', tooltipField: 'localToBaseFXRate', headerName: 'Local to Base FX Rate', type:'abColDefNumber'},
      { field: 'localToEURFXRate', tooltipField: 'localToEURFXRate', headerName: 'Local to EUR FX Rate', type:'abColDefNumber'},
      { field: 'isEqualisationNeeded', tooltipField: 'isEqualisationNeeded', headerName: 'IsEqualisationNeeded', type:'abColDefString'},
      { field: 'total', tooltipField: 'total', headerName: 'Total', type:'abColDefNumber'},
      { field: 'totalBase', tooltipField: 'totalBase', headerName: 'Total Base', type:'abColDefNumber'},
      { field: 'totalEur', tooltipField: 'totalEur', headerName: 'Total Eur', type:'abColDefNumber'},
      { field: 'principal', tooltipField: 'principal', headerName: 'Principal', type:'abColDefNumber'},
      { field: 'principalIndexed', tooltipField: 'principalIndexed', headerName: 'Principal Indexed', type:'abColDefNumber'},
      { field: 'pik', tooltipField: 'pik', headerName: 'Pik', type:'abColDefNumber'},
      { field: 'repayment', tooltipField: 'repayment', headerName: 'Repayment', type:'abColDefNumber'},
      { field: 'fwdCurve', tooltipField: 'fwdCurve', headerName: 'FwdCurve', type:'abColDefNumber'},
      { field: 'interest', tooltipField: 'interest', headerName: 'Interest', type:'abColDefNumber'},
      { field: 'fees', tooltipField: 'fees', headerName: 'Fees', type:'abColDefNumber'},
      { field: 'pikInterest', tooltipField: 'pikInterest', headerName: 'Pik Interest', type:'abColDefNumber'},
      { field: 'purchaseDiscount', tooltipField: 'purchaseDiscount', headerName: 'Purchase Discount', type:'abColDefNumber'},
      { field: 'marketValue', tooltipField: 'marketValue', headerName: 'Market Value', type:'abColDefNumber'},
      { field: 'accruedInterest', tooltipField: 'accruedInterest', headerName: 'Accrued Interest', type:'abColDefNumber'},
      { field: 'accruedFees', tooltipField: 'accruedFees', headerName: 'Accrued Fees', type:'abColDefNumber'},
      { field: 'totalInterest', tooltipField: 'totalInterest', headerName: 'Total Interest', type:'abColDefNumber'},
      { field: 'totalIncome', tooltipField: 'totalIncome', headerName: 'Total Income', type:'abColDefNumber'},
      { field: 'feesCcy', tooltipField: 'feesCcy', headerName: 'Fees Ccy', type:'abColDefNumber'},
      { field: 'interestCcy', tooltipField: 'interestCcy', headerName: 'Interest Ccy', type:'abColDefNumber'},
      { field: 'repaymentCcy', tooltipField: 'repaymentCcy', headerName: 'Repayment Ccy', type:'abColDefNumber'},
      { field: 'capitalInvestedCcy', tooltipField: 'capitalInvestedCcy', headerName: 'Capital Invested Ccy', type:'abColDefNumber'},
      { field: 'marketValueDaily', tooltipField: 'marketValueDaily', headerName: 'Market Value Daily', type:'abColDefNumber'},
      { field: 'marketValueDailyEur', tooltipField: 'marketValueDailyEur', headerName: 'Market Value Daily Eur', type:'abColDefNumber'},
      { field: 'faceValue', tooltipField: 'faceValue', headerName: 'Face Value', type:'abColDefNumber'},
      { field: 'internalTradeTotal', tooltipField: 'internalTradeTotal', headerName: 'Internal Trade Total', type:'abColDefNumber'},
      { field: 'internalTradeTotalEur', tooltipField: 'internalTradeTotalEur', headerName: 'Internal Trade Total Eur', type:'abColDefNumber'},
      { field: 'feesEur', tooltipField: 'feesEur', headerName: 'Fees Eur', type:'abColDefNumber'},
      { field: 'capitalInvestedEur', tooltipField: 'capitalInvestedEur', headerName: 'Capital Invested Eur', type:'abColDefNumber'},
      { field: 'capitalReturnEur', tooltipField: 'capitalReturnEur', headerName: 'Capital Return Eur', type:'abColDefNumber'},
      { field: 'incomeEur', tooltipField: 'incomeEur', headerName: 'Income Eur', type:'abColDefNumber'},
      { field: 'capitalInvestedBase', tooltipField: 'capitalInvestedBase', headerName: 'Capital Invested Base', type:'abColDefNumber'},
      { field: 'capitalReturnBase', tooltipField: 'capitalReturnBase', headerName: 'Capital Return Base', type:'abColDefNumber'},
      { field: 'incomeBase', tooltipField: 'incomeBase', headerName: 'Income Base', type:'abColDefNumber'},
      { field: 'capitalInvested', tooltipField: 'capitalInvested', headerName: 'Capital Invested', type:'abColDefNumber'},
      { field: 'capitalReturn', tooltipField: 'capitalReturn', headerName: 'Capital Return', type:'abColDefNumber'},
      { field: 'income', tooltipField: 'income', headerName: 'Income', type:'abColDefNumber'},
      { field: 'modifiedOn', tooltipField: 'modifiedOn', headerName: 'Modified On', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'isOriginalCashflow', tooltipField: 'isOriginalCashflow', headerName: 'IsOriginalCashflow',type:'abColDefString'}

    ]
    
    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      context:{},
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:false,
      suppressScrollOnNewData: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES, 
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg
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
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Equalised Position Cashflows',
      adaptableStateKey: `Equalised Position Cashflows Key`,
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      quickSearchOptions: {
        clearSearchesOnStartUp: true
      },
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },
      formatColumnOptions:{
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS)
          ],
      },
  
      predefinedConfig: {
        Dashboard: {
          Revision: 2,
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
          Revision: 14,
          CurrentLayout: 'Default Equalised Cashflows Layout',
          Layouts: [{
            Name: 'Default Equalised Cashflows Layout',
            Columns: [
              'fundGroup',
              'issuer',
              'assetName',
              'assetId',
              'fund',
              'fundHedging',
              'allocationKey',
              'positionID',
              'cashDate',
              'isEqualisationNeeded',
              'total',
              'totalBase',
              'totalEur',
              'principal',
              'principalIndexed',
              'pik',
              'repayment',
              'fwdCurve',
              'interest',
              'fees',
              'pikInterest',
              'purchaseDiscount',
              'marketValue',
              'accruedInterest',
              'accruedFees',
              'totalInterest',
              'totalIncome',
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
          Revision:8,
          FormatColumns:[
             BLANK_DATETIME_FORMATTER_CONFIG(['asOfDate','cashDate','modifiedOn']),
             DATE_FORMATTER_CONFIG_ddMMyyyy(['asOfDate','cashDate']),
             DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn']),
             CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,['amountFormatter']),
          ]
        },
        StatusBar: {
          Revision: 3,
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