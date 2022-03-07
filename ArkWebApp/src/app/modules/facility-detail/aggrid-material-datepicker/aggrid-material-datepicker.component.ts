import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/all-modules';
import { FacilityDetailComponent } from '../facility-detail.component';
import { formatDate } from 'src/app/shared/functions/formatter';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

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

  inputDate: string = null;
  date = new FormControl(null)

  value?: string = null;

  datePipe: DatePipe;

  agInit(params: ICellEditorParams): void {
    this.params = params;  
    this.componentParent = params.context.componentParent;  
    this.value = String(params.data['expectedDate']) != 'null' ? String(params.data['expectedDate']) : null;
  }

  getValue() {
    return this.datePipe.transform(this.value, 'dd/MM/yyyy');
  }

  isCancelAfterEnd(): boolean {
      if(['01/01/1970', '01/01/1', '01/01/2001', 'NaN/NaN/NaN', 'null'].includes(this.value)){
        return true;
      }
      else return false;
  }

  ngOnInit(): void {

    this.value = String(this.params.data['expectedDate']) != 'null' ? String(this.params.data['expectedDate']) : null;

    this.datePipe = new DatePipe('en-GB');    
  }

}
