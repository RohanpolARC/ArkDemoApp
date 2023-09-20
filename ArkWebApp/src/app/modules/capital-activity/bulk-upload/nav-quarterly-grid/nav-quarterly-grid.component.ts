import { ColDef, FirstDataRenderedEvent, GridOptions, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { dateFormatter } from '../../utilities/utility';
import { amountFormatter } from 'src/app/shared/functions/formatter';
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
    { field: 'Quarter End', maxWidth: 150, valueFormatter: dateFormatter, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Quarter End'},
    { field: 'NAV per FS', maxWidth: 150, tooltipField: 'NAV per FS', valueFormatter: amountFormatter},
    { field: 'Deferred loan origination fee income', headerName: 'Deferred loan origination fee income', maxWidth: 150, tooltipField: 'Deferred loan origination fee income', valueFormatter: amountFormatter},
    { field: 'Current Period Rebates', headerName: 'Current Period Rebates', maxWidth: 150, cellClass: 'ag-right-aligned-cell', valueFormatter: amountFormatter, allowedAggFuncs: [ 'sum', 'avg', 'first', 'last', 'count', 'min', 'max'], tooltipField:'Current Period Rebates'},
    { field: 'Organisational costs unamortised', maxWidth: 150, tooltipField:'Organisational costs unamortised', valueFormatter: amountFormatter},
    { field: 'Subscription costs & leverage costs unamortised', maxWidth: 170, tooltipField: 'Subscription costs & leverage costs unamortised', valueFormatter: amountFormatter},
    { field: 'Carried Interest Provision ', headerName: 'Carried Interest Provision ', tooltipField:'Carried Interest Provision ', valueFormatter: amountFormatter},
    { field: 'Rebate ITD', maxWidth: 150, headerName: 'Rebate ITD', tooltipField:'Rebate ITD', valueFormatter: amountFormatter},
    { field: 'Net realised and unrealised gains and losses ITD', maxWidth: 150, headerName: 'Net realised and unrealised gains and losses ITD', tooltipField: 'Net realised and unrealised gains and losses ITD', valueFormatter: amountFormatter },
    { field: 'Advanced Tax', maxWidth: 150, valueFormatter: amountFormatter },
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
      },
      StatusBar: {
        Revision:1,
        StatusBars: [
          {
            Key: 'Right Panel',
            StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
          },
        ],
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
        'Fund Hedging','Quarter End','NAV per FS','Deferred loan origination fee income','Current Period Rebates','Organisational costs unamortised','Subscription costs & leverage costs unamortised','Carried Interest Provision ','Rebate ITD','Net realised and unrealised gains and losses ITD','Advanced Tax','_ROW_ID'
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
        'Fund Hedging','Quarter End','NAV per FS','Deferred loan origination fee income','Current Period Rebates','Organisational costs unamortised','Subscription costs & leverage costs unamortised','Carried Interest Provision ','Rebate ITD','Net realised and unrealised gains and losses ITD','Advanced Tax','remark','_ROW_ID',
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