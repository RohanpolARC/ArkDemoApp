import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Injectable, OnInit } from '@angular/core';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { ICheckboxChanged, ICheckboxControl, IDefaultValue, IDisableCheckbox, IShowCheckbox } from 'src/app/shared/modules/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.types';
import { ValuationGridService } from './valuation-grid.service';

@Injectable()
export class GridCheckboxUtilService implements OnInit {

  public getUseModelValuationCellRendererParams(): ICheckboxControl {
    return {
      defaultVal: this.defaultValForModelValuation,
      disableCheckbox: this.disableCheckboxForUseModelValuation,
      checkboxChanged: this.checkboxChangedForModelValuation,
      showCheckbox: this.showCheckboxForUseModelValuation
    }
  }
  public getForceOverrideCellRendererParams(): ICheckboxControl {
    return {
      defaultVal: this.defaultValForForceOverride,
      disableCheckbox: this.disableCheckboxForForceOverride,
      checkboxChanged: this.checkboxChangedForForceOverride,
      showCheckbox: this.showCheckboxForForceOverride
    }
  }
  public getReviewCellRendererParams(): ICheckboxControl {
    return {
      defaultVal: this.defaultValForReview,
      disableCheckbox: this.disableCheckboxForReview,
      checkboxChanged: this.checkboxChangedForReview,
      showCheckbox: this.showCheckboxForReview
    }
  }

  constructor(private gridSvc: ValuationGridService) { }
  
  component: IPropertyReader
  registerComponent(comp: IPropertyReader){
    this.component = comp;
  }
  
  private getAdaptableApi(): AdaptableApi {
    return this.component.readProperty<AdaptableApi>('adaptableApi');
  } 
  
  private getColumnDefs(): ColDef[] {
    return this.component.readProperty<ColDef[]>('columnDefs')
  }
  
  ngOnInit(){ }

  private showCheckboxForUseModelValuation: IShowCheckbox = (params: ICellRendererParams) => { 
    return !!params.data?.['modelValuation'] 
  }

  private showCheckboxForForceOverride: IShowCheckbox = (params: ICellRendererParams) => { 
    return String(params.data?.['markType']).toLowerCase() === 'impaired cost' && (params.data?.['seniority']?.toLowerCase() !== 'equity' || params.data?.['assetTypeName']?.toLowerCase() !== 'equity') 
  }

  private showCheckboxForReview: IShowCheckbox = (params: ICellRendererParams) => { 
    return !(params.data?.['showIsReviewed'] === -1)
  }

  private disableCheckboxForUseModelValuation: IDisableCheckbox = (params: ICellRendererParams) => { 
    return !this.gridSvc.isEditing(params.node); 
  }

  private disableCheckboxForForceOverride: IDisableCheckbox = (params: ICellRendererParams) => { 
    return !this.gridSvc.isEditing(params.node)
  }

  private disableCheckboxForReview: IDisableCheckbox = (params: ICellRendererParams) => { 
    return this.gridSvc.isEditing(params.node) || params.data?.['showIsReviewed'] === 1 
  }

  private checkboxChangedForModelValuation: ICheckboxChanged = (params: ICellRendererParams, boolVal: boolean) => {
    if(boolVal){
      params.data['oldOverride'] = params.data?.['override'];
      params.data['override'] = params.data?.['modelValuation'];
      params.data['oldShowIsReviewed'] = params.data?.['showIsReviewed'];
      params.data['showIsReviewed'] = 0;
      delete params.data['review']
    }
    else{
      params.data['override'] = params.data?.['oldOverride'];
      params.data['showIsReviewed'] = params.data['oldShowIsReviewed']; // need to reset it to the original value if useModelValuation was mistakenly ticked previously and now is being reverted back.
    }
    this.getAdaptableApi().gridApi.refreshCells([params.node], this.getColumnDefs().map(col => col.field))
  }

  private checkboxChangedForForceOverride: ICheckboxChanged = (params: ICellRendererParams, boolVal: boolean) => {
    params.data['forceOverride'] = boolVal;
    if(boolVal){
      params.data['oldShowIsReviewed'] = params.data?.['showIsReviewed'];

      params.data['showIsReviewed'] = 0;
      delete params.data['review']

    }
    else{
      params.data['showIsReviewed'] = params.data['oldShowIsReviewed']; // need to reset it to the original value if useModelValuation was mistakenly ticked previously and now is being reverted back.
    }
    this.getAdaptableApi().gridApi.refreshCells([params.node], this.getColumnDefs().map(col => col.field))
  }

  private checkboxChangedForReview: ICheckboxChanged
  
  private defaultValForModelValuation: IDefaultValue = (params: ICellRendererParams) => { return params.value }
  private defaultValForForceOverride: IDefaultValue = (params: ICellRendererParams) => { return params.value }
  private defaultValForReview: IDefaultValue = (params: ICellRendererParams) => { 
    if(params.data?.['showIsReviewed'] === 1)
      return true;
    
    else if(params.data?.['review'] && params.data?.['showIsReviewed'] === 0)
      return true;  
    return false;
  }
}