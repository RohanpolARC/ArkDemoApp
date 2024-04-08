import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, Module, ColDef, GridReadyEvent, GridApi, CellClickedEvent } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { NetReturnsService } from 'src/app/core/services/NetReturns/net-returns.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { DetailedView, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';

@Component({
  selector: 'app-net-returns-cashflows',
  templateUrl: './net-returns-cashflows.component.html',
  styleUrls: ['./net-returns-cashflows.component.scss']
})
export class NetReturnsCashflowsComponent implements OnInit {

  @Input() cashflows: any[]
  @Input() cashflowCount: number
  @Input() fundHedging: string
  @Input() asOfDate: string

  filterApply$: Observable<boolean> = this.dataSvc.filterApplyBtnState.pipe(
    tap((isHit: boolean) => {
      if(isHit){
        this.noRowsToDisplayMsg='No data found for applied filter.'
        this.gridApi?.showLoadingOverlay();
      }
    })
  )

  agGridModules: Module[]
  columnDefs: ColDef[]
  gridOptions: GridOptions
  gridApi: GridApi
  adaptableOptions: AdaptableOptions

  subscriptions: Subscription[] = []
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  constructor(
    private dataSvc: DataService,
    public netReturnsSvc: NetReturnsService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.agGridModules = CommonConfig.AG_GRID_MODULES

    this.columnDefs = <ColDef[]>[
      { field: 'category', type: 'abColDefString',sortable:false},
      { field: 'valueDate', type: 'abColDefDate' },
      { field: 'amount', type: 'abColDefNumber', 
        onCellClicked: this.onAmountClicked.bind(this), 
        cellStyle: this.clickableAmountStyle,
        tooltipValueGetter: this.amountTooltipGetter
      },
      { field: 'capitalSubType', type: 'abColDefString' },
      { field: 'capitalType', type: 'abColDefString' },
      { field: 'narrative', type: 'abColDefString', tooltipField: 'narrative' },
      //{ field: 'groupingRank', sort: 'desc' as 'desc'}
    ].map((x: ColDef) => { x.type = x.type ?? 'abColDefNumber'; x.width = 175; return x; })

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      rowGroupPanelShow: 'always',
      tooltipShowDelay: 0,
      defaultColDef: {
        resizable: true,
        filter: true,
        sortable: true,
        enableValue: true,
        enableRowGroup: true
      },
      headerHeight: 30,
      rowHeight: 30,
      groupHeaderHeight: 30,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      }
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Net Returns Cashflows',
      adaptableStateKey: 'Net Returns Cashflows Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },

      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', ['amount']),
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 7,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          IsHidden: false,
          DashboardTitle: 'Cashflows'
        },
        Layout: {
          Revision: 10,
          CurrentLayout: 'Default',
          Layouts: [{
            Name: 'Default',
            Columns: this.columnDefs.map(c => c.field).filter(field => !['category','valueDate'].includes(field)).filter(field => !['groupingRank'].includes(field)),
            RowGroupedColumns: ['category','valueDate'],
            AggregationColumns:{
              'amount' : 'sum'
            },
            SuppressAggFuncInHeader: true
          },
          {
            Name: 'Capital Subtype Summary',
            Columns: this.columnDefs.map(c => c.field).filter(field => !['category','capitalSubType'].includes(field)).filter(field => !['groupingRank'].includes(field)),
            RowGroupedColumns: ['category','capitalSubType'],
            AggregationColumns:{
              'amount' : 'sum'
            },
            SuppressAggFuncInHeader: true
          }
        ]
        },
        FormatColumn:{
          Revision: 4,
          FormatColumns: [
            CUSTOM_FORMATTER(['amount'], ['amountFormatter']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['valueDate']),
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

  onAdaptableReady = ({ adaptableApi: AdaptableApi, gridOptions: GridOptions }) => {
    AdaptableApi.columnApi.autosizeAllColumns()
  }

  onAmountClicked(params: CellClickedEvent){
    let data = params.data;
    if(data?.['capitalType'] === 'NAV' && data?.['capitalSubType'] === 'Performance Fee'){

      let req: DetailedView = <DetailedView>{};
      req.screen = 'Net Returns - Performance Fee Accrual'
      req.param1 = this.asOfDate;
      req.param2 = this.fundHedging;
      req.param3 = req.param4 = req.param5 = '';
      req.strParam1 = [];

      const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent, {
        data: {
          detailedViewRequest: req,
          failureMessage: `Failed to load the performance fee details`,
          noFilterSpace: true,
          grid: 'Net Returns - Performance Fee Accrual',
          header: `Accrued performance fee details for ${this.asOfDate} - ${this.fundHedging}` 
        },
        width: '90vw',
        height: '80vh'
      });
    }

    if(data?.['capitalType'] === 'NAV' && data?.['capitalSubType'] === 'NAV'){

      let req: DetailedView = <DetailedView>{};
      req.screen = 'Net Returns - Estimated NAV'
      req.param1 = this.asOfDate;
      req.param2 = this.fundHedging;
      req.param3 = req.param4 = req.param5 = '';
      req.strParam1 = [];

      const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent, {
        data: {
          detailedViewRequest: req,
          failureMessage: `Failed to load the estimated NAV details`,
          noFilterSpace: true,
          grid: 'Net Returns - Estimated NAV',
          header: `Estimated NAV details for ${this.asOfDate} - ${this.fundHedging}` 
        },
        width: '90vw',
        height: '80vh'
      });
    }

  }
  clickableAmountStyle (params) {
    if((params.data?.['capitalType'] === 'NAV' && params.data?.['capitalSubType'] === 'Performance Fee') || (params.data?.['capitalType'] === 'NAV' && params.data?.['capitalSubType'] === 'NAV') )
      return { color: '#0590ca' };
    return null;
  }
  amountTooltipGetter (params) {
    if(params.data?.['capitalType'] === 'NAV' && params.data?.['capitalSubType'] === 'Performance Fee')
      return 'View accrual calculation';
    if(params.data?.['capitalType'] === 'NAV' && params.data?.['capitalSubType'] === 'NAV')
      return 'View estimated NAV calculation';
    return null;
  }
  onGridReady(params: GridReadyEvent){
    params.api.showNoRowsOverlay()
    params.api.closeToolPanel()
    this.netReturnsSvc.netCashflowsGridApi = params.api

    this.gridApi = params.api;
  }
}
