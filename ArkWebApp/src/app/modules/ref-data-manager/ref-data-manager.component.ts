import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableReadyInfo, DashboardState, LayoutState, UserInterfaceOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module, RowNode } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { createColumnDefs, GENERAL_FORMATTING_EXCEPTIONS, parseFetchedData, saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { BLANK_DATETIME_FORMATTER_CONFIG,  DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';


@Component({
  selector: 'app-ref-data-manager',
  templateUrl: './ref-data-manager.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./ref-data-manager.component.scss']
})
export class RefDataManagerComponent implements OnInit {

  subscriptions: Subscription[] = []

  isWriteAccess: boolean = false;
  columnDefs: ColDef[] =[]
  userInterfaceOptions: UserInterfaceOptions ={}
  gridApi: GridApi
  adaptableApi: AdaptableApi
  rowData: Observable<any>
  filterValue: string

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  preSelectedColumns: any[] = [];
  rowRefData = []

  DATE_COLUMNS = []
  DATETIME_COLUMNS = []
  AMOUNT_COLUMNS = []


  gridOptions:GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
    enableRangeSelection: true,
    columnDefs: this.columnDefs,
    sideBar: true,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      enableValue: true,
      enableRowGroup: true  
    },
  }

  layout: LayoutState = {

  }

  dashBoard: DashboardState = {
    Revision: 1,
    ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
    IsCollapsed: true,
    Tabs: [{
      Name: 'Layout',
      Toolbars: ['Layout']
    }],
    IsHidden: false,
    DashboardTitle: ' '
  };

  primaryKey: string = 'AttributeId';

  adaptableOptions:AdaptableOptions =  {
    ...CommonConfig.ADAPTABLE_OPTIONS,
    primaryKey: this.primaryKey,    
    autogeneratePrimaryKey: true,
    userName: this.dataSvc.getCurrentUserName(),
    adaptableId: 'Ref Data ID',
    adaptableStateKey: 'RefData State Key',
    teamSharingOptions: {
      enableTeamSharing: true,
      persistSharedEntities: presistSharedEntities.bind(this), 
      loadSharedEntities: loadSharedEntities.bind(this)
    },
    actionColumnOptions: {
      actionColumns: [
        {
          columnId: 'ActionDelete',
          friendlyName: 'Delete',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {
                let rowData = context.rowNode.data;
            },
            icon: {
              src: '../assets/img/trash.svg',
              style: {height: 25, width: 25}
            }
          }
        }
      ]
    },

    predefinedConfig: {
      Dashboard: this.dashBoard,
      StatusBar: {
        Revision: 1,
          StatusBars: [
            {
               Key: 'Center Panel',
               StatusBarPanels: ['ColumnFilter']
            },
            {
               Key: 'Right Panel',
               StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
                  },
                ],
              }
            }
  }
  deleteRefDataID: any;

  constructor(
    private dataSvc: DataService,
    public dialog: MatDialog,
  ) { }


  ngOnInit(): void { }

  ngOnDestroy(): void{
    this.subscriptions.forEach(sub=>sub.unsubscribe());
  }

  refreshGrid(){
    let filterValue : string = 'Attributes Fixing'
    let filterType: string = 'Attributes Fixing'
          
      if(this.filterValue === 'undefined'){
        this.gridApi.setGridOption("columnDefs", []);
        this.gridApi.setGridOption("rowData", [])
      }

      this.gridApi?.showLoadingOverlay()
      if(filterType!=null){
            let refData = [
              {
                columnValues: [
                  { column: 'AttributeId', value: '2' },
                  { column: 'AttributeName', value: 'NAV' },
                  { column: 'AttributeLevel', value: 'Fund Hedging' },
                  { column: 'AttributeType', value: 'Decimal' },
                  { column: 'CreatedBy', value: 'ARCMONT\\nbharambe' },
                  { column: 'CreatedOn', value: '10/17/2022 10:23:17 AM' },
                  { column: 'ModifiedBy', value: 'ARCMONT\\nbharambe' },
                  { column: 'ModifiedOn', value: '10/17/2022 10:23:17 AM' }
                ]
              },
              {
                columnValues: [
                  { column: 'AttributeId', value: '3' },
                  { column: 'AttributeName', value: 'Management Fee' },
                  { column: 'AttributeLevel', value: 'Fund Hedging' },
                  { column: 'AttributeType', value: 'Decimal' },
                  { column: 'CreatedBy', value: 'ArkWebPortal' },
                  { column: 'CreatedOn', value: '10/18/2022 11:48:16 AM' },
                  { column: 'ModifiedBy', value: 'ArkWebPortal' },
                  { column: 'ModifiedOn', value: '10/18/2022 11:48:16 AM' }
                ]
              }
            ];
            
            let configData = [
              {
                columnValues: [
                  { column: 'Column', value: 'AttributeName' },
                  { column: 'EscapeGridFormat', value: 'True' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'String' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'AttributeLevel' },
                  { column: 'EscapeGridFormat', value: 'True' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'String' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'AttributeType' },
                  { column: 'EscapeGridFormat', value: 'True' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'String' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'CreatedBy' },
                  { column: 'EscapeGridFormat', value: 'True' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'String' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'CreatedOn' },
                  { column: 'EscapeGridFormat', value: 'False' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'Date' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'ModifiedBy' },
                  { column: 'EscapeGridFormat', value: 'True' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'String' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'ModifiedOn' },
                  { column: 'EscapeGridFormat', value: 'False' },
                  { column: 'IsDefault', value: 'True' },
                  { column: 'DataType', value: 'Date' }
                ]
              },
              {
                columnValues: [
                  { column: 'Column', value: 'AttributeId' },
                  { column: 'EscapeGridFormat', value: 'True' },
                  { column: 'IsDefault', value: 'False' },
                  { column: 'DataType', value: 'Number' }
                ]
              }
            ];
          
            let dynamicColumns = parseFetchedData(configData)
  
            this.preSelectedColumns = dynamicColumns.filter(r=>r?.['IsDefault']==='True').map(r=>r?.['Column'].toLowerCase())
            let doNotFormat :string[] = dynamicColumns.filter(r=>r?.['EscapeGridFormat']==='True').map(r=>r?.['Column'].toLowerCase());
  
            this.DATETIME_COLUMNS = dynamicColumns.filter(r => (r?.['DataType'] === 'Date' && r?.['Column']==='CreatedOn' || r?.['Column']==='ModifiedOn')).map(r => r?.['Column']);
  
            this.columnDefs = createColumnDefs(
              refData[0].columnValues,
              [
                ...GENERAL_FORMATTING_EXCEPTIONS,
                ...doNotFormat,
              ],
              ['createdOn','modifiedOn']
            )
  
  
            this.rowRefData = parseFetchedData(refData)
            this.gridApi.setGridOption("columnDefs", this.columnDefs);
    
            this.gridApi?.hideOverlay();
  
            let selectedColDef: ColDef[] = [];
            this.preSelectedColumns.forEach(colName => {
              let colDefs:ColDef[] = this.columnDefs.filter(def =>{
                return def.field.toLowerCase() === colName
              })
              if(colDefs.length > 1){
                console.warn(`Duplicate columnDefs for field: ${colName}`)
              }
              if(colDefs.length > 0)
                selectedColDef.push(colDefs[0])
            })
  
  
            saveAndSetLayout([
              { field: 'AttributeName', tooltipField: 'AttributeName'},
              { field: 'AttributeLevel', tooltipField: 'AttributeLevel'},
              { field: 'AttributeType', tooltipField: 'AttributeType'},
              { field: 'CreatedOn', tooltipField: 'CreatedOn'},
              { field: 'CreatedBy', tooltipField: 'CreatedBy'},
              { field: 'ActionDelete', tooltipField: 'ActionDelete'}
             ], 
            this.adaptableApi,'Basic Layout',null,{ActionDelete: 'right'},{ActionDelete: 18});
            this.gridApi?.setGridOption("rowData", this.rowRefData)            
            this.adaptableApi.formatColumnApi.deleteAllFormatColumns()
            this.adaptableApi.formatColumnApi.addFormatColumns([
                BLANK_DATETIME_FORMATTER_CONFIG([...this.DATETIME_COLUMNS]),
                DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm([...this.DATETIME_COLUMNS]),

            ])
            this.gridApi?.hideOverlay();
            if(true){
              this.adaptableOptions.primaryKey = 'AttributeId'
              this.adaptableOptions.autogeneratePrimaryKey = false              
            }

      }
  }

  onAdaptableReady = (params: AdaptableReadyInfo) => {
    this.adaptableApi = params.adaptableApi;
    this.gridApi = params.agGridApi;
    this.refreshGrid()
    this.gridApi.closeToolPanel()
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }
}
