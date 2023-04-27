import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, Inject, TemplateRef, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { DetailedViewService } from '../detailed-view.service';

@Component({
  selector: 'app-default-detailed-view-popup',
  templateUrl: './default-detailed-view-popup.component.html',
  styleUrls: ['./default-detailed-view-popup.component.scss']
})
export class DefaultDetailedViewPopupComponent implements OnInit {

  failureMsg: string = null;
  header: string = 'Detailed View'
  noDataMessage: string = 'No detailed view'
  detailedViewRequest: any;

  requestListener$: Observable<any[]>
  configLoader$: Observable<any>

  constructor(
    private detailedVwSvc: DetailedViewService,
    public dialogRef: MatDialogRef<DefaultDetailedViewPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public params: {
      detailedViewRequest: DetailedView | null,
      failureMsg: string,
      header: string,
      noDataMessage: string,
      grid?: string,      // To load grid config name from the DB.
      filterTemplateRef: TemplateRef<any>,

      noFilterSpace: boolean
    }
  ) { }

  public get noFilterSpace(): boolean {
    return this.params.noFilterSpace;
  }

  public get gridOptions(): GridOptions {
    return this.detailedVwSvc.gridOptions;
  }

  public get gridColumnDefs(): ColDef[] {
    return this.detailedVwSvc.columnDefs;
  }

  public get gridData(): any[] {
    return this.detailedVwSvc.rowData;
  }

  public get filterTemplateRef(): TemplateRef<any> {
    return this.params.filterTemplateRef;
  }









  ngOnInit(): void {
    if(this.params.detailedViewRequest)
      this.detailedViewRequest = this.params?.['detailedViewRequest'];
    if(this.params.failureMsg)   
      this.failureMsg = this.params?.['failureMsg'];
    if(this.params.header)
      this.header = this.params?.['header'];
    if(this.params.noDataMessage)
      this.noDataMessage = this.params?.['noDataMessage'];

    if(this.params.grid){

      // Loading grid config 
      let gridName: string = this.params.grid;



    // *** This would be needed to be defined in the wherever default-detailed-view component would be embeded in.      
      this.configLoader$ = this.detailedVwSvc.loadingGridConfig(gridName);
      this.requestListener$ = this.detailedVwSvc.onRequestUpdate();
    }

    // *** Clearing the grid when dialog box is closed.
    this.dialogRef.beforeClosed().pipe(take(1)).subscribe(() => {
      this.detailedVwSvc.rowData = null;
    })
    
  }

  onClose(){
    this.dialogRef.close();
  }
}