import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { amountFormatter, dateFormatter, dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { EditorFormComponent } from './editor-form/editor-form.component';

@Component({
  selector: 'app-unfunded-assets',
  templateUrl: './unfunded-assets.component.html',
  styleUrls: ['./unfunded-assets.component.scss']
})
export class UnfundedAssetsComponent implements OnInit {

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
    private dataSvc: DataService
  ) { }

  ngOnInit(): void {
    
    this.fetchAssetFundingDetails();

    this.columnDefs = [
      { field: 'rowID', type: 'abColDefNumber' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'issuerShortName', type: 'abColDefString' },
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

      toolPanelOptions: {
        toolPanelOrder: ['columns', 'AdaptableToolPanel']
      },

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
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
          Revision: 3,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [
              'asset',
              'issuerShortName',
              'commitmentAmount',
              'fundedAmount',
              'unfundedAmount',
              'tobefundedAmount',
              'fundingDate'
            ]

          }]
        }
      }
    }

  }

  openDialog(){
    const dialogRef = this.dialog.open(EditorFormComponent, {
      maxHeight: '90vh',
      width: '80vw',
      data: {
        assetRef: this.assetFundingDetails,
        adaptableApi: this.adaptableApi 
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
        console.log(this.assetFundingDetails)
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

        console.log(this.rowData)

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
