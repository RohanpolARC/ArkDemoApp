import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, IAggFuncParams, Module } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { ManagementFeeService } from 'src/app/core/services/ManagementFee/management-fee.service';
import { amountFormatter, dateFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { getNodes } from '../capital-activity/utilities/functions';

@Component({
  selector: 'app-management-fee',
  templateUrl: './management-fee.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './management-fee.component.scss']
})
export class ManagementFeeComponent implements OnInit {

  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  rowData = []
  agGridModules: Module[]
  adaptableApi: AdaptableApi;
  gridApi: GridApi;
  subscriptions: Subscription[] = [];
  asOfDate: string;

  constructor(
    private managementFeeSvc: ManagementFeeService,
    private dataSvc: DataService
  ) { }

  ngOnInit(): void {

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.gridApi.showLoadingOverlay();
        this.managementFeeSvc.getManagementFee(this.asOfDate).pipe(
            map((mgmtFeeData: any[]) => mgmtFeeData.map(row => {
            row['adjustedITDFee'] = 0;
            return row;
          }))
        ).subscribe({
          next: (d) => {
            this.rowData = d
            this.gridApi.hideOverlay();
          },
          error: (e) => {
            console.error(`Failed to load management view: ${e}`)
          }
        });
    
      }
    }))

    this.subscriptions.push(this.managementFeeSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.agGridModules = CommonConfig.AG_GRID_MODULES;
    
    let allowedAggFunc = ['sum', 'max', 'min', 'first', 'last', 'count']
    this.columnDefs = [
      { field: 'fundHedging', type: 'abColDefString' },
      { field: 'aumBase', type: 'abColDefNumber', valueFormatter: amountFormatter, aggFunc: 'sum' },
      { field: 'feeRate', type: 'abColDefNumber', valueFormatter: amountFormatter, aggFunc: 'max'  },
      { field: 'calculatedITDFee', type: 'abColDefNumber', valueFormatter: amountFormatter, aggFunc: 'sum'  },
      { field: 'fixingDate', type: 'abColDefDate', valueFormatter: dateFormatter, aggFunc: 'Max', allowedAggFuncs: ['Max'] },
      { field: 'fixing', type: 'abColDefNumber', valueFormatter: amountFormatter, aggFunc: 'max'  },
      { field: 'adjustment', type: 'abColDefNumber', valueFormatter: amountFormatter, aggFunc: 'sum',   },
      { field: 'instrumentType', type: 'abColDefString' },
      { field: 'investment', type: 'abColDefString' },
      { field: 'adjustedITDFee', type: 'abColDefNumber', valueFormatter: amountFormatter, allowedAggFuncs: ['Sum'], aggFunc: 'Sum' },
      { field: 'aggregatedAdjustment', type: 'abColDefNumber', valueFormatter: amountFormatter }
    ].map(c => {
      if(c.allowedAggFuncs == null)
        c.allowedAggFuncs = allowedAggFunc
      return c
    })

    let aggFuncs = {
      'Max': (params: IAggFuncParams) => {
        if(params.column.getColId() === 'fixingDate'){

          const MIN_DATE_VAL: number = -8640000000000000;
          let maxDate = new Date(MIN_DATE_VAL);
          params.values.forEach(value => {
            let d = new Date(value)
            if(d > maxDate)
              maxDate = d
          })

          if(formatDate(maxDate) === '01/01/1')
            return null;
          else return maxDate;
        }

        return 0;
      },
      'Sum': (params: IAggFuncParams) => {
        if(params.column.getColId() === 'adjustedITDFee'){
          let childData = getNodes(params.rowNode, []);
          let aggAdj: number = childData.reduce((n, {aggregatedAdjustment}) => n + aggregatedAdjustment, 0) ?? 0;
          let fixing: number = Math.max(...childData.map(c => Number(c['fixing']))) ?? 0;

          return Number(aggAdj + fixing);
        }

        return 0;
      }
    }
  
    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      rowGroupPanelShow: 'always',
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true,
      },
      suppressAggFuncInHeader: true,
      onGridReady: this.onGridReady.bind(this),
      aggFuncs: aggFuncs
    }

    this.adaptableOptions = {
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Management Fee ID',
      adaptableStateKey: 'Management Fee State key',
      toolPanelOptions: {
        toolPanelOrder: ['columns', 'AdaptableToolPanel']
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      predefinedConfig: {
        Dashboard: {
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 9,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [ ...this.columnDefs.map(c => c.field)].filter(c => !['aggregatedAdjustment'].includes(c)),
            RowGroupedColumns: [
              'fundHedging'
            ],
            AggregationColumns: {
              adjustedITDFee: true,
              adjustment: true,
              aumBase: true,
              feeRate: true,
              calculatedITDFee: true,
              fixing: true,
              fixingDate: true,
              aggregatedAdjustment: true
            }
          }]
        }
      }
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api;
  }

  onAdaptableReady({
    adaptableApi,
    vendorGrid
  }: {
    adaptableApi: AdaptableApi;
    vendorGrid: GridOptions;
  }){
    this.adaptableApi = adaptableApi
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();


  }

}
