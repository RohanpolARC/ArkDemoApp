import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { ContractHistoryService } from 'src/app/core/services/ContractHistory/contract-history.service';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { createColumnDefs, GENERAL_FORMATTING_EXCEPTIONS, parseFetchedData, saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import {  presistSharedEntities, loadSharedEntities, autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

@Component({
  selector: 'app-contract-history',
  templateUrl: './contract-history.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./contract-history.component.scss']
})

export class ContractHistoryComponent implements OnInit {

  subscriptions: Subscription[] = []
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  
  columnDefs: ColDef[] = []
  gridApi: GridApi;
  gridColumnApi: any;
  adaptableApi: AdaptableApi;
  funds
  isLatest

  rowData = []

  preSelectedColumns: string[] = []
  gridOptions: GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
    enableRangeSelection: true,
    columnDefs: this.columnDefs,
    tooltipShowDelay: 0,
    // components: {
    //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    // },
    onGridReady: this.onGridReady.bind(this),
    defaultColDef: {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: true
    },
    rowData: this.rowData,
    sideBar: true,
    excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
    noRowsOverlayComponent : NoRowsOverlayComponent,
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => this.noRowsToDisplayMsg,
    },
    onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
      autosizeColumnExceptResized(event)
    },
  }

  adaptableOptions: AdaptableOptions = {
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    primaryKey: '',
    userName: this.dataSvc.getCurrentUserName(),
    autogeneratePrimaryKey: true,
    adaptableId: 'Contracts history ID',
    adaptableStateKey: 'Contracts history state key',

    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

    
    // toolPanelOptions: {
    //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
    // },

    teamSharingOptions: {
      enableTeamSharing: true,
      persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
      loadSharedEntities: loadSharedEntities.bind(this)

    },

    layoutOptions: {
      autoSizeColumnsInLayout: true
    },

    userInterfaceOptions:{
      customDisplayFormatters:[
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter')
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
  DATE_COLUMNS: string[]=[];
  AMOUNT_COLUMNS: string[]=[];
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  constructor(
    private contractHistorySvc: ContractHistoryService,
    private dataSvc: DataService,
    private filterSvc: GeneralFilterService
  ) { }

  changeListeners() {
    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id===521){
          this.contractHistorySvc.changeisLatestValue(data.value)
        }else if(data.id === 522){
          let funds:any[] = []
          data.value?.forEach(ele=>funds.push(ele.value))
          this.contractHistorySvc.changeFundValues(funds) 
        }
      }
    }))

    this.subscriptions.push(this.contractHistorySvc.currentfundValues.subscribe(funds => {
      this.funds = funds
    }))
    this.subscriptions.push(this.contractHistorySvc.currentisLatestValue.subscribe(isLatest => {
      this.isLatest = isLatest
    }))


  }

  ngOnInit(): void {
    this.changeListeners();
  }

  ngOnDestroy(): void {
    this.gridApi.destroy();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  refreshGrid(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){

        this.gridApi?.showLoadingOverlay()
        this.subscriptions.push(forkJoin(
          [
            this.contractHistorySvc.getContractHistory({
              funds: this.funds?.join(','),
              isLatest: this.isLatest
            }),
            this.dataSvc.getGridDynamicColumns('Contract History')
          ]
          ).pipe(first()).subscribe({
          next: data => {
            if(data[0].length === 0){
              this.noRowsToDisplayMsg = 'No data found for applied filter.'
            }
            let contractData = data[0]
            let dynamicColumns = parseFetchedData(data[1])

            this.preSelectedColumns = dynamicColumns.filter(r => r?.['IsDefault'] === 'True').map(r => r?.['Column'].toLowerCase())
            let doNotFormat: string[] = dynamicColumns.filter(r => r?.['EscapeGridFormat'] === 'True').map(r => r?.['Column'].toLowerCase());

            if(contractData.length > 0)
              this.columnDefs = createColumnDefs(contractData[0].columnValues, [...GENERAL_FORMATTING_EXCEPTIONS, ...doNotFormat,'AssetType','Position Id','DateTo','StartDateInRange','EndDateInRange'],[],true)
        
            this.DATE_COLUMNS = dynamicColumns.filter(r => (r?.['DataType'] === 'Date' && r?.['Column']!=='StartDateInRange' && r?.['Column']!=='EndDateInRange')).map(r => r?.['Column']);

            this.AMOUNT_COLUMNS = dynamicColumns.filter(r => r?.['DataType'] === 'Number' && !['BaseRate','AllInRate','Position Id'].includes(r?.['Column'])).map(r => r?.['Column']);

            this.columnDefs.forEach(col=>{
              if(col.type==='abColDefNumber'){
                this.AMOUNT_COLUMNS.push(col.field)
              }
            })
            


            this.columnDefs.forEach(col=>{
              if( this.DATE_COLUMNS.includes(col.field)){
                col.type = 'abColDefDate'
              }else if(this.AMOUNT_COLUMNS.includes(col.field)){
                col.type = 'abColDefNumber'
              }
            })

            this.adaptableApi.formatColumnApi.addFormatColumns([
              BLANK_DATETIME_FORMATTER_CONFIG(this.DATE_COLUMNS),
              DATE_FORMATTER_CONFIG_ddMMyyyy(this.DATE_COLUMNS),
              CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,['amountFormatter'])
            ])
            this.rowData = parseFetchedData(contractData)
            
            this.gridApi?.setColumnDefs(this.columnDefs);
            this.gridColumnApi?.autoSizeAllColumns(true);

            this.gridApi?.hideOverlay();

            let selectedColDef: ColDef[] = [];
            this.preSelectedColumns.forEach(colName => {
              let colDefs: ColDef[] = this.columnDefs.filter(def => def.field.toLowerCase() === colName)
              if(colDefs.length > 1){
                console.warn(`Duplicate columnDefs for field: ${colName}`)
              }
              if(colDefs.length > 0)
                selectedColDef.push(colDefs[0])
            })
            saveAndSetLayout(selectedColDef, this.adaptableApi);
            this.gridApi?.setRowData(this.rowData)
          },
          error: error => {
            console.error(error)
            this.gridApi?.hideOverlay();
          }
        }))
      }
    }))

  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.refreshGrid();
    params.api.closeToolPanel()
  }
  
  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.columnApi.autosizeAllColumns()

  }
}
