import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit,  Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DetailedView, NoRowsCustomMessages } from '../../../models/GeneralModel';
import { DetailedViewService } from '../detailed-view.service';

@Component({
  selector: 'app-default-detailed-view',
  templateUrl: './default-detailed-view.component.html',
  styleUrls: ['./default-detailed-view.component.scss']
})
export class DefaultDetailedViewComponent implements OnInit {

  @Input() detailedViewRequest    : any
  @Input() failureMsg             : string = null
  @Input() header                 : string = 'Detailed View'
  @Input() noDataMessage          : string = 'No detailed view'

  @Input() gridOptions            : GridOptions
  @Input() columnDefs             : ColDef[]
  @Input() rowData                : any[]

  @Input() filterspace            : TemplateRef<any>

  subscriptions                   : Subscription[] = [];
  request                         : DetailedView;
  defaultColDef                   : ColDef;
  agGridModules                   : Module[] = CommonConfig.AG_GRID_MODULES;

  noRowsToDisplayMsg              : NoRowsCustomMessages = 'No data found.';

  gridConfig$                     : Observable<any[]>;

  constructor(private detailedVwSvc: DetailedViewService) { }

  ngOnInit(): void {
  }

  onApply(){ 
    // this.applyHit.emit(true)
    this.detailedVwSvc.hitApply(true)
  }

  onGridReady(params: GridReadyEvent){
    params.api.closeToolPanel();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
