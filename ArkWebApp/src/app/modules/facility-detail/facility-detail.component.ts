import { Component, OnInit, ViewChild } from '@angular/core';
import { CellValueChangedEvent, ColDef, EditableCallbackParams, GridApi, ICellRendererParams } from '@ag-grid-community/all-modules';
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
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';

import { amountFormatter, removeDecimalFormatter, formatDate, dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { AggridMaterialDatepickerComponent } from './aggrid-material-datepicker/aggrid-material-datepicker.component';
import { DataService } from 'src/app/core/services/data.service';
import { CheckboxEditorComponent } from 'src/app/shared/components/checkbox-editor/checkbox-editor.component';
import { FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-facility-detail',
  templateUrl: './facility-detail.component.html',
  styleUrls: ['./facility-detail.component.scss']
})

export class FacilityDetailComponent implements OnInit {
  @ViewChild(ActionCellRendererComponent) actionCell!: ActionCellRendererComponent;

  subscriptions: Subscription[] = [];

  agGridModules: Module[] = [
    ClientSideRowModelModule, RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule
  ];

  columnDefs: ColDef[]
    
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

  rowData: any[] = [];
  constructor(private facilityDetailsService: FacilityDetailService,
    private accessService: AccessService,
    private dataSvc: DataService) { }

  adaptableOptions: AdaptableOptions;
  adapTableApi: AdaptableApi;

  context

  gridApi: GridApi
  gridColumnApi
  params

  actionClickedRowID: number = null;
  
  isWriteAccess: boolean = false;

  editableCellStyle = (params) => {
    return (params.rowIndex === this.actionClickedRowID) ? 
    {
      'border-color': '#0590ca',
    } : null
  }

  isEditable = (params: EditableCallbackParams) => {
    return params.node.rowIndex === this.actionClickedRowID
  } 

  checkValidation(newVal: any, columnID: string, rowData: any){
    // Expected Price
    if(columnID === 'expectedPrice'){
      if(<number>rowData['costPrice'] !== 0 &&
        (<number>newVal <  (0.75 * <number>rowData['costPrice']) 
      || <number>newVal > (1.5 * <number>rowData['costPrice'])) && rowData['assetTypeName'].toLowerCase().includes('loan')){
        this.dataSvc.setWarningMsg(`Expected price not in range (Loan)`, 'Dismiss', 'ark-theme-snackbar-warning');
      }
      else if(<number>rowData['costPrice'] !== 0 &&
        (<number>newVal <  (0.5 * <number>rowData['costPrice']) 
      || <number>newVal > (3.0 * <number>rowData['costPrice'])) && rowData['assetTypeName'].toLowerCase().includes('equity')){
        this.dataSvc.setWarningMsg(`Expected price not in range (Equity)`, 'Dismiss', 'ark-theme-snackbar-warning');
      }
    }
    if(columnID === 'expectedDate'){
      if(newVal != 'Invalid Date' || formatDate(newVal) !== 'NaN/NaN/NaN'){
        if(rowData['maturityDate']?.split('/')?.reverse()?.join('/') < newVal?.split('/')?.reverse()?.join('/')){
          this.dataSvc.setWarningMsg(`Expected date greator than Maturity date`, `Dismiss`, 'ark-theme-snackbar-warning')
        }  
      }
    }
  }

  toggleIsOverrideCheckbox(params: CellValueChangedEvent, newVal, column: string){

    if(['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount', 'isOverride'].includes(column)){

      let isChanged: boolean = false;
      if(['expectedPrice', 'maturityPrice', 'spreadDiscount'].includes(column)){
        if(Number(params.newValue) !== Number(params.oldValue)){
          isChanged = true
        }
      }
      else if(column === 'expectedDate'){
        if(params.newValue !== params.oldValue, true){
          isChanged = true
        }
      }

      if(isChanged){
        let nodeData = params.data;
        nodeData['isOverride'] = true
        params.api.applyTransaction({ update: [nodeData] })
  
        params.api.refreshCells({
          force: true,
          columns: ['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount', 'isOverride'],
          rowNodes: [params.api.getRowNode(params.node.id)]
        });
  
      }  
    }
  }

  onCellValueChanged(params: CellValueChangedEvent){

    let newVal = params.newValue;
    let column: string = params.column.getColId();

    this.toggleIsOverrideCheckbox(params, newVal, column);
    this.checkValidation(newVal, column, params.data);
  }

  onCheckboxChange(params: ICellRendererParams){

    if(params.value == false){

      let data = params.data;
      data['expectedDate'] = formatDate(data?.['dealPFExpectedDate']);
      data['expectedPrice'] = data?.['dealPFExpectedPrice'];
      data['modifiedOn'] = data?.['dealPFModifiedOn'];
      data['modifiedBy'] = data?.['dealPFModifiedBy'];

      params.api.applyTransaction({
        update: [data]
      })
    }
  }

