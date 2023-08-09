import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo, CustomQueryVariableContext } from '@adaptabletools/adaptable-angular-aggrid';
import { CellClassParams, ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, ITooltipParams, Module, RowNode } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { getMomentDate, presistSharedEntities, loadSharedEntities, autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { SpreadBenchmarkIndex, YieldCurve } from 'src/app/shared/models/ValuationModel';
import { IPropertyReader, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { AggridMatCheckboxEditorComponent } from 'src/app/shared/modules/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.component';
import { ValuationGridService } from '../service/valuation-grid.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { GridCheckboxUtilService } from '../service/grid-checkbox-util.service';
import { DateRange } from '@angular/material/datepicker';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-valuation-grid',
  templateUrl: './valuation-grid.component.html',
  styleUrls: ['./valuation-grid.component.scss']
})
export class ValuationGridComponent implements OnInit, IPropertyReader, OnDestroy {

  @Output() valuationEventEmitter = new EventEmitter<number[]>();
  @Output() reviewingAssetsEmitter = new EventEmitter<any[]>();
  @Output() filteredMTMAssetsEmitter = new EventEmitter<number[]>();

  @Input() rowData;
  @Input() benchmarkIndexes: { [index: string]: SpreadBenchmarkIndex }
  @Input() yieldCurves: YieldCurve[]
  @Input() asOfDate: AsOfDateRange
  @Input() funds: string[]
  @Input() showLoadingOverlayReq: { show: 'Yes' | 'No' }
  @Input() clearEditingStateReq: { clear: 'Yes' | 'No' }
  @Input() getReviewingAssetsReq: { get: 'Yes' | 'No' }
  @Input() marktypes: string[]
  @Input() modelValuations
  @Input() reviewedAssets
  @Input() setAllAssetsForReviewReq: { set: 'Yes' | 'No' }
  @Input() getFilteredMTMAssetsReq: { get: 'Yes' | 'No' }

  @Input() noRowsToDisplayMsg:NoRowsCustomMessages 

  agGridModules: Module[]
  gridOptions: GridOptions;
  adaptableOptions: AdaptableOptions;
  adaptableApi: AdaptableApi;
  gridApi: GridApi;
  columnDefs: ColDef[]
  subscriptions: Subscription[] = []

  constructor(
    private dataSvc: DataService,
    private gridSvc: ValuationGridService,
    private gridCheckboxUtilSvc: GridCheckboxUtilService
  ) { 
    this.agGridModules = CommonConfig.AG_GRID_MODULES
    this.gridSvc.registerComponent(this);
    this.gridCheckboxUtilSvc.registerComponent(this);
  }

  /**
   * Implementing the visitor pattern to read component properties in the service.
      https://stackoverflow.com/a/56975850
   */
  readProperty<T>(prop: string): T {
    if(!this.hasOwnProperty(prop)){
      throw Error(`Property ${prop} does not exist`);
    }
    return this[prop];
  }

  ngOnChanges(changes: SimpleChanges){

    if(changes?.['showLoadingOverlayReq']?.currentValue?.show === 'Yes'){
      this.gridApi.showLoadingOverlay();
    }

    if(changes?.['clearEditingStateReq']?.currentValue?.clear === 'Yes'){
      this.gridSvc.clearEditingState(false);
    }

    if(changes?.['getReviewingAssetsReq']?.currentValue?.get === 'Yes'){
      this.emitReviewingAssets()
    }

    if(changes?.['modelValuations']?.currentValue){
      this.gridSvc.updateModelValuation(this.modelValuations)
    }

    if(changes?.['rowData']?.currentValue?.length > 0){
      this.gridSvc.clearEditingState(true)
    }

    if(changes?.['reviewedAssets']?.currentValue?.length > 0){
      this.gridSvc.updateGridOnReview(this.reviewedAssets)
    }

    if(changes?.['setAllAssetsForReviewReq']?.currentValue?.set === 'Yes'){
      this.gridSvc.setAllAssetsForReview();
    }

    if(changes?.['getFilteredMTMAssetsReq']?.currentValue?.get === 'Yes'){
      let assetIDs: number[] = this.gridSvc.getAllFilteredMTMAssets();
      this.filteredMTMAssetsEmitter.emit(assetIDs);
    }

    if(changes?.['benchmarkIndexes']?.currentValue){
      
    }
  }

