import { ColDef } from "@ag-grid-community/core";
import { CommonConfig } from "src/app/configs/common-config";
import { amountFormatter, booleanYesNoFormatter, dateFormatter, nonAmountNumberFormatter2Dec } from "src/app/shared/functions/formatter";



 let POSITIONS_COLUMN_DEF:ColDef[] = [
      
    {field:'issuer',type:'abColDefString'}, 
    {field:'issuerShortName',type:'abColDefString'},
    {field:'asset',type:'abColDefString'},
    {field:'fundLegalEntity',type:'abColDefString'},
    {field:'fundHedging',type:'abColDefString'},
    {field:'fundStrategy',type:'abColDefString'},
    {field:'portfolioName',type:'abColDefString'},
    {field:'ccyName',type:'abColDefString'},
    {field:'faceValue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'faceValueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'faceValueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'costValue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'costValueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'costValueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'marketValue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'marketValueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'marketValueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'faceValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'faceValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'faceValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'costValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'costValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'costValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'marketValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'marketValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'marketValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'cost',type:'abColDefNumber', valueFormatter: amountFormatter,width:85 },
    {field:'mark',type:'abColDefNumber', valueFormatter: amountFormatter,width:85 },
    {field:'accInterestIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'accFeesIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'benchmarkIndex',type:'abColDefString'},
    {field:'spread',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'spreadFrequency',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'assetId',type:'abColDefNumber'},
    {field:'pikMargin',headerName:'PIK Margin',type:'abColDefNumber'},
    {field:'unfundedMargin',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'maturityDate',valueFormatter:  dateFormatter,cellClass:'dateUK',type: 'abColDefDate' },
    {field:'primaryId',type:'abColDefNumber' },
    {field:'assetTypeName',type:'abColDefString'},
    {field:'isMultiCurrency',type:'abColDefBoolean'},
    {field:'positionId',type:'abColDefNumber' },
    {field:'fxRateEur',headerName:'FX Rate EUR',type:'abColDefNumber',valueFormatter:nonAmountNumberFormatter2Dec},
    {field:'fxRateBase',headerName:'FX Rate Base',type:'abColDefNumber',valueFormatter:nonAmountNumberFormatter2Dec},
    {field:'feesIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'fees',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'feesFX',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'interestIncomeIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'interestIncome',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'interestIncomeFX',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'interestExpenseIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'interestExpense',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'interestExpenseFX',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'realizedPnLIssue',headerName:'Realized PnL Issue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'realizedPnL',headerName:'Realized PnL',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'realizedPnLFX',headerName:'Realized PnL FX',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'unrealizedPnLIssue',headerName:'Unrealized PnL Issue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'unrealizedPnL',headerName:'Unrealized PnL',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'unrealizedPnLFX',headerName:'Unrealized PnL FX',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'totalPnLIssue',headerName:'Total PnL Issue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'totalPnL',headerName:'Total PnL',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'totalPnLFX',headerName:'Total PnL FX',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'contractBaseRate',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'contractSpread',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'contractAllinRate',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'dirtyMarketValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'dirtyMarketValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'dirtyMarketValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'asOfDate',valueFormatter:  dateFormatter,cellClass:'dateUK',type: 'abColDefDate' },
    {field:'quantity',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'capitalisedInterestBase',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'capitalisedInterestEur',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'capitalisedInterestLocal',type:'abColDefNumber', valueFormatter: amountFormatter },
    {field:'status',type:'abColDefString'},
    {field:'settleType',type:'abColDefString'},
    {field:'capStructureTranche',type:'abColDefString'},
    {field:'securedUnsecured',type:'abColDefString'},
    {field:'assetClass',type:'abColDefString'},
    {field:'seniority',type:'abColDefString'},
    {field:'isFinancing',type:'abColDefString',valueFormatter:booleanYesNoFormatter}

    ]


let GRID_OPTIONS = {
    defaultColDef: {
        resizable: true,
        sortable: true,
        enableRowGroup: true,
        enablePivot: true,
        filter: true,
        enableValue: true,

      },
      enableRangeSelection: true,
      sideBar: true,
      rowGroupPanelShow: 'always',
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,

    autoGroupColumnDef:{
      minWidth:200,
      sortable:true,
    }

}

export {POSITIONS_COLUMN_DEF,GRID_OPTIONS}