import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from '../../components/no-rows-overlay/no-rows-overlay.component';
import { createColumnDefs2, GridColumnConfig, parseFetchedData } from '../../functions/dynamic.parse';
import { DetailedView } from '../../models/GeneralModel';

@Injectable()
export class DetailedViewService {

  columnDefs: ColDef[]
  gridOptions: GridOptions
  
  detailedView: DetailedView    // To should get auto updated once user hits apply
  rowData: any[]

  // To listen to any changes made to the filter and user wanting to refresh the results for the same.

  private applyBtnHit = new BehaviorSubject<boolean>(false);
  applyBtnHitState = this.applyBtnHit.asObservable();
  hitApply(isHit: boolean){
      this.applyBtnHit.next(isHit);
  }
  
  private detailedVwReq = new BehaviorSubject<DetailedView>(<DetailedView>{});
  detailedVwReqState = this.detailedVwReq.asObservable();
  updateRequest(request: DetailedView){
    this.detailedVwReq.next(request);
  }


  constructor(private dataSvc: DataService) { }

  // Needs to be used in the component consuming default-detailed-view, just like its pop up component.
  onRequestUpdate(): Observable<any[]> {

    return this.detailedVwReqState.pipe(
      filter((req: DetailedView) => Object.keys(req).length >= 1),
      switchMap((req: DetailedView) => this.dataSvc.getDetailedView(req).pipe(
        tap((data) => {
          this.rowData = parseFetchedData(data);
        })
      ))
    )
  }

  // Needs to be used in the component consuming default-detailed-view, just like its pop up component.
  loadingGridConfig(gridName: string) {

    return this.dataSvc.getRefDatatable(gridName).pipe(
      map((config) => JSON.parse(<string><unknown>config)),
      tap((config: GridColumnConfig[]) => {
        this.columnDefs = createColumnDefs2(config);
        this.gridOptions = this.getGridOptions();
      })
    )
  }

  getGridOptions(): GridOptions {
    
    return {
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        sortable: true,
        filter: true,
      },
      headerHeight: 30,
      rowHeight: 30,
      groupHeaderHeight: 30,
      tooltipShowDelay: 0,
      enableRangeSelection: true,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => `Please apply filter`,
      },
    }  
  }
}
