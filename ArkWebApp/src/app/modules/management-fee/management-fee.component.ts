import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { ManagementFeeService } from 'src/app/core/services/ManagementFee/management-fee.service';
import { amountFormatter, dateFormatter, formatDate, noDecimalAmountFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { getNodes } from '../capital-activity/utilities/functions';
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi, GridOptions, Module, ColDef, IAggFuncParams, GridReadyEvent } from '@ag-grid-community/core';

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

  fetchManagementFee(){

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

  }
  ngOnInit(): void {


    this.subscriptions.push(this.managementFeeSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.agGridModules = CommonConfig.AG_GRID_MODULES;
    
    let allowedAggFunc = ['sum', 'max', 'min', 'first', 'last', 'count']
    this.columnDefs = [
      { field: 'positionID', type: 'abColDefNumber' },
      { field: 'fundHedging', type: 'abColDefString' },
      { field: 'issuerShortName', type: 'abColDefString' },
      { field: 'issuer', type: 'abColDefString' },
      { field: 'asset', type: 'abColDefString' },
      { field: 'managementDate', type: 'abColDefDate', valueFormatter: dateFormatter, cellClass: 'dateUK', headerName: 'Trade Date' },
      { field: 'aumBase', type: 'abColDefNumber', valueFormatter: noDecimalAmountFormatter, aggFunc: 'sum' },
      { field: 'feeRate', type: 'abColDefNumber', valueFormatter: amountFormatter, aggFunc: 'max', headerName: 'Fee Rate Percent'  },
      { field: 'calculatedITDFee', type: 'abColDefNumber', valueFormatter: noDecimalAmountFormatter, aggFunc: 'sum'  },
      { field: 'fixingDate', type: 'abColDefDate', valueFormatter: dateFormatter, aggFunc: 'Max', allowedAggFuncs: ['Max'], cellClass: 'dateUK' },
      { field: 'fixing', type: 'abColDefNumber', valueFormatter: noDecimalAmountFormatter, aggFunc: 'max'  },
      { field: 'adjustment', type: 'abColDefNumber', valueFormatter: noDecimalAmountFormatter, aggFunc: 'sum',   },
      { field: 'adjustedITDFee', type: 'abColDefNumber', valueFormatter: noDecimalAmountFormatter, allowedAggFuncs: ['Sum'], aggFunc: 'Sum' },
      { field: 'aggregatedAdjustment', type: 'abColDefNumber', valueFormatter: noDecimalAmountFormatter }
    ].map(c => {
      if(c.allowedAggFuncs == null)
        c.allowedAggFuncs = allowedAggFunc
      c['tooltipField'] = c.field;
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
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true,
      },
      suppressAggFuncInHeader: true,
      onGridReady: this.onGridReady.bind(this),
      aggFuncs: aggFuncs,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Management Fee ID',
      adaptableStateKey: 'Management Fee State key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 2,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 11,
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
    
    this.fetchManagementFee();
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    // use AdaptableApi for runtime access to Adaptable
  };

}
