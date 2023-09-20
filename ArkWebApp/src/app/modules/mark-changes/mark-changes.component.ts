import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { MarkChangesService } from 'src/app/core/services/MarkChanges/MarkChanges.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-mark-changes',
  templateUrl: './mark-changes.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./mark-changes.component.scss']
})
export class MarkChangesComponent implements OnInit {

  gridOptions:GridOptions
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  rowData:any = []
  adaptableOptions:AdaptableOptions
  adaptableApi:AdaptableApi
  columnDefs:ColDef[]
  gridApi:GridApi
  noRowsToDisplayMsg = 'Please select the filter.'
  subscriptions:Subscription[] = []
  sDate:AsOfDateRange

  NON_AMOUNT_NUMBER_2DEC_COLUMNS = [
    "openingMark",
    "closingMark",
    "change"
  ]


  constructor(
    public dataSvc:DataService,
    public markChangesSvc:MarkChangesService,
    private filterSvc: GeneralFilterService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id === 341){
          this.sDate = data.value
          if(this.sDate.end === 'Invalid date')
            this.sDate.end = this.sDate.start;
          this.markChangesSvc.changeSearchDateRange(this.sDate)
        }
      }
    }))

    this.sDate = null
    this.columnDefs=[
      {field: "positionId",type:"abColDefNumber",cellClass: 'ag-right-aligned-cell'},
      {field: "issuerShortName",type:"abColDefString"},
      {field: "issuer",type:"abColDefString"},
      {field: "assetId",type:"abColDefNumber",cellClass: 'ag-right-aligned-cell'},
      {field: "assetTypeName",type:"abColDefString"},
      {field: "methodology",type:"abColDefString"},
      {field: "asset",type:"abColDefString"},
      {field: "fundHedging",type:"abColDefString"},
      {field: "openingMark",type:"abColDefNumber",cellClass: 'ag-right-aligned-cell'},
      {field: "closingMark",type:"abColDefNumber",cellClass: 'ag-right-aligned-cell'},
      {field: "change",type:"abColDefNumber",cellClass: 'ag-right-aligned-cell'}
      
    ]


    this.gridOptions={
      ...CommonConfig.GRID_OPTIONS,
      defaultColDef:{
        resizable: true,
        sortable: true,
        enablePivot: true,
        enableRowGroup:true,
        filter: true,
        enableValue:true
      },
      enableRangeSelection: true,
      rowGroupPanelShow: "always",
      sideBar: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;   
      },
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'MarkChanges',
      adaptableStateKey: 'MarkChanges Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nonAmountNumberFormatter2Dec',this.NON_AMOUNT_NUMBER_2DEC_COLUMNS)
        ]
      },

      predefinedConfig: {
        Dashboard: {
          Revision:7,
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
          CurrentLayout: 'Basic Mark Changes Layout',
          Revision: 3,
          Layouts: [{
            Name: 'Basic Mark Changes Layout',
            Columns: [ ...this.columnDefs.map(c => c.field)]
          }]
          
        },
        FormatColumn:{
          Revision :3,
          FormatColumns:[
            CUSTOM_FORMATTER(this.NON_AMOUNT_NUMBER_2DEC_COLUMNS,'nonAmountNumberFormatter2Dec'),

          ]
        },
        StatusBar: {
          Revision:1,
          StatusBars: [
            {
              Key: 'Right Panel',
              StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
            },
          ],
        }
        }

    }
  }

  getMarkChanges(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        if(this.sDate !== null){
          this.gridApi.showLoadingOverlay();
          this.subscriptions.push(this.markChangesSvc.getMarkChanges(this.sDate).subscribe({
            next: data => {
              if(data.length === 0){
                this.noRowsToDisplayMsg = 'No data found for applied filter.'
              }
              this.rowData = data
              this.gridApi.showNoRowsOverlay()
            },
            error: error => {
              console.error("Error in fetching Mark Changes Data" + error);
              this.noRowsToDisplayMsg = 'No data found for applied filter.'
              this.gridApi.showNoRowsOverlay()

            }
        }));  
      }
      else
        console.warn("Component loaded without setting date in filter pane");
      }
    }))

    this.subscriptions.push(this.markChangesSvc.currentSearchDateRange.subscribe(sDate => {
      this.sDate = sDate;
    }))
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getMarkChanges()
    this.adaptableApi.columnApi.autosizeAllColumns();
  }

  ngOnDestroy():void{
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe()
    })

  }

}
