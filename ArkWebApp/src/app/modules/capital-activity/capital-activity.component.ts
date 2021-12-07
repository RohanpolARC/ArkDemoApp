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
  rowData: CapitalActivityModel[];
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
    { field: 'capitalType', headerName: 'Capital Type', type:'abColDefString'},
    { field: 'capitalSubType', headerName: 'Capital Subtype', type:'abColDefString'},
    { field: 'fundCcy', headerName: 'Currency', type:'abColDefString'},
    { field: 'totalAmount', headerName: 'Total Amount', valueFormatter: this.amountFormatter, type:'abColDefNumber'},
    { field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
    { field: 'issuerShortName', headerName: 'Issuer Short Name', type:'abColDefString'},
    { field: 'asset', headerName: 'Asset', type:'abColDefString'},
    { field: 'source', headerName: 'Source', type:'abColDefString'},
    { field: 'sourceID', headerName: 'Source ID', type:'abColDefNumber'},
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
      allowContextMenuWithControlKey:false
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

              let rowData =  context.rowNode?.data;
              this.openDialog(rowData, 'EDIT');
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
            'fundCcy',
            'totalAmount',
            'fundHedging',
            'issuerShortName',
            'asset',
            'source',
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

  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[] = [];

  refData = [];

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

    
    this.subscriptions.push(this.capitalActivityService.getCapitalRefData().subscribe({
      next: data => {
        data.capitalType.forEach(x => { this.capitalTypeOptions.push(x) });
        data.capitalSubType.forEach(x => { this.capitalSubTypeOptions.push(x) });

        this.refData = data.portfolio_Info;
      },
      error: error => {
        console.error("Couldn't fetch refData. Form dropdown fields will be disabled");
      }
    }));

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

  openDialog(data? , actionType = 'ADD',):void{

    const dialogRef = this.dialog.open(AddCapitalModalComponent, {
      data: {
        rowData : data,
        adapTableApi: this.adapTableApi,
        actionType: actionType,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        refData: this.refData,
      },
      minWidth: '685px',
    });
    this.subscriptions.push(dialogRef.afterClosed().subscribe((result) => {

    }));
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
      return null;
    else return Number(params.value)
  }


}
