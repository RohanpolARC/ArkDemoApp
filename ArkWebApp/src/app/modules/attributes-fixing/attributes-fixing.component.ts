import { Component, OnInit } from '@angular/core';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, Module, RowNode, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { ActionColumnButtonContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { dateTimeFormatter,dateFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';
import { ClipboardModule, ColumnsToolPanelModule, ExcelExportModule, FiltersToolPanelModule, MenuModule, RangeSelectionModule, SetFilterModule, SideBarModule } from '@ag-grid-enterprise/all-modules';
import { FixingDetailsFormComponent } from './fixing-details-form/fixing-details-form.component';
import { map } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/components/confirmation-popup/confirmation-popup.component';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { MsalService } from '@azure/msal-angular';


@Component({
  selector: 'app-attributes-fixing',
  templateUrl: './attributes-fixing.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './attributes-fixing.component.scss']
})
export class AttributesFixingComponent implements OnInit {

  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[] = []
  gridApi: GridApi
  adaptableApi : AdaptableApi
  rowData: Observable<any>
  isWriteAccess: boolean = false;
  isDeleteAccess: boolean = false;

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
  deleteFixingDetailID: number;

  

  constructor(
    private attributeFixingSvc: AttributesFixingService,
    private dataSvc: DataService,
    private accessSvc: AccessService,
    private msalSvc: MsalService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs?.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Fixing Attributes' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    // Only admin.write has delete access.
    let userRoles: string[] = this.msalSvc.instance.getActiveAccount()?.idTokenClaims?.roles
    if(userRoles.map(role => role.toLowerCase()).includes('admin.write')){
      this.isDeleteAccess = true;
    }

    this.columnDefs = [
      { field: 'fixingID' },
      { field: 'asOfDate',valueFormatter:dateFormatter, type: 'abColDefDate' },
      { field: 'attributeName'},
      { field: 'attributeId'},
      { field: 'attributeType'},
      { field: 'attributeLevel' },
      { field: 'attributeLevelValue'},
      { field: 'attributeValue', 
        valueFormatter: (params: ValueFormatterParams) => {
          if(params.data?.['attributeType'] === 'Date')
            return formatDate(params.value);
          return params.value;
      }
      },
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
      userInterfaceOptions: {
        actionColumns: [
          {
            columnId: 'ActionEdit',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {
                  // TO open the dialog
                  if(!this.isWriteAccess){
                    this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
                    return;
                  }
  
                  let rowData = context.rowNode.data;
  
                  // To open dialog after successfull fetch
                  this.openDialog('EDIT', rowData); 
              },
              icon: {
                src: '../assets/img/edit.svg',
                style: {height: 25, width: 25}
              }
            }
          },
          {
            columnId: 'ActionDelete',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {

                // TO open the dialog
                if(!this.isDeleteAccess){
                  this.dataSvc.setWarningMsg('Only admin has delete access', 'Dismiss', 'ark-theme-snackbar-warning')
                  return;
                }

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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.fetchFixingDetails();
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

  fetchFixingDetails(){
    this.rowData = this.attributeFixingSvc.getFixingDetails().pipe(
      map((fixingData: any[]) => fixingData.map(row => {
        if(row['attributeType'] === 'Boolean'){
          row['attributeValue'] = row['attributeValue'] ? 'Yes' : 'No';
        }
        return row;
      }))
    )
  }

  deleteFixingDetail(fixingID){
    this.subscriptions.push(this.attributeFixingSvc.deleteFixingDetails(fixingID).subscribe((result:any)=>{
      if(result.isSuccess===true){
        const rowNode:RowNode = this.adaptableApi.gridApi.getRowNodeForPrimaryKey(fixingID)
        this.adaptableApi.gridApi.deleteGridData([rowNode.data])
        this.dataSvc.setWarningMsg('The Attribute deleted successfully','Dismiss','ark-theme-snackbar-success')
      }else{
        this.dataSvc.setWarningMsg('The Attribute could not be deleted','Dismiss','ark-theme-snackbar-error')
      }
    }))
  }

  openDialog(action: 'ADD' | 'EDIT' | 'DELETE' = 'ADD', fixingDetails:any = []) { 
    
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    if(action === 'DELETE'){
      this.deleteFixingDetailID = fixingDetails.fixingID
      let confirmTextString = 'Are you sure you want to delete this attribute ?'
      const dialogRef = this.dialog.open(ConfirmationPopupComponent, { 
        data:{confirmText:confirmTextString},
        maxHeight: '95vh'
      })
      this.subscriptions.push(dialogRef.afterClosed().subscribe((value)=>{
        if(value.action==='Confirm'){
          this.deleteFixingDetail(this.deleteFixingDetailID)
        }
      }))
    }else{
      const dialogRef = this.dialog.open(FixingDetailsFormComponent, {
        data: { 
          action: action,
          fixingDetails: fixingDetails,
          adaptableApi: this.adaptableApi
        },
        maxHeight: '95vh',
        // minWidth: '500px'
        //minHeight: '60vh'
      })
      this.subscriptions.push(dialogRef.afterClosed().subscribe())
    }


    
  }

}