  emitReviewingAssets(){
    if(this.gridSvc.lockEdit){
      this.dataSvc.setWarningMsg(`Cannot review while editing`, `Dismiss`, `ark-theme-snackbar-warning`)
      return;
    }

    let r = [];
    this.gridApi.forEachNodeAfterFilter((node) => r.push(node.data));

    r = r.filter(row => row['showIsReviewed'] !== 1 && row['review'] === true) 

    let reviewingAssets:{ 
      assetID: number, markType: string, overrideDate: Date /*YYYY-MM-DD */ 
    }[] = r.map(row => { 
      return { assetID: row['assetID'], markType: row['markType'], overrideDate: getMomentDate(row['overrideDate']) }
    })

    this.reviewingAssetsEmitter.emit(reviewingAssets)
  }

  ngOnInit(): void {

    this.columnDefs = [
      { field: 'issuer', type: 'abColDefString', hide: true },
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'assetCcy', type: 'abColDefString', hide: true },
      { field: 'currentWSOMark', type: 'abColDefNumber' },
      { field: 'assetID', type: 'abColDefNumber', hide: true },
      { field: 'currentWSOMark', type: 'abColDefNumber', width: 175 },
      // { field: 'dateTo', type: 'abColDefDate' },
      { field: 'previousWSOMark', type: 'abColDefNumber', width: 175 },
      // { field: 'dateFrom', type: 'abColDefDate' },
      { field: 'override', type: 'abColDefNumber', cellStyle: this.gridSvc.editableCellStyle.bind(this), onCellValueChanged: this.gridSvc.onOverrideCellValueChanged.bind(this.gridSvc), editable: this.gridSvc.isEditable.bind(this.gridSvc), width: 120 },
      { field: 'calculatedWSOMark', type: 'abColDefNumber', width: 195 },
      { field: 'overrideDate', type: 'abColDefDate', width: 150 },
      { field: 'markType', type: 'abColDefString', width: 140 },
      { field: 'yieldCurve', type: 'abColDefString', cellEditor: 'yieldCurveAutocompleteCellEditor',
        cellEditorParams: () => {
          return {
            options: [...new Set(this.yieldCurves.map(yc => yc.name))], isStrict: true, oldValRestoreOnStrict: true
          }
        },
        editable: this.gridSvc.isEditable.bind(this.gridSvc),
        cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc),
        onCellValueChanged: this.gridSvc.onYieldCurveValueChanged.bind(this.gridSvc)
      },
      { field: 'initialYCYield', type: 'abColDefNumber', 
        headerName: 'Initial YC Yield',      
        cellStyle: this.gridSvc.editableCellStyle.bind(this), 
        editable: this.gridSvc.isEditable.bind(this.gridSvc), 
        onCellValueChanged: this.gridSvc.onInitialYCYieldValueChanged.bind(this.gridSvc)
      },
      { field: 'currentYCYield', type: 'abColDefNumber', headerName: 'Current YC Yield' },

