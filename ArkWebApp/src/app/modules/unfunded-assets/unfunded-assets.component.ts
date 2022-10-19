import { ActionColumnButtonContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { amountFormatter, dateFormatter, dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
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

  agGridModules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    ClipboardModule,
    SideBarModule,
    RangeSelectionModule
  ];
  adaptableApi: AdaptableApi;

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
      { field: 'commitmentAmount', type: 'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
      { field: 'fundedAmount', type: 'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
      { field: 'unfundedAmount', type: 'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
      { field: 'tobefundedAmount', headerName: 'To be funded', type: 'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
      { field: 'fundingDate', type: 'abColDefDate', valueFormatter: dateFormatter },
      { field: 'createdBy', type: 'abColDefString' },
      { field: 'createdOn', type: 'abColDefDate', valueFormatter: dateTimeFormatter },
      { field: 'modifiedBy', type: 'abColDefString' },
      { field: 'modifiedOn', type: 'abColDefDate', valueFormatter: dateTimeFormatter }
    ]

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      sideBar: true,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      rowGroupPanelShow: 'always',
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true  
      },
      onGridReady: this.onGridReady.bind(this)
    }

    this.adaptableOptions = {
      primaryKey: 'rowID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Unfunded Asset ID',
      adaptableStateKey: 'Unfunded Asset Key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      toolPanelOptions: {
        toolPanelOrder: ['columns', 'AdaptableToolPanel']
      },

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
      },

      userInterfaceOptions: {
        actionColumns: [
          {            
            columnId: 'actionEdit',
            friendlyName: "actionEdit",
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
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

      predefinedConfig: {
        Dashboard: {
          Revision: 1,
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
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

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

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
}
