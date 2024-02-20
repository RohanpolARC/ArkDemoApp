import { ColDef, FirstDataRenderedEvent, GridOptions, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { dateFormatter } from '../../utilities/utility';
import { AmountOrZeroFormatter } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo, Layout } from '@adaptabletools/adaptable-angular-aggrid';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-nav-quarterly-grid',
  templateUrl: './nav-quarterly-grid.component.html',
  styleUrls: ['./nav-quarterly-grid.component.scss']
})
export class NavQuarterlyGridComponent implements OnInit {

  @Input() gridInfo: {
    gridData: any[],
    isValid: boolean
  }
  constructor(private dataSvc: DataService) { }
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  adaptableApi: AdaptableApi
  columnDefs: ColDef[] = [
    { field: 'Fund Hedging', maxWidth: 150, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Fund Hedging'},
    { field: 'Strategy/Currency', maxWidth: 150, tooltipField: 'Strategy/Currency'},
    { field: 'Quarter End', maxWidth: 150, valueFormatter: dateFormatter, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Quarter End'},
    { field: 'NAV per FS', maxWidth: 150, tooltipField: 'NAV per FS', valueFormatter: AmountOrZeroFormatter},
    { field: 'Deferred loan origination fee income', headerName: 'Deferred loan origination fee income', maxWidth: 150, tooltipField: 'Deferred loan origination fee income', valueFormatter: AmountOrZeroFormatter},
    { field: 'Current Period Rebates', headerName: 'Current Period Rebates', maxWidth: 150, cellClass: 'ag-right-aligned-cell', valueFormatter: AmountOrZeroFormatter, allowedAggFuncs: [ 'sum', 'avg', 'first', 'last', 'count', 'min', 'max'], tooltipField:'Current Period Rebates'},
    { field: 'Organisational costs unamortised', maxWidth: 150, tooltipField:'Organisational costs unamortised', valueFormatter: AmountOrZeroFormatter},
    { field: 'Subscription costs & leverage costs unamortised', maxWidth: 170, tooltipField: 'Subscription costs & leverage costs unamortised', valueFormatter: AmountOrZeroFormatter},
    { field: 'Advanced Tax', maxWidth: 150, valueFormatter: AmountOrZeroFormatter },
    { field: 'Carried Interest Provision ', headerName: 'Carried Interest Provision ', tooltipField:'Carried Interest Provision ', valueFormatter: AmountOrZeroFormatter},
    { field: 'GPS ITD' ,maxWidth:150,headerName:'GPS ITD',tooltipField:'GPS ITD',valueFormatter:AmountOrZeroFormatter},
    { field: 'Rebate ITD', maxWidth: 150, headerName: 'Rebate ITD', tooltipField:'Rebate ITD', valueFormatter: AmountOrZeroFormatter},
    { field: 'Total foreign exchange movements ITD',maxWidth:150,headerName:'Total foreign exchange movements ITD',tooltipField:'Total foreign exchange movements ITD',valueFormatter:AmountOrZeroFormatter},
    { field: 'Finance Cost ITD',maxWidth:150,headerName:'Finance Cost ITD',tooltipField:'Finance Cost ITD',valueFormatter:AmountOrZeroFormatter},
    { field: 'Total Operating exp (excluded GPS) ITD',maxWidth:150,headerName:'Total Operating exp (excluded GPS) ITD',tooltipField:'Total Operating exp (excluded GPS) ITD',valueFormatter:AmountOrZeroFormatter},
    { field: 'Net forward contract movements ITD (unrealised)',maxWidth:150,headerName:'Net forward contract movements ITD',tooltipField:'Net forward contract movements ITD',valueFormatter:AmountOrZeroFormatter},
    { field: 'Net forward contract movements ITD (realised)',maxWidth:150,headerName:'Net forward contract movements ITD',tooltipField:'Net forward contract movements ITD',valueFormatter:AmountOrZeroFormatter},
    { field: 'remark', width: 500, tooltipField: 'remark'},
    { field: '_ROW_ID', headerName: 'Row', maxWidth: 100},
  ]
  gridOptions: GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    enableRangeSelection: true,
    sideBar: true,
    suppressMenuHide: true,
    singleClickEdit: false,
    columnDefs: this.columnDefs,
    allowContextMenuWithControlKey:true,
    rowGroupPanelShow: 'always',
    onFirstDataRendered:(event: FirstDataRenderedEvent)=>{
      autosizeColumnExceptResized(event)
    },
    rowHeight: 30,
    headerHeight: 30,
    groupHeaderHeight: 30,
    pivotHeaderHeight: 30,
    defaultColDef: {
      resizable: true
    }
  }

  adaptableOptions: AdaptableOptions = {
    ...CommonConfig.ADAPTABLE_OPTIONS,
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    autogeneratePrimaryKey: true,
    primaryKey:'',
    userName: this.dataSvc.getCurrentUserName(),
    adaptableId: "NAV Quarterly",
    adaptableStateKey: `NAV Quarterly`,

    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

    teamSharingOptions: {
      enableTeamSharing: true,
      persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
      loadSharedEntities: loadSharedEntities.bind(this)
    },

    predefinedConfig: {
      Dashboard: {
        Revision: 1,
        ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
        IsCollapsed: true,
        Tabs: [],
        DashboardTitle: ' '
      },
      FormatColumn: {
        FormatColumns: [
          {
            Scope: {
              ColumnIds: ['remark'],
            },
            Style: {
              ForeColor: '#FF0000',
            },
          }
        ]
      }
    }
  }

  ngOnInit(): void {
  }

  onAdaptableReady(event: AdaptableReadyInfo){
    
    this.adaptableApi = event.adaptableApi;

    let layout: Layout = this.getLayout(this.gridInfo.isValid);

    this.adaptableApi.layoutApi.createOrUpdateLayout(layout);
    this.adaptableApi.layoutApi.setLayout(layout.Name);
  }

  getLayout(isValid): Layout {
    let layout: Layout;

    if(isValid){
      layout = {
        Name: 'NAV Quarterly',
        Columns: [
        'Fund Hedging','Strategy/Currency','Quarter End','NAV per FS','Deferred loan origination fee income','Current Period Rebates','Organisational costs unamortised','Subscription costs & leverage costs unamortised','Advanced Tax','Carried Interest Provision ','GPS ITD','Rebate ITD','Total foreign exchange movements ITD','Finance Cost ITD','Total Operating exp (excluded GPS) ITD','Net forward contract movements ITD (unrealised)','Net forward contract movements ITD (realised)','_ROW_ID'

        ],
        PinnedColumnsMap: {
        _ROW_ID: 'left'
      },
      ColumnWidthMap: {
        _ROW_ID: 5
      },
        RowGroupedColumns : [],
      }
    }
    else {
      layout = {
        Name: 'Invalid Excel Grid',
        Columns: [
          'Fund Hedging','Strategy/Currency','Quarter End','NAV per FS','Deferred loan origination fee income','Current Period Rebates','Organisational costs unamortised','Subscription costs & leverage costs unamortised','Advanced Tax','Carried Interest Provision ','GPS ITD','Rebate ITD','Total foreign exchange movements ITD','Finance Cost ITD','Total Operating exp (excluded GPS) ITD','Net forward contract movements ITD (unrealised)','Net forward contract movements ITD (realised)','remark','_ROW_ID'

        ],
        PinnedColumnsMap: {
          _ROW_ID: 'left',
          remark: 'right'
        },
        ColumnWidthMap: {
          _ROW_ID: 5,
          remark: 300
        }          
      }
    }

    return layout;
  }
}