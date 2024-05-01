import { Component, OnInit, ViewChild } from '@angular/core';
import { AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable/types';
import { Subscription } from 'rxjs';
import { removeDecimalFormatter, formatDate,DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm,CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, BLANK_DATETIME_FORMATTER_CONFIG } from 'src/app/shared/functions/formatter';
import { DataService } from 'src/app/core/services/data.service';
import { CommonConfig } from 'src/app/configs/common-config';
import { CellValueChangedEvent, ColDef,  EditableCallbackParams, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, Module, PostSortRowsParams, RowNode } from '@ag-grid-community/core';
import { ActionColumnContext, AdaptableButton, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { MatDialog } from '@angular/material/dialog';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetail/facility-detail.service';

@Component({
  selector: 'app-facility-detail',
  templateUrl: './facility-detail.component.html',
  styleUrls: ['./facility-detail.component.scss']
})

export class FacilityDetailComponent implements OnInit {

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
  };  
  gridOptions: GridOptions;
  adaptableOptions: AdaptableOptions;
  adapTableApi: AdaptableApi;
  context
  gridApi: GridApi
  gridColumnApi
  isWriteAccess: boolean = false;
  rowData: any[] = [];
  dealTypesCS: string[];



  constructor(private facilityDetailsService: FacilityDetailService,
    private dataSvc: DataService,
    public dialog: MatDialog,
    ) { }



  frameworkComponents = {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  asOfDate: string = null;
  funds: string[] = null;


  ngOnInit(): void {


    
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
      cellEditorParams: () => { 
        return {
          options: this.dealTypesCS,
          isStrict: true, oldValRestoreOnStrict: true
      }}},
      { field: 'expectedDate', 
        maxWidth: 150,
        width: 150,
        filter: false,
        cellEditor: 'agGridMaterialDatepicker',
        cellClass: 'dateUK'
      },
      { field: 'expectedPrice', 
        width: 140,
        cellClass: 'ag-right-aligned-cell', 
        filter: false,
        type: 'abColDefNumber'
      },
      { field: 'maturityPrice', 
        width: 136,
         
        cellClass: 'ag-right-aligned-cell',
        filter: false,
        type: 'abColDefNumber'
      },
      {
        headerName: 'Spread Discount',
        width: 151,
        field: 'spreadDiscount',
        filter: false,
        valueFormatter: removeDecimalFormatter, type: 'abColDefNumber'
      },
      {
        field: 'isOverride',
        cellRenderer: 'agGridCheckboxRenderer',
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


    this.subscriptions.push(this.facilityDetailsService.getFacilityDetails(this.funds, this.asOfDate).subscribe({
      next: data => {
        this.rowData = data;
      },
      error: error => {
        this.gridApi?.showNoRowsOverlay();
        this.rowData = null;
      }
    }))   



    this.isWriteAccess = false;


    this.gridOptions =  {
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      sideBar:true,
      enableRangeSelection: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true, 
      components:this.frameworkComponents,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
    }



    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      primaryKey: 'assetID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: "Facility Detail ID",
      adaptableStateKey: 'Facility Detail Key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,


      actionColumnOptions:{
        actionColumns:[
          {
            columnId:'Audit',
            friendlyName:' ',
            rowScope: {
              ExcludeGroupRows: true,
            },
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
                    console.log('action - info')
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

          ]
        },
        StatusBar: {
          Revision: 2,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['GridFilter']
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



   onAdaptableReady = (params:AdaptableReadyInfo) => {
    this.adapTableApi = params.adaptableApi;    
    this.gridApi = params.agGridApi
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel();
    this.gridApi.autoSizeAllColumns()
    this.gridApi.closeToolPanel();

  };
}
