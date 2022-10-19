import { ActionColumnButtonContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/all-modules';
import { SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { RefDataManagerService } from 'src/app/core/services/RefDataManager/ref-data-manager.service';
import { createColumnDefs, parseFetchedData, saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { dateTimeFormatter,dateFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { AddRefDataFormComponent } from './add-ref-data-form/add-ref-data-form.component';


@Component({
  selector: 'app-ref-data-manager',
  templateUrl: './ref-data-manager.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./ref-data-manager.component.scss']
})
export class RefDataManagerComponent implements OnInit {

  subscriptions: Subscription[] = []

  isWriteAccess: boolean 
  columnDefs: ColDef[] =[]
  gridOptions: GridOptions
  gridApi: GridApi
  adaptableOptions : AdaptableOptions
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
  preSelectedColumns: any[];

  constructor(
    private attributeFixingSvc: AttributesFixingService,
    private refDataManagerSvc: RefDataManagerService,
    private accessSvc: AccessService,
    private dataSvc: DataService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.isWriteAccess = true;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs?.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Ref Data Manager' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }


    this.subscriptions.push(this.refDataManagerSvc.currentFilterValues.subscribe(value=>{
      console.log(value)
      this.filterValue = value
    }))


    this.columnDefs = [
      { field: 'fixingID' },
      { field: 'asOfDate',valueFormatter:dateFormatter, type: 'abColDefDate' },
      { field: 'attributeName' },
      { field: 'attributeId'},
      { field: 'attributeType'},
      { field: 'attributeLevel' },
      { field: 'attributeLevelValue'},
      { field: 'attributeValue'},
      { field: 'modifiedBy' },
      { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
      { field: 'createdBy' },
      { field: 'createdOn', valueFormatter: dateTimeFormatter },
    ]

    this.gridOptions = {
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

    this.adaptableOptions= {
      primaryKey: 'fixingID',
      adaptableId: 'Fixing Attribute ID',
      adaptableStateKey: 'Fixing Attributes Key',
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
          Revision: 12,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [ ...this.columnDefs.map(colDef => colDef.field).filter(r => !['fixingID'
            ,'attributeId'
            ,'attributeType'
            ,'createdBy'
            ,'createdOn'].includes(r)), 'ActionEdit','ActionDelete'],
            PinnedColumnsMap: { 
              ActionEdit: 'right',
              ActionDelete:'right' 
            },
            ColumnWidthMap: {
              ActionEdit: 18,
              ActionDelete: 18
            }
          }]
        }
      }

    }
  }

  refreshGrid(){
    this.subscriptions.push(this.refDataManagerSvc.currentFilterValues.subscribe(filterType => {
      console.log(filterType.length==1 && filterType[0]==='Attribute Fixing')
      if(filterType.length==1 && filterType[0]==='Attribute Fixing'){

        let newColDefs = [
          //{ field: 'fixingID' },
          //{ field: 'asOfDate',valueFormatter:dateFormatter, type: 'abColDefDate' },
          { field: 'attributeName' },
          { field: 'attributeId'},
          { field: 'attributeType'},
          { field: 'attributeLevel' },
          //{ field: 'attributeLevelValue'},
          //{ field: 'attributeValue'},
          { field: 'modifiedBy' },
          { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
          { field: 'createdBy' },
          { field: 'createdOn', valueFormatter: dateTimeFormatter },
        ]
        this.gridApi?.setColumnDefs(newColDefs);

        //this.gridApi?.showLoadingOverlay()
        // this.subscriptions.push(forkJoin(
        //   [
        //     this.attributeFixingSvc.getFixingTypes(),
        //     this.dataSvc.getGridDynamicColumns('Attribute Fixing')
        //   ]
        //   ).pipe(first()).subscribe({
        //   next: data => {
        //     let contractData = data[0]
        //     let dynamicColumns = parseFetchedData(data[1])

        //     this.preSelectedColumns = dynamicColumns.filter(r => r?.['IsDefault'] === 'True').map(r => r?.['Column'].toLowerCase())
        //     let doNotFormat: string[] = dynamicColumns.filter(r => r?.['EscapeGridFormat'] === 'True').map(r => r?.['Column'].toLowerCase());

        //     if(contractData.length > 0)
        //       this.columnDefs = createColumnDefs(contractData[0].columnValues, [...GENERAL_FORMATTING_EXCEPTIONS, ...doNotFormat])
            
        //     this.rowData = parseFetchedData(contractData)
            
        //     this.gridApi?.setColumnDefs(this.columnDefs);
        //     this.gridColumnApi?.autoSizeAllColumns(true);

        //     this.gridApi?.hideOverlay();

        //     let selectedColDef: ColDef[] = [];
        //     this.preSelectedColumns.forEach(colName => {
        //       let colDefs: ColDef[] = this.columnDefs.filter(def => def.field.toLowerCase() === colName)
        //       if(colDefs.length > 1){
        //         console.warn(`Duplicate columnDefs for field: ${colName}`)
        //       }
        //       if(colDefs.length > 0)
        //         selectedColDef.push(colDefs[0])
        //     })
        //     saveAndSetLayout(selectedColDef, this.adaptableApi);
        //     this.gridApi?.setRowData(this.rowData)
        //   },
        //   error: error => {
        //     console.error(error)
        //     this.gridApi?.hideOverlay();
        //   }
        // }))
      }
    }))

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
    this.adaptableApi.columnApi.autosizeAllColumns()
  }

  openDialog(action: 'ADD' | 'EDIT' = 'ADD') { 
    
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    const dialogRef = this.dialog.open(AddRefDataFormComponent, {
      data: { 
        action: action,
        adaptableApi: this.adaptableApi
      },
      maxHeight: '95vh',
      // minWidth: '500px'
      //minHeight: '60vh'
    })
    this.subscriptions.push(dialogRef.afterClosed().subscribe())


    
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.fetchRefDataDetails();
  }
  
  fetchRefDataDetails() {
    this.rowData = this.refDataManagerSvc.getRefData(this.filterValue)
    
  }

}
