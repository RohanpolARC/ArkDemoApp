import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core';
import { Injectable, OnInit } from '@angular/core';
import { ComponentReaderService } from '../../service/component-reader.service';
import { GridUtilService } from './grid-util.service';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, removeDecimalFormatter } from 'src/app/shared/functions/formatter';
import { RefService } from '../ref/ref.service';
import { CommonConfig } from 'src/app/configs/common-config';
import { AggridMaterialDatepickerComponent } from 'src/app/modules/facility-detail/aggrid-material-datepicker/aggrid-material-datepicker.component';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { NoRowsOverlayComponent } from '@ag-grid-community/core/dist/cjs/es5/rendering/overlays/noRowsOverlayComponent';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';

@Injectable()
export class GridConfigService {

  constructor(private dataSvc: DataService,
    private compReaderSvc: ComponentReaderService,
    public gridUtilSvc: GridUtilService,
    // When service is injected in a componenet. Order of execution:
    // Service Constructor > Component Constructor > Component ngOnInit (Since, it needs to resolve all the dependencies of the component).
    // Hence, init() is called inside constructor here, instead of in the ngOnInit() of the service.
    private refSvc: RefService) {
      this.init();
    }

  columnDefs: ColDef[]
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions

  init(): void {
    
    this.columnDefs = [    
      {field: 'positionID', width:100, tooltipField: 'positionID', type:'abColDefNumber', cellStyle: this.gridUtilSvc.positionIDCellStyle.bind(this.gridUtilSvc), onCellClicked: this.gridUtilSvc.positionIdClick.bind(this.gridUtilSvc) },
      {field: 'fundHedging', width:150, tooltipField: 'fundHedging', rowGroup: true, pinned: 'left', type: 'abColDefString'}, 
      {field: 'issuerShortName', width: 170, tooltipField: 'issuerShortName', rowGroup: true, pinned: 'left', type: 'abColDefString'},
      {field: 'asset', width: 240, tooltipField: 'asset', type: 'abColDefString'},
      {field: 'assetID', width: 103, type:'abColDefNumber'},
      {field: 'assetTypeName', width: 153, type: 'abColDefString'},
      {field: 'fund', width: 150, tooltipField: 'fund', type: 'abColDefString'},
      {field: 'ccy', width: 80, type: 'abColDefString'},
      {field: 'fundCcy', width: 80, type: 'abColDefString' },
      {field: 'faceValueIssue', cellClass: 'ag-right-aligned-cell', width: 150, type:'abColDefNumber'},
      {field: 'costPrice',  cellClass: 'ag-right-aligned-cell', width: 110, type:'abColDefNumber'},
      {field: 'mark',  cellClass: 'ag-right-aligned-cell', width: 86, type:'abColDefNumber'},
      {field: 'maturityDate', type: 'abColDefDate', width: 135, cellClass: 'dateUK', 
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this), cellEditor: 'agGridMaterialDatepicker'},
      {field: 'benchMarkIndex', width: 161, type: 'abColDefString',     editable: this.gridUtilSvc.isEditable.bind(this),
      cellStyle: this.gridUtilSvc.editableCellStyle.bind(this),
      cellEditor: 'autocompleteCellEditor',
      // This function will return when required and not on columndef init only
      cellEditorParams: () => { 
        return {
          options: this.refSvc.benchMarkIndexList,
          isStrict: true,
          oldValRestoreOnStrict: true
      }}},
      { 
        field: 'spread', width: 94, cellClass: 'ag-right-aligned-cell', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
      },
      {
        field: 'pikMargin', width: 120, headerName: 'PIK Margin', cellClass: 'ag-right-aligned-cell', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
      },
      {
        field: 'unfundedMargin', width: 160,  cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'
        ,editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
      },
      {
        field: 'floorRate', width: 113,  cellClass: 'ag-right-aligned-cell', type:'abColDefNumber',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
      },
      { field: 'dealType',
        type: 'abColDefString',
      },
      { 
        field: 'dealTypeCS',
        type: 'abColDefString'
      },
      { field: 'expectedDate', maxWidth: 150, width: 150, type: 'abColDefDate', cellEditor: 'agGridMaterialDatepicker',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this),
        cellClass: 'dateUK'
      },
      { field: 'entryDate', maxWidth: 150, type: 'abColDefDate', hide: true },
      { field: 'expectedPrice', width: 140,  cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
      },
      { field: 'maturityPrice', width: 136, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber' },
      { headerName: 'Spread Discount', width: 151, field: 'spreadDiscount', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
      },
      { field: 'positionPercent', width: 150, headerName: 'Position Percent', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
        editable: this.gridUtilSvc.isEditable.bind(this),
        cellStyle: this.gridUtilSvc.editableCellStyle.bind(this)
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
    
      { field: 'assetClass', width: 145 ,type: 'abColDefString'},
      { field: 'capStructureTranche', width: 145 ,type: 'abColDefString'},
      { field: 'securedUnsecured', width: 145 ,type: 'abColDefString'},
      { field: 'seniority', width: 145 ,type: 'abColDefString'},
      { field: 'IsChecked', width: 50, headerName: 'Checked', type: 'abColDefBoolean', checkboxSelection: true },
      { field: 'isOverride', width: 150, headerName: 'IsOverride', type: 'abColDefString' },
      { field: 'clear_override', width: 50, headerName: 'Override', type: 'abSpecialColumn' },
      { field: 'isVirtual', hide: true, type: 'abColDefBoolean' }
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      context: {
        componentParent: this.compReaderSvc.component
      },
      singleClickEdit: true,
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        filter: true
      },
      rowHeight: 30,
      groupHeaderHeight: 30,
      headerHeight: 30,
      
      rowGroupPanelShow: 'always',
      rowSelection: 'multiple',
      groupSelectsFiltered: true,
      groupSelectsChildren: true,
      suppressRowClickSelection: true,
      suppressAggFuncInHeader: true,
      enableGroupEdit: true,
      autoGroupColumnDef: {
        pinned: 'left',
        cellRendererParams: {
          suppressCount: true     // Disable row count on group
        }
      },
      components: {
        agGridMaterialDatepicker: AggridMaterialDatepickerComponent,
        autocompleteCellEditor: MatAutocompleteEditorComponent
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => 'Please apply the filter'
      },
      onFirstDataRendered:(event: FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      onCellValueChanged: this.gridUtilSvc.onCellValueChanged.bind(this.gridUtilSvc)
    }

    this.adaptableOptions = {
      filterOptions: CommonConfig.ADAPTABLE_FILTER_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'positionID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'IRR Calc - positions',
      adaptableStateKey: 'IRR Calc key',
      
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },
      userInterfaceOptions: {
        dateInputOptions: {
          dateFormat: 'dd/MM/yyyy',
          locale: 'en-GB'
        },
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[ 'maturityPrice','expectedPrice','floorRate','faceValueIssue','costPrice','mark','adjustedEBITDAatInv','ebitda','ltmRevenues','netLeverage','netLeverageAtInv','netLTV','netLTVatInv','revenueatInv','revenuePipeline','reportingEBITDA','reportingNetLeverage','unfundedMargin', 'floorRate']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('customDateFormat',['expectedDate', 'localExpectedDate', 'globalExpectedDate','maturityDate', 'localMaturityDate', 'globalMaturityDate'])
        ]
      },

