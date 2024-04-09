import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class GridConfigService {

  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  gridApi : GridApi
  adaptableApi: AdaptableApi
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  constructor(private dataSvc: DataService) {
    this.init();
  }
  init(){

    this.columnDefs = [
      { field: "issuer", type: 'abColDefString' },
      { field: "issuerShortName", type: 'abColDefString' },
      { field: "asset", type: 'abColDefString' },
      { field: "assetType", type: 'abColDefNumber', hide: true },
      { field: "portfolio", type: 'abColDefString' },
      { field: "portfolioAUMMethod", type: 'abColDefString' },
      { field: "fund", type: 'abColDefString' },
      { field: "fundHedging", type: 'abColDefString' },
      { field: "type", type: 'abColDefString' },
      { field: "baseCcyName", type: 'abColDefString' },
      { field: "positionCcy", type: 'abColDefNumber' },
      { field: "transAssetType", type: 'abColDefString' },
      { field: "positionID", type: 'abColDefNumber' },
      { field: "tradeDate", type: 'abColDefDate' },
      { field: "settleDate", type: 'abColDefDate' },
      { field: "parAmount", type: 'abColDefNumber', hide: true },
      { field: "price", type: 'abColDefNumber', hide: true },
      { field: "amount", type: 'abColDefNumber', hide: true },
      { field: "outstanding", type: 'abColDefNumber', hide: true },
      { field: "isFinancing", type: 'abColDefString' },
      { field: "tradeID", type: 'abColDefNumber' },
      { field: "internalTrade", type: 'abColDefString' },
      { field: "counterParty", type: 'abColDefString' },
      { field: "isFirmwideCumulative", type: 'abColDefString' },
      { field: "isMainfundCumulative", type: 'abColDefString' },
      { field: "isSMACumulative", type: 'abColDefString' },
      { field: "isCapitalOut", type: 'abColDefString' },
      { field: "isFundedOut", type: 'abColDefString' },
      { field: "isCapitalDeployed", type: 'abColDefString' },
      { field: "buyParPrice", type: 'abColDefNumber' },
      { field: "priceFactor", type: 'abColDefNumber' },
      { field: "source", type: 'abColDefNumber' },
      { field: "eurGIRTradeDate", type: 'abColDefNumber' },
      { field: "fxRateEurTradeDate", type: 'abColDefNumber' },
      { field: "baseGIRTradeDate", type: 'abColDefNumber' },
      { field: "fxRateBaseTradeDate", type: 'abColDefNumber' },
      { field: "eurGIRSettleDate", type: 'abColDefNumber' },
      { field: "fxRateEurSettleDate", type: 'abColDefNumber' },
      { field: "baseGIRSettleDate", type: 'abColDefNumber' },
      { field: "fxRateBaseSettleDate", type: 'abColDefNumber' },
      { field: "asOfDate", type: 'abColDefDate' },
      { field: "portfolioType", type: 'abColDefNumber' },
      { field: "wtAvgCostCommited", type: 'abColDefNumber' },
      { field: "wtAvgCostFunded", type: 'abColDefNumber' },
      { field: "baseGIRWtAvgCommitedSD", type: 'abColDefNumber' },
      { field: "eurGIRWtAvgCommitedSD", type: 'abColDefNumber' },
      { field: "baseGIRWtAvgFundedSD", type: 'abColDefNumber' },
      { field: "eurGIRWtAvgFundedSD", type: 'abColDefNumber' },
      { field: "baseGIRWtAvgCommited", type: 'abColDefNumber' },
      { field: "eurGIRWtAvgCommited", type: 'abColDefNumber' },
      { field: "baseGIRWtAvgFunded", type: 'abColDefNumber' },
      { field: "eurGIRWtAvgFunded", type: 'abColDefNumber' },
      { field: "fxRateEurEffective", type: 'abColDefNumber' },
      { field: "fxRateBaseEffective", type: 'abColDefNumber' },
      { field: "fxRateEffectiveMethod", type: 'abColDefNumber' },
      { field: "fxRateEurEffectiveCommited", type: 'abColDefNumber' },
      { field: "fxRateBaseEffectiveCommited", type: 'abColDefNumber' },
      { field: "fxRateEffectiveMethodCommited", type: 'abColDefNumber' },
      { field: "totalCommitedCostOut", type: 'abColDefNumber' },
      { field: "totalFundedCostOut", type: 'abColDefNumber' },
      { field: "netCommitedCost", type: 'abColDefNumber' },
      { field: "netFundedCost", type: 'abColDefNumber' },
      { field: "totalCommitedParOut", type: 'abColDefNumber' },
      { field: "totalFundedParOut", type: 'abColDefNumber' },
      { field: "netCommitedPar", type: 'abColDefNumber' },
      { field: "netFundedPar", type: 'abColDefNumber' },
      { field: "totalCommitedCostOutSD", type: 'abColDefNumber' },
      { field: "totalFundedCostOutSD", type: 'abColDefNumber' },
      { field: "netCommitedCostSD", type: 'abColDefNumber' },
      { field: "netFundedCostSD", type: 'abColDefNumber' },
      { field: "parAmountEur", type: 'abColDefNumber' },
      { field: "fundedParAmountEur", type: 'abColDefNumber' },
      { field: "costAmountEur", type: 'abColDefNumber' },
      { field: "fundedCostAmountEur", type: 'abColDefNumber' },
      { field: "parAmountLocal", type: 'abColDefNumber' },
      { field: "fundedParAmountLocal", type: 'abColDefNumber' },
      { field: "costAmountLocal", type: 'abColDefNumber' },
      { field: "fundedCostAmountLocal", type: 'abColDefNumber' },
      { field: "parAmountBase", type: 'abColDefNumber' },
      { field: "fundedParAmountBase", type: 'abColDefNumber' },
      { field: "costAmountBase", type: 'abColDefNumber' },
      { field: "fundedCostAmountBase", type: 'abColDefNumber' },
      { field: "aumEur", type: 'abColDefNumber' },
      { field: "isFundedCumalative", type: 'abColDefString' },
      { field: "grossCostAmountEur", type: 'abColDefNumber' },
      { field: "grossFundedCostAmountEur", type: 'abColDefNumber' },
      { field: "aumBase", type: 'abColDefNumber' },
      { field: "mgmtNetFee", type: 'abColDefNumber' },
      { field: "mgmtNetOfRebateFee", type: 'abColDefNumber' },
      { field: "mgmtGrossFee", type: 'abColDefNumber' },
      { field: "noOfMgmtDays", type: 'abColDefNumber' },
      { field: "isAUMDelayed", type: 'abColDefNumber' },
      { field: "aumEurDelayed", type: 'abColDefNumber' },
      { field: "aumBaseDelayed", type: 'abColDefNumber' },
      { field: "unfundedMargin", type: 'abColDefNumber' },
      { field: "unfundedFlag", type: 'abColDefNumber' },
      { field: "unfundedStartDate", type: 'abColDefDate' },
      { field: "mgmtNetFeeDelta", type: 'abColDefNumber' },
      { field: "noOfMgmtDeltaDays", type: 'abColDefNumber' },
      { field: "fixingId", type: 'abColDefNumber' },
      { field: "aumPosition", type: 'abColDefNumber' },
      { field: "aumBaseAdjustment", type: 'abColDefNumber' },
      { field: "aumEurAdjustment", type: 'abColDefNumber' },
      { field: "eurGIRTradeDateSource", type: 'abColDefNumber' },
      { field: "eurGIRSettleDateSource", type: 'abColDefNumber' },
      { field: "baseGIRTradeDateSource", type: 'abColDefNumber' },
      { field: "baseGIRSettleDateSource", type: 'abColDefNumber' },
      { field: "runningAUMBase", type: 'abColDefNumber' },
      { field: "runningAUMEur", type: 'abColDefNumber' },
      { field: "eurGIRTradeDateTimestamp", type: 'abColDefDate' },
      { field: "eurGIRSettleDateTimestamp", type: 'abColDefDate' },
      { field: "baseGIRTradeDateTimestamp", type: 'abColDefDate' },
      { field: "baseGIRSettleDateTimestamp", type: 'abColDefDate' },
      { field: "gpsDate", type: 'abColDefDate' },
      { field: "aumEurSpot", type: 'abColDefNumber' },
      { field: "grossGPS", type: 'abColDefNumber' },
      { field: "netOfRebateGPS", type: 'abColDefNumber' },
      { field: "netGPS", type: 'abColDefNumber' },
      { field: "fxRateBaseAsOfDate", type: 'abColDefNumber' },
      { field: "isOriginalParHistory", type: 'abColDefString' },
    ];

    let visibleColumns : string[] = [
      'issuer'
      ,'issuerShortName'
      ,'asset'
      ,'assetType'
      ,'portfolio'
      ,'portfolioAUMMethod'
      ,'fund'
      ,'fundHedging'
      ,'type'
      ,'baseCcyName'
      ,'positionCcy'
      ,'positionID'
      ,'tradeDate'
      ,'settleDate'
      ,'tradeID'
      ,'asOfDate'
      ,'price'
      ,'outstanding'
      ,'amount'
      ,'parAmount'
      ,'totalFundedParOut'
      ,'totalCommitedParOut'
      ,'netCommitedPar'
      ,'netFundedPar'
      ,'fundedParAmountEur'
      ,'fundedParAmountLocal'
      ,'fundedParAmountBase'
      ,'parAmountEur'
      ,'parAmountLocal'
      ,'parAmountBase'
      ,'costAmountEur'
      ,'costAmountLocal'
      ,'costAmountBase'
      ,'totalFundedCostOut'
      ,'totalFundedCostOutSD'
      ,'netFundedCost'
      ,'netFundedCostSD'
      ,'totalCommitedCostOut'
      ,'totalCommitedCostOutSD'
      ,'netCommitedCost'
      ,'netCommitedCostSD'
      ,'fundedCostAmountEur'
      ,'fundedCostAmountLocal'
      ,'fundedCostAmountBase'
      ,'grossCostAmountEur'
      ,'grossFundedCostAmountEur'
      ,'priceFactor'
      ,'portfolioType'
      ,'source'
      ,'counterParty'
      ,'isFinancing'
      ,'internalTrade'
      ,'buyParPrice'
      ,'transAssetType'
      ,'isFundedCumalative'
      ,'isFirmwideCumulative'
      ,'isMainfundCumulative'
      ,'isSMACumulative'
      ,'isCapitalOut'
      ,'isFundedOut'
      ,'isCapitalDeployed'
      
    ]
    
    let amountColumns: string[] = ["parAmount", "price", "amount", "outstanding", "buyParPrice", "priceFactor", "totalCommitedCostOut", "totalFundedCostOut", "netCommitedCost", "netFundedCost", "totalCommitedParOut", "totalFundedParOut", "netCommitedPar", "netFundedPar", "totalCommitedCostOutSD", "totalFundedCostOutSD", "netCommitedCostSD", "netFundedCostSD", "parAmountEur", "fundedParAmountEur", "costAmountEur", "fundedCostAmountEur", "parAmountLocal", "fundedParAmountLocal", "costAmountLocal", "fundedCostAmountLocal", "parAmountBase", "fundedParAmountBase", "costAmountBase", "fundedCostAmountBase", "aumEur", "grossCostAmountEur", "grossFundedCostAmountEur", "aumBase", "mgmtNetFee", "mgmtNetOfRebateFee", "mgmtGrossFee", "aumEurDelayed", "aumBaseDelayed", "unfundedMargin", "mgmtNetFeeDelta", "aumPosition", "aumBaseAdjustment", "aumEurAdjustment", "runningAUMBase", "runningAUMEur", "aumEurSpot", "grossGPS", "netOfRebateGPS", "netGPS"];
    let dateColumns: string[] = ["tradeDate", "settleDate", "asOfDate", "unfundedStartDate", "eurGIRTradeDateTimestamp", "eurGIRSettleDateTimestamp", "baseGIRTradeDateTimestamp", "baseGIRSettleDateTimestamp", "gpsDate"];
    let fxColumns: string[] = ["eurGIRTradeDate", "fxRateEurTradeDate", "baseGIRTradeDate", "fxRateBaseTradeDate", "eurGIRSettleDate", "fxRateEurSettleDate", "baseGIRSettleDate", "fxRateBaseSettleDate", "wtAvgCostCommited", "wtAvgCostFunded", "baseGIRWtAvgCommitedSD", "eurGIRWtAvgCommitedSD", "baseGIRWtAvgFundedSD", "eurGIRWtAvgFundedSD", "baseGIRWtAvgCommited", "eurGIRWtAvgCommited", "baseGIRWtAvgFunded", "eurGIRWtAvgFunded", "fxRateEurEffective", "fxRateBaseEffective", "fxRateEurEffectiveCommited", "fxRateBaseEffectiveCommited", "fxRateBaseAsOfDate"];

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      suppressScrollOnNewData: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg
      },
      onFirstDataRendered: autosizeColumnExceptResized,
      allowContextMenuWithControlKey: false,
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
      },
      columnDefs: this.columnDefs,
      rowGroupPanelShow: 'always'
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Equalisation - Portfolio History',
      adaptableStateKey: 'Equalisation - Portfolio History Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      searchOptions: {
        clearSearchesOnStartUp: true
      },
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...amountColumns]),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('fxFormatter',[...fxColumns])
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 4,
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
          CurrentLayout: 'Default',
          Revision: 5,
          Layouts: [
            {
              Name: 'Default',
              Columns: visibleColumns
            }
          ]
        },
        FormatColumn: {
          Revision: 5,
          FormatColumns: [
            CUSTOM_FORMATTER(amountColumns, ['amountFormatter']),
            CUSTOM_FORMATTER(fxColumns, ['fxFormatter']),
            BLANK_DATETIME_FORMATTER_CONFIG(dateColumns),
            DATE_FORMATTER_CONFIG_ddMMyyyy(dateColumns)
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
}
