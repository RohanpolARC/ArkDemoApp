import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { ValuationGridService } from '../service/valuation-grid.service';

@Component({
  selector: 'app-valuation-grid',
  templateUrl: './valuation-grid.component.html',
  styleUrls: ['./valuation-grid.component.scss']
})
export class ValuationGridComponent implements OnInit, IPropertyReader, OnDestroy {

  @Output() valuationEventEmitter = new EventEmitter<number[]>();

  @Input() rowData;
  @Input() benchmarkIndexes: string[]
  @Input() asOfDate: string
  @Input() showLoadingOverlayReq: { show: 'Yes' | 'No' }
  @Input() clearEditingStateReq: { clear: 'Yes' | 'No' }
  @Input() marktypes: string[]
  @Input() modelValuations

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

    if(changes?.['modelValuations']?.currentValue){
      this.gridSvc.updateModelValuation(this.modelValuations)
    }

    if(changes?.['rowData']?.currentValue?.length > 0){
      this.gridSvc.clearEditingState(true)
    }
  }

  ngOnInit(): void {

    this.columnDefs = [
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'assetID', type: 'abColDefNumber' },
      { field: 'currentWSOMark', type: 'abColDefNumber' },
      // { field: 'dateTo', type: 'abColDefDate' },
      { field: 'previousWSOMark', type: 'abColDefNumber' },
      // { field: 'dateFrom', type: 'abColDefDate' },
      { field: 'override', type: 'abColDefNumber', cellStyle: this.gridSvc.editableCellStyle.bind(this), onCellValueChanged: this.gridSvc.onOverrideCellValueChanged.bind(this.gridSvc), editable: this.gridSvc.isEditable.bind(this.gridSvc) },
      { field: 'overrideDate', type: 'abColDefDate' },
      { field: 'markType', type: 'abColDefString' },
      { field: 'initialYieldCurveSpread', type: 'abColDefNumber', editable: this.gridSvc.isEditable.bind(this.gridSvc), cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc)  },
      { field: 'initialCreditSpread', type: 'abColDefNumber', editable: this.gridSvc.isEditable.bind(this.gridSvc), cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc), headerName: 'Initial Benchmark Spread' },
      { field: 'creditSpreadIndex', type: 'abColDefString', cellEditor: 'autocompleteCellEditor', cellEditorParams: () => {
        return {
          options: this.benchmarkIndexes, isStrict: true, oldValRestoreOnStrict: true
        }
      }, editable: this.gridSvc.isEditable.bind(this.gridSvc), cellEditorPopup: false , cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc), headerName: 'Benchmark Spread Index' },
      { field: 'currentYieldCurveSpread', type: 'abColDefNumber' },
      { field: 'currentCreditSpread', type: 'abColDefNumber', headerName: 'Current Benchmark Spread' },
      { field: 'deltaSpreadDiscount', type: 'abColDefNumber', cellStyle: this.gridSvc.editableCellStyle.bind(this.gridSvc), editable: this.gridSvc.isEditable.bind(this.gridSvc) },
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
      { field: 'assetTypeName', type: 'abColDefString', hide: true },
      // { field: 'modifiedBy', type: 'abColDefString' },
      // { field: 'modifiedOn', type: 'abColDefDate' }
      { field: 'marketValue', type: 'abColDefNumber', valueGetter: this.gridSvc.marketValueGetter }
    ]

    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      headerHeight: 30,
      rowHeight: 30,
      singleClickEdit: true,
      stopEditingWhenCellsLoseFocus: false,
      rowGroupPanelShow: 'never',
      onGridReady: (p: GridReadyEvent) => {
        this.gridApi = p.api;
        this.gridApi.hideOverlay();
      },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        rowGroup: false,
        enableRowGroup: false,
        enableValue: false
      },
      components: {
        'autocompleteCellEditor': MatAutocompleteEditorComponent
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
          'initialYieldCurveSpread', 'initialCreditSpread', 'currentYieldCurveSpread', 'currentCreditSpread', 'deltaSpreadDiscount', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100', 'usedSpreadDiscount', 'marketValue']),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat', ['override', 'currentWSOMark', 'previousWSOMark']),

        ],
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
          Revision: 17,
          Layouts: [
            {
              Name: 'Basic Layout',
              Columns: [ ...this.columnDefs.filter(c => !c.hide).map(c => c.field), 'action' ],
              PinnedColumnsMap: {
                'action': 'right'
              },
              ColumnWidthMap: {
                action: 5
              },
            }
          ]
        },
        FormatColumn: {
          Revision: 16,
          FormatColumns: [
            BLANK_DATETIME_FORMATTER_CONFIG(['overrideDate']), //'dateTo', 'dateFrom'
            DATE_FORMATTER_CONFIG_ddMMyyyy(['overrideDate']), //'dateTo', 'dateFrom'
            AMOUNT_FORMATTER_CONFIG_Zero(['override', 'currentWSOMark', 'previousWSOMark'], 2, ['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['override', 'currentWSOMark', 'previousWSOMark'], 10),
            CUSTOM_FORMATTER(['faceValueIssue', 'mark', 'costPrice', 
            'initialYieldCurveSpread', 'initialCreditSpread', 'currentYieldCurveSpread', 'currentCreditSpread', 'deltaSpreadDiscount', 'modelValuation', 'modelValuationMinus100', 'modelValuationPlus100', 'usedSpreadDiscount', 'marketValue'], 'amountFormatter')
          ]
        },
        // CalculatedColumn: {
        //   CalculatedColumns: [
        //     {
        //       FriendlyName: 'MarketValue',
        //       ColumnId: 'MarketValue',
        //       Query: {
        //         ScalarExpression: `[currentWSOMark] + [previousWSOMark] `
        //         // ScalarExpression: `
        //         //   CASE WHEN [assetTypeName] = 'Equity' THEN [faceValueIssue] * COALESCE([override], [currentWSOMark])
        //         //        WHEN [assetTypeName] IN ('Loan', 'Bond')   THEN [faceValueIssue] * COALESCE([override], [currentWSOMark]) / 100.0
        //         //        ELSE 0
        //         //   END
        //         // `
        //       },
        //       CalculatedColumnSettings: {
        //         DataType: 'Number'
        //       }
        //     }
        //   ]
        // }
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