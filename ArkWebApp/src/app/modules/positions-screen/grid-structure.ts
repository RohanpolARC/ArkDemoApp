import { ColDef, GridOptions } from "@ag-grid-community/core";
import { CommonConfig } from "src/app/configs/common-config";

let POSITIONS_COLUMN_DEF:ColDef[] = [
      
  {field:'fundHedging',type:'abColDefString'},
  {field:'issuer',type:'abColDefString'}, 
  {field:'issuerShortName',type:'abColDefString'},
  {field:'asset',type:'abColDefString'},
  {field: 'fund', type: 'abColDefString'},
  {field:'fundLegalEntity',type:'abColDefString'},
  {field:'fundStrategy',type:'abColDefString'},
  {field:'portfolioName',type:'abColDefString'},
  {field: 'valuationMethod', type: 'abColDefString'},
  {field:'ccyName',type:'abColDefString'},
  {field:'faceValue',type:'abColDefNumber' },
  {field:'faceValueFunded',type:'abColDefNumber' },
  {field:'faceValueFundedSD',type:'abColDefNumber' },
  {field:'costValue',type:'abColDefNumber' },
  {field:'costValueFunded',type:'abColDefNumber' },
  {field:'costValueFundedSD',type:'abColDefNumber' },
  {field:'marketValue',type:'abColDefNumber' },
  {field:'marketValueFunded',type:'abColDefNumber' },
  {field:'marketValueFundedSD',type:'abColDefNumber' },
  {field:'faceValueIssue',type:'abColDefNumber' },
  {field:'faceValueIssueFunded',type:'abColDefNumber' },
  {field:'faceValueIssueFundedSD',type:'abColDefNumber' },
  {field:'costValueIssue',type:'abColDefNumber' },
  {field:'costValueIssueFunded',type:'abColDefNumber' },
  {field:'costValueIssueFundedSD',type:'abColDefNumber' },
  {field:'marketValueIssue',type:'abColDefNumber' },
  {field:'marketValueIssueFunded',type:'abColDefNumber' },
  {field:'marketValueIssueFundedSD',type:'abColDefNumber' },
  {field:'cost',type:'abColDefNumber',width:85 },
  {field:'mark',type:'abColDefNumber',width:85 },
  {field:'accInterestIssue',type:'abColDefNumber' },
  {field:'accFeesIssue',type:'abColDefNumber' },
  {field:'benchmarkIndex',type:'abColDefString'},
  {field:'spread',type:'abColDefNumber' },
  {field:'spreadFrequency',type:'abColDefNumber' },
  {field:'assetId',type:'abColDefNumber'},
  {field:'pikMargin',headerName:'PIK Margin',type:'abColDefNumber'},
  {field:'unfundedMargin',type:'abColDefNumber' },
  {field:'maturityDate',cellClass:'dateUK',type: 'abColDefDate' },
  {field:'primaryId',type:'abColDefNumber' },
  {field:'assetTypeName',type:'abColDefString'},
  {field:'isMultiCurrency',type:'abColDefBoolean'},
  {field:'positionId',type:'abColDefNumber' },
  {field:'fxRateEur',headerName:'FX Rate EUR',type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
  {field:'fxRateBase',headerName:'FX Rate Base',type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
  {field:'feesIssue',type:'abColDefNumber' },
  {field:'fees',type:'abColDefNumber' },
  {field:'feesFX',type:'abColDefNumber' },
  {field:'interestIncomeIssue',type:'abColDefNumber' },
  {field:'interestIncome',type:'abColDefNumber' },
  {field:'interestIncomeFX',type:'abColDefNumber' },
  {field:'interestExpenseIssue',type:'abColDefNumber' },
  {field:'interestExpense',type:'abColDefNumber' },
  {field:'interestExpenseFX',type:'abColDefNumber' },
  {field:'realizedPnLIssue',headerName:'Realized PnL Issue',type:'abColDefNumber' },
  {field:'realizedPnL',headerName:'Realized PnL',type:'abColDefNumber' },
  {field:'realizedPnLFX',headerName:'Realized PnL FX',type:'abColDefNumber' },
  {field:'unrealizedPnLIssue',headerName:'Unrealized PnL Issue',type:'abColDefNumber' },
  {field:'unrealizedPnL',headerName:'Unrealized PnL',type:'abColDefNumber' },
  {field:'unrealizedPnLFX',headerName:'Unrealized PnL FX',type:'abColDefNumber' },
  {field:'totalPnLIssue',headerName:'Total PnL Issue',type:'abColDefNumber' },
  {field:'totalPnL',headerName:'Total PnL',type:'abColDefNumber' },
  {field:'totalPnLFX',headerName:'Total PnL FX',type:'abColDefNumber' },
  {field:'contractBaseRate',type:'abColDefNumber' },
  {field:'contractSpread',type:'abColDefNumber' },
  {field:'contractAllinRate',type:'abColDefNumber' },
  {field:'dirtyMarketValueIssue',type:'abColDefNumber' },
  {field:'dirtyMarketValueIssueFunded',type:'abColDefNumber' },
  {field:'dirtyMarketValueIssueFundedSD',type:'abColDefNumber' },
  {field:'asOfDate',cellClass:'dateUK',type: 'abColDefDate' },
  {field:'quantity',type:'abColDefNumber' },
  {field:'capitalisedInterestBase',type:'abColDefNumber' },
  {field:'capitalisedInterestEur',type:'abColDefNumber' },
  {field:'capitalisedInterestLocal',type:'abColDefNumber' },
  {field:'status',type:'abColDefString'},
  {field:'settleType',type:'abColDefString'},
  {field:'capStructureTranche',type:'abColDefString'},
  {field:'securedUnsecured',type:'abColDefString'},
  {field:'assetClass',type:'abColDefString'},
  {field:'seniority',type:'abColDefString'},
  {field:'isFinancing',type:'abColDefString'}

  ]


let GRID_OPTIONS:GridOptions = {
  ...CommonConfig.GRID_OPTIONS,
  ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
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
      rowGroupPanelShow: "always",
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,

    autoGroupColumnDef:{
      minWidth:200,
      sortable:true,
    }

}

let AMOUNT_COLUMNS_LIST =  [ 'faceValue',
'faceValueFunded',
'faceValueFundedSD',
'costValue',
'costValueFunded',
'costValueFundedSD',
'marketValue',
'marketValueFunded',
'marketValueFundedSD',
'faceValueIssue',
'faceValueIssueFunded',
'faceValueIssueFundedSD',
'costValueIssue',
'costValueIssueFunded',
'costValueIssueFundedSD',
'marketValueIssue',
'marketValueIssueFunded',
'marketValueIssueFundedSD',
'cost',
'mark',
'accInterestIssue',
'accFeesIssue',
'spread',
'spreadFrequency',
'unfundedMargin',
'feesIssue',
'fees',
'feesFX',
'interestIncomeIssue',
'interestIncome',
'interestIncomeFX',
'interestExpenseIssue',
'interestExpense',
'interestExpenseFX',
'realizedPnLIssue',
'realizedPnL',
'realizedPnLFX',
'unrealizedPnLIssue',
'unrealizedPnL',
'unrealizedPnLFX',
'totalPnLIssue',
'totalPnL',
'totalPnLFX',
'contractBaseRate',
'contractSpread',
'contractAllinRate',
'dirtyMarketValueIssue',
'dirtyMarketValueIssueFunded',
'dirtyMarketValueIssueFundedSD',
'quantity',
'capitalisedInterestBase',
'capitalisedInterestEur',
'capitalisedInterestLocal']

let DATE_COLUMNS_LIST =[
  'asOfDate',
  'maturityDate'
]





export {POSITIONS_COLUMN_DEF,GRID_OPTIONS,AMOUNT_COLUMNS_LIST,DATE_COLUMNS_LIST}