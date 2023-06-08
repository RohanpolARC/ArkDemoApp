import { ColDef, FirstDataRenderedEvent, GetRowIdFunc, GetRowIdParams, GridOptions, GridReadyEvent, IDetailCellRendererParams, Module } from '@ag-grid-community/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { WSOMarkDetailComponent } from '../wsomark-detail/wsomark-detail.component';
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";
import { first, map } from 'rxjs/operators';
import { dateFormatter, dateTimeFormatter, nonAmountNumberFormatter } from 'src/app/shared/functions/formatter';

@Component({
  selector: 'app-mark-override-master',
  templateUrl: './mark-override-master.component.html',
  styleUrls: ['./mark-override-master.component.scss']
})
export class MarkOverrideMasterComponent implements OnInit {

  assetID: number
  marktype: string
  asofdate: string

  columnDefs: ColDef[]
  gridOptions: GridOptions
  wsomarkDetailRenderer: WSOMarkDetailComponent
  rowData$: Observable<any[]>
  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES, MasterDetailModule];

  detailCellRendererParams: IDetailCellRendererParams<any, any>;

  onFirstDataRendered: (event: FirstDataRenderedEvent<any>) => void;
  onGridReady: (event: GridReadyEvent<any>) => void = (event: GridReadyEvent) => {
    this.rowData$ = this.valuationSvc.getAuditMaster(this.assetID, this.marktype, this.asofdate)
      .pipe(
        map((rowData: any[]) => { 
          for(let i: number = 0; i < rowData.length; i+= 1){
            rowData[i] = { ...rowData[i], 'uniqueID': i+1 }
          }
          return rowData;
        })
    )
  }

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data?.uniqueID;
  };

  constructor(public dialogRef: MatDialogRef<MarkOverrideMasterComponent>,
    @Inject(MAT_DIALOG_DATA) public params: {
      assetID: number,
      marktype: string,
      asofdate: string  //'YYYY-MM-DD'
    },
    private valuationSvc: ValuationService) { }

  ngOnInit(): void {

    this.assetID = this.params.assetID;
    this.marktype = this.params.marktype;
    this.asofdate = this.params.asofdate;

    this.columnDefs = [
      { field: 'assetID', cellRenderer: 'agGroupCellRenderer' },
      { field: 'markOverride', valueFormatter: nonAmountNumberFormatter },
      { field: 'markDate', valueFormatter: dateFormatter },
      { field: 'valuationMethod', headerName: 'Mark Type' },
      { field: 'modifiedBy' },
      { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
      { field: 'auditEventID', hide: true }
    ]

    this.gridOptions = {
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true
      },
      masterDetail: true,
      detailRowHeight: 310,
      onFirstDataRendered: this.onFirstDataRendered,
      onGridReady: this.onGridReady,
      headerHeight: 30,
      rowHeight: 30,
      enableRangeSelection: true,
      // sideBar: true
    }

    let detailColDef: ColDef[] = [];
    if(this.marktype.toLowerCase() === 'mark to market'){
      detailColDef = [
        { field: 'positionID' },
        { field: 'fundHedging' },
        { field: 'portfolioName' },
        { field: 'mark', valueFormatter: nonAmountNumberFormatter },
        { field: 'markDate', valueFormatter: dateFormatter },
        { field: 'modifiedBy' },
        { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
        { field: 'wsoActivityID', valueFormatter: nonAmountNumberFormatter }    
      ];
    }
    else if(this.marktype.toLowerCase() === 'impaired cost'){
      detailColDef = [
        { field: 'assetID' },
        { field: 'issuerShortName' },
        { field: 'asset' },
        { field: 'mark', valueFormatter: nonAmountNumberFormatter },
        { field: 'markDate', valueFormatter: dateFormatter },
        { field: 'modifiedBy' },
        { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
        { field: 'wsoActivityID', valueFormatter: nonAmountNumberFormatter }    
      ]
    }
    this.detailCellRendererParams = {
      detailGridOptions: {
        columnDefs: detailColDef,
        defaultColDef: {
          resizable: true
        },
        headerHeight: 30,
        rowHeight: 30,
        enableRangeSelection: true,
        // sideBar: true
      },

      getDetailRowData: (params) => {

        let auditeventID: number = params.data?.['auditEventID'];

        this.valuationSvc.getAuditDetail(this.assetID, this.marktype, this.asofdate, auditeventID).pipe(first()).subscribe({
          next: (detail) => {
            params.successCallback(detail)
          },
          error: (error) => {
            console.error(`Failed to load audit details for audit event ID: ${auditeventID}`);
          }
        })
      }
    } as IDetailCellRendererParams
  }
}