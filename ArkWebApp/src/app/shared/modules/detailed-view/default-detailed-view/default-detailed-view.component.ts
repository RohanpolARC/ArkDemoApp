import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit,  Input, TemplateRef, SimpleChanges } from '@angular/core';
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

  @Input() failureMsg             : string = null
  @Input() header                 : string = 'Detailed View'
  @Input() noDataMessage          : string = 'No detailed view'

  @Input() gridOptions            : GridOptions
  @Input() columnDefs             : ColDef[]
  @Input() rowData                : any[]

  @Input() noFilterSpace          : boolean = false;
  // Search space template passed as Input()

  @Input() filterspace            : TemplateRef<any>

  // Required when not using any filter space. request sent here would be directly accepted.
  @Input() requestIfNoFilter      : DetailedView;

  subscriptions                   : Subscription[] = [];
  defaultColDef                   : ColDef;
  agGridModules                   : Module[] = CommonConfig.AG_GRID_MODULES;

  noRowsToDisplayMsg              : NoRowsCustomMessages = 'No data found.';

  gridConfig$                     : Observable<any[]>;

  constructor(private detailedVwSvc: DetailedViewService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){
    
    // If no filter is applicable, then we automatically update the request listener for it to make a request directly since there is no Apply button to listen from.

    if(changes?.['noFilterSpace']?.currentValue === true){
      this.detailedVwSvc.updateRequest(this.requestIfNoFilter);
    }
  }

  onApply(){ 
    this.detailedVwSvc.hitApply(true)
  }

  onGridReady(params: GridReadyEvent){
    params.api.closeToolPanel();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
