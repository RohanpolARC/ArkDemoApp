import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, HeaderValueGetterParams, Module, ValueGetterParams } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs-compat';
import { CommonConfig } from 'src/app/configs/common-config';
import { AumDeltaService } from 'src/app/core/services/AumDelta/aumDelta.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import {  CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, formatDate, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-aum-delta',
  templateUrl: './aum-delta.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./aum-delta.component.scss']
})
export class AumDeltaComponent implements OnInit {

  gridOptions: GridOptions = {}
  rowData: any = []
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[] = []
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  gridApi: GridApi;
  adaptableApi: AdaptableApi;
  subscriptions: Subscription[] = []
  sDate: AsOfDateRange = null;
  noRowsToDisplayMsg = 'Please select the filter.'

  AMOUNT_COLUMNS = [
    "aum",
    "aumLatest",
    "aumDelta",
    "globalIssueAmount"
  ]

  NON_DECIMAL_AMOUNT_COLUMNS = [
    "spread2",
    "spread"
  ]

  NON_AMOUNT_NUMBER_2DEC_COLUMNS = [
    "floorRate",
    "pikMargin",
    "unfundedMargin",
    "strikePrice",
    "spreadFrequency"
  ]

  DATE_COLUMNS=[
    "expiryDate",
    "maturityDate"
  ]


  constructor(private dataSvc: DataService,
    private aumDeltaSvc: AumDeltaService) { }

  getHeaderValue(params:HeaderValueGetterParams){
    let coldef = params.column.getColDef()
    if(coldef.field==="aumLatest"){
      let endDate = (this?.sDate)? " ("+formatDate(this.sDate.end)+")":" Latest"
      return "AUM"+endDate
    }else{
      let startDate = (this?.sDate)? " (" +formatDate(this.sDate.start)+")":"" 
      return "AUM"+startDate
    }
  }

