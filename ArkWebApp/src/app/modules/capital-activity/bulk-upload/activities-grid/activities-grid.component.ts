import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo, Layout } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridOptions, Module } from '@ag-grid-community/core';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { dateFormatter } from '../../utilities/utility';
import { amountFormatter } from 'src/app/shared/functions/formatter';
import { CommonConfig } from 'src/app/configs/common-config';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-activities-grid',
  templateUrl: './activities-grid.component.html',
  styleUrls: ['./activities-grid.component.scss']
})
export class ActivitiesGridComponent implements OnInit {
  @Input() gridInfo: {
    gridData: any[],
    isValid: boolean
  }
  adaptableApi: AdaptableApi
  constructor(private dataSvc: DataService) { }

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  columnDefs: ColDef[] = [
    { field: 'Cash Flow Date', maxWidth: 150, valueFormatter: dateFormatter, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Cash Flow Date'},
    { field: 'Call Date', maxWidth: 150, valueFormatter: dateFormatter, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Call Date'},
    { field: 'Fund Hedging', maxWidth: 150, tooltipField: 'Fund Hedging'},
    { field: 'Fund Currency', headerName: 'Fund Ccy', maxWidth: 150, tooltipField: 'Fund Currency'},
    { field: 'Amount (in Fund Ccy)', headerName: 'Amount (in Fund Ccy)', maxWidth: 150, cellClass: 'ag-right-aligned-cell', valueFormatter: amountFormatter, allowedAggFuncs: [ 'sum', 'avg', 'first', 'last', 'count', 'min', 'max'], tooltipField:'Amount (in Fund Ccy)'},
    { field: 'Capital Type', maxWidth: 150, tooltipField:'Capital Type'},
    { field: 'Capital Subtype', maxWidth: 170, tooltipField:'Capital Subtype'},
    { field: 'Wso Asset ID', headerName: 'WSO Asset ID', tooltipField:'Wso Asset ID'},
    { field: 'Asset (optional)', maxWidth: 150, headerName: 'Asset', tooltipField:'Asset (optional)'},
    { field: 'Narative (optional)', maxWidth: 150, headerName: 'Narrative', tooltipField:'Narative (optional)'},
    { field: 'remark', width: 500, tooltipField: 'remark'},
    { field: '_ROW_ID', headerName: 'Row', maxWidth: 100},
  ]
  aggFuncs = {
    'Min': params => {
      let minDate = new Date(8640000000000000);
      params.values.forEach(value => {
        if(value < minDate)
          minDate = value
      })
      return minDate
    },
    'Max': params => {
      let maxDate = new Date(-8640000000000000);
      params.values.forEach(value => {
        if(value > maxDate)
          maxDate = value
      })
      return maxDate
    } 
  }
  gridOptions: GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
    enableRangeSelection: true,
    sideBar: true,
    suppressMenuHide: true,
    singleClickEdit: false,
    columnDefs: this.columnDefs,
    allowContextMenuWithControlKey:true,
    rowGroupPanelShow: 'always',
    aggFuncs: this.aggFuncs,
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
    filterOptions: CommonConfig.ADAPTABLE_FILTER_OPTIONS,
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    autogeneratePrimaryKey: true,
     primaryKey:'',
     userName: this.dataSvc.getCurrentUserName(),
     adaptableId: "Capital Activity - Bulk Upload",
     adaptableStateKey: `Bulk Upload Key`,

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

  tooltipShowDelay: number = 0
  onAdaptableReady(info: AdaptableReadyInfo){
    this.adaptableApi = info.adaptableApi;

    let layout: Layout = this.getLayout(this.gridInfo.isValid);
    this.adaptableApi.layoutApi.createOrUpdateLayout(layout);
    this.adaptableApi.layoutApi.setLayout(layout.Name);
  }

  ngOnInit(): void {
  }

  getLayout(isValid: boolean): Layout {
    
    let layout: Layout;

    if(isValid){
      layout = {
        Name: 'Bulk Grid',
        Columns: [
         'Cash Flow Date',
         'Call Date',
         'Fund Hedging',
         'Fund Currency',
         'Amount (in Fund Ccy)',
         'Capital Type',
         'Capital Subtype',
         'Wso Asset ID',
         'Asset (optional)',
         'Narative (optional)',
         '_ROW_ID'
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
         'Cash Flow Date',
         'Call Date',
         'Fund Hedging',
         'Fund Currency',
         'Amount (in Fund Ccy)',
         'Capital Type',
         'Capital Subtype',
         'Wso Asset ID',
         'Asset (optional)',
         'Narative (optional)',
         'remark',
         '_ROW_ID',
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
