import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { FacilityDetailComponent } from '../facility-detail.component';
import { formatDate } from 'src/app/shared/functions/formatter';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';
import { ICellEditorParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-aggrid-material-datepicker',
  templateUrl: './aggrid-material-datepicker.component.html',
  styleUrls: ['./aggrid-material-datepicker.component.scss']
})
export class AggridMaterialDatepickerComponent implements OnInit, ICellEditorAngularComp, OnDestroy {

  private subs: Subscription[] = [];

  constructor() { }
  params: ICellEditorParams;
  componentParent: FacilityDetailComponent;

  val: string;  // Verbose Date Format
  dateControl = new FormControl('');

  @ViewChild(MatDatepicker, { static: true })
  datepicker: MatDatepicker<Date>

  themeSizes:{
    rowHeight: number;
    headerHeight: number;
  }

  customMatDatePickerStyle :string = 'width: 100%;'

  ngAfterViewInit(): void {
    // this.datepicker.open();
  }

  agInit(params: ICellEditorParams): void{
    this.params = params;
    this.componentParent = params.context.componentParent;

    let str: string = params.value;
    this.val = str
    this.dateControl.setValue(
      new Date(Date.UTC(parseInt(str?.split('/')[2]), parseInt(str?.split('/')[1]) - 1, parseInt(str?.split('/')[0])))
    )

    this.val = this.dateControl.value;
    this.themeSizes =  params.api.getSizesForCurrentTheme()
    if(this.themeSizes.rowHeight===30){
      this.customMatDatePickerStyle = 'font-size: 0.75rem; width: 100%;'
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.subs.push(this.dateControl.valueChanges.subscribe({
      error: console.error,
      next: (value) => {
        this.val = value
        // this.params.stopEditing();
      }
    }));
  }

  getValue() {
    if(this.val == null || ['01/01/1970', '01/01/2001', '01/01/1', '01/01/01', 'NaN/NaN/NaN'].includes(formatDate(this.val))){
      return null;
    }
    return formatDate(this.val)
  }
}
