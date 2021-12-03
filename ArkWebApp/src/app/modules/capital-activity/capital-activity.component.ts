import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCapitalModalComponent } from './add-capital-modal/add-capital-modal.component';

import {
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
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';

import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';

@Component({
  selector: 'app-capital-activity',
  templateUrl: './capital-activity.component.html',
  styleUrls: ['./capital-activity.component.scss']
})
export class CapitalActivityComponent implements OnInit {

  subscriptions: Subscription[] = [];
  rowData: CapitalActivityModel[] = [];
  rowGroupPanelShow:string = 'always';

  agGridModules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule
  ];

  columnDefs = [
    {field: 'capitalID', headerName: 'Capital ID', type: 'abColDefNumber'},
    { field: 'valueDate', headerName: 'Value Date', type: 'abColDefDate', valueFormatter: this.dateFormatter},
    { field: 'callDate', headerName: 'Call Date', type: 'abColDefDate', valueFormatter: this.dateFormatter },
    { field: 'narrative', headerName: 'Narrative', type:'abColDefString'},
    { field: 'capitalType', headerName: 'Capital Type'},
    { field: 'capitalSubType', headerName: 'Capital Subtype'},
    { field: 'totalAmount', headerName: 'Total Amount', valueFormatter: this.amountFormatter},
    { field: 'fundHedging', headerName: 'Fund Hedging'},
    { field: 'issuer', headerName: 'Issuer'},
    { field: 'asset', headerName: 'Asset'},
    { field: 'source', headerName: 'Source'},
    { field: 'sourceID', headerName: 'Source ID'}
  ]

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  };
  gridOptions: GridOptions;
  adapTableApi: AdaptableApi;

  constructor(public dialog:MatDialog, private capitalActivityService: CapitalActivityService) { 
    this.gridOptions = {
      enableRangeSelection: false,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true
    }
  }

  public adaptableOptions: AdaptableOptions = {
    primaryKey: 'capitalID',
    userName: 'TestUser',
    adaptableId: '',
    adaptableStateKey: `Capital Activity Key`,
    
    layoutOptions: {
      autoSaveLayouts: false
    },

    toolPanelOptions: {
      toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
    },

    userInterfaceOptions: {
      actionColumns: [
        {
          columnId: 'ActionEdit',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnButtonContext>,
              context: ActionColumnButtonContext
            ) => {
              let dialogRef = this.dialog.open(AddCapitalModalComponent,{
                data: {
                  rowData: context.rowNode?.data,
                  adapTableApi: this.adapTableApi,
                  actionType: 'EDIT',
                }});

            },
            icon: {
              src: '../assets/img/edit.svg',
              style: {
                height: 25, width: 25
              }
            },
          }
        }
      ]
    },

    predefinedConfig: {
      Dashboard: {
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        IsCollapsed: true,
        Tabs: [],
      },
      Layout: {
        CurrentLayout: 'Basic Capital Activity',
        Layouts: [{
          Name: 'Basic Capital Activity',
          Columns: [
            'callDate',
            'valueDate',
            'narrative',
            'capitalType',
            'capitalSubType',
            'totalAmount',
            'fundHedging',
            'issuer',
            'asset',
            'source',
            'sourceID',
            'ActionEdit',
          ],
          RowGroupedColumns: [],
          ColumnWidthMap:{
            ActionEdit: 50,
          },
          PinnedColumnsMap: {
            ActionEdit: 'right',
          },

        }]
      }
    }
  }

  fetchData(): void{
    this.subscriptions.push(this.capitalActivityService.getCapitalActivity().subscribe({
      next: data => {
        this.rowData = data;
        this.adapTableApi.gridApi.loadGridData(this.rowData);
      },
      error: error => {
        this.rowData = [];
      }
    }));
  }

  ngOnInit(): void {
    this.fetchData();
  }

  openDialog():void{

    const dialogRef = this.dialog.open(AddCapitalModalComponent, {
      data: {
        adapTableApi: this.adapTableApi,
        actionType: 'ADD',
      }});
    dialogRef.afterClosed().subscribe((result) => {

      if(result.data && result.event === 'Close with Success'){
        this.fetchData(); // Reloading the datagrid to fetch capitalID for newly added rows.
      }
    });
  }

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    this.adapTableApi = adaptableApi;
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

/* Closes right sidebar on start */
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

  dateFormatter(params) {
    if(params.value!=undefined)
    return moment(params.value).format('DD/MM/YYYY');
    else{
      return ""
    }
  }

  amountFormatter(params){
    if(params.value!=undefined&&Number(params.value)!=0)
    return Number(params.value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    else if(Number(params.value)==0) {
      return "-"
    } else{
      return ""
    }

  }

  zeroFormatter(params){
    if(params.value == undefined || Number(params.value) == 0)
      return ""
    else return Number(params.value)
  }


}