  setSelectedRowID(rowID: number){
    this.actionClickedRowID = rowID;
    if(this.actionClickedRowID === null){
      this.gridApi?.stopEditing(true);
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
    agGridMaterialDatepicker: AggridMaterialDatepickerComponent,
    agGridCheckboxRenderer: CheckboxEditorComponent
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  asOfDate: string = null;
  funds: string[] = null;

  ngOnInit(): void {

    this.columnDefs = [
      {field: 'issuerShortName', pinned: 'left', width: 170, tooltipField: 'issuerShortName', type: 'abColDefString'},
      {field: 'asset', pinned: 'left', width: 240, tooltipField: 'asset', type: 'abColDefString'},
      {field: 'assetID', width: 103, type: 'abColDefNumber'},
      {field: 'assetTypeName', width: 153, type: 'abColDefString'},
      {field: 'ccy', width: 80, type: 'abColDefString'},
      {field: 'faceValueIssue',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 150, type: 'abColDefNumber'},
      {field: 'costPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 110, type: 'abColDefNumber'},
      {field: 'mark', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 86, type: 'abColDefNumber'},
      {field: 'maturityDate', //valueFormatter: dateFormatter,
       width: 135},
      {field: 'benchMarkIndex', width: 161, type: 'abColDefString'},
      { 
        field: 'spread', 
        width: 94,
        cellClass: 'ag-right-aligned-cell', 
        valueFormatter: removeDecimalFormatter, type: 'abColDefNumber'
      },
      {
        field: 'pikmargin', 
        width: 120,
        headerName: 'PIK Margin',
        cellClass: 'ag-right-aligned-cell',
        valueFormatter: removeDecimalFormatter, type: 'abColDefNumber'
      },
      {field: 'unfundedMargin', 
       width: 160,
      valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      {field: 'floorRate', 
      width: 113,
      valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'expectedDate', 
        maxWidth: 150,
        width: 150,
      //  valueFormatter: dateFormatter, 
  
        editable: this.isEditable,
        cellEditor: 'agGridMaterialDatepicker',
        cellStyle: this.editableCellStyle
      },
      { field: 'expectedPrice', 
        width: 140,
        valueFormatter: amountFormatter, 
        cellClass: 'ag-right-aligned-cell', 
        editable: this.isEditable,
        cellStyle: this.editableCellStyle, type: 'abColDefNumber'
      },
      { field: 'maturityPrice', 
        width: 136,
        valueFormatter: amountFormatter, 
        cellClass: 'ag-right-aligned-cell',
        editable: this.isEditable,
        cellStyle: this.editableCellStyle,
        type: 'abColDefNumber'
      },
      {
        headerName: 'Spread Discount',
        width: 151,
        field: 'spreadDiscount',
        editable: this.isEditable,
        cellStyle: this.editableCellStyle,
        valueFormatter: removeDecimalFormatter, type: 'abColDefNumber'
      },
      {
        field: 'isOverride',
        cellStyle: this.editableCellStyle,
        cellRenderer: 'agGridCheckboxRenderer',
        cellRendererParams: () => {
          return {
            editableRowID: this.getSelectedRowID(),
            onCheckboxcolChanged: this.onCheckboxChange
          }
        },
        width: 130
      },
      { headerName: 'Action', 
        field: 'Action',
        width: 130,
        pinned: 'right',
        pinnedRowCellRenderer: 'right',
        cellRenderer: 'actionCellRenderer',
        editable: false,
        menuTabs: []
      },
  
      { field: 'assetClass', width: 145, type: 'abColDefString' },
      { field: 'capStructureTranche', width: 145, type: 'abColDefString' },
      { field: 'securedUnsecured', width: 145, type: 'abColDefString' },
      { field: 'seniority', width: 145, type: 'abColDefString' },
      { field: 'modifiedBy', width: 145, type: 'abColDefString' },
      { field: 'modifiedOn', width: 150, valueFormatter: dateTimeFormatter }
    ]
    /** Making this component available to child components in Ag-grid */
    
    this.context = {
      componentParent: this
    }

    this.subscriptions.push(this.dataSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.subscriptions.push(this.dataSvc.currentSearchTextValues.subscribe(funds => {
      this.funds = funds
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.setSelectedRowID(null);

        if(this.funds != null && this.asOfDate != null){
          this.gridOptions.api.showLoadingOverlay();
          this.subscriptions.push(this.facilityDetailsService.getFacilityDetails(this.funds, this.asOfDate).subscribe({
            next: data => {
              this.gridOptions.api.hideOverlay();
              for(let i: number = 0; i < data?.length; i+= 1){
                data[i].expectedDate = formatDate(data[i]?.expectedDate)
                if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].expectedDate)){
                  data[i].expectedDate = null;
                }
  
                data[i].maturityDate = formatDate(data[i]?.maturityDate)
                if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].maturityDate)){
                  data[i].maturityDate = null;
                }
  
              }
              this.rowData = data;
            },
            error: error => {
              this.gridOptions.api.showNoRowsOverlay();
              this.rowData = null;
            }
          }))          
        }  
      }
    }))

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessService.accessibleTabs.length; i+= 1){
      if(this.accessService.accessibleTabs[i].tab === 'Asset Browser' && this.accessService.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    this.gridOptions =  {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true, 
      onCellValueChanged: this.onCellValueChanged.bind(this)
    }

    this.adaptableOptions = {
      primaryKey: 'assetID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: "Facility Detail ID",
      adaptableStateKey: 'Facility Detail Key',

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },

      predefinedConfig: {
        Dashboard: {
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
          Tabs: [],
          DashboardTitle: ' ',
          Revision: 2
        },
        Layout:{
          Revision: 2,
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
              'spreadDiscount',
              'isOverride',
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority',
              'modifiedBy',
              'modifiedOn',
              'Action',
            ],
            PinnedColumnsMap:{
              issuerShortName: 'left',
              asset: 'left',
              Action: 'right'
            }
          }]
        },
        FormatColumn: {
          Revision: 2
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
