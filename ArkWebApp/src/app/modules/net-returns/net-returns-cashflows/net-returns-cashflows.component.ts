import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, CellValueChangedEvent, Module, ColDef, GridReadyEvent, GridApi } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-net-returns-cashflows',
  templateUrl: './net-returns-cashflows.component.html',
  styleUrls: ['./net-returns-cashflows.component.scss']
})
export class NetReturnsCashflowsComponent implements OnInit {

  @Input() cashflows
  @Input() cashflowCount

  filterApply$: Observable<boolean> = this.dataSvc.filterApplyBtnState.pipe(
    tap((isHit: boolean) => {
      if(isHit){
        this.gridApi.showLoadingOverlay();
      }
    })
  )

  asOfDate: string;
  agGridModules: Module[]
  columnDefs: ColDef[]
  gridOptions: GridOptions
  gridApi: GridApi
  // rowData$: Observable<any[]>
  adaptableOptions: AdaptableOptions

  subscriptions: Subscription[] = []
  constructor(private dataSvc: DataService) { }

  ngOnInit(): void {

    this.agGridModules = CommonConfig.AG_GRID_MODULES

    this.columnDefs = <ColDef[]>[
      { field: 'category', type: 'abColDefString',sortable:false},
      { field: 'valueDate', type: 'abColDefDate' },
      { field: 'amount', type: 'abColDefNumber' },
      { field: 'capitalSubType', type: 'abColDefString' },
      { field: 'capitalType', type: 'abColDefString' },
      { field: 'narrative', type: 'abColDefString' },
      //{ field: 'groupingRank', sort: 'desc' as 'desc'}
    ].map((x: ColDef) => { x.type = x.type ?? 'abColDefNumber'; x.width = 175; return x; })

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      rowGroupPanelShow: 'always',
      defaultColDef: {
        resizable: true,
        filter: true,
        sortable: true
      },
      headerHeight: 30,
      rowHeight: 30,
      groupHeaderHeight: 30
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Net Returns Cashflows',
      adaptableStateKey: 'Net Returns Cashflows Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },

      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', ['amount']),
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 5,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: 'Cashflows'
        },
        Layout: {
          Revision: 4,
          CurrentLayout: 'Basic Layout',
          Layouts: [{
            Name: 'Basic Layout',
            Columns: this.columnDefs.map(c => c.field).filter(field => !['category'].includes(field)).filter(field => !['groupingRank'].includes(field)),
            RowGroupedColumns: ['category'],
          }]
        },
        FormatColumn:{
          Revision: 4,
          FormatColumns: [
            CUSTOM_FORMATTER(['amount'], ['amountFormatter']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['valueDate']),
          ]
        }
      }
    }
  }

  onAdaptableReady = ({ adaptableApi: AdaptableApi, gridOptions: GridOptions }) => {}

  onCellValueChanged(params: CellValueChangedEvent){}

  onGridReady(params: GridReadyEvent){
    params.api.hideOverlay()
    params.api.closeToolPanel()

    this.gridApi = params.api;
  }
}
