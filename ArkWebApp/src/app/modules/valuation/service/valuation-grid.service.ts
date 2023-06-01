import { ActionColumnContext, AdaptableApi, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { CellClassParams, CellValueChangedEvent, EditableCallbackParams, GridApi, RowNode } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { getFinalDate } from 'src/app/shared/functions/utilities';
import { APIReponse, IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { Valuation } from 'src/app/shared/models/ValuationModel';

@Injectable()
export class ValuationGridService {

  component: IPropertyReader

  registerComponent(comp: IPropertyReader){
    this.component = comp;
  }

  public lockEdit: boolean

  overrideColMap: {
    [col: string] : {
      global: string
    }
  }

  constructor(private dataSvc: DataService,
    private valuationSvc: ValuationService) {

    this.overrideColMap = {
      'override': { global: 'globaloverride' },
      'initialYieldCurveSpread': { global: 'globalinitialYieldCurveSpread' },
      'initialCreditSpread': { global: 'globalinitialCreditSpread' },
      'creditSpreadIndex': { global: 'globalcreditSpreadIndex' },
      'deltaSpreadDiscount': { global: 'globaldeltaSpreadDiscount' },
      'overrideDate': { global: 'globaloverrideDate' }
    }
  }

  getOverrideColumns(): string[] {
    return Object.keys(this.overrideColMap);
  }

  getAdaptableApi(): AdaptableApi {
    return this.component.readProperty<AdaptableApi>('adaptableApi');
  }

  getGridApi(): GridApi {
    return this.component.readProperty<GridApi>('gridApi');
  }

  getAsOfDate(): string {
    return this.component.readProperty<string>('asOfDate');
  }

  setFields(node: RowNode, overrideCols: string[], mode: 'Set' | 'Reset'){

    for(let i: number = 0; i < overrideCols.length; i+= 1){
      let col: string = overrideCols[i];

      if(mode === 'Set')
        node.data[this.overrideColMap[col].global] = node.data[col];
      else
        node.data[col] = node.data[this.overrideColMap[col].global];
    }
  }

  editActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
    if(this.lockEdit){
      this.dataSvc.setWarningMsg(`An asset is already in editing state`,`Dismiss`,`ark-theme-snackbar-warning`)
    }
    else {
      this.lockEdit = true;
      context.rowNode.data['editing'] = true;

      this.setFields(context.rowNode, this.getOverrideColumns(), 'Set');

      this.getAdaptableApi().gridApi.refreshCells([context.rowNode], this.getOverrideColumns());
    }
  }

  isEditing(context: ActionColumnContext | RowNode): boolean{
    if(context instanceof RowNode){
      let isRowEditing: boolean = !!<RowNode>context?.data?.['editing'];
      return isRowEditing;
    }
    else{  
      return !!<ActionColumnContext>context.rowNode.data['editing'];
    }
  }

  saveActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
    let node: RowNode = context.rowNode;

    let valuation: Valuation = <Valuation> {};
    valuation.assetID = node.data?.['assetID'];
    valuation.markType = node.data?.['markType'];   // Hedging Mark/Mark Override
    valuation.creditSpreadIndex = node.data?.['creditSpreadIndex'];
    valuation.initialCreditSpread = node.data?.['initialCreditSpread'];
    valuation.initialYieldCurveSpread = node.data?.['initialYieldCurveSpread'];
    valuation.deltaSpreadDiscount = node.data?.['deltaSpreadDiscount'];
    valuation.override = node.data?.['override'];
    valuation.overrideDate = getFinalDate(new Date(this.getAsOfDate())); //getFinalDate(node.data?.['overrideDate']);
    valuation.modifiedBy = this.dataSvc.getCurrentUserName();



    // let ovrdDate: string = formatDate(node.data?.['overrideDate']);
    // ovrdDate = ovrdDate === 'NaN/NaN/NaN' ? null : ovrdDate;

    // valuation.overrideDate = ovrdDate;

    this.valuationSvc.putValuationData([valuation]).pipe(first()).subscribe({
      next: (res: APIReponse) => {
        if(res.isSuccess){
          this.dataSvc.setWarningMsg(`Saved Valuation information for this asset`, `Dismiss`, `ark-theme-snackbar-success`);

          node.data['modifiedBy'] = valuation.modifiedBy;
          node.data['modifiedOn'] = new Date();

          this.lockEdit = false;
          delete context.rowNode.data['editing'];
          
          let adaptableApi: AdaptableApi = this.component.readProperty<AdaptableApi>('adaptableApi');
          adaptableApi.gridApi.refreshCells([context.rowNode], [...this.getOverrideColumns(), 'action']);
        }
        else {
          this.dataSvc.setWarningMsg(`Failed to save valuation information for this asset`, 'Dismiss', 'ark-theme-snackbar-error')
        }
      },
      error: (err) => {
        console.error(`Failed to save valuation model: ${err}`)
      }
    })

  }

  clearEditingStateForRow(node: RowNode){
    this.lockEdit = false;
    delete node?.data?.['editing'];

    this.setFields(node, [...this.getOverrideColumns()], 'Reset');

    this.getAdaptableApi().gridApi.refreshCells([node], [...this.getOverrideColumns(), 'action']);
  }

  cancelActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
    
    this.clearEditingStateForRow(context.rowNode);
    
    // this.lockEdit = false;
    // delete context.rowNode.data['editing'];

    // this.setFields(context.rowNode, [...this.getOverrideColumns()], 'Reset');

    // this.getAdaptableApi().gridApi.refreshCells([context.rowNode], this.getOverrideColumns());
  }

  infoActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
  }

  runActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
  }

  hideEditActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    return this.isEditing(context);
  }

  hideInfoActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    return this.isEditing(context);
  }

  hideRunActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    if(context?.data?.['markType'] !== 'Mark to Market')
      return true   
    return this.isEditing(context);
  }

  hideCancelActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    return !this.isEditing(context);
  }

  hideSaveActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    return !this.isEditing(context);
  }

  editableCellStyle = (params: CellClassParams) => {
    let node: RowNode = params.node;

    if(node.group)
      return null;

    if(this.isCellEditable(params)){
      return {
        'border-color': '#0590ca'
      }
    }
    return null;
  }

  onOverrideCellValueChanged(event: CellValueChangedEvent){

    let node: RowNode = event.node;
    node.data['overrideDate'] = getFinalDate(new Date(this.getAsOfDate()));

    this.getAdaptableApi().gridApi.refreshCells([node], [...this.getOverrideColumns()]);
  }

  isEditable = (params: EditableCallbackParams) => {
    return this.isCellEditable(params);
  }

  isCellEditable(params: EditableCallbackParams | CellClassParams){

    if(params?.data?.['markType'] === 'Hedging Mark' || params?.data?.['markType'] === 'Impaired Cost'){
      if(params.column.getColId() === 'override')
        return this.isEditing(params.node);
      else
        return false;
    }
    else 
        return this.isEditing(params.node);
  }

  clearEditingState(hideWarnings: boolean = false){
    this.getGridApi().stopEditing(true);

    let nodes: RowNode[] = this.getAdaptableApi().gridApi.getAllRowNodes({
      includeGroupRows: false,
      filterFn: (node: RowNode) => {
        return this.isEditing(node);
      }
    })

    if(nodes.length > 1){
      this.dataSvc.setWarningMsg(`Error clearing editing state. Please reload.`, `Dismiss`, 'ark-theme-snackbar-warning')
    }
    else if(nodes.length = 1){
      // Perform clearing action here.
      this.clearEditingStateForRow(nodes[0]);

    }
    else if(!hideWarnings)
      this.dataSvc.setWarningMsg(`Editing state already cleared`, 'Dismiss', 'ark-theme-snackbar-normal');
  }
}