      layoutOptions: {
        autoSaveLayouts: false
      },

      actionOptions: {
        actionColumns: 
        [{
            columnId: 'clear_override',
            friendlyName: ' ',
            includeGroupedRows: true,
            actionColumnSettings: {
              suppressMenu: true,
              suppressMovable: true,
              resizable: true
            },
            actionColumnButton: [
              {
                onClick: this.gridUtilSvc.clearOverrideActionColumn.bind(this.gridUtilSvc),
                hidden: this.gridUtilSvc.hideClearOverrideActionColumn.bind(this.gridUtilSvc),
                tooltip: 'Clear override',
                icon: {
                  src: '../assets/img/cancel.svg',
                  style: {
                    height: 25, width: 25
                  }
                }
              },
              {
                onClick: this.gridUtilSvc.applyOverrideActionColumn.bind(this.gridUtilSvc),
                hidden: this.gridUtilSvc.hideApplyOverrideActionColumn.bind(this.gridUtilSvc),
                tooltip: 'Apply override',
                icon: {
                  src: '../assets/img/redo.svg',
                  style: {
                    height: 25, width: 25
                  }
                }
              }
            ]
          }]
      },


      predefinedConfig: {  
        Dashboard: {
          Revision: 4,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 16,
          CurrentLayout: 'Manual',
          Layouts: [
          {
            Name: 'Manual',
            Columns: [
              'positionID',
              'fundHedging',
              'issuerShortName',
              'asset',
              'assetID',
              'assetTypeName',
              'fund',
              'ccy',
              'faceValueIssue',
              'costPrice',
              'mark',
              'maturityDate',
              'benchMarkIndex',
              'spread',
              'pikMargin',
              'unfundedMargin',
              'floorRate',
              'dealTypeCS',
              'dealType',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'positionPercent',
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
              'IsChecked',
              'isOverride',
              'clear_override'
            ],
            PinnedColumnsMap: {
              clear_override: 'right',
              IsChecked: 'right'
            },
            RowGroupedColumns: ['fund', 'issuerShortName']
          },
          {
            Name: 'Automatic',
            Columns: [
              'positionID',
              'fundHedging',
              'issuerShortName',
              'asset',
              'assetID',
              'assetTypeName',
              'fund',
              'ccy',
              'faceValueIssue',
              'costPrice',
              'mark',
              'maturityDate',
              'benchMarkIndex',
              'spread',
              'pikMargin',
              'unfundedMargin',
              'floorRate',
              'dealTypeCS',
              'dealType',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'positionPercent',
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
              'isOverride',
              'clear_override'
            ],
            PinnedColumnsMap: {
              clear_override: 'right'
            },
            RowGroupedColumns: ['fund', 'issuerShortName'],
          }]
        },
        FormatColumn:{
          Revision:11,
          FormatColumns:[
            CUSTOM_FORMATTER(['maturityPrice','expectedPrice','floorRate','faceValueIssue','costPrice','mark','adjustedEBITDAatInv','ebitda','ltmRevenues','netLeverage','netLeverageAtInv','netLTV','netLTVatInv','revenueatInv','revenuePipeline','reportingEBITDA','reportingNetLeverage','unfundedMargin', 'floorRate'],['amountFormatter']),
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
}
