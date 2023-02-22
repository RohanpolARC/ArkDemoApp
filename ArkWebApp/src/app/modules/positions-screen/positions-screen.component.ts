import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import {   BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import {  AMOUNT_COLUMNS_LIST, DATE_COLUMNS_LIST, GRID_OPTIONS, POSITIONS_COLUMN_DEF } from './grid-structure';

@Component({
  selector: 'app-positions-screen',
  templateUrl: './positions-screen.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./positions-screen.component.scss']
})
export class PositionsScreenComponent implements OnInit {


  columnDefs: ColDef[]
  subscriptions = []
  gridApi: GridApi
  adaptableApi: AdaptableApi
  gridOptions: GridOptions
  rowData = []
  adaptableOptions: AdaptableOptions;
  asOfDate
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  noRowsDisplayMsg:string = 'Please apply the filter.'


  constructor(
    public dataSvc:DataService,
    public positionScreenSvc: PositionScreenService
  ) { }

  getPositionsData(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){

        this.gridApi.showLoadingOverlay();

        this.subscriptions.push(this.positionScreenSvc.currentSearchDate.subscribe(asOfDate => {
          this.asOfDate = asOfDate
        }))
    
        this.subscriptions.push(this.positionScreenSvc.getPositions(this.asOfDate).subscribe({
          next: (data) => {
            if(data.length === 0){
              this.noRowsDisplayMsg = 'No data found for applied filter.'
            }
            this.gridApi?.hideOverlay();
            this.rowData = data;

          },
          error: (e) => {
            console.error(`Failed to get the Positions: ${e}`)
          }
        }))
    
      }
    }))
  }


  ngOnInit(): void {

    this.columnDefs=[
      ...POSITIONS_COLUMN_DEF
    ]

    this.gridOptions = {
      ...GRID_OPTIONS,
      
      context: {
        componentParent: this
      },
      columnDefs: this.columnDefs,
      rowData: this.rowData,

      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;   
      },
      noRowsOverlayComponent:NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsDisplayMsg,
      }

    }
    

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Positions',
      adaptableStateKey: 'Positions Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      userInterfaceOptions:{
        customDisplayFormatters: [
          //CUSTOM_AMOUNT_FORMATTER('amountFormatter',[...AMOUNT_COLUMNS_LIST])
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...AMOUNT_COLUMNS_LIST])
          ],
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
        Layout:{
          CurrentLayout: 'Basic Positions Layout',
          Revision: 9,
          Layouts: [{
            Name: 'Basic Positions Layout',
            Columns: this.columnDefs.map(def => def.field)
          }]
          
        },
        FormatColumn :{
          Revision:17,
          FormatColumns: [
          BLANK_DATETIME_FORMATTER_CONFIG([...DATE_COLUMNS_LIST]),
          DATE_FORMATTER_CONFIG_ddMMyyyy([...DATE_COLUMNS_LIST]),
          //AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(AMOUNT_COLUMNS_LIST,2,['amountFormatter']),
          CUSTOM_FORMATTER(AMOUNT_COLUMNS_LIST,['amountFormatter'])
          //AMOUNT_FORMATTER_CONFIG_Zero(AMOUNT_COLUMNS_LIST,2,['amountZeroFormat'])
        ]
      }}

    }

  }

  
  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getPositionsData();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>sub.unsubscribe());
  }



}
