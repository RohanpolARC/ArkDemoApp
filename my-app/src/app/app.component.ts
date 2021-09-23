import { Component } from '@angular/core';  
import { Employee } from './Employee';  
import { DataService } from './data.service';  
import {
  ColDef,
  GridApi,
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {AddAssetGirComponent} from './add-asset-gir/add-asset-gir.component'
import * as moment from 'moment'
import {MatAccordion} from '@angular/material/expansion';
import { MatIconRegistry } from '@angular/material/icon';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import charts from '@adaptabletools/adaptable-plugin-charts';
import {
  ActionColumnButtonContext,
  AdaptableApi,
  AdaptableButton,
  AdaptableOptions,
  CustomToolPanelButtonContext,
  MenuContext,
  PredicateDefHandlerParams,
  ToolPanelButtonContext,
} from '@adaptabletools/adaptable-angular-aggrid';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { BtnCellRenderer } from './btn-cell-renderer.component';
//import finance from '@adaptabletools/adaptable-plugin-finance';

@Component({  
  selector: 'app-root',  
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.scss']  
})  
export class AppComponent {  
  title = 'AzureMSALAngular';  
  
  employees: Employee[];  
  errorMessage: any;  
  rowData: Observable<any[]>;

  opened =true;
  rightSidebarOpened =false;

  modules: Module[] = [ClientSideRowModelModule,RowGroupingModule,ColumnsToolPanelModule,MenuModule,SetFilterModule];

  public gridOptions: GridOptions;
  private gridApi;
  private gridColumnApi;
  public getRowNodeId;
  public userName: String;
  public dialogRef;
  public rowGroupPanelShow;
  public defaultColDef;
  public sideBar;
  public frameworkComponents;

  // enables undo / redo
  public undoRedoCellEditing = true;

// restricts the number of undo / redo steps to 2
  public undoRedoCellEditingLimit = 5;

// enables flashing to help see cell changes
  public enableCellChangeFlash = true;

// columnDefs = [
//       { field: 'id',sortable: true, filter: true,hide: true },
//       { field: 'wsoAssetid',sortable: true, filter: true,hide: true},
//       { field: 'asOfDate',sortable: true, filter: true, valueFormatter: this.dateFormatter,rowGroup:true },
//       { field: 'ccy',sortable: true, filter: true,hide: true },
//       { field: 'rate',sortable: true, filter: true,editable:true },
//       { headerName:"Currency",field: 'ccyName',sortable: true, filter: true },
//       { headerName:"Asset Name", field: 'text',sortable: true, filter: true,resizable: true },
//       { headerName:"Last Update", field: 'last_update',sortable: true, filter: true,  valueFormatter: this.dateTimeFormatter },
//       { field: 'createdBy',sortable: true, filter: true,resizable: true,hide: true },
//       { field: 'modifiedBy',sortable: true, filter: true,resizable: true,hide: true },
//       { field: 'createdOn',sortable: true, filter: true,resizable: true,hide: true },
//       { field: 'modifiedOn',sortable: true, filter: true,resizable: true,hide: true }
//   ];

columnDefs = [
  { headerName:"Position Id",field: 'positionId',sortable: true, filter: true,hide: true },
  { headerName:"Asset Id",field: 'assetId',sortable: true, filter: true,hide: true},
  { headerName:"Asset",field: 'asset',sortable: true, filter: true,enableValue: true },
  { headerName:"Issuer",field: 'issuerShortName',sortable: true, filter: true,enableValue: true },
  { headerName:"Fund",field: 'fund',sortable: true, filter: true },
  { headerName:"Fund Hedging",field: 'fundHedging',sortable: true, filter: true },
  { headerName:"Fund Ccy", field: 'fundCcy',sortable: true, filter: true },
  { headerName:"As Of Date", field: 'asOfDate',sortable: true, filter: true,  valueFormatter: this.dateFormatter },
  { headerName:"Trade Date",field: 'tradeDate',sortable: true, filter: true,resizable: true, enableRowGroup:true, rowGroup: true, valueFormatter: this.dateFormatter },
  { headerName:"Settle Date",field: 'settleDate',sortable: true, filter: true,resizable: true,  valueFormatter: this.dateFormatter },
  { headerName:"Position Ccy",field: 'positionCcy',sortable: true, filter: true,resizable: true},
  { headerName:"Amount",field: 'amount',sortable: true, filter: true,resizable: true,enableValue: true },
  { headerName:"Par Amount",field: 'parAmount',sortable: true, filter: true,resizable: true },
  { headerName:"ParAmountLocal",field: 'parAmountLocal',sortable: true, filter: true,resizable: true},
  { headerName:"FundedParAmountLocal",field: 'fundedParAmountLocal',sortable: true, filter: true,resizable: true},
  { headerName:"CostAmountLocal",field: 'costAmountLocal',sortable: true, filter: true,resizable: true },
  { headerName:"FundedCostAmountLocal",field: 'fundedCostAmountLocal',sortable: true, filter: true,resizable: true },
  { headerName:"Going In Rate",field: 'fxRateBaseEffective',sortable: true, filter: true,resizable: true,editable:true },
  {
    field: 'actionNew',
    cellRenderer: 'btnCellRenderer',
    cellRendererParams: {
      clicked: function(field: any) {
        console.log(`${field} was clicked`);
      }
    },
    minWidth: 50,
  }
];

public adaptableOptions: AdaptableOptions = {
  primaryKey: 'positionId',
  userName: "TestUser",
  adaptableId: 'AdapTable Angular Demo',
  adaptableStateKey: `${Date.now()}`
  // userInterfaceOptions: {
  //   showAdaptableToolPanel: true
  // }

}


  constructor(private http: HttpClient,private dataService: DataService,public dialog: MatDialog,iconRegistry:MatIconRegistry) {


    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent' },
        ],
      },
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      
    //  rowData: this.rowData,
     // onGridReady: this.onGridReady,
    };

    this.defaultColDef = {
      // flex: 1,
      // minWidth: 100,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      filter: true,
    };
    this.sideBar = 'columns';

    this.getRowNodeId = function (data) {
     
      return data.positionId;
    };

    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderer
    }

    this.rowGroupPanelShow = 'always';

    // enables undo / redo
