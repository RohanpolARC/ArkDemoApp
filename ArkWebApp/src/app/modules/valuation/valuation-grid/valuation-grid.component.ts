import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo, CustomQueryVariableContext } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, Module } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { getMomentDate, getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { YieldCurve } from 'src/app/shared/models/ValuationModel';
import { AggridMatCheckboxEditorComponent } from 'src/app/shared/modules/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.component';
import { ValuationGridService } from '../service/valuation-grid.service';

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
  @Input() benchmarkIndexes: { [index: string]: any }
  @Input() yieldCurves: YieldCurve[]
  @Input() asOfDate: string
  @Input() showLoadingOverlayReq: { show: 'Yes' | 'No' }
  @Input() clearEditingStateReq: { clear: 'Yes' | 'No' }
  @Input() getReviewingAssetsReq: { get: 'Yes' | 'No' }
  @Input() marktypes: string[]
  @Input() modelValuations
  @Input() reviewedAssets
  @Input() setAllAssetsForReviewReq: { set: 'Yes' | 'No' }
  @Input() getFilteredMTMAssetsReq: { get: 'Yes' | 'No' }

  agGridModules: Module[]
  gridOptions: GridOptions;
  adaptableOptions: AdaptableOptions;
  adaptableApi: AdaptableApi;
  gridApi: GridApi;
  columnDefs: ColDef[]
  subscriptions: Subscription[] = []

  constructor(
    private dataSvc: DataService,
    private gridSvc: ValuationGridService
  ) { 
    this.agGridModules = CommonConfig.AG_GRID_MODULES
    this.gridSvc.registerComponent(this);
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
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'assetID', type: 'abColDefNumber' },
      { field: 'assetCcy', type: 'abColDefString', hide: true },
      { field: 'currentWSOMark', type: 'abColDefNumber' },
      // { field: 'dateTo', type: 'abColDefDate' },
      { field: 'previousWSOMark', type: 'abColDefNumber' },
      // { field: 'dateFrom', type: 'abColDefDate' },
      { field: 'override', type: 'abColDefNumber', cellStyle: this.gridSvc.editableCellStyle.bind(this), onCellValueChanged: this.gridSvc.onOverrideCellValueChanged.bind(this.gridSvc), editable: this.gridSvc.isEditable.bind(this.gridSvc) },
      { field: 'overrideDate', type: 'abColDefDate' },
      { field: 'markType', type: 'abColDefString' },
      { field: 'yieldCurve', type: 'abColDefString', cellEditor: 'yieldCurveAutocompleteCellEditor',
        cellEditorParams: () => {
          return {
            options: [...new Set(this.yieldCurves.map(yc => yc.name))], isStrict: true, oldValRestoreOnStrict: true
          }
        },
        editable: this.gridSvc.isEditable.bind(this.gridSvc),
        cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc)
      },
      { field: 'initialYCYield', type: 'abColDefNumber', headerName: 'Initial YC Yield' },
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
      { field: 'initialBenchmarkYield', type: 'abColDefNumber' },
      { field: 'currentBenchmarkYield', type: 'abColDefNumber' },
      { field: 'initialSpread', type: 'abColDefNumber' },
      { field: 'currentSpread', type: 'abColDefNumber' },
      { field: 'benchmarkIndexPrice', type: 'abColDefNumber', hide: true },
      // { field: 'benchmarkIndexYield', type: 'abColDefNumber' },
      // { field: 'currentBenchmarkSpread', type: 'abColDefNumber', headerName: 'Current Benchmark Spread' },
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
      { field: 'faceValueIssue', type: 'abColDefNumber', hide: true },
      { field: 'mark', type: 'abColDefNumber', hide: true },
      { field: 'costPrice', type: 'abColDefNumber', hide: true },
      { field: 'comment', type: 'abColDefString', hide: true },
      { field: 'positionsCount', type: 'abColDefNumber', hide: true },
      { field: 'assetTypeName', type: 'abColDefString', hide: true, headerName: 'WSO Asset Type Name' },
      { field: 'expectedDate', type: 'abColDefDate' },
      { field: 'seniority', type: 'abColDefNumber' },
      // { field: 'wsoStatus', type: 'abColDefString', hide: true },
      // { field: 'showIsReviewed', type: 'abColDefNumber', hide: true },
      { field: 'reviewedBy', type: 'abColDefString', hide: true },
      { field: 'reviewedOn', type: 'abColDefDate', hide: true },
      { field: 'modifiedBy', type: 'abColDefString', hide: true },
      { field: 'modifiedOn', type: 'abColDefDate', hide: true },
      { field: 'useModelValuation', type: 'abColDefBoolean', cellRenderer: 'useModelValuationCheckbox', lockPinned: true, maxWidth: 180,
        cellRendererParams: () => {
          return {
            showCheckbox: (params: ICellRendererParams) => { return !!params.data?.['modelValuation'] },
            disableCheckbox: (params: ICellRendererParams) => { return !this.gridSvc.isEditing(params.node); },
            checkboxChanged: (params: ICellRendererParams, boolVal: boolean) => {
              if(boolVal){
                params.data['oldOverride'] = params.data?.['override'];
                params.data['override'] = params.data?.['modelValuation'];
                params.data['oldShowIsReviewed'] = params.data?.['showIsReviewed'];
                params.data['showIsReviewed'] = 0;
              }
              else{
                params.data['override'] = params.data?.['oldOverride'];
                params.data['showIsReviewed'] = params.data['oldShowIsReviewed']; // need to reset it to the original value if useModelValuation was mistakenly ticked previously and now is being reverted back.
              }
              this.adaptableApi.gridApi.refreshCells([params.node], this.columnDefs.map(col => col.field))
            },
            defaultVal: (params: ICellRendererParams) => { return params.value }
          }
        }
      },
      { field: 'review', type: 'abColDefBoolean', cellRenderer: 'aggridMatCheckboxCellEditor', lockPinned: true, maxWidth: 100,
        cellRendererParams: () => {
          return {
            showCheckbox: (params: ICellRendererParams) => { return !(params.data?.['showIsReviewed'] === -1) },
            disableCheckbox: (params: ICellRendererParams) => { return this.gridSvc.isEditing(params.node) || params.data?.['showIsReviewed'] === 1 },
            checkboxChanged: (params: ICellRendererParams, boolVal: boolean) => { 
            },
            defaultVal: (params: ICellRendererParams) => { 
              if(params.data?.['showIsReviewed'] === 1)
                return true;
              
              else if(params.data?.['review'] && params.data?.['showIsReviewed'] === 0)
                return true;  
              return false;
            }
          }
        }
      },
    ]

    this.gridOptions = {
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
        this.gridApi.hideOverlay();
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
        'useModelValuationCheckbox': AggridMatCheckboxEditorComponent
      }
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
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
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
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', ['faceValueIssue', 'mark', 'costPrice', 
           'benchmarkIndexYield', 'currentBenchmarkSpread', 'deltaSpreadDiscount', 'usedSpreadDiscount', 'marketValue', 'currentMarketValue', 'previousMarketValue', 'benchmarkIndexPrice']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat', ['override', 'currentWSOMark', 'previousWSOMark']),

        ],
      },
      adaptableQLOptions: {
        expressionOptions: {
          customQueryVariables: {
            // Adding markOverride variable to set 0 as null for coalesce used below
            markOverride: (context: CustomQueryVariableContext) => {


              const override: any = context?.args[0];
              if (override === 0) {
                return null;
              } else{
                return override
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
          CurrentLayout: 'Basic Layout',
          Revision: 25,
          Layouts: [
            {
              Name: 'Basic Layout',
              Columns: [ ...this.columnDefs.filter(c => !c.hide).map(c => c.field), 'action' ],
              PinnedColumnsMap: {
                'useModelValuation': 'right',
                'review': 'right',
                'action': 'right'
              },
              ColumnWidthMap: {
                action: 5
              },
            }
          ]
        },
        FormatColumn: {
          Revision: 29,
          FormatColumns: [
            {
              Scope: { ColumnIds: [ ...this.columnDefs.map(def => def.field), 'marketValue', 'currentMarketValue', 'previousMarketValue'] },
              Style: { BackColor: 'pink' },
              Rule: { BooleanExpression: `COALESCE([comment],"" ) != ""` }
            },
            BLANK_DATETIME_FORMATTER_CONFIG(['overrideDate', 'expectedDate', 'modifiedOn', 'reviewedOn', 'effectiveDate']), //'dateTo', 'dateFrom'
            DATE_FORMATTER_CONFIG_ddMMyyyy(['overrideDate', 'expectedDate', 'effectiveDate']), //'dateTo', 'dateFrom'
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn', 'reviewedOn']),
            AMOUNT_FORMATTER_CONFIG_Zero(['override', 'currentWSOMark', 'previousWSOMark'], 2, ['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['currentWSOMark', 'previousWSOMark', 'override', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100'], 4),
            CUSTOM_FORMATTER(['faceValueIssue', 'mark', 'costPrice', 
            'benchmarkIndexPrice', 'benchmarkIndexYield', 'currentBenchmarkSpread', 'deltaSpreadDiscount', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100', 'usedSpreadDiscount', 'marketValue', 'currentMarketValue', 'previousMarketValue'], 'amountFormatter')
          ]
        },
        CalculatedColumn: {
          Revision: 15,
          CalculatedColumns: [
            {
              FriendlyName: 'Market Value',
              ColumnId: 'marketValue',
              Query: {
                ScalarExpression: ` CASE WHEN [assetTypeName] = 'Equity' THEN [faceValueIssue] * COALESCE(VAR('markOverride',[override]), [currentWSOMark])  WHEN [assetTypeName] IN ('Loan', 'Bond')   THEN [faceValueIssue] * COALESCE(VAR('markOverride',[override]), [currentWSOMark]) / 100.0 ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true
              }
            },
            {
              FriendlyName: 'Current Market Value',
              ColumnId: 'currentMarketValue',
              Query: {
                ScalarExpression: `CASE WHEN [assetTypeName] = 'Equity' THEN [faceValueIssue] * COALESCE([currentWSOMark], 0.0) WHEN [assetTypeName] IN ('Loan', 'Bond') THEN [faceValueIssue] * COALESCE([currentWSOMark], 0.0) / 100.0 ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true
              }
            },
            {
              FriendlyName: 'Previous Market Value',
              ColumnId: 'previousMarketValue',
              Query: {
                ScalarExpression: `CASE WHEN [assetTypeName] = 'Equity' THEN [faceValueIssue] * COALESCE([previousWSOMark], 0.0) WHEN [assetTypeName] IN ('Loan', 'Bond') THEN [faceValueIssue] * COALESCE([previousWSOMark], 0.0) / 100.0 ELSE 0 END`
              },
              CalculatedColumnSettings: {
                DataType: 'Number', Groupable: true, Sortable: true, ShowToolTip: true, Aggregatable: true
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}