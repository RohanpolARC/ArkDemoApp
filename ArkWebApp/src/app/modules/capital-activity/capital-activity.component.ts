import { Component, OnInit, ViewChild } from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { AddCapitalModalComponent } from './add-capital-modal/add-capital-modal.component';

import {
  GridOptions,
  Module,
  ColDef
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
  ActionColumnButtonContext,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';

import { Subscription } from 'rxjs';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { dateFormatter, dateTimeFormatter, amountFormatter, nullOrZeroFormatter } from 'src/app/shared/functions/formatter';

import { getNodes, validateLinkSelect }from './utilities/functions';
import { UpdateConfirmComponent } from './update-confirm/update-confirm.component';

import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-capital-activity',
  templateUrl: './capital-activity.component.html',
  styleUrls: ['./capital-activity.component.scss']
})
export class CapitalActivityComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  subscriptions: Subscription[] = [];
  rowData: CapitalActivityModel[];
  rowDataInvstmnt: CapitalInvestment[];
  rowGroupPanelShow:string = 'always';

  agGridModules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule
  ];

  columnDefsInvstmnt: ColDef[] = [
    {field: 'positionID', headerName: 'Position ID'},
    {field: 'cashDate', headerName: 'Cash Date', valueFormatter: dateFormatter},
    {field: 'fund', headerName: 'Fund'},
    {field: 'fundHedging', headerName: 'Fund Hedging'},
    {field: 'portfolio', headerName: 'Portfolio'},
    {field: 'issuerShortName', headerName: 'Issuer'},
    {field: 'issuerID', headerName: 'Issuer ID'},
    {field: 'asset', headerName: 'Asset'},
    {field: 'assetID', headerName: 'AssetID'},
    {field: 'fundCcy', headerName: 'Fund Ccy'},
    {field: 'positionCcy', headerName: 'Position Ccy'},
    {field: 'amount', headerName: 'Amount', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'totalBase', headerName: 'Total Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'totalEur', headerName: 'Total Eur', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
  ]

  columnDefs: ColDef[] = [
    {field: 'capitalID', headerName: 'Capital ID', type: 'abColDefNumber'},
    { field: 'callDate', headerName: 'Call Date', type: 'abColDefDate', valueFormatter: dateFormatter },
    { field: 'valueDate', headerName: 'Value Date', type: 'abColDefDate', valueFormatter: dateFormatter},
    { field: 'capitalType', headerName: 'Capital Type', type:'abColDefString'},
    { field: 'capitalSubType', headerName: 'Capital Subtype', type:'abColDefString'},
    { field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
    { field: 'fundCcy', headerName: 'Fund Ccy', type:'abColDefString'},
    { field: 'posCcy', headerName: 'Position Ccy', type: 'abColDefString'},
    { field: 'fxRate', headerName: 'FXRate', valueFormatter: nullOrZeroFormatter},
    { field: 'totalAmount', headerName: 'Total Amount', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'wsoIssuerID', headerName: 'WSO Issuer ID', valueFormatter: nullOrZeroFormatter},
    { field: 'issuerShortName', headerName: 'Issuer Short Name', type:'abColDefString'},
    {field: 'wsoAssetID', headerName: 'WSO Asset ID', valueFormatter: nullOrZeroFormatter},
    { field: 'asset', headerName: 'Asset', type:'abColDefString'},
    { field: 'narrative', headerName: 'Narrative', type:'abColDefString'},
    { field: 'source', headerName: 'Source', type:'abColDefString'},
    { field: 'sourceID', headerName: 'Source ID', type:'abColDefNumber', valueFormatter: nullOrZeroFormatter},
    { field: 'isLinked', headerName: 'Is Linked', type:'abColDefBoolean'},
    { field: 'createdOn', headerName: 'Created On', type:'abColDefDate', valueFormatter: dateTimeFormatter},
    { field: 'createdBy', headerName: 'Created By', type:'abColDefString'},
    { field: 'modifiedOn', headerName: 'Modified On', type:'abColDefDate', valueFormatter: dateTimeFormatter},
    { field: 'modifiedBy', headerName: 'Modified By', type:'abColDefString'},

  ]

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  };
  gridOptions: GridOptions;
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions;

  gridOptionsInvstmnt: GridOptions;
  adapTableApiInvstmnt: AdaptableApi;
  adaptableOptionsInvstmnt: AdaptableOptions;

  constructor(public dialog:MatDialog, 
    private capitalActivityService: CapitalActivityService,
    private dataService: DataService) { 
  }


  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[] = [];

  refData = [];

  invstmntPanelOpenState = false;
  investorPanelOpenState = false;

  fetchInvestmentData(): void{

    this.subscriptions.push(this.capitalActivityService.getCapitalInvestment().subscribe({
      next: data => {
        this.rowDataInvstmnt = data;
        this.adapTableApiInvstmnt.gridApi.loadGridData(this.rowDataInvstmnt);
      },
      error: error => {
        this.rowDataInvstmnt = [];
        console.error("Capital Investment Data fetch failed");
      }
    }))
  }

  fetchCapitalActivityData(): void{
    this.subscriptions.push(this.capitalActivityService.getCapitalActivity().subscribe({
      next: data => {
        this.rowData = data;
        this.adapTableApi.gridApi.loadGridData(this.rowData);
      },
      error: error => {
        this.rowData = [];
        console.error("Capital Activity Data fetch failed");
      }
    }));
  }

  fetchCapitalRefData(): void{
    this.subscriptions.push(this.capitalActivityService.getCapitalRefData().subscribe({
      next: data => {
        data.capitalType.forEach(x => { this.capitalTypeOptions.push(x) });
        data.capitalSubType.forEach(x => { this.capitalSubTypeOptions.push(x) });

        this.refData = data.portfolio_Info;
      },
      error: error => {
        console.error("Couldn't fetch refData. Form dropdown fields not available");
      }
    }));
  }

  async getSharedEntities(adaptableId){
    return new Promise(resolve => {
      this.subscriptions.push(this.dataService.getAdaptableState(adaptableId).subscribe({
        next: state => {
          try {

            state = state.split('|').join('"')
            resolve(JSON.parse(state) ||'[]')
          } catch (e) {
            console.log("Failed to parse")
            resolve([])
          }
        }
      }));
    })
  }

  async setSharedEntities(adaptableId, sharedEntities): Promise<void>{

    return new Promise(resolve => {
      this.subscriptions.push(
        this.dataService.saveAdaptableState(adaptableId, JSON.stringify(sharedEntities).replace(/"/g,'|')).subscribe({
        next: data => {
          resolve();
        }
      }));
    })
  }

  ngOnInit(): void {
    this.gridOptions = {
      enableRangeSelection: false,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:false
    }

    this.gridOptionsInvstmnt = JSON.parse(JSON.stringify(this.gridOptions));
    this.gridOptionsInvstmnt.columnDefs = this.columnDefsInvstmnt;

    this.gridOptionsInvstmnt.components = {
      AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    },

    this.adaptableOptions = {
      primaryKey: 'capitalID',
      userName: this.dataService.getCurrentUserName(),
      adaptableId: 'Capital Activity - Investor Cashflows',
      adaptableStateKey: `Capital Activity Key`,
      
      layoutOptions: {
        autoSaveLayouts: false
      },
  
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: this.setSharedEntities.bind(this),
        getSharedEntities: this.getSharedEntities.bind(this)
  
      },
  
      toolPanelOptions: {
        toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      },
  
      userInterfaceOptions: {
        actionColumns: [
          {
            columnId: 'ActionEdit',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {
  
                let rowData =  context.rowNode?.data;
                let investments = [];
                this.capitalActivityService.getCapitalInvestment(rowData.capitalID).subscribe({
                  next: data => {
                    investments = data;
                    this.openDialog(rowData, 'EDIT', investments);
                  },
                  error: error => {
                    console.error("Couldn't fetch investments for this capitalID");
                  }
                })
              },
              icon: {
                src: '../assets/img/edit.svg',
                style: {
                  height: 25, width: 25
                }
              },
            },
          }
        ]
      },
  
      predefinedConfig: {
        Dashboard: {
          Revision: 1,
          ModuleButtons: ['TeamSharing','Export', 'Layout','ConditionalStyle'],
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 2,
          CurrentLayout: 'Basic Capital Activity',
          Layouts: [{
            Name: 'Basic Capital Activity',
            Columns: [
              'callDate',
              'valueDate',
              'capitalType',
              'capitalSubType',
              'fundHedging',
              'issuerShortName',
              'asset',
              'fundCcy',
              'posCcy',
              'totalAmount',
              'localAmount',
              'fxRate',
              // 'wsoIssuerID',
              'wsoAssetID',
              'narrative',
              'source',
              'isLinked',
              'createdBy',
              'createdOn',
              'modifiedBy',
              'modifiedOn',
              'ActionEdit',
            ],
            RowGroupedColumns: [],
            ColumnWidthMap:{
              ActionEdit: 50,
            },
            PinnedColumnsMap: {
              ActionEdit: 'right',
            },
  
          }]
        }
      }
    }

    this.adaptableOptionsInvstmnt = {
      primaryKey: '',
      autogeneratePrimaryKey: true,
      userName: this.dataService.getCurrentUserName(),
      adaptableId: 'Capital Activity - Investment Cashflows',
      adaptableStateKey: `Investment CashFlow Key`,
      
      layoutOptions: {
        autoSaveLayouts: false
      },
  
      toolPanelOptions: {
        toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      },

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: this.setSharedEntities.bind(this),
        getSharedEntities: this.getSharedEntities.bind(this)
  
      },
  
      userInterfaceOptions: {
        actionColumns: [
          {
            columnId: 'ActionLink',
            includeGroupedRows: true,
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {

                let error: string = validateLinkSelect(context);
                if(error !== null){
                  const errorDialog = this.dialog.open(UpdateConfirmComponent, {
                    data: {
                      actionType: 'ERROR-MSG',
                      errorMsg: error
                    }
                  })
                  return;
                }

                let linkData = getNodes(context.rowNode);
                this.openDialog(linkData, 'LINK-ADD');
              },
              icon: {
                src: '../assets/img/sync_alt_black_24dp.svg',
                style: {
                  height: 25, width: 25
                }
              },
            },
          }
        ]
      },

  
      predefinedConfig: {
        Dashboard: {
          Revision: 1,
          ModuleButtons: ['TeamSharing', 'Export', 'Layout','ConditionalStyle'],
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 1,
          Layouts:[{
            Name: 'Basic Investment Cashflow',
            Columns: [
              'positionID',
              'cashDate',
              'fund',
              'fundHedging',
              'portfolio',
              'issuerShortName',
              'asset',
              'fundCcy',
              'positionCcy',
              'amount',
              'totalBase',
              'totalEur',
              'ActionLink'
            ],
            ColumnWidthMap:{
              ActionLink: 50,
            },
            RowGroupedColumns: ['fundHedging', 'cashDate', 'issuerShortName', 'positionCcy'],
            PinnedColumnsMap: {
              'ActionLink': 'right'
            },
            AggregationColumns: {
              totalBase: 'sum',
              totalEur: 'sum'
            }
          }]
        }  
      }
    }

    this.fetchCapitalActivityData();
    this.fetchInvestmentData();
    this.fetchCapitalRefData();

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

  openBulkUploadDialog(): void {
    const dialogRef = this.dialog.open(BulkUploadComponent, {
      data: {
        adaptableApiInvestor: this.adapTableApi,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        refData: this.refData

      },
      width: '90vw',
      maxWidth: '90vw',
      height: '80vh',
    })
    this.subscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      // Bulk Upload Dialog Closed.
      if(result.isSuccess){
        this.fetchCapitalActivityData();
      }
    }))
  }

  openDialog(data? , actionType = 'ADD', gridData = null):void{

    const dialogRef = this.dialog.open(AddCapitalModalComponent, {
      data: {
        rowData : data,
        adapTableApi: this.adapTableApi,
        adapTableApiInvstmnt: this.adapTableApiInvstmnt,
        actionType: actionType,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        refData: this.refData,
        gridData: gridData
      },
      // minWidth: (actionType === 'LINK-ADD') ? '1500px' : '830px',
      width: '90vw',
      maxWidth: '2000px',
      // width: '95vw',
      maxHeight: '99vh'
    });
    this.subscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      /** ADD Rows to Investor Grid */
      if(result.event === 'Close with Success' && actionType !== 'EDIT'){
        this.fetchCapitalActivityData();
      }

    }));
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
    this.adapTableApi = adaptableApi;
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

/* Closes right sidebar on start */
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

  onAdaptableInvstmntReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    this.adapTableApiInvstmnt  = adaptableApi;
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

/* Closes right sidebar on start */
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }


}