this.undoRedoCellEditing = true;

// restricts the number of undo / redo steps to 5
this.undoRedoCellEditingLimit = 5;

// enables flashing to help see cell changes
this.enableCellChangeFlash = true;

}
   
   
  
ngOnInit(): void { 
    
    // this.rowData = this.http.get<any[]>('https://localhost:44366/api/ParGIRHistory/getdata');
    
    // this.dataService.getEmployees().subscribe(  
    //   values => {  
    //     this.employees = values;  
    //   },  
    //   error => this.errorMessage = <any>error  
    // );
    
    this.userName=this.dataService.getCurrentUserName()

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

  

  adaptableApi.eventApi.on('SelectionChanged', selection => {
    // do stuff
  });
}
  
  actionCellRenderer(params) {
    let eGui = document.createElement("div");
  
    let editingCells = params.api.getEditingCells();
    // checks if the rowIndex matches in at least one of the editing cells
    let isCurrentRowEditing = editingCells.some((cell) => {
      return cell.rowIndex === params.node.rowIndex;
    });
  
    if (isCurrentRowEditing) {
      eGui.innerHTML = `
  <button  (click)="setAction()" class="action-button update"  data-action="update"> update  </button>
  <button  (click)="setAction()" class="action-button cancel"  data-action="cancel" > cancel </button>
  `;
    } else {
      eGui.innerHTML = `
  <button (click)="setAction()" class="action-button edit"  data-action="edit" > edit  </button>
  `;
    }
  
    return eGui;
  }

  dateFormatter(params) {
    if(params.value!=undefined)
    return moment(params.value).format('DD/MM/YYYY');
    else{
      return ""
    }
  }

  dateTimeFormatter(params) {
    if(params.value!=undefined)
    return moment(params.value).format('DD/MM/YYYY HH:mm');
    else{
      return ""
    }
  }
  
  openDialog() {
     this.dialogRef = this.dialog.open(AddAssetGirComponent);

    this.dialogRef.afterClosed().subscribe(result => {

      // this.rowData = this.http.get<any[]>('https://localhost:44366/api/assetgir/getdata');
    

    });
  }

  closeDialog(){
   
    console.log("hi")
   this.dialogRef.close()
    
  }

  setAction(){
    console.log("Hellllooo")
  }


  refreshGrid(){

    // this.rowData = this.http.get<any[]>('https://localhost:44366/api/assetgir/getdata');

  }

  getUser(){  
    this.dataService.getCurrentUserInfo();  
  }  
  
  logout(){  
    this.dataService.logout();  
  }  

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }


  onCellClicked(params) {

    console.log("Hi "+ params.event.target.dataset.action)
   
    // Handle click event for action cells
    if (params.column.colId === "action" && params.event.target.dataset.action) {
     // debugger
      let action = params.event.target.dataset.action;

      if (action === "edit") {
        params.api.startEditingCell({
          rowIndex: params.node.rowIndex,
          // gets the first columnKey
          colKey: "fxRateBaseEffective" //params.columnApi.getDisplayedCenterColumns()[0].colId
        });
      }

      if (action === "update") {

        //console.log(params.data)

        var updatedRowData = params.data;

        
    var saveAssetGirData = {
      id: 0,
      wsoAssetid:updatedRowData.assetId,
      asOfDate:updatedRowData.tradeDate,
      ccy:0,
      rate:updatedRowData.fxRateBaseEffective,
      last_update:new Date(),
      ccyName:updatedRowData.positionCcy,
      text:updatedRowData.asset,
      createdBy:this.userName,
      modifiedBy:this.userName,
      createdOn:new Date(),
      modifiedOn:new Date()
    };
    
   // rowNode.setSelected(true);

   // console.log(saveAssetGirData)

  //   this.http.post<any>('https://localhost:44366/api/AssetGIR/put',saveAssetGirData).subscribe({
  //     next: data => {
  //      //   console.log(data)
        

  //     },
  //     error: error => {
  //         this.errorMessage = error.message;
  //        // console.error('There was an error!', error);
  //     }
  // })



        params.api.stopEditing(false);
      }

      if (action === "cancel") {
        params.api.stopEditing(true);
      }
    }
  }

  onRowEditingStarted(params) {
    params.api.refreshCells({
      columns: ["actionNew"],
      rowNodes: [params.node],
      force: true
    });
  }
  onRowEditingStopped(params) {
    params.api.refreshCells({
      columns: ["actionNew"],
      rowNodes: [params.node],
      force: true
    });
    params.api.refreshCells({
      columns: ["fxRateBaseEffective"],
      rowNodes: [params.node],
      force: true
    });
  }


  onCellValueChanged(event) {
    //console.log(event.data) 

    let obj = event.data
//    obj.modifiedOn=new Date().toDateString()
//    obj.createdOn=new Date().toDateString()

    obj.modifiedBy=this.userName
    obj.last_update=new Date()
    obj.modifiedOn=new Date()
    
    var rowNode = this.gridApi.getRowNode(obj.id);
  
    var newData = {
      id: obj.id,
      wsoAssetid:obj.wsoAssetid,
      asOfDate:obj.asOfDate,
      ccy:obj.ccy,
      rate:obj.rate,
      last_update:new Date(),
      ccyName:obj.ccyName,
      text:obj.text,
      createdBy:obj.createdBy,
      modifiedBy:this.userName,
      createdOn:obj.createdOn,
      modifiedOn:new Date()
    };
    
   // rowNode.setSelected(true);

    console.log(obj)

  //   this.http.post<any>('https://localhost:44366/api/AssetGIR/put',obj).subscribe({
  //     next: data => {
  //         console.log(data)
        
  //         rowNode.setData(newData);
        

  //     },
  //     error: error => {
  //         this.errorMessage = error.message;
  //         console.error('There was an error!', error);
  //     }
  // })

  }

 

} 