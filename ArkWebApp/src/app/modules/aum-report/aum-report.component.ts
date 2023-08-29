import { AdaptableApi, AdaptableOptions, DetailInitContext } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, HeaderValueGetterParams, IDetailCellRendererParams, Module, ValueGetterParams, IsRowMaster, DetailGridInfo, RowGroupOpenedEvent } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs-compat';
import { CommonConfig } from 'src/app/configs/common-config';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { AumReportService } from 'src/app/core/services/aum-report/aum-report.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import {  CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, formatDate, DATE_FORMATTER_CONFIG_ddMMyyyy, nonAmountNumberFormatter } from 'src/app/shared/functions/formatter';
import {  autosizeColumnExceptResized,  loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
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

    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id === 622){
          this.sDate = data.value
          if(this.sDate.end === 'Invalid date')
            this.sDate.end = this.sDate.start;
          this.aumReportSvc.changeSearchDateRange(this.sDate)
        }
      }
    }))
   
    this.sDate = null

    this.columnDefs = [
      {field: "issuerShortName", cellRenderer: 'agGroupCellRenderer'},
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
        },
        enableRangeSelection: true, 
        rowHeight: 30,
        headerHeight: 30          
      },
      getDetailRowData: (params) => {
        this.subscriptions.push(this.aumReportSvc.getAUMReportDetailRows(this.sDate, params.data?.["issuerShortName"]).subscribe({
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
        this.getAumReport();  
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
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

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS),
        ]
      },
      plugins: [
        masterDetailAgGridPlugin({
          detailAdaptableOptions: {
            adaptableId: 'AumReportDetails',
            primaryKey: 'PositionId',
            licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
            userInterfaceOptions:{
              customDisplayFormatters:[
                CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS),
              ]
            },
            predefinedConfig: { 
              Dashboard: {
                Revision:1,
                ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
                IsCollapsed: true,
                Tabs: [{
                  Name: 'Layout',
                  Toolbars: ['Layout']
                }],
                IsHidden: false,
                DashboardTitle: ' '
              },             
              FormatColumn:{
                Revision :1,
                FormatColumns:[
                  CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountFormatter'),
                ]
              },
            },
          },
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
          Revision: 1.1,
          Layouts: [{
            Name: 'Basic AUM Report Layout',
            Columns: [ ...this.columnDefs.map(c => c.field)].filter(c => !["positionID"].includes(c)),
          }]
          
        },
        FormatColumn:{
          Revision :1,
          FormatColumns:[
            CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountFormatter'),
          ]
        },
        
        }

    }

  }

  getAumReport(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        if(this.sDate !== null){
          this.gridApi?.showLoadingOverlay();
          this.subscriptions.push(this.aumReportSvc.getAUMReportMasterRows(this.sDate).subscribe({
            next: data => {
              if(data.length === 0){
                this.noRowsToDisplayMsg = 'No data found for applied filter.'
              }
              let unpackedData = []
              data.forEach(k => { 
                unpackedData.push(
                  {...{fund: k.fund, positionId: k.positionId, aumLatest: k.aumLatest, aumLast:k.aumLast,aumDiff:k.aumDiff,issuerShortName:k.issuerShortName,
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


