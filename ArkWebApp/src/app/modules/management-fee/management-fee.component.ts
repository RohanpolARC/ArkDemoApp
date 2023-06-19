import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { ManagementFeeService } from 'src/app/core/services/ManagementFee/management-fee.service';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER,  DATE_FORMATTER_CONFIG_ddMMyyyy, formatDate } from 'src/app/shared/functions/formatter';
import { getMomentDateStr, getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { getNodes } from '../capital-activity/utilities/functions';
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi, GridOptions, Module, ColDef, IAggFuncParams, GridReadyEvent, ValueGetterParams, ValueParserParams } from '@ag-grid-community/core';
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
    
  AMOUNT_COLUMNS= ['feeRate']
  
  NO_DEC_AMOUNT_COLUMNS = [
    'aumBase',
    'calculatedITDFee',
    'fixing',
    'adjustment',
    'adjustedITDFee',
    'aggregatedAdjustment',
    'aumLocal',
    'runningAUMBase',
    'deltaCommitted',
    'unfunded',
    'deltaFunded',
    'funded'
  ]

  DATE_COLUMNS = [
      'fixingDate',
      'managementDate',
      'girTimestamp'
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
      { field: 'positionID', type: 'abColDefNumber' },
      { field: 'fundHedging', type: 'abColDefString' },
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'issuer', type: 'abColDefString' },
      {field: 'transaction',type:'abColDefString'},
      { field: 'asset', type: 'abColDefString' },
      { field: 'managementDate', type: 'abColDefDate',  cellClass: 'dateUK', headerName: 'Trade Date' },
      { field: 'aumBase',headerName:'AUM Base', type: 'abColDefNumber', aggFunc: 'sum' },
      { field: 'feeRate', type: 'abColDefNumber',aggFunc: 'max', headerName: 'Fee Rate Percent'  },
      { field: 'calculatedITDFee', type: 'abColDefNumber', aggFunc: 'sum'  },
      { field: 'fixingDate', 
      valueGetter:(params:ValueGetterParams)=>{
        return dateNullValueGetter(params,'fixingDate')
      },
      type: 'abColDefDate',  aggFunc: 'Max', allowedAggFuncs: ['Max'], cellClass: 'dateUK' },
      { field: 'fixing', type: 'abColDefNumber', aggFunc: 'max'  },
      { field: 'adjustment', type: 'abColDefNumber', aggFunc: 'sum',   },
      { field: 'adjustedITDFee', type: 'abColDefNumber', allowedAggFuncs: ['Sum'], aggFunc: 'Sum' },
      { field: 'noOfMgmtDays',headerName: 'No of Management Days', type: 'abColDefNumber'},
      { field: 'positionCCY',headerName:'Position Ccy',type: 'abColDefString'},
      { field: 'aumLocal', headerName:'AUM Local',type: 'abColDefNumber'},
      { field: 'aggregatedAdjustment', type: 'abColDefNumber' },
      {field:'runningAUMBase',headerName:'GPS Basis',type:'abColDefNumber'},
      {field: 'gir',headerName:'GIR',type:'abColDefNumber'},
      {field: 'girSource',headerName:'GIR Source',type:'abColDefString'},
      {field: 'girTimestamp',headerName:'GIR Timestamp',type:'abColDefDate'},
      {field: 'deltaCommitted',headerName:'Delta in Commitment',type:'abColDefNumber'},
      {field: 'unfunded',type:'abColDefNumber'},
      {field: 'deltaFunded',headerName:'Delta in Funded',type:'abColDefNumber'},
      {field: 'funded',type:'abColDefNumber'},
      {field: 'wtAvgGIRMethod',type:'abColDefString'},
      {field: 'wtAvgGIR',type:'abColDefNumber'}



    ].map(c => {
      if(c.allowedAggFuncs == null)
        c.allowedAggFuncs = allowedAggFunc
      c['tooltipField'] = c.field;
      return c
    })
    

    let aggFuncs = {
      'Max': (params: IAggFuncParams) => {
        if(params.column.getColId() === 'fixingDate'){

          const MIN_DATE_VAL: number = -8640000000000000;
          let maxDate = new Date(MIN_DATE_VAL);
          params.values.forEach(value => {
            let d = new Date(value)
            if(d > maxDate)
              maxDate = d
          })

          if(formatDate(maxDate) === '01/01/1' || formatDate(maxDate) === '01/01/1970')
            return null;
          else return maxDate;
        }

        return 0;
      },
      'Sum': (params: IAggFuncParams) => {
        if(params.column.getColId() === 'adjustedITDFee'){
          let childData = getNodes(params.rowNode, []);
          let aggAdj: number = childData.reduce((n, {aggregatedAdjustment}) => n + aggregatedAdjustment, 0) ?? 0;
          let fixing: number = Math.max(...childData.map(c => Number(c['fixing']))) ?? 0;

          return Number(aggAdj + fixing);
        }

        return 0;
      }
    }
  
    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      rowGroupPanelShow: 'always',
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
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
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('noDecimalAmountFormatter',this.NO_DEC_AMOUNT_COLUMNS)
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
          Revision: 14,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [ ...this.columnDefs.map(c => c.field)].filter(c => !['aggregatedAdjustment'].includes(c)),
            RowGroupedColumns: [
              'fundHedging'
            ],
            AggregationColumns: {
              adjustedITDFee: true,
              adjustment: true,
              aumBase: true,
              feeRate: true,
              calculatedITDFee: true,
              fixing: true,
              fixingDate: true,
              aggregatedAdjustment: true
            }
          }]
        },
        FormatColumn:{
          Revision:7,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(this.DATE_COLUMNS),
            DATE_FORMATTER_CONFIG_ddMMyyyy(this.DATE_COLUMNS),
            CUSTOM_FORMATTER(this.NO_DEC_AMOUNT_COLUMNS,['noDecimalAmountFormatter']),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['wtAvgGIR','gir'], 8),
            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS,'wtAvgGIR','gir'],['amountFormatter'])
          ]
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
    // use AdaptableApi for runtime access to Adaptable
  };

}
