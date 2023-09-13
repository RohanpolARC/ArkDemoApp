import { AdaptableApi, AdaptableOptions, DetailInitContext } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, IDetailCellRendererParams, Module, DetailGridInfo, RowGroupOpenedEvent, RowDataUpdatedEvent, FilterChangedEvent, ColumnRowGroupChangedEvent, ValueGetterParams } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs-compat';
import { CommonConfig } from 'src/app/configs/common-config';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { AumReportService } from 'src/app/core/services/aum-report/aum-report.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import {     CUSTOM_DISPLAY_FORMATTERS_CONFIG,   CUSTOM_FORMATTER,   nonAmountNumberFormatter } from 'src/app/shared/functions/formatter';
import {  autosizeColumnExceptResized,  loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { AsOfDateRange, FilterValueChangeParams } from 'src/app/shared/models/FilterPaneModel';
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";
import masterDetailAgGridPlugin from '@adaptabletools/adaptable-plugin-master-detail-aggrid';

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
  sDate: AsOfDateRange = null;
  noRowsToDisplayMsg = 'Please select the filter.'
  detailCellRendererParams: IDetailCellRendererParams<any, any>;
  funds: string[] = []

  AMOUNT_COLUMNS = [
    "aumLast",
    "aumLatest",
    "aumDiff",
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
    "aumEurAdjustmentDiff"
  ]




  constructor(private dataSvc: DataService,
    private aumReportSvc: AumReportService,
    public filterSvc: GeneralFilterService) { }

  ngOnInit(): void {

    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe((filter:FilterValueChangeParams)=>{
      if(filter){
        if(filter.id === 622){
          this.sDate = filter.value
          if(this.sDate.end === 'Invalid date')
            this.sDate.end = this.sDate.start;
          this.aumReportSvc.changeSearchDateRange(this.sDate)
        }
        else if(filter.id === 623){
          this.funds = filter?.value?.map(fund => fund?.value);

        }
      }
    }))
   
    this.sDate = null

    this.columnDefs = [
      {field: "issuerShortName", cellRenderer: 'agGroupCellRenderer'},
      {field: "issuer", type:"abColDefString"},
      {field: "aumLatest",type:"abColDefNumber", headerName:"AUM Latest" },
      {field: "aumLast",type:"abColDefNumber", headerName:"AUM Last"},
      {field: "aumDiff",type:"abColDefNumber", headerName:"AUM Diff"},
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
      {field: "issuerType",type:'abColDefString'},
      {field: "moveType",type:'abColDefString'},
      {field: "comment",type:'abColDefString'}

    ]

    this.detailCellRendererParams = {
      ...CommonConfig.GRID_OPTIONS,
      detailGridOptions: {
        columnDefs: this.detailColumnDefs,
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
        onGridReady: (params: GridReadyEvent) => {
          params.api.closeToolPanel()
        }
      },
      getDetailRowData: (params) => {
        this.subscriptions.push(this.aumReportSvc.getAUMReportDetailRows(this.sDate, params.data?.["issuerShortName"],this.funds).subscribe({
          next: (detail) => {
            params.successCallback(detail)
          },
          error: (error) => {
            console.error(`Failed to load audit details for audit event ID:`);
          }
        })
      )},
    } as IDetailCellRendererParams;

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
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
        sortable:true
      },
      enableRangeSelection: true,
      rowGroupPanelShow: "always",
      sideBar: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      suppressAggFuncInHeader: true,
      detailRowHeight: 450,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api; 
        this.getAumReport();  
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onRowDataUpdated: (params : RowDataUpdatedEvent) => {
        params.api.setPinnedBottomRowData(this.getAggBottomRow())
      },
      onFilterChanged: (params : FilterChangedEvent) => {
        params.api.setPinnedBottomRowData(this.getAggBottomRow())
      },
      onColumnRowGroupChanged: (params: ColumnRowGroupChangedEvent) => {
        params.api.setPinnedBottomRowData(this.getAggBottomRow())
      },
      masterDetail: true,
      keepDetailRows: true,
      keepDetailRowsCount: 5,
      rowHeight: 30,
      headerHeight: 30,
      onRowGroupOpened: this.onRowGroupOpened
    }


    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'AumReport',
      adaptableStateKey: 'AumReport Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG("amountMillionFormatter",this.AMOUNT_COLUMNS)
        ]
      },

      plugins: [
        masterDetailAgGridPlugin({
          detailAdaptableOptions: {
            adaptableId: 'AumReportDetails',
            primaryKey: 'positionId',
            licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
            userInterfaceOptions: {
              customDisplayFormatters: [
                CUSTOM_DISPLAY_FORMATTERS_CONFIG("amountMillionFormatter",this.AMOUNT_COLUMNS)
              ]
            },
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
                Revision:5,
                Layouts:[{
                  Name: "Basic AUM Report Detail Layout",
                  Columns: [
                    "fund"
                    ,"fundHedging"
                    ,"portfolio"
                    ,"asset"
                    ,"aumLatest"
                    ,"aumLast"
                    ,"aumDiff"
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
                  ],
                  RowGroupedColumns: [
                    "fund"
                  ],
                  AggregationColumns: {
                    aumLatest: "sum",
                    aumLast: "sum",
                    aumDiff: "sum",
                    grossCostAmountEurCurrent: "sum",
                    grossCostAmountEurLast: "sum",
                    grossCostAmountEurDiff: "sum",
                    grossFundedCostAmountEurCurrent: "sum",
                    grossFundedCostAmountEurLast: "sum",
                    grossFundedCostAmountEurDiff: "sum"
                  }
                }],
              },
              FormatColumn:{
                Revision :5,
                FormatColumns:[
                  CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountMillionFormatter')
                ]
              },
            },
          },
          onDetailInit: (context: DetailInitContext)=>{
            context.adaptableApi.toolPanelApi.closeAdapTableToolPanel()
          }
        }),
      ],
      
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
          Revision: 2,
          Layouts: [{
            Name: 'Basic AUM Report Layout',
            Columns: [
              "issuerShortName",
              "moveType",
              "aumLatest",
              "aumLast",
              "aumDiff",
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
              "comment"
            ],
            RowGroupedColumns: [
              "issuerType"
            ],
            AggregationColumns: {
              aumLatest: "sum",
              aumLast: "sum",
              aumDiff: "sum",
              grossCostAmountEurCurrent: "sum",
              grossCostAmountEurLast: "sum",
              grossCostAmountEurDiff: "sum",
              grossFundedCostAmountEurCurrent: "sum",
              grossFundedCostAmountEurLast: "sum",
              grossFundedCostAmountEurDiff: "sum"
            }
          }]
          
        },
        FormatColumn:{
          Revision :5,
          FormatColumns:[
            CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountMillionFormatter')
          ]
        },
        
        }

    }

  }

  getAggBottomRow(){
    if(this.rowData.length === 0){
      return []
    }
    let columns = this.columnDefs.filter(coldef => coldef.type === 'abColDefNumber').map(coldef => coldef.field)
    let aggRow = {}
    columns.forEach(col => {
      
      let sum = 0
      this.gridApi.forEachNodeAfterFilter(node => {
        sum += node.data?.[col] ?? 0
      })
      aggRow[col] = sum
    })

    return [aggRow];
  }

  getAumReport(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        if(this.sDate !== null && this.funds.length > 0){
          this.gridApi?.showLoadingOverlay();
          this.subscriptions.push(this.aumReportSvc.getAUMReportMasterRows(this.sDate,this.funds).subscribe({
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
                    ,aumEurAdjustmentDiff: k.aumEurAdjustmentDiff, issuerType: k.issuerType, moveType: k.moveType, comment: k.comment
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
      } 
        else
        console.warn("Component loaded without setting date in filter pane");
      }
    }))
      
      this.subscriptions.push(this.aumReportSvc.currentSearchDateRange.subscribe(sDate => {
        this.sDate = sDate;
      }))
    }

      onRowGroupOpened: (event: RowGroupOpenedEvent<any>) => void = (params: RowGroupOpenedEvent) => {
        this.detailColumnDefs = [
          {field: "positionId",type:"abColDefNumber"},
          {field: "issuerShortName", type:"abColDefString"},
          {field: "fund", type:"abColDefString"},
          {field: "fundHedging", type:"abColDefString"},
          {field: "portfolio", type:"abColDefString"},
          {field: "issuer", type:"abColDefString"},
          {field: "asset", type:"abColDefString"},
          {field: "aumLatest",type:"abColDefNumber", valueFormatter: nonAmountNumberFormatter, headerName:"AUM Latest"},
          {field: "aumLast",type:"abColDefNumber", headerName:"AUM Last"},
          {field: "aumDiff",type:"abColDefNumber", headerName:"AUM Diff"},
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
          // {field: "issuerType",type:'abColDefString'},
          // {field: "moveType",type:'abColDefString'},
          // {field: "comment",type:'abColDefString'}
        ]
        let detailGridInfo: DetailGridInfo = params.api.getDetailGridInfo(`detail_${params.data?.['__ADAPTABLE_PK__']}`);
        if(detailGridInfo){
          detailGridInfo.api.setColumnDefs(this.detailColumnDefs);
        }
      }
      

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.columnApi.autosizeAllColumns()
  }

  ngOnDestroy():void{
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe()
    })

  }

}