      { field: 'spreadBenchmarkIndex', type: 'abColDefString', cellEditor: 'autocompleteCellEditor',    
        cellEditorParams: () => {
          return {
            options: [...new Set(Object.keys(this.benchmarkIndexes))], isStrict: true, oldValRestoreOnStrict: true
          }
        },
        onCellValueChanged: this.gridSvc.onIndexCellValueChanged.bind(this.gridSvc),
        editable: this.gridSvc.isEditable.bind(this.gridSvc), cellEditorPopup: false ,
        cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc), headerName: 'Benchmark Spread Index' },
      { field: 'initialBenchmarkYield', type: 'abColDefNumber', 
        cellStyle: this.gridSvc.editableCellStyle.bind(this), 
        editable: this.gridSvc.isEditable.bind(this.gridSvc),
        onCellValueChanged: this.gridSvc.onInitialBenchmarkYieldValueChanged.bind(this.gridSvc)
      },
      { field: 'currentBenchmarkYield', type: 'abColDefNumber' },
      { field: 'initialSpread', type: 'abColDefNumber' },
      { field: 'currentSpread', type: 'abColDefNumber' },
      { field: 'benchmarkIndexPrice', type: 'abColDefNumber', hide: true },
      { field: 'deltaSpreadDiscount', type: 'abColDefNumber', 
        cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc), 
        editable: this.gridSvc.isEditable.bind(this.gridSvc), 
        onCellValueChanged: this.gridSvc.onDeltaSpreadDiscountCellValueChanged.bind(this.gridSvc) },
      { field: 'effectiveDate', type: 'abColDefDate', headerName: 'Effective Date' },
      { field: 'modelValuation', type: 'abColDefNumber' },
      { field: 'modelValuationMinus100', type: 'abColDefNumber', headerName: 'Valuation-100bps' },
      { field: 'modelValuationPlus100', type: 'abColDefNumber', headerName: 'Valuation+100bps' },
      { field: 'isModelValuationStale', type: 'abColDefBoolean' },
      { field: 'usedSpreadDiscount', type: 'abColDefNumber' },
      { field: 'faceValueIssue', type: 'abColDefNumber', headerName: 'Face Value Issue/Qty' },
      { field: 'faceValueIssueFunded', type: 'abColDefNumber', headerName: 'Face Value Issue Funded/Qty' },
      { field: 'mark', type: 'abColDefNumber', hide: true },
      { field: 'costPrice', type: 'abColDefNumber', hide: true },
      { field: 'comment', type: 'abColDefString' },
      { field: 'positionsCount', type: 'abColDefNumber', 
        onCellClicked: this.gridSvc.onPositionsCountClicked.bind(this.gridSvc),
        cellStyle: (params: CellClassParams) => {
          if(!!params.value){
            return { color: '#0590ca' }
          }
          return null;
        },
        tooltipValueGetter: (params: ITooltipParams) => {
          if(!!params.value){
            return `Click here to check all underlying positions`;
          }
          return null;
        }
      },
      { field: 'assetTypeName', type: 'abColDefString', hide: true, headerName: 'WSO Asset Type Name' },
      { field: 'expectedDate', type: 'abColDefDate' },
      { field: 'seniority', type: 'abColDefNumber' },
      // { field: 'wsoStatus', type: 'abColDefString', hide: true },
      // { field: 'showIsReviewed', type: 'abColDefNumber', hide: true },
      { field: 'reviewedBy', type: 'abColDefString', hide: true },
      { field: 'reviewedOn', type: 'abColDefDate', hide: true },
      { field: 'modifiedBy', type: 'abColDefString', hide: true },
      { field: 'modifiedOn', type: 'abColDefDate', hide: true },
      { field: 'useModelValuation', type: 'abColDefBoolean', cellRenderer: 'useModelValuationCheckbox', lockPinned: true, 
        maxWidth: 180,
        cellRendererParams: () => { return this.gridCheckboxUtilSvc.getUseModelValuationCellRendererParams() }
      },
      { field: 'forceOverride', type: 'abColDefBoolean', cellRenderer: 'forceOverrideCheckbox', lockPinned: true, maxWidth: 180,
        cellRendererParams: () => { return this.gridCheckboxUtilSvc.getForceOverrideCellRendererParams() }
      },
      { field: 'review', type: 'abColDefBoolean', cellRenderer: 'aggridMatCheckboxCellEditor', lockPinned: true, maxWidth: 100,
        cellRendererParams: () => { return this.gridCheckboxUtilSvc.getReviewCellRendererParams() }
      },
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      headerHeight: 30,
      rowHeight: 30,
      singleClickEdit: true,
      stopEditingWhenCellsLoseFocus: false,
      rowGroupPanelShow: 'always',
      onGridReady: (p: GridReadyEvent) => {
        this.gridApi = p.api;
        this.gridApi.showNoRowsOverlay();
      },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        rowGroup: false,
        enableRowGroup: true,
        enableValue: true
      },
      components: {
        'autocompleteCellEditor': MatAutocompleteEditorComponent,
        'yieldCurveAutocompleteCellEditor': MatAutocompleteEditorComponent,
        'aggridMatCheckboxCellEditor': AggridMatCheckboxEditorComponent,
        'useModelValuationCheckbox': AggridMatCheckboxEditorComponent,
        'forceOverrideCheckbox': AggridMatCheckboxEditorComponent
      },
      noRowsOverlayComponent:NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'ValuationId',
      adaptableStateKey: 'Valuation State Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      actionOptions: {
        actionColumns: [
          {
            columnId: 'action',
            friendlyName: ' ',
            includeGroupedRows: false,
            actionColumnSettings: {
              suppressMenu: true,
              suppressMovable: true,
              resizable: true
            },
            actionColumnButton: [
              {
                onClick: this.gridSvc.editActionColumn.bind(this.gridSvc),
                hidden: this.gridSvc.hideEditActionColumn.bind(this.gridSvc),
                icon: {
                  src: '../../assets/img/edit.svg', style: { height: 25, width: 25 }
                },
                tooltip: 'Edit'
              },
              {
                onClick: this.gridSvc.saveActionColumn.bind(this.gridSvc),
                hidden: this.gridSvc.hideSaveActionColumn.bind(this.gridSvc),
                icon: {
                  src: '../../assets/img/save_black_24dp.svg', style: { height: 25, width: 25 }
                },
                tooltip: 'Save'
              },
              {
                onClick: this.gridSvc.cancelActionColumn.bind(this.gridSvc),
                hidden: this.gridSvc.hideCancelActionColumn.bind(this.gridSvc),
                icon: {
                  src: '../../assets/img/cancel.svg', style: { height: 25, width: 25 }
                },
                tooltip: 'Cancel'
              },
              {
                onClick: this.gridSvc.infoActionColumn.bind(this.gridSvc),
                hidden: this.gridSvc.hideInfoActionColumn.bind(this.gridSvc),
                icon: {
                  src: '../../assets/img/info.svg', style: { height: 25, width: 25 }
                },
                tooltip: 'Audit Log'
              },
              {
                onClick: this.gridSvc.runActionColumn.bind(this.gridSvc),
                hidden: this.gridSvc.hideRunActionColumn.bind(this.gridSvc),
                icon: {
                  src: '../../assets/img/trigger.svg', style: { height: 25, width: 25 }
                },
                tooltip: 'Run'
              }
            ]
          }
        ]
      },
      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', ['faceValueIssue','faceValueIssueFunded', 'mark', 'costPrice', 
           'initialYCYield','currentYCYield','initialBenchmarkYield', 'currentBenchmarkYield','initialSpread','currentSpread', 'deltaSpreadDiscount', 'usedSpreadDiscount', 'marketValueIssue', 'marketValueIssueFunded', 'currentMarketValueIssue', 'previousMarketValueIssue', 'currentMarketValueIssueFunded', 'previousMarketValueIssueFunded', 'benchmarkIndexPrice']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat', ['override', 'currentWSOMark', 'previousWSOMark', 'calculatedWSOMark']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nullableDateFormatter', ['overrideDate', 'expectedDate', 'effectiveDate'])

        ],
      },
      adaptableQLOptions: {
        expressionOptions: {
          customQueryVariables: {
            // Adding markOverride variable to set 0 as null for coalesce used below
            markOverride: (context: CustomQueryVariableContext) => {


              const mark: any = context?.args[0];
              if (mark === 0) {
                return null;
              } else{
                return mark
              }
            },
          },
        },
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 1,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout', Toolbars: ['Layout']
          }],
          IsHidden: false, DashboardTitle: ' '
        },
        Layout: {
          CurrentLayout: 'Valuation',
          Revision: 31,
          Layouts: [
            {
              Name: 'Valuation',
              Columns: [ ...this.columnDefs.filter(c => !c.hide).map(c => c.field), 'action', 'marketValueIssue', 'marketValueIssueFunded','currentMarketValueIssueFunded', 'previousMarketValueIssueFunded' ],
              PinnedColumnsMap: {
                'useModelValuation': 'right',
                'forceOverride': 'right',
                'review': 'right',
                'action': 'right'
              },
              ColumnWidthMap: {
                action: 5
              },
            },
            {
              Name: 'Manual Mark',
              Columns: [ ...this.columnDefs.filter(c => !c.hide)
                .filter(c => !['yieldCurve','initialYCYield','currentYCYield','spreadBenchmarkIndex','initialBenchmarkYield','currentBenchmarkYield','initialSpread','currentSpread','benchmarkIndexPrice','effectiveDate', 'deltaSpreadDiscount', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100', 'isModelValuationStale', 'usedSpreadDiscount'].includes(c.field)).map(c => c.field), 'action', 'marketValueIssue', 'marketValueIssueFunded','currentMarketValueIssueFunded', 'previousMarketValueIssueFunded' ],
              PinnedColumnsMap: {
                'useModelValuation': 'right',
                'forceOverride': 'right',
                'review': 'right',
                'action': 'right'
              },
              ColumnWidthMap: {
                action: 5
              },
            },
          ]
        },
        FormatColumn: {
          Revision: 46,
          FormatColumns: [
            {
              Scope: { ColumnIds: [ ...this.columnDefs.map(def => def.field), 'marketValueIssue', 'marketValueIssueFunded','currentMarketValueIssue', 'previousMarketValueIssue', 'currentMarketValueIssueFunded', 'previousMarketValueIssueFunded'] },
              Style: { BackColor: 'pink' },
              Rule: { BooleanExpression: `COALESCE([comment],"" ) != ""` }
            },
            BLANK_DATETIME_FORMATTER_CONFIG(['overrideDate', 'expectedDate', 'modifiedOn', 'reviewedOn', 'effectiveDate']), //'dateTo', 'dateFrom'
            DATE_FORMATTER_CONFIG_ddMMyyyy(['overrideDate', 'expectedDate', 'effectiveDate']), //'dateTo', 'dateFrom'
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn', 'reviewedOn']),
            AMOUNT_FORMATTER_CONFIG_Zero(['override','calculatedWSOMark', 'currentWSOMark', 'previousWSOMark'], 2, ['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['currentWSOMark', 'previousWSOMark', 'override','calculatedWSOMark', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100'], 4),
            CUSTOM_FORMATTER(['faceValueIssue','faceValueIssueFunded', 'mark', 'costPrice', 
            'benchmarkIndexPrice', 'initialYCYield', 'currentYCYield', 'initialSpread', 'initialBenchmarkYield', 'currentBenchmarkYield', 'currentSpread',   'deltaSpreadDiscount', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100', 'usedSpreadDiscount', 'marketValueIssue', 'marketValueIssueFunded', 'currentMarketValueIssue', 'previousMarketValueIssue', 'currentMarketValueIssueFunded', 'previousMarketValueIssueFunded'], 'amountFormatter')
          ]
        },
        CalculatedColumn: {
          Revision: 30,
          CalculatedColumns: [
            {
              FriendlyName: 'Market Value Issue',
              ColumnId: 'marketValueIssue',
              Query: {
                ScalarExpression: ` CASE WHEN [assetTypeName] = 'Equity' THEN [faceValueIssue] * [override]  WHEN [assetTypeName] IN ('Loan', 'Bond')   THEN [faceValueIssue] * [override] / 100.0 ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true, Resizable: true
              }
            },
            {
              FriendlyName: 'Market Value Issue Funded',
              ColumnId: 'marketValueIssueFunded',
              Query: {
                ScalarExpression: ` CASE WHEN [assetTypeName] = 'Equity' THEN [faceValueIssueFunded] * [override]  WHEN [assetTypeName] IN ('Loan', 'Bond')   THEN [faceValueIssueFunded] * [override] / 100.0 ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true, Resizable: true
              }
            },
            {
              FriendlyName: 'Curr Market Value Issue',
              ColumnId: 'currentMarketValueIssue',
              Query: {
                ScalarExpression: `CASE WHEN COALESCE([faceValueIssueFunded], 0.0) = 0.0 THEN 0 WHEN [assetTypeName] = 'Equity' THEN [currentWSOMark]*[faceValueIssue] WHEN [assetTypeName] IN ('Loan', 'Bond') THEN (([currentWSOMark]*[faceValueIssue]-100*([faceValueIssue]-[faceValueIssueFunded]))/[faceValueIssueFunded])*([faceValueIssue]/100.0) ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true, Resizable: true
              }
            },
            {
              FriendlyName: 'Curr Market Value Issue Funded',
              ColumnId: 'currentMarketValueIssueFunded',
              Query: {
                ScalarExpression:  `CASE WHEN COALESCE([faceValueIssueFunded], 0.0) = 0.0 THEN 0 WHEN [assetTypeName] = 'Equity' THEN [currentWSOMark]*[faceValueIssueFunded] WHEN [assetTypeName] IN ('Loan', 'Bond') THEN (([currentWSOMark]*[faceValueIssue]-100*([faceValueIssue]-[faceValueIssueFunded]))/[faceValueIssueFunded])*([faceValueIssueFunded]/100.0) ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true, Resizable: true
              }
            },
            {
              FriendlyName: 'Prev Market Value Issue',
              ColumnId: 'previousMarketValueIssue',
              Query: {
                ScalarExpression: `CASE WHEN COALESCE([faceValueIssueFunded], 0.0) = 0.0 THEN 0 WHEN [assetTypeName] = 'Equity' THEN [previousWSOMark]*[faceValueIssue] WHEN [assetTypeName] IN ('Loan', 'Bond') THEN (([previousWSOMark]*[faceValueIssue]-100*([faceValueIssue]-[faceValueIssueFunded]))/[faceValueIssueFunded])*([faceValueIssue]/100.0) ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true, Resizable: true
              }
            },
            {
              FriendlyName: 'Prev Market Value Issue Funded',
              ColumnId: 'previousMarketValueIssueFunded',
              Query: {
                ScalarExpression: `CASE WHEN COALESCE([faceValueIssueFunded], 0.0) = 0.0 THEN 0 WHEN [assetTypeName] = 'Equity' THEN [previousWSOMark]*[faceValueIssueFunded] WHEN [assetTypeName] IN ('Loan', 'Bond') THEN (([previousWSOMark]*[faceValueIssue]-100*([faceValueIssue]-[faceValueIssueFunded]))/[faceValueIssueFunded])*([faceValueIssueFunded]/100.0) ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true, Resizable: true
              }
            }
          ]
        }
      }
    }
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }: AdaptableReadyInfo) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.columnApi.autosizeAllColumns()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}