import { Component, OnInit, ViewChild } from '@angular/core';
import { CellClickedEvent, CellValueChangedEvent, ColDef, EditableCallbackParams, GridApi, RowNode } from '@ag-grid-community/all-modules';
import {
  GridOptions,
  Module,
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
import { Subscription } from 'rxjs';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';

import { dateFormatter, amountFormatter } from 'src/app/shared/functions/formatter';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { AggridMaterialDatepickerComponent } from './aggrid-material-datepicker/aggrid-material-datepicker.component';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-facility-detail',
  templateUrl: './facility-detail.component.html',
  styleUrls: ['./facility-detail.component.scss']
})

export class FacilityDetailComponent implements OnInit {
  @ViewChild(ActionCellRendererComponent) actionCell!: ActionCellRendererComponent;

  subscriptions: Subscription[] = [];

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  columnDefs: ColDef[] = [
    {field: 'issuerShortName'},
    {field: 'asset'},
    {field: 'assetID'},
    {field: 'assetTypeName'},
    {field: 'ccy'},
    {field: 'faceValueIssue',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'costPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'mark', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'maturityDate', valueFormatter: dateFormatter},
    {field: 'benchMarkIndex'},
    {field: 'spread', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'pikmargin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'unfundedMargin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'floorRate', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    { field: 'expectedDate', 
      maxWidth: 200,
      width: 200,
      valueFormatter: dateFormatter, 
      editable: (params: EditableCallbackParams) => {
        return params.node.rowIndex === this.actionClickedRowID;
      }, 
      cellEditor: 'agGridMaterialDatepicker',
      cellStyle: (params) => {
        return (params.rowIndex === this.actionClickedRowID) ? 
        {
          'border-color': '#0590ca',
        } : {
          'border-color': '#fff'
        };
      },
    },
    { field: 'expectedPrice', 
      valueFormatter: amountFormatter, 
      cellClass: 'ag-right-aligned-cell', 
      editable: (params: EditableCallbackParams) => {
        return params.node.rowIndex === this.actionClickedRowID;
      },
      cellStyle: (params) => {
        return (params.rowIndex === this.actionClickedRowID) ? 
        {
          'border-color': '#0590ca',
        } : {
          'border-color': '#fff'
        };
      }
    },
    { field: 'maturityPrice', 
      valueFormatter: amountFormatter, 
      cellClass: 'ag-right-aligned-cell',
      editable: (params: EditableCallbackParams) => {
        return params.node.rowIndex === this.actionClickedRowID;
      }, 
      cellStyle: (params) => {
        return (params.rowIndex === this.actionClickedRowID) ? 
        {
          'border-color': '#0590ca',
        } : {
          'border-color': '#fff'
        };
      }
    },
    {
      headerName: 'Spread Discount',
      field: 'spreadDiscount',
      valueFormatter: amountFormatter,
      editable:(params: EditableCallbackParams) => {
        return params.node.rowIndex === this.actionClickedRowID;
      }, 
      cellStyle: (params) => {
        return (params.rowIndex === this.actionClickedRowID) ? 
        {
          'border-color': '#0590ca',
        } : {
          'border-color': '#fff'
        };
      }
    },
    { headerName: 'Action', 
      field: 'Action',
      width: 150,
      pinned: 'right',
      pinnedRowCellRenderer: 'right',
      cellRenderer: 'actionCellRenderer',
      editable: false,
    },
  ]
    
  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: false,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  };  

  gridOptions: GridOptions;

  rowData: any[] = null;
  constructor(private facilityDetailsService: FacilityDetailService,
    private warningMsgPopUp: MatSnackBar,
    private accessService: AccessService,
    private dataService: DataService) { }

  adaptableOptions: AdaptableOptions;
  adapTableApi: AdaptableApi;

  context

  gridApi: GridApi
  gridColumnApi
  params

  actionClickedRowID: number = null;
  
  isWriteAccess: boolean = false;

  setWarningMsg(message: string, action: string, type: string = 'ark-theme-snackbar-normal'){
    this.warningMsgPopUp.open(message, action, {
      duration: 5000,
      panelClass: [type]
    });
  }

  checkValidation(newVal: any, columnID: string, rowData: any){
    // Expected Price
    if(columnID === 'expectedPrice'){
      if((<number>newVal <  (0.75 * <number>rowData['costPrice']) 
      || <number>newVal > (1.5 * <number>rowData['costPrice'])) && rowData['assetTypeName'].toLowerCase().includes('loan')){
        this.setWarningMsg(`Warning: Expected price not in range (Loan)`, 'Dismiss', 'ark-theme-snackbar-warning');
      }
      else if((<number>newVal <  (0.5 * <number>rowData['costPrice']) 
      || <number>newVal > (3.0 * <number>rowData['costPrice'])) && rowData['assetTypeName'].toLowerCase().includes('equity')){
        this.setWarningMsg(`Expected price not in range (Equity)`, 'Dismiss', 'ark-theme-snackbar-warning');
      }
    }
    if(columnID === 'expectedDate'){
      console.log(rowData['maturityDate'])
      console.log(newVal);
      if(newVal != 'Invalid Date'){
        if(<Date>rowData['maturityDate'] < newVal?.toISOString()){
          this.setWarningMsg(`Expected date greator than Maturity date`, `Dismiss`, 'ark-theme-snackbar-warning')
        }  
      }
    }
  }

  onCellValueChanged(params: CellValueChangedEvent){
    let newVal = params.newValue;
    let column: string = params.column.getColId();
    
    this.checkValidation(newVal, column, params.data);
  }
  
  setSelectedRowID(rowID: number){
    this.actionClickedRowID = rowID;
    if(this.actionClickedRowID === null){
      this.gridApi.stopEditing(true);
    }
  }

  getSelectedRowID(){
    return this.actionClickedRowID;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.params = params;

    this.gridApi.closeToolPanel();
  }

  frameworkComponents = {
    actionCellRenderer: ActionCellRendererComponent,
    agGridMaterialDatepicker: AggridMaterialDatepickerComponent
  }

  ngOnInit(): void {

    /** Making this component available to child components in Ag-grid */
    
    this.context = {
      componentParent: this
    }

    this.subscriptions.push(this.dataService.currentSearchFunds.subscribe(funds => {
      
      funds = funds?.map(k => { return k?.fund })

      if(funds != null && funds != []){
        this.subscriptions.push(this.facilityDetailsService.getFacilityDetails(funds).subscribe({
          next: data => {
            this.rowData = data;
          },
          error: error => {
            this.rowData = [];
          }
        }))
      }
    }))

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessService.accessibleTabs.length; i+= 1){
      if(this.accessService.accessibleTabs[i].tab === 'Facility Detail' && this.accessService.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    this.gridOptions =  {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      undoRedoCellEditing: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true,      
    }

    this.adaptableOptions = {
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: 'TestUser',
      adaptableId: "",
      adaptableStateKey: 'Facility Detail Key',

      userInterfaceOptions: {
        actionColumns: [
          {
            columnId: 'Save',
            actionColumnButton: {
             
              
              buttonStyle: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {
                return {
                  variant: 'raised',
                }
              },

              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {
                let rowData = context.rowNode?.data;
              },
              icon: {
                src: '../assets/img/save_black_24dp.svg',
                style: {
                  height: 25,
                  width: 25
                } 
              }
            }
          },
          {
            columnId: 'Undo',
            actionColumnButton: {

              onClick: (
                button: AdaptableButton<ActionColumnButtonContext>,
                context: ActionColumnButtonContext
              ) => {
                let pkey = context.primaryKeyValue;
                this.gridOptions.api.undoCellEditing();
              },
              icon: {
                src: '../assets/img/undo_black_24dp.svg',
                style: {
                  height: 25,
                  width: 25
                }
              }


            }
          }
        ]
      },

      predefinedConfig: {
        Dashboard: {
          ModuleButtons: ['Export', 'Layout', 'ConditionalStyle'],
          Tabs: []
        },
        Layout:{
          CurrentLayout: 'Basic Facility Detail',
          Layouts: [{
            Name: 'Basic Facility Detail',
            Columns: [
              'issuerShortName',
              'asset',
              'assetID',
              'assetTypeName',
              'ccy',
              'faceValueIssue',
              'costPrice',
              'mark',
              'maturityDate',
              'benchMarkIndex',
              'spread',
              'pikmargin',
              'unfundedMargin',
              'floorRate',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'Action',
            ],
            PinnedColumnsMap:{
              Action: 'right'
            }
          }]
        }
      }
    }
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
}
