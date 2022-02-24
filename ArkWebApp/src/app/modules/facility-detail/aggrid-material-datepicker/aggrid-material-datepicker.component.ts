import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/all-modules';
import { FacilityDetailComponent } from '../facility-detail.component';

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

    this.inputDate = new Date(<string> params.data['expectedDate']);
    if(this.inputDate.toLocaleDateString() == (new Date('0001-01-01T00:00:00')).toLocaleDateString())
      this.inputDate = null;
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
