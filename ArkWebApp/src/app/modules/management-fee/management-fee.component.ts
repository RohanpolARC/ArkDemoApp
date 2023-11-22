import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { ManagementFeeService } from 'src/app/core/services/ManagementFee/management-fee.service';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER,  DATE_FORMATTER_CONFIG_ddMMyyyy, formatDate } from 'src/app/shared/functions/formatter';
import { getMomentDateStr,  presistSharedEntities,loadSharedEntities, autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { getNodes } from '../capital-activity/utilities/functions';
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi, GridOptions, Module, ColDef, IAggFuncParams, GridReadyEvent, ValueGetterParams, ValueParserParams, RowNode, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';

@Component({
  selector: 'app-management-fee',
  templateUrl: './management-fee.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './management-fee.component.scss']
})
export class ManagementFeeComponent implements OnInit {

  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  rowData = []
  agGridModules: Module[]
  adaptableApi: AdaptableApi;
  gridApi: GridApi;
  subscriptions: Subscription[] = [];
  asOfDate: string;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  
  constructor(
    private managementFeeSvc: ManagementFeeService,
    private dataSvc: DataService,
    private filterSvc: GeneralFilterService
    ) { }
    
  AMOUNT_COLUMNS= [
    'feeRate',
    'grossGPSRate',
    'netOfRebateGPSRate',
    'netGPSRate'
  ]
  
  NO_DEC_AMOUNT_COLUMNS = [
    'aumBase',
    'calculatedITDFee',
    'adjustment',
    'adjustedITDFee',
    'aggregatedAdjustment',
    'runningAUMBase',
    'grossGPS',
    'netOfRebateGPS',
    'netGPS',
    'deltaCommitted',
    'funded',
    'unfunded',
    'deltaFunded',
    'runningAUMPosition',
    'aumPosition'

  ]

  DATE_COLUMNS = [
      'managementDate'
  ]

  fetchManagementFee(){

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.gridApi.showLoadingOverlay();
        this.managementFeeSvc.getManagementFee(this.asOfDate).pipe(
            map((mgmtFeeData: any[]) => mgmtFeeData.map(row => {
            row['adjustedITDFee'] = 0;
            return row;
          }))
        ).subscribe({
          next: (d) => {
            if(d.length === 0){
              this.noRowsToDisplayMsg = 'No data found for applied filter.'
            }
            this.rowData = d
            this.gridApi.hideOverlay();
          },
          error: (e) => {
            console.error(`Failed to load management view: ${e}`)
          }
        });
    
      }
    }))

  }
  ngOnInit(): void {
    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id === 431){
          this.managementFeeSvc.changeSearchDate(getMomentDateStr(data.value))
        }
      }
    }))


    this.subscriptions.push(this.managementFeeSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.agGridModules = CommonConfig.AG_GRID_MODULES;
    
    let allowedAggFunc = ['sum', 'max', 'min', 'first', 'last', 'count']
    this.columnDefs = [
      { field: 'positionID',headerName: 'Position Id', type: 'abColDefNumber' },
      { field: 'fundHedging', type: 'abColDefString' },
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'issuer', type: 'abColDefString' },
      { field: 'transaction',type:'abColDefString'},
      { field: 'asset', type: 'abColDefString' },
      { field: 'managementDate', type: 'abColDefDate',  cellClass: 'dateUK', headerName: 'Trade Date' },
      { field: 'aumBase',headerName:'AUM Base', type: 'abColDefNumber' },
      { field: 'runningAUMBase',headerName:'GPS Basis', type: 'abColDefNumber',allowedAggFuncs:['AUMBaseSum','sum', 'max', 'min', 'first', 'last', 'count'], aggFunc: 'AUMBaseSum' },
      { field: 'feeRate', type: 'abColDefNumber',aggFunc: 'max', headerName: 'Fee Rate Percent'  },
      { field: 'calculatedITDFee', type: 'abColDefNumber', aggFunc: 'sum'  },
      { field: 'adjustment', type: 'abColDefNumber', aggFunc: 'sum',   },
      { field: 'adjustedITDFee', type: 'abColDefNumber', allowedAggFuncs: ['Sum'], aggFunc: 'Sum' },
      { field: 'noOfMgmtDays',headerName: 'No of GPS Days', type: 'abColDefNumber'},
      { field: 'positionCCY',headerName:'Local Currency',type: 'abColDefString'},
      { field: 'aggregatedAdjustment', type: 'abColDefNumber' },
      { field: 'grossGPS', headerName:'Gross GPS', type:'abColDefNumber', aggFunc: 'sum'},
      { field: 'grossGPSRate', headerName:'Gross GPS Rate', type:'abColDefNumber', aggFunc: 'max'},
      { field: 'netOfRebateGPS', headerName:'Net of Rebate GPS', type:'abColDefNumber', aggFunc: 'sum'},
      { field: 'netOfRebateGPSRate', headerName:'Net of Rebate GPS Rate', type:'abColDefNumber', aggFunc: 'max'},
      { field: 'netGPS', headerName:'Net GPS', type:'abColDefNumber', aggFunc: 'sum', },
      { field: 'netGPSRate', headerName:'Net GPS Rate', type:'abColDefNumber', aggFunc: 'max'},
      { field: 'gir', headerName:'GIR', type:'abColDefNumber'},
      { field: 'deltaCommitted', headerName: 'Delta Committed', type: 'abColDefNumber'},
      { field: 'unfunded', headerName: 'Unfunded', type: 'abColDefNumber'},
      { field: 'deltaFunded', headerName: 'Delta Funded', type: 'abColDefNumber'},
      { field: 'funded', headerName: 'Funded', type: 'abColDefNumber'},
      { field: 'runningAUMPosition',headerName:'Running AUM Local', type: 'abColDefNumber',allowedAggFuncs:['AUMLocalSum','sum', 'max', 'min', 'first', 'last', 'count'], aggFunc: 'AUMLocalSum' },
      { field: 'aumPosition',headerName:'AUM Local', type: 'abColDefNumber' },






    ].map(c => {
      if(c.allowedAggFuncs == null)
        c.allowedAggFuncs = allowedAggFunc
      c['tooltipField'] = c.field;
      return c
    })
    

    let aggFuncs = {
      'Sum': (params: IAggFuncParams) => {
        if(params.column.getColId() === 'adjustedITDFee'){
          let childData = getNodes(params.rowNode as RowNode, []);
          let aggAdj: number = childData.reduce((n, {aggregatedAdjustment}) => n + aggregatedAdjustment, 0) ?? 0;
          let fixing: number = Math.max(...childData.map(c => Number(c['fixing']))) ?? 0;

          return Number(aggAdj + fixing);
        }

        return 0;
      },
      'AUMBaseSum': (params: IAggFuncParams) => {
        if(params.column.getColId() === 'runningAUMBase'){
        let childData = getNodes(params.rowNode as RowNode,[]);
        let totalAUMBase: number = childData.reduce((n, {aumBase}) => n + aumBase, 0) ?? 0;
        return totalAUMBase
        }
        return 0
      },
      'AUMLocalSum' : (params: IAggFuncParams) => {
        if(params.column.getColId() === 'runningAUMPosition'){
          let childData = getNodes(params.rowNode as RowNode, []);
          let totalAUMLocal: number = childData.reduce((n,{aumPosition}) => n + aumPosition, 0) ?? 0;
          return totalAUMLocal
        }
        return 0
      }
    }
  
    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      rowGroupPanelShow: 'always',
      rowHeight: 40,
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      autoGroupColumnDef:{
        minWidth:200,
      },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true,
      },
      suppressAggFuncInHeader: true,
      onGridReady: this.onGridReady.bind(this),
      aggFuncs: aggFuncs,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Management Fee ID',
      adaptableStateKey: 'Management Fee State key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('noDecimalAmountFormatter',this.NO_DEC_AMOUNT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('fxFormatter',['gir'])

        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 2,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 29,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns:[
              'fundHedging',
              'issuer',
              'issuerShortName',
              'asset',
              'positionID',
              'positionCCY',
              'managementDate',
              'transaction',
              'noOfMgmtDays',
              'gir',
              'runningAUMBase',
              'runningAUMPosition',
              'grossGPS',
              'grossGPSRate',
              'netOfRebateGPS',
              'netOfRebateGPSRate',
              'netGPS',
              'netGPSRate',
              'deltaCommitted',
              'funded',
              'unfunded',
              'deltaFunded'

            ],
            RowGroupedColumns: [
              'fundHedging'
            ],
            AggregationColumns: {
              adjustedITDFee: true,
              adjustment: true,
              feeRate: true,
              calculatedITDFee: true,
              fixing: true,
              fixingDate: true,
              aggregatedAdjustment: true,
              grossGPS: true,
              grossGPSRate: true,
              netOfRebateGPS: true,
              netOfRebateGPSRate: true,
              netGPS: true,
              netGPSRate: true,
              runningAUMBase: true,
              runningAUMPosition: true,


            },
            ColumnSorts: [
              {
                ColumnId: 'positionID',
                SortOrder: 'Desc',
              },
              {
                ColumnId: 'managementDate',
                SortOrder: 'Desc'
              }
            ],
          }]
        },
        FormatColumn:{
          Revision:11,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(this.DATE_COLUMNS),
            DATE_FORMATTER_CONFIG_ddMMyyyy(this.DATE_COLUMNS),
            CUSTOM_FORMATTER(this.NO_DEC_AMOUNT_COLUMNS,['noDecimalAmountFormatter']),
            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS],['amountFormatter']),
            CUSTOM_FORMATTER(['gir'],['fxFormatter'])
          ]
        },
        StatusBar: {
          Revision: 2,
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


  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api;
    
    this.fetchManagementFee();
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.columnApi.autosizeAllColumns()
    // use AdaptableApi for runtime access to Adaptable
  };

}
