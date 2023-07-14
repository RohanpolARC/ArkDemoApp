import { ColDef, DetailGridInfo, FirstDataRenderedEvent, GetRowIdFunc, GetRowIdParams, GridOptions, GridReadyEvent, IDetailCellRendererParams, IsRowMaster, Module, RowGroupOpenedEvent } from '@ag-grid-community/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";
import { first, map } from 'rxjs/operators';
import { dateFormatter, dateTimeFormatter, nonAmountNumberFormatter, nullOrZeroFormatterWithoutLocale } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';

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
  detailColumnDefs: ColDef[]
  gridOptions: GridOptions
  rowData$: Observable<any[]>
  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES, MasterDetailModule];

  detailCellRendererParams: IDetailCellRendererParams<any, any>;

  onFirstDataRendered: (event: FirstDataRenderedEvent<any>) => void = (event:FirstDataRenderedEvent)=>{
    autosizeColumnExceptResized(event)
  };
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
      assetID?: number,   // Can be empty, in case of global audit
      marktype?: string,  // Can be empty, in case of global audit

      // This will be the date (likely current date) for which its positions will be used to check the mark (not markDate).
      asofdate: string  //'YYYY-MM-DD'
    },
    private valuationSvc: ValuationService) { }

  ngOnInit(): void {

    this.assetID = this.params.assetID;
    this.marktype = this.params.marktype;
    this.asofdate = this.params.asofdate;

    this.columnDefs = [
      { field: 'assetID', cellRenderer: 'agGroupCellRenderer' },
    ]

    if(!this.assetID) {      // In case of global audit
      this.columnDefs = [...this.columnDefs,
        { field: 'issuerShortName' },
        { field: 'asset' },    
      ]
    }

    this.columnDefs = [ ...this.columnDefs,
      { field: 'type' },
      { field: 'markOverride', valueFormatter: nonAmountNumberFormatter },
      { field: 'calculatedWSOMark', valueFormatter: nonAmountNumberFormatter },
      { field: 'markDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
      { field: 'valuationMethod', headerName: 'Mark Type' },
      { field: 'modifiedBy' },
      { field: 'modifiedOn', valueFormatter: dateTimeFormatter, cellClass: 'dateUK' },
      { field: 'reviewedBy' },
      { field: 'reviewedOn', valueFormatter: dateTimeFormatter, cellClass: 'dateUK' },
      { field: 'auditEventID', hide: true },
      { field: 'wsoStatus', hide: true },
      { field: 'isMarkedAtCost', hide: true },
      { field: 'comment', width: 500 },
    ]

    if(!this.assetID) {      // In case of global audit
      this.columnDefs = [...this.columnDefs,
        { field: 'issuer' }
      ]
    }

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        cellStyle: this.gridCellStyle.bind(this),
        filter: true 
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      masterDetail: true,
      isRowMaster: this.isRowMaster,
      keepDetailRows: true,
      keepDetailRowsCount: 5,
      detailRowHeight: 310,
      onFirstDataRendered: this.onFirstDataRendered,
      onGridReady: this.onGridReady,
      headerHeight: 30,
      rowHeight: 30,
      enableRangeSelection: true,
      onRowGroupOpened: this.onRowGroupOpened
    }

    this.detailCellRendererParams = {
      ...CommonConfig.GRID_OPTIONS,
      detailGridOptions: {
        columnDefs: this.detailColumnDefs,
        defaultColDef: {
          resizable: true,
          cellStyle: this.gridCellStyle.bind(this)
        },
        headerHeight: 30,
        rowHeight: 30,
        enableRangeSelection: true,
      },

      getDetailRowData: (params) => {

        let auditeventID: number = params.data?.['auditEventID'];
        let assetID: number = params.data?.['assetID'];
        let marktype: string = params.data?.['valuationMethod']; 

        this.valuationSvc.getAuditDetail(assetID, marktype, this.asofdate, auditeventID).pipe(first()).subscribe({
          next: (detail) => {
            params.successCallback(detail)
          },
          error: (error) => {
            console.error(`Failed to load audit details for audit event ID: ${auditeventID}`);
          }
        })
      },
    } as IDetailCellRendererParams
  }

  gridCellStyle(params){
    return { 'background': params.data?.['colour'] };
  }

  isRowMaster: IsRowMaster = (nData: any) => {
    return nData ? nData?.['isReviewed'] : false;
  }

  onClose(){
    this.dialogRef.close()
  }

  onRowGroupOpened: (event: RowGroupOpenedEvent<any>) => void = (params: RowGroupOpenedEvent) => {

    this.detailColumnDefs = [
      { field: 'assetID', valueFormatter: nullOrZeroFormatterWithoutLocale },
      { field: 'positionID', valueFormatter: nullOrZeroFormatterWithoutLocale },
      { field: 'fundHedging' },
      { field: 'portfolioName' },
      { field: 'mark', valueFormatter: nonAmountNumberFormatter },
      { field: 'markDate', valueFormatter: dateFormatter },
      { field: 'modifiedBy' },
      { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
      { field: 'wsoAuditID', valueFormatter: nonAmountNumberFormatter },
      { field: 'wsoStatus', hide: true },
      { field: 'isMarkedAtCost', hide: true },
      { field: 'comment' }
    ]

    let detailGridInfo: DetailGridInfo = params.api.getDetailGridInfo(`detail_${params.data?.['uniqueID']}`);
    if(detailGridInfo){
      detailGridInfo.api.setColumnDefs(this.detailColumnDefs);
    }
  }
}