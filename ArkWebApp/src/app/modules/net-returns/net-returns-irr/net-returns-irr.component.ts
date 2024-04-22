import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, CellValueChangedEvent, Module, ColDef, GridReadyEvent, GridApi, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { NetReturnsService } from 'src/app/core/services/NetReturns/net-returns.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

@Component({
  selector: 'app-net-returns-irr',
  templateUrl: './net-returns-irr.component.html',
  styleUrls: ['./net-returns-irr.component.scss']
})
export class NetReturnsIrrComponent implements OnInit {

  @Input() smy;
  @Input() runid;

  filterApply$: Observable<boolean> = this.dataSvc.filterApplyBtnState.pipe(
    tap((isHit: boolean) => {
      if(isHit){
        this.noRowsToDisplayMsg = 'No data found for applied filter.'
        this.gridApi?.showLoadingOverlay();
      }
    })
  )

  asOfDate: string;
  agGridModules: Module[]
  gridOptions: GridOptions
  rowData$: Observable<any[]>
  gridApi: GridApi
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[]

  subscriptions: Subscription[] = []
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  FORMAT_COLUMNS: string[];


  constructor(
    private dataSvc: DataService,
    public netReturnsSvc: NetReturnsService
  ) { }

  ngOnInit(): void {

    this.agGridModules = CommonConfig.AG_GRID_MODULES

    this.columnDefs = <ColDef[]>[
      { field: 'Category', type: 'abColDefString', headerTooltip:'Category' },
      { field: 'GrossIRR',headerTooltip:'GrossIRR'},
      { field: 'Leverage', headerName:'Grosss IRR with Leverage',headerTooltip:'Grosss IRR with Leverage'},
      { field: 'Other' ,headerTooltip:'Other'},
      { field: 'FX',headerName:'Net IRR before FX Costs',headerTooltip:'Net IRR Before FX Costs'},
      { field: 'Opex', headerName:'Net IRR before Opex',headerTooltip:'Net IRR before Opex' },
      { field: 'MgmtFee', headerName:'Net IRR before Management Fee',headerTooltip: 'Net IRR before Management Fee'},
      { field: 'PerfFee', headerName:'Net IRR before Performance Fee',headerTooltip:'Net IRR before Performance Fee' },
      { field: 'NetIRR' ,headerTooltip:'NetIRR'}
    ].map((x: ColDef) => { x.type = x.type ?? 'abColDefNumber'; return x; })

    this.FORMAT_COLUMNS = ['GrossIRR','Leverage','Other','FX','Opex','MgmtFee','PerfFee','NetIRR']

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
      },
      headerHeight: 30,
      rowHeight: 30,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Net Returns IRR',
      adaptableStateKey: 'Net Returns IRR Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      formatColumnOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('percentFormatter', this.columnDefs.map(c => c.field).filter(field => !['Category'].includes(field)))
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 10,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          IsHidden: false,
          DashboardTitle: 'Returns'
        },
        Layout: {
          Revision: 13,
          CurrentLayout: 'Basic Layout',
          Layouts: [{
            Name: 'Basic Layout',
            Columns: this.columnDefs.map(c => c.field)
          }]
        },
        FormatColumn:{
          Revision: 5,
          FormatColumns: [
            CUSTOM_FORMATTER(this.columnDefs.map(c => c.field).filter(field => !['Category'].includes(field)), ['percentFormatter'])
          ]
        }
      }
    }
  }

  onAdaptableReady = ({ adaptableApi: AdaptableApi, gridOptions: GridOptions }) => {
    AdaptableApi.columnApi.autosizeAllColumns()
  }

  onCellValueChanged(params: CellValueChangedEvent){}

  onGridReady(params: GridReadyEvent){
    params.api.showNoRowsOverlay()
    this.netReturnsSvc.netSmyGridApi = params.api
    
    this.gridApi = params.api;
  }
}
