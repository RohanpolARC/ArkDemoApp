import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { ICheckboxCellParams, ICheckboxChanged, ICheckboxControl, IDefaultValue, IDisableCheckbox, IShowCheckbox } from '../aggrid-mat-checkbox-editor.types';

@Component({
  selector: 'app-aggrid-mat-checkbox-editor',
  templateUrl: './aggrid-mat-checkbox-editor.component.html',
  styleUrls: ['./aggrid-mat-checkbox-editor.component.scss']
})
export class AggridMatCheckboxEditorComponent implements ICellRendererAngularComp, ICheckboxControl  {

  params: ICellRendererParams;
  checked: boolean;

  showCheckbox: IShowCheckbox = ((params) => true);
  disableCheckbox: IDisableCheckbox = ((params) => false);
  checkboxChanged: ICheckboxChanged = ((params, boolVal) => {});
  defaultVal: IDefaultValue = ((params) => false); 
  
  constructor() { }

  initHelperFns(params: ICheckboxCellParams): void {

    if(params?.['showCheckbox'])
      this.showCheckbox = params?.['showCheckbox']
    if(params?.['disableCheckbox'])
      this.disableCheckbox = params?.['disableCheckbox'];
    if(params?.['checkboxChanged'])
      this.checkboxChanged = params?.['checkboxChanged'];
    if(params?.['defaultVal'])
      this.defaultVal = params?.['defaultVal'];
  }

  agInit(params: ICheckboxCellParams): void {
    this.params = params;

    this.initHelperFns(params)
    
    if(this.defaultVal)
      this.checked = this.defaultVal(params);
  }
  
  refresh(params: ICellRendererParams<any, any>): boolean {

    // In this case, ag-grid will re-create the cell everytime anything happens here. There is not custom refresh logic here, hence false. So, refresh here is just the reinitialisation of the checkbox cell. Hence, it will always call agInit() to refresh the cell value and will use defaultVal() function to assign values. 

    // NOTE: Here, setting the value of the checkbox will be done by defaultVal() at all times. So, implement the value switching logic, if any in this function. 
    return false;
  }

  onModelChanged(boolVal: boolean){
    this.checked = boolVal;

    let colid: string = this.params.column.getColId();
    this.params.data[colid] = boolVal;

    if(this.checkboxChanged)
      this.checkboxChanged(this.params, boolVal);
  }
} 