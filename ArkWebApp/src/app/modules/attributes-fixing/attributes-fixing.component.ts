import { Component, OnInit } from '@angular/core';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/all-modules';
import { ActionColumnButtonContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { dateTimeFormatter,dateFormatter } from 'src/app/shared/functions/formatter';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';
import { ClipboardModule, ColumnsToolPanelModule, ExcelExportModule, FiltersToolPanelModule, MenuModule, RangeSelectionModule, SetFilterModule, SideBarModule } from '@ag-grid-enterprise/all-modules';
import { FixingDetailsFormComponent } from './fixing-details-form/fixing-details-form.component';


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
  isWriteAccess: boolean = true;

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

  

  constructor(
    private attributeFixingSvc: AttributesFixingService,
    private dataSvc: DataService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.columnDefs = [
      { field: 'fixingID' },
      { field: 'asOfDate',valueFormatter:dateFormatter },
      { field: 'attributeName'},
      { field: 'attributeId'},
      { field: 'attributeType'},
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
                  let fundName: string = rowData?.['fundName'];
  
                  // To open dialog after successfull fetch
                  this.openDialog('EDIT', rowData); 
              },
              icon: {
                src: '../assets/img/edit.svg',
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
          Revision: 3,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [ ...this.columnDefs.map(colDef => colDef.field).filter(r => !['fixingID'
            ,'attributeId'
            ,'attributeType'
            ,'createdBy'
            ,'createdOn'].includes(r)), 'ActionEdit'],
            PinnedColumnsMap: { 
              ActionEdit: 'right' 
            },
            ColumnWidthMap: {
              ActionEdit: 15
            }
          }]
        }
      }

    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.fetchFundFeeData();
  }

  fetchFundFeeData(){
    this.rowData = this.attributeFixingSvc.getFixingDetails()

  }
  openDialog(action: 'ADD' | 'EDIT' = 'ADD', fixingDetails = []) { 
    
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    const dialogRef = this.dialog.open(FixingDetailsFormComponent, {
      data: { 
        action: action,
        fixingDetails: fixingDetails,
        adaptableApi: this.adaptableApi
      },
      maxHeight: '95vh'
      //minHeight: '60vh'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe())
  }

}
