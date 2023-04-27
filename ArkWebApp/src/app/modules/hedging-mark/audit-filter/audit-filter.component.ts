import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { take } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { DetailedViewService } from 'src/app/shared/modules/detailed-view/detailed-view.service';
import { HedgingMarkService } from '../service/hedging-mark.service';

@Component({
  selector: 'app-audit-filter',
  templateUrl: './audit-filter.component.html',
  styleUrls: []
})
export class AuditFilterComponent implements OnInit {

  markType = new FormControl('Mark Override');

  positionsDropdown = []
  selectedpositions = []

  constructor(
    private dataSvc: DataService,
    private detailedVwSvc: DetailedViewService,
    private hedgingMarkSvc: HedgingMarkService
  ) { }


  settings: IDropdownSettings = {
    singleSelection: false,
    textField: 'value',
    itemsShowLimit: 10,
    allowSearchFilter: true    
  }

  ngOnInit(){

    this.hedgingMarkSvc.auditingPositionsState.pipe(take(1)).subscribe((pids: number[]) => {
      this.selectedpositions = pids.map(p => {
        return { value: String(p), id: String(p) }
      })
    })

    this.dataSvc.getUniqueValuesForField('PositionID').pipe(take(1)).subscribe({
      next: (data) => {
        console.log(data)
        this.positionsDropdown = data
      },
      error: (error) => {
        console.error(`Failed to load the positionIDs: ${error}`)
      }
    })

    this.detailedVwSvc.applyBtnHitState.subscribe((isHit) => {
      // Listen to the filter and do your job

      this.detailedVwSvc.rowData = null;
      // // Generate the request object
      let request: DetailedView = <DetailedView>{}

      request.strParam1 = this.selectedpositions?.map(r => <string>r?.['value'])
      request.param1 = ''
      request.param2 = '',
      request.param3 = this.markType.value,
      request.param4 = request.param5 =  ' '
      request.screen = 'Valuation/Hedging Mark'

      this.detailedVwSvc.updateRequest(request);
      
    })
  }

  onSelectedPositionsChange(event){
    this.selectedpositions = event
  }
}