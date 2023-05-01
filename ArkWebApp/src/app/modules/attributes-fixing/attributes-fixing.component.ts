import { Component, OnInit } from '@angular/core';
import { CellClickedEvent, ColDef, GridApi, GridOptions, GridReadyEvent, Module, RowNode, ValueFormatterParams } from '@ag-grid-community/core';
import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { formatDate, BLANK_DATETIME_FORMATTER_CONFIG, DATE_FORMATTER_CONFIG_ddMMyyyy, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm } from 'src/app/shared/functions/formatter';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';
import { FixingDetailsFormComponent } from './fixing-details-form/fixing-details-form.component';
import { map } from 'rxjs/operators';
import { ConfirmationPopupComponent } from 'src/app/shared/components/confirmation-popup/confirmation-popup.component';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { MsalService } from '@azure/msal-angular';
import { DetailedView, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { CommonConfig } from 'src/app/configs/common-config';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';


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

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  deleteFixingDetailID: number;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

  

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
      { field: 'fixingID', type: 'abColDefNumber' },
      { field: 'asOfDate', type: 'abColDefDate', cellClass: 'dateUK' },
      { 
        field: 'attributeName',
        cellStyle: {
          color: '#0590ca'
        },
        onCellClicked: this.onAttributeCellClicked.bind(this),
        type: 'abColDefString'
      },
      { field: 'attributeId', type: 'abColDefNumber'},
      { field: 'attributeType', type: 'abColDefString'},
      { field: 'attributeLevel', type: 'abColDefString' },
      { field: 'attributeLevelValue',type: 'abColDefString'},
      { field: 'attributeValue', 
        valueFormatter: (params: ValueFormatterParams) => {
          if(params.data?.['attributeType'] === 'Date')
            return formatDate(params.value);
          return params.value;
      }
      },
      { field: 'modifiedBy', type: 'abColDefString' },
      { field: 'modifiedOn', type: 'abColDefDate', cellClass: 'dateUK' },
      { field: 'createdBy', type: 'abColDefString' },
      { field: 'createdOn', type: 'abColDefDate', cellClass: 'dateUK' },
    ]

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      onGridReady: this.onGridReady.bind(this),
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
    }

    
    this.adaptableOptions= {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'fixingID',
      adaptableId: 'Fixing Attribute ID',
      adaptableStateKey: 'Fixing Attributes Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      actionOptions: {
        actionColumns: [
          {
            columnId: 'ActionEdit',
            friendlyName: 'Edit',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
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
            friendlyName: 'Delete',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
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
          Revision: 1,
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
        },
        FormatColumn:{
          Revision:1,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['asOfDate']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['asOfDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn','createdOn'])
          ]
        }
      }

    }
  }

  onAttributeCellClicked(event: CellClickedEvent){
      let model: DetailedView = <DetailedView>{};

      model.screen = 'Fixing Attributes';
      model.param1 = String(event.data.attributeId);           //attribute name
      model.param2 = String(event.data.attributeLevelValue);
      model.param3 = formatDate(event.data.asOfDate,true);
      model.param4 = ''
      model.param5 = ''
      model.strParam1 = []

      const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent,{
        data: {
          detailedViewRequest: model,
          noFilterSpace: true,
          grid: 'Fixing Attributes'
        },
        width: '90vw',
        height: '80vh'
      })
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.fetchFixingDetails();
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.columnApi.autosizeAllColumns()
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
