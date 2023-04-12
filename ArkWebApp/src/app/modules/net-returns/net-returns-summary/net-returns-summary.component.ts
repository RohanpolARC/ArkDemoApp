import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, CellValueChangedEvent, Module, ColDef, GridReadyEvent, GridApi } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-net-returns-summary',
  templateUrl: './net-returns-summary.component.html',
  styleUrls: ['./net-returns-summary.component.scss']
})
export class NetReturnsSummaryComponent implements OnInit {

  @Input() smy;
  @Input() runid;

  filterApply$: Observable<boolean> = this.dataSvc.filterApplyBtnState.pipe(
    tap((isHit: boolean) => {
      if(isHit){
        this.gridApi.showLoadingOverlay();
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

  constructor(private dataSvc: DataService) { }

  ngOnInit(): void {

    this.agGridModules = CommonConfig.AG_GRID_MODULES

    this.columnDefs = <ColDef[]>[
      { field: 'Category', type: 'abColDefString', maxWidth: 175,headerTooltip:'Category' },
      { field: 'GrossIRR',headerTooltip:'GrossIRR'},
      { field: 'Leverage', headerName:'Grosss IRR with Leverage',headerTooltip:'Grosss IRR with Leverage'},
      { field: 'FX',headerTooltip:'FX'},
      { field: 'Other' ,headerTooltip:'Other'},
      { field: 'SetupCosts', headerName:'Net IRR before Setup Costs',headerTooltip:'Net IRR before Setup Costs' },
      { field: 'Opex', headerName:'Net IRR before Opex',headerTooltip:'Net IRR before Opex' },
      { field: 'MgmtFee', headerName:'Net IRR before Management Fee',headerTooltip: 'Net IRR before Management Fee'},
      { field: 'PerfFee', headerName:'Net IRR before Performance Fee',headerTooltip:'Net IRR before Performance Fee' },
      { field: 'NetIRR' ,headerTooltip:'NetIRR'}
    ].map((x: ColDef) => { x.type = x.type ?? 'abColDefNumber'; x.maxWidth = x.maxWidth ?? 225; x.width = 200; return x; })

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
      },
      headerHeight: 30,
      rowHeight: 30
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Net Returns Summary',
      adaptableStateKey: 'Net Returns Summary Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('percentFormatter', this.columnDefs.map(c => c.field).filter(field => !['Category'].includes(field)))
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 8,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: 'Summary'
        },
        Layout: {
          Revision: 8,
          CurrentLayout: 'Basic Layout',
          Layouts: [{
            Name: 'Basic Layout',
            Columns: this.columnDefs.map(c => c.field)
          }]
        },
        FormatColumn:{
          Revision: 4,
          FormatColumns: [
            CUSTOM_FORMATTER(this.columnDefs.map(c => c.field).filter(field => !['Category'].includes(field)), ['percentFormatter'])
          ]
        }
      }
    }
  }

  onAdaptableReady = ({ adaptableApi: AdaptableApi, gridOptions: GridOptions }) => {}

  onCellValueChanged(params: CellValueChangedEvent){}

  onGridReady(params: GridReadyEvent){
    params.api.hideOverlay()
    this.gridApi = params.api;
  }
}