  ngOnInit(): void {
    this.sDate = null
    this.columnDefs = [
      {field: "positionId",type:"abColDefNumber",cellClass: 'ag-right-aligned-cell'},
      {field: "aumLatest",type:"abColDefNumber",headerValueGetter:this.getHeaderValue.bind(this)},
      {field: "aum",type:"abColDefNumber",headerValueGetter:this.getHeaderValue.bind(this)},
      {field: "aumDelta",type:"abColDefNumber", headerName:"AUM Δ"},
      {field:"issuerShortName",type:"abColDefNumber"},
      {field:"issuer",type:'abColDefString'},
      {field:"portfolioName",type:'abColDefString'},
      {field:"portfolioType",type:'abColDefString'},
      {field:"asset",type:'abColDefString'},
      {field:"ccy",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"ccyName",type:'abColDefString'},
      {field:"issuerId",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"benchmarkIndex",type:'abColDefString'},
      {field:"spread",type:'abColDefNumber'},
      {field:"globalIssueAmount",type:'abColDefNumber'},
      {field:"assetId",type:'abColDefNumber'},
      {field:"spread2Type",type:'abColDefString'},
      {field:"spread2",type:'abColDefNumber'},
      {field:"floorRate",type:'abColDefNumber'},
      {field:"loanXId",type:'abColDefString'},
      {field:"maturityDate",type:'abColDefDate'},
      {field:"portId",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"assetType",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"assetTypeName",type:'abColDefString'},
      {field:"pikMargin",type:'abColDefNumber'},
      {field:"unfundedMargin",type:'abColDefNumber'},
      {field:"facilityType",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"m_lPortfolioType",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"settleType",type:'abColDefString'},
      {field:"assetCurrencyType",type:'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
      {field:"equityType",type:'abColDefString'},
      {field:"expiryDate",type:'abColDefDate',
        valueGetter:(params:ValueGetterParams)=>{
        return dateNullValueGetter(params,'expiryDate')
      },},
      {field:"strikePrice",type:'abColDefNumber'},
      {field:"optionType",type:'abColDefString'},
      {field:"fund",type:'abColDefString'},
      {field:"fundHedging",type:'abColDefString'},
      {field:"fundLegalEntity",type:'abColDefString'},
      {field:"fundStrategy",type:'abColDefString'},
      {field:"isMultiCurrency",type:'abColDefNumber'},
      {field:"spreadFrequency",type:'abColDefNumber'},
      {field:"fundCcy",type:'abColDefString'},
      {field:"isFinancing",type:'abColDefBoolean'},
      {field:"fundAdmin",type:'abColDefString'},
      {field:"fundSMA",type:'abColDefBoolean'},
      {field:"fundInvestor",type:'abColDefString'},
      {field:"fundSMAText",type:'abColDefString'},
      {field:"portfolioAUMMethod",type:'abColDefString'},
      {field:"fundRecon",type:'abColDefString'},
      {field:"fundCcyReporting",type:'abColDefString'},
      {field:"solvencyPortfolioName",type:'abColDefString'},
      {field:"excludeFxExposure",type:'abColDefBoolean'},
      {field:"rcfType",type:'abColDefString'}
    ]

    this.gridOptions = {
      defaultColDef: {
        resizable: true,
        sortable: true,
        enablePivot: true,
        enableRowGroup: true,
        filter: true,
        enableValue:true

      },
      autoGroupColumnDef:{
        minWidth:200,
        sortable:true,
      },
      enableRangeSelection: true,
      rowGroupPanelShow: "always",
      sideBar: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      suppressAggFuncInHeader: true,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;   
      },

      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },

    }



    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'AUMDelta',
      adaptableStateKey: 'AUMDelta Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nonAmountNumberFormatter2Dec',this.NON_AMOUNT_NUMBER_2DEC_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('noDecimalAmountFormatter',this.NON_DECIMAL_AMOUNT_COLUMNS)
        ]
      },

      predefinedConfig: {
        Dashboard: {
          Revision:6,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout:{
          CurrentLayout: 'Basic AUM Delta Layout',
          Revision: 2,
          Layouts: [{
            Name: 'Basic AUM Delta Layout',
            Columns: [ ...this.columnDefs.map(c => c.field)].filter(c => !['portfolioType',"portId","facilityType","m_lPortfolioType","equityType","rcfType","excludeFxExposure","solvencyPortfolioName"].includes(c)),
            RowGroupedColumns:["issuerShortName"],
            AggregationColumns: {
              aum: 'sum',
              aumLatest: 'sum',
              aumDelta: 'sum',
            }
          }]
          
        },
        FormatColumn:{
          Revision :4,
          FormatColumns:[
            CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountFormatter'),
            CUSTOM_FORMATTER(this.NON_AMOUNT_NUMBER_2DEC_COLUMNS,'nonAmountNumberFormatter2Dec'),
            CUSTOM_FORMATTER(this.NON_DECIMAL_AMOUNT_COLUMNS,'noDecimalAmountFormatter'),
            DATE_FORMATTER_CONFIG_ddMMyyyy(this.DATE_COLUMNS)
          ]
        },
        
        }

    }

  }

  getAUMDelta(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        if(this.sDate !== null){
          this.gridApi.showLoadingOverlay();
          this.subscriptions.push(this.aumDeltaSvc.getAumDelta(this.sDate).subscribe({
            next: data => {
              if(data.length === 0){
                this.noRowsToDisplayMsg = 'No data found for applied filter.'
              }
              let unpackedData = []
              data.forEach(k => { 
                unpackedData.push(
                  {...{aum: k.aum, aumDelta:k.aumDelta,aumLatest:k.aumLatest,issuerShortName:k.issuerShortName},
                  ...k.objPositionStatic})
                }
              )
              this.rowData = unpackedData;
              this.gridApi.refreshHeader()
              this.gridApi.hideOverlay()
            },
            error: error => {
              console.error("Error in fetching AUM Delta Data" + error);
              this.gridApi.hideOverlay()

            }
        }));  
      }
      else
        console.warn("Component loaded without setting date in filter pane");
      }
    }))

    this.subscriptions.push(this.aumDeltaSvc.currentSearchDateRange.subscribe(sDate => {
      this.sDate = sDate;
    }))
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getAUMDelta();
  }

  ngOnDestroy():void{
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe()
    })

  }

}
