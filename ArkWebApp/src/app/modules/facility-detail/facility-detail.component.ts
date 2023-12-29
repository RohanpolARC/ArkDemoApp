import { Component, OnInit, ViewChild } from '@angular/core';
import { AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable/types';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';
import { removeDecimalFormatter, formatDate,DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm,CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, BLANK_DATETIME_FORMATTER_CONFIG } from 'src/app/shared/functions/formatter';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { AggridMaterialDatepickerComponent } from './aggrid-material-datepicker/aggrid-material-datepicker.component';
import { DataService } from 'src/app/core/services/data.service';
import { CheckboxEditorComponent } from 'src/app/shared/components/checkbox-editor/checkbox-editor.component';
import { getMomentDateStr, presistSharedEntities, loadSharedEntities,  autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { CommonConfig } from 'src/app/configs/common-config';
import { CellValueChangedEvent, ColDef,  EditableCallbackParams, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, Module, PostSortRowsParams, RowNode } from '@ag-grid-community/core';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { DetailedView, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { ActionColumnContext, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';

@Component({
  selector: 'app-facility-detail',
  templateUrl: './facility-detail.component.html',
  styleUrls: ['./facility-detail.component.scss']
})

export class FacilityDetailComponent implements OnInit {
  @ViewChild(ActionCellRendererComponent) actionCell!: ActionCellRendererComponent;

  subscriptions: Subscription[] = [];
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
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
  adaptableOptions: AdaptableOptions;
  adapTableApi: AdaptableApi;
  context
  gridApi: GridApi
  gridColumnApi
  params
  isWriteAccess: boolean = false;
  rowData: any[] = [];
  dealTypesCS: string[];

  lockedit:boolean=false


  

  AMOUNT_COLUMNS = [
    'maturityPrice',
    'expectedPrice',
    'floorRate',
    'faceValueIssue',
    'costPrice',
    'mark',
    'adjustedEBITDAatInv',
    'ebitda',
    'ltmRevenues',
    'netLeverage',
    'netLeverageAtInv',
    'netLTV',
    'netLTVatInv',
    'revenueatInv',
    'revenuePipeline',
    'reportingEBITDA',
    'reportingNetLeverage',
    'unfundedMargin',
  'floorRate']
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  prevRowIndex: number;

  constructor(private facilityDetailsService: FacilityDetailService,
    private accessService: AccessService,
    private dataSvc: DataService,
    public dialog: MatDialog,
    private filterSvc: GeneralFilterService
    ) { }


  editableCellStyle = (params) => {
    return (params.node.data?.['editing']) ? 
    {
      borderColor: '#0590ca',
    } : null
  }

  isEditable = (params: EditableCallbackParams) => {
    return params.node.data?.['editing']
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

    if(['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount', 'isOverride', 'dealTypeCS'].includes(column)){

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
      else if(column === 'dealTypeCS'){
        if(params.newValue !== params.oldValue)
          isChanged = true
      }

      if(isChanged){
        let nodeData = params.data;
        nodeData['isOverride'] = true
        params.api.applyTransaction({ update: [nodeData] })
  
        params.api.refreshCells({
          force: true,
          columns: ['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount', 'isOverride', 'dealTypeCS'],
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
 
    let node  = this.getEditingRow()
    this.gridApi.setFocusedCell(node?.rowIndex,column)
  }


  //We are using this function to maintain position of Editing Rownode when sort is activated on Editable column.
  // Issue - ag grid sorts the column values before user can save the edited value.
  //https://www.ag-grid.com/angular-data-grid/row-sorting/ => Post-Sort
  postSortRows(params:PostSortRowsParams) {
    let rowNodes = params.nodes;

    if(rowNodes){
      for (let i = 0; i < rowNodes.length; i++) {
          if (!!rowNodes[i].data?.editing) {
              rowNodes.splice(params.context.componentParent.prevRowIndex, 0, rowNodes.splice(i, 1)?.[0]);
          }
      }
    }
  };

  getEditingRow(){
    let node :RowNode
    this.gridApi?.forEachNode(rownode=>{
      if (rownode.data['editing'] === true){
        node = <RowNode> rownode
      }
    });
    if(node){
      this.prevRowIndex = node.rowIndex
    }
    return node
  }

  clearEditingState(){
    this.lockedit = false
    let node = this.getEditingRow()
    delete node?.data?.['editing']
    this.prevRowIndex = null
  }

  onCheckboxChange(params: ICellRendererParams){

    if(params.value == false){

      let data = params.data;
      data['expectedDate'] = formatDate(data?.['dealPFExpectedDate']);
      data['expectedPrice'] = data?.['dealPFExpectedPrice'];
      data['modifiedOn'] = data?.['dealPFModifiedOn'];
      data['modifiedBy'] = data?.['dealPFModifiedBy'];
      data['dealTypeCS'] = data?.['dealPFDealTypeCS'];

      params.api.applyTransaction({
        update: [data]
      })
    }
  }


  onGridReady(params:GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.params = params;

    this.gridApi.closeToolPanel();
  }

  frameworkComponents = {
    actionCellRenderer: ActionCellRendererComponent,
    agGridMaterialDatepicker: AggridMaterialDatepickerComponent,
    agGridCheckboxRenderer: CheckboxEditorComponent,
    autocompleteCellEditor: MatAutocompleteEditorComponent
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  asOfDate: string = null;
  funds: string[] = null;

  fetchUniqueDealTypesCS(){
    this.subscriptions.push(this.dataSvc.getUniqueValuesForField('Deal Type (CS)').subscribe(d => {
      this.dealTypesCS = d.map((dt) => dt.value);
    }))
  }

  ngOnInit(): void {

    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id===211){
          let funds:any[] = []
          data.value?.forEach(ele=>funds.push(ele.value))
          this.facilityDetailsService.changeFundValues(funds)
        }else if(data.id === 212){
          this.facilityDetailsService.changeSearchDate(getMomentDateStr(data.value))
        }
      }
    }))

    this.fetchUniqueDealTypesCS();
    
    this.columnDefs = [
      {field: 'issuerShortName', pinned: 'left', width: 170, tooltipField: 'issuerShortName', type: 'abColDefString'},
      {field: 'dealName', pinned: 'left', width: 170, tooltipField: 'dealName', type: 'abColDefString'},
      {field: 'asset', pinned: 'left', width: 240, tooltipField: 'asset', type: 'abColDefString'},
      {field: 'assetID', width: 103, type: 'abColDefNumber'},
      {field: 'assetTypeName', width: 153, type: 'abColDefString'},
      {field: 'ccy', width: 80, type: 'abColDefString'},
      {field: 'faceValueIssue',headerName: 'Face Value Issue / Quantity', cellClass: 'ag-right-aligned-cell', width: 150, type: 'abColDefNumber'},
      {field: 'costPrice',  cellClass: 'ag-right-aligned-cell', width: 110, type: 'abColDefNumber'},
      {field: 'mark',  cellClass: 'ag-right-aligned-cell', width: 86, type: 'abColDefNumber'},
      {field: 'maturityDate', //valueFormatter: dateFormatter,
       width: 135, cellClass: 'dateUK'},
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
       cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      {field: 'floorRate', 
      width: 113,
       cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
      { field: 'dealType', type: 'abColDefString' },
      { field: 'dealTypeCS', type: 'abColDefString', cellEditor: 'autocompleteCellEditor',        
      editable: this.isEditable, filter: false,

      cellStyle: this.editableCellStyle,
      cellEditorParams: () => { 
        return {
          options: this.dealTypesCS,
          isStrict: true, oldValRestoreOnStrict: true
      }}},
      { field: 'expectedDate', 
        maxWidth: 150,
        width: 150,
        editable: this.isEditable,filter: false,
        cellEditor: 'agGridMaterialDatepicker',
        cellStyle: this.editableCellStyle,
        cellClass: 'dateUK'
      },
      { field: 'expectedPrice', 
        width: 140,
        cellClass: 'ag-right-aligned-cell', 
        editable: this.isEditable,filter: false,
        cellStyle: this.editableCellStyle, type: 'abColDefNumber'
      },
      { field: 'maturityPrice', 
        width: 136,
         
        cellClass: 'ag-right-aligned-cell',
        editable: this.isEditable,filter: false,
        cellStyle: this.editableCellStyle,
        type: 'abColDefNumber'
      },
      {
        headerName: 'Spread Discount',
        width: 151,
        field: 'spreadDiscount',
        editable: this.isEditable,
        cellStyle: this.editableCellStyle,filter: false,
        valueFormatter: removeDecimalFormatter, type: 'abColDefNumber'
      },
      {
        field: 'isOverride',
        cellStyle: this.editableCellStyle,
        cellRenderer: 'agGridCheckboxRenderer',
        cellRendererParams: () => {
          return {
            editableRowID: this.getEditingRow()?.rowIndex,
            onCheckboxcolChanged: this.onCheckboxChange
          }
        },
        width: 130
      },
      { headerName: 'Edit', 
        field: 'Action',
        width: 130,
        pinned: 'right',
        cellRenderer: 'actionCellRenderer',
        editable: false,
        menuTabs: []
      },
  
      { field: 'adjustedEBITDAatInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Adj EBITDA at Inv' },
      { field: 'ebitda',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'EBITDA' }, 
      { field: 'ltmRevenues',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'LTM Revenues' },
      { field: 'netLeverage',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net Leverage' },
      { field: 'netLeverageAtInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net Leverage At Inv' },
      { field: 'netLTV',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net LTV' },
      { field: 'netLTVatInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net LTV at Inv' },
      { field: 'revenueatInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Revenue at Inv' },
      { field: 'revenuePipeline',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Revenue Pipeline' },
      { field: 'reportingEBITDA',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Reporting EBITDA' },
      { field: 'reportingNetLeverage',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Reporting Net Leverage' },
      { field: 'reportingNetLeverageComment', type: 'abColDefString', headerName: 'Reporting Net Leverage Comment' },
    
      { field: 'assetClass', width: 145, type: 'abColDefString' },
      { field: 'capStructureTranche', width: 145, type: 'abColDefString' },
      { field: 'securedUnsecured', width: 145, type: 'abColDefString' },
      { field: 'seniority', width: 145, type: 'abColDefString' },
      { field: 'modifiedBy', width: 145, type: 'abColDefString' },
      { field: 'modifiedOn',type:'abColDefDate', width: 150, cellClass: 'dateUK' }
    ]
    /** Making this component available to child components in Ag-grid */
    
    this.context = {
      componentParent: this
    }

    this.subscriptions.push(this.facilityDetailsService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.subscriptions.push(this.facilityDetailsService.currentfundValues.subscribe(funds => {
      this.funds = funds
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.clearEditingState();

        if(this.funds != null && this.asOfDate != null){
          this.gridOptions?.api?.showLoadingOverlay();
          this.subscriptions.push(this.facilityDetailsService.getFacilityDetails(this.funds, this.asOfDate).subscribe({
            next: data => {
              if(data){
                this.noRowsToDisplayMsg = 'No data found for applied filter.'
              }
              this.gridOptions?.api?.hideOverlay();
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
              this.gridOptions?.api?.showNoRowsOverlay();
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
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      sideBar:true,
      enableRangeSelection: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true, 
      onCellValueChanged: this.onCellValueChanged.bind(this),
      components:this.frameworkComponents,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent:NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }



    this.adaptableOptions = {
      filterOptions: CommonConfig.ADAPTABLE_FILTER_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'assetID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: "Facility Detail ID",
      adaptableStateKey: 'Facility Detail Key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
      },

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS)
        ]
      },

      actionOptions:{
        actionColumns:[
          {
            columnId:'Audit',
            friendlyName:' ',
            includeGroupedRows:false,
            actionColumnSettings:{
              suppressMenu: true,
              suppressMovable: true,
              resizable: true
            },
            actionColumnButton:[
              {
                onClick:(
                  button:AdaptableButton<ActionColumnContext>,
                  context:ActionColumnContext
                )=>{
                  if(this.lockedit){
                    this.dataSvc.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')  
                  }else{
                    let m = <DetailedView>{};
                    m.screen = 'Asset Browser';
                    m.param1 = String(context.rowNode.data.assetID);
                    m.param2 = '';
                    m.param3 = ''
                    m.param4 = '';
                    m.param5 = '';
                    m.strParam1 = []
  
  
                    const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent,{
                      data:{
                        detailedViewRequest: m,
                        noFilterSpace:true,
                        grid: 'Asset Browser'
                      },
                      width: '90vw',
                      height: '80vh'
                    })
                  }
                },
                icon:{
                  src: '../assets/img/info.svg',
                  style: {
                    height: 25, width: 25
                  }
                }
              }
            ]
          }
        ]
      },

      predefinedConfig: {
        Dashboard: {
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          Tabs: [],
          DashboardTitle: ' ',
          Revision: 3
        },
        Layout:{
          Revision: 10,
          CurrentLayout: 'Basic Facility Detail',
          Layouts: [{
            Name: 'Basic Facility Detail',
            Columns: [
              'issuerShortName',
              'dealName',
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
              'dealType',
              'dealTypeCS',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'isOverride',
              'adjustedEBITDAatInv',
              'ebitda',
              'ltmRevenues',
              'netLeverage',
              'netLeverageAtInv',
              'netLTV',
              'netLTVatInv',
              'revenueatInv',
              'revenuePipeline',
              'reportingEBITDA',
              'reportingNetLeverage',
              'reportingNetLeverageComment',
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority',
              'modifiedBy',
              'modifiedOn',
              'Action',
              'Audit'
            ],
            PinnedColumnsMap:{
              issuerShortName: 'left',
              dealName: 'left',
              asset: 'left',
              Action: 'right',
              Audit:'right'
            },
            ColumnWidthMap:{
              'Audit':75
            }
          }]
        },
        FormatColumn: {
          Revision: 7,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['modifiedOn']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn']),
            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS],['amountFormatter']),

          ]
        },
        StatusBar: {
          Revision: 2,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['Filter']
            },
            {
              Key: 'Right Panel',
              StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
            },
          ],
        }
      }
    }
   }



   onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adapTableApi.columnApi.autosizeAllColumns()

  };
}
