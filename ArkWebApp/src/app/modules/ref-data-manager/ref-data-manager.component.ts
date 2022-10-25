import { ActionColumn, ActionColumnButtonContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableToolPanelAgGridComponent, DashboardState, LayoutState, UserInterfaceOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, Module, RowNode } from '@ag-grid-community/all-modules';
import { SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { RefDataManagerService } from 'src/app/core/services/RefDataManager/ref-data-manager.service';
import { ConfirmationPopupComponent } from 'src/app/shared/components/confirmation-popup/confirmation-popup.component';
import { createColumnDefs, GENERAL_FORMATTING_EXCEPTIONS, parseFetchedData, saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { dateTimeFormatter,dateFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { RefDataProc } from 'src/app/shared/models/GeneralModel';
import { AddRefDataFormComponent } from './add-ref-data-form/add-ref-data-form.component';


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

  agGridModules: Module[] = [
    ClientSideRowModelModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    ClipboardModule,
    SideBarModule,
    RangeSelectionModule
  ];
  preSelectedColumns: any[] = [];
  rowRefData = []



  gridOptions:GridOptions = {
    enableRangeSelection: true,
    columnDefs: this.columnDefs,
    sideBar: true,
    onGridReady: this.onGridReady.bind(this),
    components: {
      AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      enableValue: true,
      enableRowGroup: true  
    }
  }

  layout: LayoutState = {

  }

  dashBoard: DashboardState = {
    ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
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
    primaryKey: this.primaryKey,
    userName: this.dataSvc.getCurrentUserName(),
    //autogeneratePrimaryKey:true,
    adaptableId: 'Ref Data ID',
    adaptableStateKey: 'RefData State Key',
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
          columnId: 'ActionDelete',
          friendlyName: 'Delete',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnButtonContext>,
              context: ActionColumnButtonContext
            ) => {


                let rowData = context.rowNode.data;

                // To open dialog after successfull fetch
                this.openDialog('DELETE', rowData); 
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
      Dashboard: this.dashBoard
    }

  }
  gridColumnApi: any;
  deleteRefDataID: any;


  constructor(
    private refDataManagerSvc: RefDataManagerService,
    private accessSvc: AccessService,
    private dataSvc: DataService,
    public dialog: MatDialog
  ) { }

  changeListeners(){
    this.subscriptions.push(this.refDataManagerSvc.currentFilterValues.subscribe(value=>{
      if(value[0] === undefined){
        this.filterValue = 'undefined'
        this.dataSvc.setWarningMsg('Select Proper Filter', 'Dismiss', 'ark-theme-snackbar-warning')
      }else{
        this.filterValue = value
      }
    }))
  }

  ngOnInit(): void {

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs?.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Ref Data Manager' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    this.changeListeners();
  }

  ngOnDestroy(): void{
    this.gridApi.destroy();
    this.subscriptions.forEach(sub=>sub.unsubscribe());
  }

  refreshGrid(){
    this.subscriptions.push(this.refDataManagerSvc.currentFilterValues.subscribe(filterType => {
      
      if(this.filterValue === 'undefined'){
        this.gridApi.setColumnDefs([])
        this.gridApi?.setRowData([])

      }

      this.gridApi?.showLoadingOverlay()

      this.subscriptions.push(
        forkJoin(
          [
            this.dataSvc.getGridDynamicColumns(filterType[0]),
            this.refDataManagerSvc.getRefData(filterType[0])
          ])
          .subscribe({
          next: data=>{
          let refData = data[1]
          let dynamicColumns = parseFetchedData(data[0])

          this.preSelectedColumns = dynamicColumns.filter(r=>r?.['IsDefault']==='True').map(r=>r?.['Column'].toLowerCase())
          let doNotFormat :string[] = dynamicColumns.filter(r=>r?.['EscapeGridFormat']==='True').map(r=>r?.['Column'].toLowerCase());

          this.columnDefs = createColumnDefs(
            refData[0].columnValues,
            [
              ...GENERAL_FORMATTING_EXCEPTIONS,
              ...doNotFormat
            ]
          )
          this.rowRefData = parseFetchedData(refData)
          this.gridApi?.setColumnDefs(this.columnDefs);

          //this.gridColumnApi?.autoSizeAllColumns(true);

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


          //saveAndSetLayout(selectedColDef,this.adaptableApi);
          if(filterType[0] === 'Attribute Fixing' )
            this.adaptableOptions.primaryKey = 'AttributeId'
          this.layout = {
            Revision:1,
            CurrentLayout: 'Default Layout',
            Layouts: [{
              Name: 'Default Layout',
              Columns: [ 
                'AttributeName',
                'AttributeLevel',
                'AttributeType',
                'CreatedOn',
                'CreatedBy',
                'ModifiedOn',
                'ModifiedBy','ActionDelete'],
              PinnedColumnsMap: { 
                ActionDelete:'right' 
              },
              ColumnWidthMap: {
                ActionDelete: 18
              }
            }]
          }
          this.adaptableApi.configApi.reloadPredefinedConfig({
            Dashboard: this.dashBoard,
            Layout: this.layout
          })
          this.gridApi?.setRowData(this.rowRefData)
          console.log(this.adaptableOptions,this.adaptableApi.layoutApi.getCurrentLayout(),this.adaptableApi.userInterfaceApi.getAllActionColumn())
        },
        error:error=>{
          console.log(error)
          this.gridApi?.hideOverlay();
        }
      }))
    }))

  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi
    this.refreshGrid()
    params.api.closeToolPanel()
  }

  onAdaptableReady({
    adaptableApi,
    vendorGrid
  }: {
    adaptableApi: AdaptableApi;
    vendorGrid: GridOptions;
  }){
    this.adaptableApi = adaptableApi
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

  openDialog(action: 'ADD' | 'EDIT' | 'DELETE' = 'ADD',rowData:any=[]) { 
    
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    if(action ==='DELETE'){
      this.deleteRefDataID = rowData.AttributeId
      let confirmTextString = 'Are you sure you want to delete this attribute ?'
      const dialogRef = this.dialog.open(ConfirmationPopupComponent, { 
        data:{confirmText:confirmTextString},
        maxHeight: '95vh'
      })
      this.subscriptions.push(dialogRef.afterClosed().subscribe((value)=>{
        if(value.action==='Confirm'){
          this.deleteRefData(this.deleteRefDataID)
        }
      }))
    }else{
      const dialogRef = this.dialog.open(AddRefDataFormComponent, {
        data: { 
          action: action,
          refData:rowData,
          adaptableApi: this.adaptableApi,
          filterValue: 'Attribute Fixing'//this.filterValue[0]
        },
        maxHeight: '95vh'
      })
      this.subscriptions.push(dialogRef.afterClosed().subscribe())
  
    }
    

    
  }
  deleteRefData(deleteRefDataID: any) {
    let refDataProcParams:RefDataProc = {
      filterValue : this.filterValue[0],
      param1 :String(deleteRefDataID),
      param2 :'',
      param3 : '',
      param4 : '',
      param5 : ''
    }
    this.subscriptions.push(this.refDataManagerSvc.deleteRefData(refDataProcParams).subscribe((result:any)=>{
      if(result.isSuccess===true){
        const rowNode:RowNode = this.adaptableApi.gridApi.getRowNodeForPrimaryKey(deleteRefDataID)
        this.adaptableApi.gridApi.deleteGridData([rowNode.data])
        this.dataSvc.setWarningMsg('The Attribute deleted successfully','Dismiss','ark-theme-snackbar-success')
      }else{
        this.dataSvc.setWarningMsg('The Attribute could not be deleted','Dismiss','ark-theme-snackbar-error')
      }
    }))
  }

}
