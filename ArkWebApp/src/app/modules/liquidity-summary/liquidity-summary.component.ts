import { Component, OnInit } from '@angular/core';

import {
  ColDef,
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
  ActionColumnButtonContext,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';

import { dateFormatter, amountFormatter, removeDecimalFormatter, formatDate, dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { Subscription } from 'rxjs';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-liquidity-summary',
  templateUrl: './liquidity-summary.component.html',
  styleUrls: ['./liquidity-summary.component.scss']
})
export class LiquiditySummaryComponent implements OnInit {

  subscriptions: Subscription[] = [];
  constructor(private liquiditySummarySvc: LiquiditySummaryService,
              private dataSvc: DataService) { }

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  gridOptions: GridOptions;
  adaptableOptions: AdaptableOptions;
  adapTableApi: AdaptableApi;
  
  /** Filter Pane fields */
  asOfDate: string = null;
  fundHedgings: string[] = null;

  rowData = null;

  columnDefs: ColDef[] = [
    {
      field: 'date',
      valueFormatter: dateFormatter
    },
    {
      field: 'fundHedging',
    },
    {
      field: 'attribute'
    },
    {
      field: 'number',
      valueFormatter: amountFormatter
    },
    {
      field: 'NetCash',
    },
    {
      field: 'CurrentCash'
    }
  ]

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  }

  isWriteAccess: boolean = false;

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  fetchLiquiditySummary(){
    // Setting RowData for upper grid.
    if(this.asOfDate !== null)
    this.subscriptions.push(this.liquiditySummarySvc.getLiquiditySummary(this.asOfDate, this.fundHedgings).subscribe({
      next: summary => {
        for(let i:number = 0; i < summary?.length; i+= 1){
          summary[i].NetCash = summary[i].CurrentCash = null;
          summary[i].NetCash = 'Net Cash'
          summary[i].CurrentCash = 'Current Cash'
        }
        this.rowData = summary;
      },
      error: error => {
        console.error("Error in fetching liquidity summary" + error);
      }
    }));
    else
      console.warn("Component loaded without setting date in filter pane");
  }

  autoGroupColumnDef: ColDef = {
    cellRendererParams: {
      footerValueGetter: (params: any) => {
        console.log(params)
        const isRootLevel = params.node.level === -1;
        if (isRootLevel) {
          return 'Liquidity';
        }
        return params.value
      },
    },
  };

  ngOnInit(): void {
    this.gridOptions = {
      groupIncludeFooter: true,  // Footer for each group
      groupIncludeTotalFooter: true,

      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      autoGroupColumnDef: this.autoGroupColumnDef
    }

    this.adaptableOptions = {
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: "",
      adaptableStateKey: `Liquidity Summary State Key`,
      
      predefinedConfig: {
       Dashboard: {
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        Tabs: []
       },
       Layout: {
         CurrentLayout: 'Pivot Layout',
         Layouts: [
           {
             Name: 'Pivot Layout',
             EnablePivot: true,
             PivotColumns: ['fundHedging'],
             RowGroupedColumns: ['date', 'NetCash', 'CurrentCash', 'attribute'],
             AggregationColumns: {
               number: 'sum'
             },
             Columns: []
           }
         ]

       }
      }
    }

    this.subscriptions.push(this.dataSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;

    }));

    this.subscriptions.push(this.dataSvc.currentSearchTextValues.subscribe(fundHedgings => {
      this.fundHedgings = fundHedgings;
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.fetchLiquiditySummary();
      }
    }))

  }

}
