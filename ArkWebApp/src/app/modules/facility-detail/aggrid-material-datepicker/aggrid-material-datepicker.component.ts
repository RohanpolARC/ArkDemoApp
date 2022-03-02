import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/all-modules';
import { FacilityDetailComponent } from '../facility-detail.component';
import * as moment from 'moment';

@Component({
  selector: 'app-aggrid-material-datepicker',
  templateUrl: './aggrid-material-datepicker.component.html',
  styleUrls: ['./aggrid-material-datepicker.component.scss']
})
export class AggridMaterialDatepickerComponent implements OnInit, ICellEditorAngularComp {

  constructor() { }
  params: ICellEditorParams;
  componentParent: FacilityDetailComponent;

  rowNodeID;

  inputDate: Date = null;

  agInit(params: ICellEditorParams): void {
    this.params = params;  
    this.componentParent = params.context.componentParent;  

    this.inputDate = new Date(moment(params.data['expectedDate']).format('YYYY-MM-DD'))
    if(moment(params.data['expectedDate']).format('YYYY-MM-DD') === 'Invalid Date')
      this.inputDate = null

    if(<string> params.data['expectedDate'] === '0001-01-01T00:00:00'){
      this.inputDate = null
    }
  }

  getValue() {
    return this.inputDate;
  }

  onDateClick(){
    this.rowNodeID = this.componentParent.getSelectedRowID();
    this.params.api.getRowNode(this.rowNodeID).setDataValue('expectedDate', this.inputDate);
  }

  ngOnInit(): void {
  }

}
