import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { UnfundedAssetsEditorComponent } from './unfunded-assets-editor/unfunded-assets-editor.component';

@Component({
  selector: 'app-unfunded-assets',
  templateUrl: './unfunded-assets.component.html',
  styleUrls: ['./unfunded-assets.component.scss']
})
export class UnfundedAssetsComponent implements OnInit {

  isWriteAccess: boolean
  subscriptions: Subscription[] = []
  assetFundingDetails: any[]
  rowData: any[]

  columnDefs: ColDef[]
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  adaptableApi: AdaptableApi;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

  constructor(
    public dialog: MatDialog,
    private unfundedAssetsSvc: UnfundedAssetsService,
    private dataSvc: DataService,
    private accessSvc: AccessService
  ) { }

  ngOnInit(): void {

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs?.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Unfunded Assets' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true
        break;
      }        
    }

    this.fetchAssetFundingDetails();

    this.columnDefs = [
      { field: 'rowID', type: 'abColDefNumber' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'assetID', type: 'abColDefNumber' },
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'ccy', type: 'abColDefString'},
      { field: 'commitmentAmount', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
      { field: 'fundedAmount', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
      { field: 'unfundedAmount', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
      { field: 'tobefundedAmount', headerName: 'To be funded', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
      { field: 'fundingDate', type: 'abColDefDate', cellClass: 'dateUK' },
      { field: 'createdBy', type: 'abColDefString' },
      { field: 'createdOn', type: 'abColDefDate',  cellClass: 'dateUK' },
      { field: 'modifiedBy', type: 'abColDefString' },
      { field: 'modifiedOn', type: 'abColDefDate',  cellClass: 'dateUK' }
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      sideBar: true,
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      rowGroupPanelShow: 'always',
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true  
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      filterOptions: CommonConfig.ADAPTABLE_FILTER_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'rowID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Unfunded Asset ID',
      adaptableStateKey: 'Unfunded Asset Key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      // toolPanelOptions: {
      //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
      // },

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },

      actionOptions: {
        actionColumns: [
          {            
            columnId: 'actionEdit',
            friendlyName: "Edit",
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
              ) => {

                let rowData = context.rowNode.data
                this.openDialog(rowData);
              },
              icon: {
                src: '../assets/img/edit.svg',
                style: {
                  height: 25, width: 25
                }
              }
            }
          }
        ]
      },

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[
            'commitmentAmount',
            'fundedAmount',
            'unfundedAmount',
            'tobefundedAmount'
          ])
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
          Revision: 6,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [
              'issuerShortName',            
              'asset',
              'assetID',
              'ccy',
              'commitmentAmount',
              'fundedAmount',
              'unfundedAmount',
              'tobefundedAmount',
              'fundingDate',
              'actionEdit'
            ],
            PinnedColumnsMap: {
              actionEdit: "right"
            },
            ColumnWidthMap: {
              actionEdit: 20
            }

          }]
        },
        FormatColumn:{
          Revision:5,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['fundingDate','createdOn','modifiedOn']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['fundingDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['createdOn','modifiedOn']),
            CUSTOM_FORMATTER([
              'commitmentAmount',
              'fundedAmount',
              'unfundedAmount',
              'tobefundedAmount'
            ],['amountFormatter'])

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

  openDialog(rowData = null){

    // Check isWrite Access

    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No access', 'Dismiss', 'ark-theme-snackbar-warning')
      return;
    }

    const dialogRef = this.dialog.open(UnfundedAssetsEditorComponent, {
      maxHeight: '90vh',
      width: '60vw',
      maxWidth: '1200px',
      minWidth: '400px',
      data: {
        assetRef: this.assetFundingDetails,
        adaptableApi: this.adaptableApi,
        rowData: rowData,
        action: (rowData === null) ? 'ADD' : 'EDIT' 
      }
    })
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.columnApi.autosizeAllColumns()
  };

  onGridReady(params: GridReadyEvent){

    this.fetchUnfundedAssets();
  }

  fetchAssetFundingDetails(){

    this.subscriptions.push(this.unfundedAssetsSvc.getAssetFundingDetails().subscribe({
      next: (resp) => {
        this.assetFundingDetails = resp;
      },
      error: (error) => {
        console.error(`Failed to fetch the funding details: ${error}`)
      }
    }))
  }

  fetchUnfundedAssets(){
    
    this.gridOptions.api?.showLoadingOverlay();
    this.subscriptions.push(this.unfundedAssetsSvc.getUnfundedAssets().subscribe({
      next: (resp: any[]) => {

        if(resp.length === 0){
          this.rowData = null;
        }
        else this.rowData = resp
        this.gridOptions.api?.hideOverlay();

        this.gridOptions.api.setRowData(this.rowData)
      },
      error: (error) => {
        this.rowData = []
        this.gridOptions.api?.showNoRowsOverlay();

        console.error(`Failed to get unfunded assets grid: ${error}`);
      }
    }))
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }
}