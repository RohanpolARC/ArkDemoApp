import { Component, OnInit } from '@angular/core';

import {
  CellClickedEvent,
  ColDef,
  EditableCallbackParams,
  GridApi,
  GridOptions,
  IAggFuncParams,
  IsGroupOpenByDefaultParams,
  ITooltipParams,
  Module
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

import { dateFormatter, noDecimalAmountFormatter } from 'src/app/shared/functions/formatter';
import { Subscription } from 'rxjs';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { DataService } from 'src/app/core/services/data.service';
import { MatDialog }  from '@angular/material/dialog';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { DetailedViewComponent } from 'src/app/shared/components/detailed-view/detailed-view.component';
import { AttributeGroupRendererComponent } from './attribute-group-renderer/attribute-group-renderer.component';
import { UnfundedAssetsEditorComponent } from './unfunded-assets-editor/unfunded-assets-editor.component';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { ClipboardModule, FiltersToolPanelModule, RangeSelectionModule, SideBarModule } from '@ag-grid-enterprise/all-modules';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';

@Component({
  selector: 'app-liquidity-summary',
  templateUrl: './liquidity-summary.component.html',
  styleUrls: ['./liquidity-summary.component.scss']
})
export class LiquiditySummaryComponent implements OnInit {

  subscriptions: Subscription[] = [];
  assetFundingDetails: any[];
  unfundedAssets: any;
  constructor(private liquiditySummarySvc: LiquiditySummaryService,
              private unfundedAssetsSvc: UnfundedAssetsService,
              private dataSvc: DataService,
              private accessSvc: AccessService,
              private warningMsgPopUp: MatSnackBar,
              public dialog: MatDialog) { }

  agGridModules: Module[] = [    
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    ClipboardModule,
    SideBarModule,
    RangeSelectionModule
];

  gridOptions: GridOptions;

   
  
  /** Filter Pane fields */
  asOfDate: string = null;
  fundHedgings: string[] = null;
  days: number = null;

  rowData = null;
  refData = null;

  columnDefs: ColDef[]
  context
  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: false,
    sortable: false,
    filter: true,
    autosize:true,
    showOpengroup:true,
  }

  actionClickedRowID: number = null;
  isWriteAccess: boolean = false;

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setSelectedRowID(rowID: number){
    this.actionClickedRowID = rowID;
    if(this.actionClickedRowID === null){
      /** 
       *    gridOptions.api (gridApi can be null on initial load, hence adding ? to not call    stopEditing())
       * 
       *  If not adding ?, can give error and wouldn't call getLiquiditySummaryPivoted() in filterBtnApplyState listener
       */
      this.gridOptions.api?.stopEditing(true);
    }
  }

  getSelectedRowID(){
    return this.actionClickedRowID;
  }


  parseFetchedSummary(summary: {date: Date, attr: string, fundHedgingAmount: { fundHedging: string, amount: number}[]}[] = null): any{
    let parsedData = []
    for(let i:number = 0; i < summary.length; i+= 1){
      let row = {};
      row['attr'] = summary[i]['attr'];
      row['date'] = summary[i]['date'];
      row['attrType'] = summary[i]['attrType'];
      row['subAttr'] = summary[i]['subAttr'];
      row['isManual'] = summary[i]['isManual']
      for(let j: number = 0; j < summary[i].fundHedgingAmount.length; j+= 1){
        let FHAmountPair = summary[i].fundHedgingAmount[j]
        row[FHAmountPair.fundHedging] = Number(FHAmountPair.amount);
      }
      parsedData.push(row);
    }

    return parsedData;
  }

  aggFuncs = {
    'Sum': (params: IAggFuncParams )=> {

      if(params.rowNode.field === 'attr'){
        return params.values.reduce((a, b) => Number(a) + Number(b), 0);
      }

      if(params.rowNode.field === 'attrType'){
        let sum: number = 0;
        let colName: string = params.column.getColId();
        if(params.rowNode.group){
  
          if (params.rowNode.key === 'Current Cash') {
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(rowNode.data?.['attrType'] === 'Current Cash'){
                sum += Number(rowNode.data?.[colName]);
              }
            })
          }
          else if(params.rowNode.key === 'Net Cash') {
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(['Current Cash', 'Net Cash'].includes(rowNode.data?.['attrType'])){
                sum += Number(rowNode.data?.[colName]);
              }
            })
          }
          else if(params.rowNode.key === 'Liquidity'){
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(['Current Cash', 'Net Cash', 'Liquidity'].includes(rowNode.data?.['attrType'])){
                sum += Number(rowNode.data?.[colName]);
              }
            })
          }
          else if(params.rowNode.key === 'Known Outflows Unsettled'){
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(['Known Outflows Unsettled'].includes(rowNode.data?.['attrType'])){
                sum += Number(rowNode.data?.[colName]);
              }
            })
          }
          else if(params.rowNode.key === 'Known Outflows Pipeline'){
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(['Known Outflows Pipeline'].includes(rowNode.data?.['attrType'])){
                sum += Number(rowNode.data?.[colName]);
              }
            })
          }
          else if(params.rowNode.key === 'Known Outflows Funding'){
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(['Known Outflows Funding'].includes(rowNode.data?.['attrType'])){
                sum += Number(rowNode.data?.[colName]);
              }
            })
          }
          else if(params.rowNode.key === 'Cash Post Known Outflows'){
  
            this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
              if(['Current Cash', 'Net Cash', 'Liquidity','Known Outflows Unsettled', 'Known Outflows Funding','Known Outflows Pipeline'].includes(rowNode.data?.['attrType'])){
                sum += Number(rowNode.data?.[colName]);
              }
            })
  
          }
        }
        return sum;  
      }
    }
  }

  createColumnDefs(row: {date: Date, attr: string, fundHedgingAmount: { fundHedging: string, amount: number}[]} = null){
    this.columnDefs = [
      {
        field: 'date',
        valueFormatter: dateFormatter,
        width: 115,
        pinned: 'left',
        sortable: true,
      
      },
      
      {
        headerName: 'Attribute Type',
        field: 'attrType',
        tooltipField: 'attrType',
        rowGroup: true,
        hide: true,
        pinned: 'left',
      },
      {
        headerName: 'Attribute',
        field: 'attr',
        tooltipField: 'attr',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: 'attributeGroupRenderer',
          suppressDoubleClickExpand: true,
        },
        width: 200,
        pinned: 'left',
        rowGroup: true,
        hide: true

      },
      {
        headerName: 'Sub Attribute',
        field: 'subAttr',
        tooltipField: 'subAttr',
        width: 200,
        pinned: 'left',
        cellStyle: (params) => {

          if(!params.node.group && params.data?.['attr'] === "To be funded asset" && params.data?.['attrType'] === "Known Outflows Funding")  {
            return {
              color: '#0590ca'
            }
          }     
          return null;
        },
        onCellClicked: (params: CellClickedEvent) => {

          if(!params.node.group && params.data?.['attr'] === "To be funded asset" && params.data?.['attrType'] === "Known Outflows Funding")  {

            this.onUnfundedAssetClick(params.data, 'EDIT')
          }     
        }
      },
      {
        headerName: 'Is Manual',
        field: 'isManual',
        hide: true
      }
    ];

    if(!row)
      return;

    let FHColDefs = [];

    for(let i:number = 0; i < row.fundHedgingAmount.length; i+= 1){
      let FH: string = row.fundHedgingAmount[i].fundHedging;
      let colDef: ColDef = {
        field: FH,
        headerName: FH,
        valueFormatter: noDecimalAmountFormatter,
        width: 133,
        cellStyle: params => {

          if(params.node.group && params.node.field === 'attr' && !params.node.allLeafChildren[0].data?.['isManual'] && !(params.node.key === 'Cash Post Known Outflows')){
            return {
              color: '#0590ca'
            }
          }
            return null;
        },
        cellClass: 'ag-right-aligned-cell',
        allowedAggFuncs: ['Sum', 'min', 'max'],
        aggFunc: 'Sum',
        editable: (params: EditableCallbackParams) => {
          return params.node.rowIndex === this.actionClickedRowID;
        },
        /**
         
        https://stackoverflow.com/questions/56681444/ag-grid-using-grid-event-cellclicked-for-specific-column-cannot-access-this

        onCellClicked: this.onLiquidityCellClicked, has ag grid row context as `this`. In order to access original component inside the event callback, bind it with the actual context(LiquiditySummaryComponent), i.e. bind(this);  

         */
        onCellClicked: this.onLiquidityCellClicked.bind(this),
        tooltipValueGetter: (params: ITooltipParams) => {
          if(params.node.group && params.node.field === 'attr' && !params.node.allLeafChildren[0].data?.['isManual']){
            return "Detailed view";
          }
          else return null;
        }
      }
      
      FHColDefs.push(colDef);
    }

    FHColDefs.sort((a,b) => {
      let FH_1: string = a['field'];
      let FH_2: string = b['field'];
      if(FH_1 < FH_2)
          return -1;
      else if(FH_1 > FH_2)
          return 1;
      else return 0;
    })

    FHColDefs.forEach(fhColDef => this.columnDefs.push(fhColDef));

    this.columnDefs.push(
    {  
        field: 'action',
        cellRenderer: 'addCellRenderer',
        pinned: 'right',
        width: 117
    })
  }

  fetchLiquiditySummaryRef(){

    this.subscriptions.push(this.liquiditySummarySvc.getLiquiditySummaryRef().subscribe({
      next: data => {
        this.refData = data;
      },
      error: error => {
        console.error("Failed to fetch Liquidity summary Ref data: " + error);
      }
    }))
  }

  fetchLiquiditySummary(){

    this.setSelectedRowID(null);
    if(this.asOfDate !== null){

      this.gridOptions.api.showLoadingOverlay();
      this.subscriptions.push(this.liquiditySummarySvc.getLiquiditySummaryPivoted(this.asOfDate, this.fundHedgings, this.days).subscribe({
        next: summary => {
  
          setTimeout(() => {
            this.gridOptions.api.hideOverlay();
            
            if(summary.length > 0){
              this.createColumnDefs(summary[0]);
              this.rowData = this.parseFetchedSummary(summary); 
              this.gridOptions.api?.setColumnDefs(this.columnDefs);

              this.gridOptions.columnApi.applyColumnState(
                {
                  state: [
                    {
                    colId: 'date',
                    sort: 'asc'
                    }
                  ]
                }
              )
            }
            else{
              this.gridOptions.api.showNoRowsOverlay();
              this.createColumnDefs();
              this.rowData = [];
            }
          }, 500)

        },
        error: error => {
          this.gridOptions.api.showNoRowsOverlay();
          console.error("Error in fetching liquidity summary" + error);
          this.rowData = [];
        }
      }));  
    }
    else
      console.warn("Component loaded without setting date in filter pane");
  }

  fetchAssetFundingDetails(){

    this.subscriptions.push(this.unfundedAssetsSvc.getAssetFundingDetails().subscribe({
      next: (resp) => {
        this.assetFundingDetails = resp;
      },
      error: (error) => {
        console.error(`Failed to fetch the funding details: ${error}`)
      }
    }))
  }

  onGridReady(params: any){
    params.api.closeToolPanel();
  }

  getAssetId(subAttr: string): number {

    let assetID: number = parseInt(subAttr.substring(subAttr.lastIndexOf('(') + 1, subAttr.length - 1));
    return assetID;
  }

  onUnfundedAssetClick(row = null, action: 'EDIT' | 'ADD' = 'ADD'){

    if(action === 'EDIT'){

      let assetID: number = this.getAssetId(row['subAttr'])
      let fundingDate: string = getMomentDateStr(row['date']);
  
      this.subscriptions.push(this.unfundedAssetsSvc.getUnfundedAssets(assetID, fundingDate).subscribe({
        next: (unfundedAsset) => {
          this.openAssetDialog(unfundedAsset[0]);
        },
        error: (error) => {
          this.dataSvc.setWarningMsg("Failed to fetch unfunded asset details", "Dismiss", "ark-theme-snackbar-error")
          console.error(`Failed to fetch unfunded asset details: ${error}`)
        }
  
      }))
  
    }
    else if(action === 'ADD'){
      this.openAssetDialog();
    }

  }

  openAssetDialog(unfundedAsset = null){

    // Check isWrite Access
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No access', 'Dismiss', 'ark-theme-snackbar-warning')
      return;
    }
    
    const dialogRef = this.dialog.open(UnfundedAssetsEditorComponent, {
      maxHeight: '90vh',
      width: '60vw',
      maxWidth: '1200px',
      minWidth: '400px',
      data: {
        assetRef: this.assetFundingDetails,
        rowData: unfundedAsset,
        action: (unfundedAsset === null) ? 'ADD' : 'EDIT' 
      }
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe(res => {
      if(dialogRef.componentInstance.isSuccess){
        this.fetchLiquiditySummary();
      }
    }))

  }

  openDialog(actionType: string = 'ADD'): void {

    if(this.isWriteAccess){
      const dialogRef = this.dialog.open(AttributeEditorComponent,{
        data: {
          action: actionType,
          fundHedgings: this.fundHedgings,
          asOfDate: this.asOfDate,
          refData: this.refData
        }
      })
  
      this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
        if(result.event === 'Close with success'){
  
          // Re-fetch attributes & IDs for newly added attributes
          this.fetchLiquiditySummaryRef();
  
            // Refresh the grid
          this.fetchLiquiditySummary();
        }
      }))  
    }
    else {
      this.setWarningMsg('Unauthorized', 'Dismiss', 'ark-theme-snackbar-error')
    }
  }

  onLiquidityCellClicked(event: CellClickedEvent){
    if(!['ag-Grid-AutoColumn', 'date', 'attr', 'action', 'attrType' ,'isManual'].includes(event.column.getColId()) && event.node.group && !(event.node.key === 'Cash Post Known Outflows')){
      // Open detailed view.

      let model: DetailedView = <DetailedView>{};

      model.screen = 'Liquidity Summary';
      model.param1 = this.asOfDate;           //date
      model.param2 = (event.node.field === 'attr') ? event.node.key : null ;    //attribute
      model.param3 = (event.node.parent.field === 'attrType') ? event.node.parent.key : null  //level
      model.param4 = event.column.getColId();   //fund Hedging
      model.param5 = String(this.days);   //days

      if(event.node.field === 'attr' && event.node.parent.field === 'attrType' && !event.node.allLeafChildren[0].data?.['isManual']){
        const dialogRef = this.dialog.open(DetailedViewComponent,{
          data: {
            detailedViewRequest: model
          },
          width: '90vw',
          height: '80vh'
        })
      }  
      }
  }

  ngOnInit(): void {

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Liquidity Summary' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    this.fetchLiquiditySummaryRef();
    this.fetchAssetFundingDetails();

    /** Making this component available to child components in Ag-grid */

    this.context = {
      componentParent: this
    }
    this.gridOptions = {
      tooltipShowDelay: 0,
      suppressAggFuncInHeader: true,
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      aggFuncs: this.aggFuncs,
      

            // Expand groups
      isGroupOpenByDefault: (params: IsGroupOpenByDefaultParams) => {
        // return params.rowNode.group && params.key !== 'Known Outflows';
        if(params.field === 'attrType')
          return true;
          
        return false;
      },
      autoGroupColumnDef: {
        pinned: 'left',
        cellRendererParams: {
          suppressCount: true     // Disable row count on group
        }
      },
      frameworkComponents:{
        addCellRenderer: UpdateCellRendererComponent,
        attributeGroupRenderer: AttributeGroupRendererComponent
      },
      groupMultiAutoColumn: true
    }

    this.subscriptions.push(this.dataSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;

    }));

    this.subscriptions.push(this.dataSvc.currentSearchTextValues.subscribe(fundHedgings => {
      this.fundHedgings = fundHedgings;
    }))

    this.subscriptions.push(this.dataSvc.currentNumberField.subscribe(days => {
      this.days = days;
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.columnDefs = null;
          /** Removes previous column order state, else new order of columnDefs is not persisted. (e.g. Sorting of FH columns))  */
        this.gridOptions.api?.setColumnDefs(null)
        this.fetchLiquiditySummary();
      }
    }))

  }

  setWarningMsg(message: string, action: string, type: string = 'ark-theme-snackbar-normal'){
    this.warningMsgPopUp.open(message, action, {
      duration: 5000,
      panelClass: [type]
    });
  }
}
