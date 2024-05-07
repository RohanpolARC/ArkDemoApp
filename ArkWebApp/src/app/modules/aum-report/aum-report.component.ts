import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo, DetailInitContext } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, IDetailCellRendererParams, Module, DetailGridInfo, RowGroupOpenedEvent, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { AumReportService } from 'src/app/core/services/aum-report/aum-report.service';
import { DataService } from 'src/app/core/services/data.service';
import {   CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, nonAmountNumberFormatter } from 'src/app/shared/functions/formatter';
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";
import masterDetailAgGridPlugin from '@adaptabletools/adaptable-plugin-master-detail-aggrid';
import { Subscription, of } from 'rxjs';

@Component({
  selector: 'app-aum-report',
  templateUrl: './aum-report.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./aum-report.component.scss']
})
export class AumReportComponent implements OnInit {

  gridOptions: GridOptions = {}
  rowData: any = []
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[] = []
  detailColumnDefs: ColDef[]
  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES, MasterDetailModule]
  gridApi: GridApi;
  adaptableApi: AdaptableApi;
  subscriptions: Subscription[] = []
  noRowsToDisplayMsg = 'Please select the filter.'
  detailCellRendererParams: (params: ICellRendererParams) => IDetailCellRendererParams<any, any>;
  funds: string[] = []




  constructor(private dataSvc: DataService,
    private aumReportSvc: AumReportService
  ) { }

  ngOnInit(): void {


    this.columnDefs = [
      {field: "issuerShortName", cellRenderer: 'agGroupCellRenderer'},
      {field: "issuer", type:"abColDefString"},
      {field: "aumLatest",type:"abColDefNumber", headerName:"AUM Latest" },
      {field: "aumLast",type:"abColDefNumber", headerName:"AUM Last"},
      {field: "aumDiff",type:"abColDefNumber", headerName:"AUM Diff"},
      {field: "aumSpotLatest",type:"abColDefNumber", headerName:"AUM Spot Latest" },
      {field: "aumSpotLast",type:"abColDefNumber", headerName:"AUM Spot Last"},
      {field: "aumSpotDiff",type:"abColDefNumber", headerName:"AUM Spot Diff"},
      {field: "coinvestCostChange",type:"abColDefNumber", headerName:"Co-Invest Cost Change"},
      {field: "smaCostChange",type:"abColDefNumber", headerName:"SMA Cost Change"},
      {field: "grossCostAmountEurCurrent",type:'abColDefNumber'},
      {field: "grossCostAmountEurLast",type:'abColDefNumber'},
      {field: "grossCostAmountEurDiff",type:'abColDefNumber'},
      {field: "grossFundedCostAmountEurCurrent",type:'abColDefNumber'},
      {field: "grossFundedCostAmountEurLast",type:'abColDefNumber'},
      {field: "grossFundedCostAmountEurDiff",type:'abColDefNumber'},
      {field: "costAmountEurCurrent",type:'abColDefNumber'},
      {field: "costAmountEurLast",type:'abColDefNumber'},
      {field: "costAmountEurDiff",type:'abColDefNumber'},
      {field: "fundedCostAmountEurCurrent",type:'abColDefNumber'},
      {field: "fundedCostAmountEurLast",type:'abColDefNumber'},
      {field: "fundedCostAmountEurDiff",type:'abColDefNumber'},
      {field: "costAmountLocalCurrent",type:'abColDefNumber'},
      {field: "costAmountLocalLast",type:'abColDefNumber'},
      {field: "costAmountLocalDiff",type:'abColDefNumber'},
      {field: "aumEurAdjustmentCurrent",type:'abColDefNumber', headerName:"AUM Eur Adjustment Current"},
      {field: "aumEurAdjustmentLast",type:'abColDefNumber', headerName:"AUM Eur Adjustment Last"},
      {field: "aumEurAdjustmentDiff",type:'abColDefNumber', headerName:"AUM Eur Adjustment Diff"},
      {field: "grossGPSLatest", type:'abColDefNumber'},
      {field: "grossGPSLast", type:'abColDefNumber'},
      {field: "grossGPSDiff", type:'abColDefNumber'},

      {field: "netGPSLatest", type:'abColDefNumber'},
      {field: "netGPSLast", type:'abColDefNumber'},
      {field: "netGPSDiff", type:'abColDefNumber'},

      {field: "netOfRebateGPSLatest", type:'abColDefNumber'},
      {field: "netOfRebateGPSLast", type:'abColDefNumber'},
      {field: "netOfRebateGPSDiff", type:'abColDefNumber'},

      {field: "issuerType",type:'abColDefString'},
      {field: "moveType",type:'abColDefString'},
      {field: "comment",type:'abColDefString'},

      {field: "upfrontFeesCurrent",type:"abColDefNumber", headerName:"Upfront Fees Current"},
      {field: "upfrontFeesLast",type:"abColDefNumber", headerName:"Upfront Fees Last"},
      {field: "upfrontFeesDiff",type:"abColDefNumber", headerName:"Upfront Fees Diff"}

    ]

    this.detailCellRendererParams =(params: ICellRendererParams) => {
      
      return <IDetailCellRendererParams>{
        detailGridOptions: {
        ...CommonConfig.GRID_OPTIONS,
        ...{
          columnDefs:  [
            {field: "positionId",type:"abColDefNumber"},
            {field: "issuerShortName", type:"abColDefString"},
            {field: "fund", type:"abColDefString"},
            {field: "fundHedging", type:"abColDefString"},
            {field: "portfolio", type:"abColDefString"},
            {field: "fundStrategy", type: "abColDefString"},
            {field: "issuer", type:"abColDefString"},
            {field: "asset", type:"abColDefString"},
            {field: "aumLatest",type:"abColDefNumber", valueFormatter: nonAmountNumberFormatter, headerName:"AUM Latest"},
            {field: "aumLast",type:"abColDefNumber", headerName:"AUM Last"},
            {field: "aumDiff",type:"abColDefNumber", headerName:"AUM Diff"},
            {field: "aumSpotLatest",type:"abColDefNumber", headerName:"AUM Spot Latest" },
            {field: "aumSpotLast",type:"abColDefNumber", headerName:"AUM Spot Last"},
            {field: "aumSpotDiff",type:"abColDefNumber", headerName:"AUM Spot Diff"},
            {field: "coinvestCostChange",type:"abColDefNumber", headerName:"Co-Invest Cost Change"},
            {field: "smaCostChange",type:"abColDefNumber", headerName:"SMA Cost Change"},
            {field: "grossCostAmountEurCurrent",type:'abColDefNumber'},
            {field: "grossCostAmountEurLast",type:'abColDefNumber'},
            {field: "grossCostAmountEurDiff",type:'abColDefNumber'},
            {field: "grossFundedCostAmountEurCurrent",type:'abColDefNumber'},
            {field: "grossFundedCostAmountEurLast",type:'abColDefNumber'},
            {field: "grossFundedCostAmountEurDiff",type:'abColDefNumber'},
            {field: "costAmountEurCurrent",type:'abColDefNumber'},
            {field: "costAmountEurLast",type:'abColDefNumber'},
            {field: "costAmountEurDiff",type:'abColDefNumber'},
            {field: "fundedCostAmountEurCurrent",type:'abColDefNumber'},
            {field: "fundedCostAmountEurLast",type:'abColDefNumber'},
            {field: "fundedCostAmountEurDiff",type:'abColDefNumber'},
            {field: "costAmountLocalCurrent",type:'abColDefNumber'},
            {field: "costAmountLocalLast",type:'abColDefNumber'},
            {field: "costAmountLocalDiff",type:'abColDefNumber'},
            {field: "aumEurAdjustmentCurrent",type:'abColDefNumber', headerName:"AUM Eur Adjustment Current"},
            {field: "aumEurAdjustmentLast",type:'abColDefNumber', headerName: "AUM Eur Adjustment Last"},
            {field: "aumEurAdjustmentDiff",type:'abColDefNumber', headerName: "AUM Eur Adjustment Diff"},
            {field: "grossGPSLatest", type:'abColDefNumber'},
            {field: "grossGPSLast", type:'abColDefNumber'},
            {field: "grossGPSDiff", type:'abColDefNumber'},
      
            {field: "netGPSLatest", type:'abColDefNumber'},
            {field: "netGPSLast", type:'abColDefNumber'},
            {field: "netGPSDiff", type:'abColDefNumber'},
      
            {field: "netOfRebateGPSLatest", type:'abColDefNumber'},
            {field: "netOfRebateGPSLast", type:'abColDefNumber'},
            {field: "netOfRebateGPSDiff", type:'abColDefNumber'},
            {field: "upfrontFeesCurrent",type:"abColDefNumber", headerName:"Upfront Fees Current"},
            {field: "upfrontFeesLast",type:"abColDefNumber", headerName:"Upfront Fees Last"},
            {field: "upfrontFeesDiff",type:"abColDefNumber", headerName:"Upfront Fees Diff"}
  
          ],
          defaultColDef: {
            resizable: true,
            filter: true,
            sortable: true,
            enableRowGroup: true,
          },
          enableRangeSelection: true, 
          rowHeight: 30,
          headerHeight: 30,
          rowGroupPanelShow: 'always',
          sideBar: true,
          suppressAggFuncInHeader: true,
        }
      },
      getDetailRowData: (params) => {
        this.subscriptions.push(this.aumReportSvc.getAUMReportDetailRows().subscribe({
          next: (detail) => {
            params.successCallback(detail)
          }
        })
      )},
    }
  } //as IDetailCellRendererParams;

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
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
        cellRendererSelector: (params) => {
          if(params.value === undefined){
            return undefined //This hides the extra row group expand icon '>' in empty cells of group column.
          }
          return { component: 'agGroupCellRenderer' };      
        },
      },
      enableRangeSelection: true,
      rowGroupPanelShow: "always",
      sideBar: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      suppressAggFuncInHeader: true,
      detailRowHeight: 450,
      masterDetail: true,
      keepDetailRows: true,
      keepDetailRowsCount: 5,
      rowHeight: 30,
      headerHeight: 30,
      onRowGroupOpened: this.onRowGroupOpened
    }


    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'AumReport',
      adaptableStateKey: 'AumReport Key',

      plugins: [
        masterDetailAgGridPlugin({
          detailAdaptableOptions: {            
            ...CommonConfig.ADAPTABLE_OPTIONS,
            adaptableId: 'AumReportDetails',
            primaryKey: 'positionId',

            exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
          
            predefinedConfig: { 
              Dashboard: {
                Revision:2,
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
                CurrentLayout:"Basic AUM Report Detail Layout",
                Revision:14,
                Layouts:[{
                  Name: "Basic AUM Report Detail Layout",
                  Columns: [
                    "fund"
                    ,"aumLatest"
                    ,"aumLast"
                    ,"aumDiff"
                    ,"aumSpotLatest"
                    ,"aumSpotLast"
                    ,"aumSpotDiff"
                    ,"coinvestCostChange"
                    ,"smaCostChange"
                    ,"grossGPSLatest"
                    ,"grossGPSLast",
                    ,"grossGPSDiff"
                    ,"netGPSLatest"
                    ,"netGPSLast"
                    ,"netGPSDiff"
                    ,"netOfRebateGPSLatest"
                    ,"netOfRebateGPSLast"
                    ,"netOfRebateGPSDiff"
                    ,"fundHedging"
                    ,"portfolio"
                    ,"asset"
                    ,"fundStrategy"
                    ,"grossCostAmountEurCurrent"
                    ,"grossCostAmountEurLast"
                    ,"grossCostAmountEurDiff"
                    ,"grossFundedCostAmountEurCurrent"
                    ,"grossFundedCostAmountEurLast"
                    ,"grossFundedCostAmountEurDiff"
                    ,"costAmountEurCurrent"
                    ,"costAmountEurLast"
                    ,"costAmountEurDiff"
                    ,"fundedCostAmountEurCurrent"
                    ,"fundedCostAmountEurLast"
                    ,"fundedCostAmountEurDiff"
                    ,"costAmountLocalCurrent"
                    ,"costAmountLocalLast"
                    ,"costAmountLocalDiff"
                    ,"aumEurAdjustmentCurrent"
                    ,"aumEurAdjustmentLast"
                    ,"aumEurAdjustmentDiff"
                    ,"upfrontFeesCurrent"
                    ,"upfrontFeesLast"
                    ,"upfrontFeesDiff"
                  ],
                  RowGroupedColumns: [
                    "fund"
                  ],
                  AggregationColumns: {
                    aumLatest: "sum",
                    aumLast: "sum",
                    aumDiff: "sum",
                    aumSpotLatest: "sum",
                    aumSpotLast: "sum",
                    aumSpotDiff: "sum",
                    grossGPSLatest: "sum",
                    grossGPSLast: "sum",
                    grossGPSDiff: "sum",
                    netGPSLatest: "sum",
                    netGPSLast: "sum",
                    netGPSDiff: "sum",
                    netOfRebateGPSLatest: "sum",
                    netOfRebateGPSLast: "sum",
                    netOfRebateGPSDiff: "sum",
                    grossCostAmountEurCurrent: "sum",
                    grossCostAmountEurLast: "sum",
                    grossCostAmountEurDiff: "sum",
                    grossFundedCostAmountEurCurrent: "sum",
                    grossFundedCostAmountEurLast: "sum",
                    grossFundedCostAmountEurDiff: "sum",
                    coinvestCostChange : "sum",
                    smaCostChange : "sum",
                    upfrontFeesCurrent: "sum",
                    upfrontFeesLast: "sum",
                    upfrontFeesDiff: "sum"
                  }
                }],
              }
            },
          },
          onDetailInit: (context: DetailInitContext)=>{
            context.adaptableApi.toolPanelApi.closeAdapTableToolPanel()
          }
        }),
      ],
      
      formatColumnOptions:{
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',['aumLatest'])
          ],
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
          CurrentLayout: 'Basic AUM Report Layout',
          Revision: 11,
          Layouts: [{
            Name: 'Basic AUM Report Layout',
            Columns: [
              "issuerShortName",
              "moveType",
              "aumLatest",
              "aumLast",
              "aumDiff",
              "aumSpotLatest",
              "aumSpotLast",
              "aumSpotDiff",
              "coinvestCostChange",
              "smaCostChange",
              "grossGPSLatest",
              "grossGPSLast",
              "grossGPSDiff",
              "netGPSLatest",
              "netGPSLast",
              "netGPSDiff",
              "netOfRebateGPSLatest",
              "netOfRebateGPSLast",
              "netOfRebateGPSDiff",
              "grossCostAmountEurCurrent",
              "grossCostAmountEurLast",
              "grossCostAmountEurDiff",
              "grossFundedCostAmountEurCurrent",
              "grossFundedCostAmountEurLast",
              "grossFundedCostAmountEurDiff",
              "costAmountEurCurrent",
              "costAmountEurLast",
              "costAmountEurDiff",
              "fundedCostAmountEurCurrent",
              "fundedCostAmountEurLast",
              "fundedCostAmountEurDiff",
              "costAmountLocalCurrent",
              "costAmountLocalLast",
              "costAmountLocalDiff",
              "aumEurAdjustmentCurrent",
              "aumEurAdjustmentLast",
              "aumEurAdjustmentDiff",
              "comment",
              "upfrontFeesCurrent",
              "upfrontFeesLast",
              "upfrontFeesDiff"
            ],
            RowGroupedColumns: [
              "issuerType"
            ],
            AggregationColumns: {
              aumLatest: "sum",
              aumLast: "sum",
              aumDiff: "sum",
              aumSpotLatest: "sum",
              aumSpotLast: "sum",
              aumSpotDiff: "sum",
              grossGPSLatest: "sum",
              grossGPSLast: "sum",
              grossGPSDiff: "sum",
              netGPSLatest: "sum",
              netGPSLast: "sum",
              netGPSDiff: "sum",
              netOfRebateGPSLatest: "sum",
              netOfRebateGPSLast: "sum",
              netOfRebateGPSDiff: "sum",
              grossCostAmountEurCurrent: "sum",
              grossCostAmountEurLast: "sum",
              grossCostAmountEurDiff: "sum",
              grossFundedCostAmountEurCurrent: "sum",
              grossFundedCostAmountEurLast: "sum",
              grossFundedCostAmountEurDiff: "sum",
              coinvestCostChange : "sum",
              smaCostChange : "sum",
              upfrontFeesCurrent: "sum",
              upfrontFeesLast: "sum",
              upfrontFeesDiff: "sum"
              
            }
          }]
          
        },
        
      FormatColumn: {
        Revision: 2,
        FormatColumns: [
          CUSTOM_FORMATTER(['aumLatest'],['amountFormatter']),
        ]
      }
      },

    }

  }


  getAumReport(){
    this.subscriptions.push(of(true).subscribe(isHit => {
      if(isHit){
          this.gridApi?.showLoadingOverlay();
          this.subscriptions.push(this.aumReportSvc.getAUMReportMasterRows().subscribe({
            next: data => {
              if(data.length === 0){
                this.noRowsToDisplayMsg = 'No data found for applied filter.'
              }
              let unpackedData = []
              data.forEach(k => { 
                unpackedData.push(
                  {...{fund: k.fund, issuer: k.issuer, positionId: k.positionId, aumLatest: k.aumLatest, aumLast:k.aumLast,aumDiff:k.aumDiff,issuerShortName:k.issuerShortName,
                    grossCostAmountEurCurrent: k.grossCostAmountEurCurrent, grossCostAmountEurLast:k.grossCostAmountEurLast,
                    grossCostAmountEurDiff: k.grossCostAmountEurDiff, grossFundedCostAmountEurCurrent:k.grossFundedCostAmountEurCurrent,
                    grossFundedCostAmountEurLast: k.grossFundedCostAmountEurLast, grossFundedCostAmountEurDiff: k.grossFundedCostAmountEurDiff,
                    costAmountEurCurrent: k.costAmountEurCurrent, costAmountEurLast: k.costAmountEurLast, costAmountEurDiff: k.costAmountEurDiff,
                    fundedCostAmountEurCurrent: k.fundedCostAmountEurCurrent, fundedCostAmountEurLast: k.fundedCostAmountEurLast, 
                    fundedCostAmountEurDiff: k.fundedCostAmountEurDiff, costAmountLocalCurrent: k.costAmountLocalCurrent, costAmountLocalLast: k.costAmountLocalLast
                    ,costAmountLocalDiff: k.costAmountLocalDiff, aumEurAdjustmentCurrent: k.aumEurAdjustmentCurrent, aumEurAdjustmentLast: k.aumEurAdjustmentLast
                    ,aumEurAdjustmentDiff: k.aumEurAdjustmentDiff, issuerType: k.issuerType, moveType: k.moveType, comment: k.comment, smaCostChange: k.smaCostChange,
                    coinvestCostChange: k.coinvestCostChange, aumSpotLatest: k.aumSpotLatest, aumSpotLast: k.aumSpotLast, aumSotDiff: k.aumSpotDiff,
                    grossGPSLatest: k.grossGPSLatest, grossGPSLast: k.grossGPSLast, grossGPSDiff: k.grossGPSDiff,
                    netGPSLatest: k.netGPSLatest, netGPSLast: k.netGPSLast, netGPSDiff: k.netGPSDiff,
                    netOfRebateGPSLatest: k.netOfRebateGPSLatest, netOfRebateGPSLast: k.netOfRebateGPSLast, netOfRebateGPSDiff: k.netOfRebateGPSDiff, 
                    upfrontFeesCurrent: k.upfrontFeesCurrent, upfrontFeesLast: k.upfrontFeesLast, upfrontFeesDiff: k.upfrontFeesDiff,
                  }})
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
        console.warn("Component loaded without setting date in filter pane");
      }
    }))
      
  
    }

      onRowGroupOpened: (event: RowGroupOpenedEvent<any>) => void = (params: RowGroupOpenedEvent) => {
    
      }
      
  onAdaptableReady(params: AdaptableReadyInfo){
    this.adaptableApi = params.adaptableApi;
    params.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    params.adaptableApi.agGridApi.autoSizeAllColumns()    
    this.gridApi = params.agGridApi; 
    this.gridApi.closeToolPanel()
    this.getAumReport();
  }

  ngOnDestroy():void{
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe()
    })

  }

}


