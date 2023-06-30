import { ActionColumnContext, AdaptableApi, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { CellClassParams, CellClickedEvent, CellValueChangedEvent, ColDef, EditableCallbackParams, GridApi, RowNode, ValueGetterParams } from '@ag-grid-community/core';
import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { getFinalDate } from 'src/app/shared/functions/utilities';
import { APIReponse, DetailedView, IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { Valuation } from 'src/app/shared/models/ValuationModel';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';
import { MarkOverrideMasterComponent } from '../mark-override-master/mark-override-master.component';

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
    private valuationSvc: ValuationService,
    private accessSvc: AccessService,
    public dialog: MatDialog) {

    this.overrideColMap = {
      'override': { global: 'globaloverride' },
      'spreadBenchmarkIndex': { global: 'globalspreadBenchmarkIndex' },
      'benchmarkIndexYield': { global: 'globalBenchmarkIndexYield' },
      'currentBenchmarkSpread': { global: 'globalCurrentBenchmarkSpread' },
      'benchmarkIndexPrice': { global: 'globalBenchmarkIndexPrice' },
      'effectiveDate': { global: 'globalEffectiveDate' },
      'deltaSpreadDiscount': { global: 'globaldeltaSpreadDiscount' },
      'overrideDate': { global: 'globaloverrideDate' },
      'showIsReviewed': { global: 'globalshowIsReviewed' },
      'review': { global: 'globalreview' },
      'comment': { global: 'globalcomment' },
      'modifiedBy': { global: 'globalmodifiedBy' },
      'modifiedOn': { global: 'globalmodifiedOn' },
      'reviewedBy': { global: 'globalReviewedBy' },
      'reviewedOn': { global: 'globalReviewedOn' },
      'useModelValuation': { global: 'globaluseModelValuation' },
      'isModelValuationStale': { global: 'globalisModelValuationStale' }
    }
  }

  runEvent(): EventEmitter<number[]> {
    return this.component.readProperty<EventEmitter<number[]>>('valuationEventEmitter');
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

  getColumnDefs(): ColDef[] {
    return this.component.readProperty<ColDef[]>('columnDefs');
  }

  getAsOfDate(): string {
    return this.component.readProperty<string>('asOfDate');
  }

  getFunds(): string[] {
    return this.component.readProperty<string[]>('funds');
  }

  getBenchmarkIndexes(): { [index: string]: any } {
    return this.component.readProperty<{ [index: string]: any }>('benchmarkIndexes');
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
    if(!this.accessSvc.checkWriteAccessForTab('Valuation')){
      this.dataSvc.setWarningMsg(`No write access found`, `Dismiss`, `ark-theme-snackbar-warning`)
      return;
    }
    else if(this.lockEdit){
      this.dataSvc.setWarningMsg(`An asset is already in editing state`,`Dismiss`,`ark-theme-snackbar-warning`)
      return;
    }
    else if(context.rowNode.data?.['showIsReviewed'] != 1 && context.rowNode.data?.['review']){
      this.dataSvc.setWarningMsg(`Please complete/discard the review first`);
      return;
    }
    else {
      this.lockEdit = true;
      context.rowNode.data['editing'] = true;

      this.setFields(context.rowNode as RowNode, this.getOverrideColumns(), 'Set');

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

    this.dataSvc.setWarningMsg(`Please wait while we save the updates`,`Dismiss`,'ark-theme-snackbar-normal')

    let node: RowNode = <RowNode>context.rowNode;

    let valuation: Valuation = <Valuation> {};
    valuation.assetID = node.data?.['assetID'];
    valuation.markType = node.data?.['markType'];   // Hedging Mark/Mark Override
    valuation.spreadBenchmarkIndex = node.data?.['spreadBenchmarkIndex'];
    valuation.deltaSpreadDiscount = node.data?.['deltaSpreadDiscount'];
    
    // To clear up hedging mark by setting it to NULL in DB.
    valuation.override = (node.data?.['override'] === "") ? null : node.data?.['override'];
    valuation.overrideSource = (node.data?.['useModelValuation']) ? 'Model Valuation' : 'New Mark';
    valuation.overrideDate = getFinalDate(new Date(this.getAsOfDate())); 
    valuation.modifiedBy = this.dataSvc.getCurrentUserName();

    this.valuationSvc.putValuationData([valuation]).pipe(first()).subscribe({
      next: (res: APIReponse) => {
        if(res.isSuccess){
          this.dataSvc.setWarningMsg(`Saved Valuation information for this asset`, `Dismiss`, `ark-theme-snackbar-success`);

          node.data['modifiedBy'] = valuation.modifiedBy;
          node.data['modifiedOn'] = new Date();

          // node.data['comment'] = null;

          this.lockEdit = false;
          delete context.rowNode.data['editing'];
          
          let adaptableApi: AdaptableApi = this.component.readProperty<AdaptableApi>('adaptableApi');
          adaptableApi.gridApi.refreshCells([context.rowNode], [...this.getOverrideColumns(), 'action', 'comment']);
        }
        else if(res.isSuccess === false){
          this.dataSvc.setWarningMsg(`Failed to save valuation information. Please try again.`)

          // node.data['comment'] = res.returnMessage;

          this.lockEdit = false;
          delete context.rowNode.data['editing'];

          this.getAdaptableApi().gridApi.refreshCells([context.rowNode], [...this.getOverrideColumns(), 'action', 'comment'])
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

    this.getAdaptableApi().gridApi.refreshCells([node], [...this.getColumnDefs().map(col => col.field), 'action']);
  }

  cancelActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {    
    this.clearEditingStateForRow(context.rowNode as RowNode);
  }

  infoActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {

    let node: RowNode = <RowNode>context.rowNode;

    let marktype: string = node.data?.['markType'].toLowerCase();

    if(marktype === 'mark to market' || marktype === 'impaired cost'){
      const dialogRef = this.dialog.open(MarkOverrideMasterComponent, {
        data: {
          assetID: node.data?.['assetID'],
          marktype: node.data?.['markType'],
          asofdate: this.getAsOfDate()
        },
        width: '90vw',
        height: '80vh'
      })  
    }

    else if(marktype === 'hedging mark'){
      let req: DetailedView = <DetailedView>{};
      req.screen = 'Valuation-Hedging Mark';
      req.param1 = String(node.data?.['assetID']);
      req.param2 = String(node.data?.['markType']);
      req.param3 = req.param4 = req.param5 = '';
      req.strParam1 = [];

      this.dialog.open(DefaultDetailedViewPopupComponent, {
        data: {
          detailedViewRequest: req,
          noFilterSpace: true,
          grid: 'Valuation-Hedging Mark',
          header: 'Audit Log - Hedging Mark'

        },
        width: '90vw',
        height: '80vh'
      })

    }
  }

  runActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {

    let assetID: number = context.rowNode.data?.['assetID'];

    this.runEvent().emit([assetID]);
  }

  hideEditActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    return this.isEditing(context);
  }

  hideInfoActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    return this.isEditing(context);
  }

  hideRunActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext): boolean {
    if(context?.data?.['markType']?.toLowerCase() !== 'mark to market')
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
    let node: RowNode = <RowNode>params.node;

    if(node.group)
      return null;

    if(this.isCellEditable(params)){
      return {
        borderColor: '#0590ca'
      }
    }
    return null;
  }

  checkValidations(params: CellValueChangedEvent, tolerance: number = 5){

    let column: string = params.column.getColId();
    let data = params.data;
    let marktype: string = data?.['markType'];
    
    if(column = 'override'){
      let mark: number = data?.['override'] ?? 0.0;
      let currentWSOMark: number = data?.['currentWSOMark'] ?? 0.0;
      let diffRate: number = Math.abs(((currentWSOMark - mark) / currentWSOMark) * 100.0);
      
      if(diffRate > tolerance){
        this.dataSvc.setWarningMsg(`Override mark varying by more than ${tolerance} percent as compared to current wso mark`);
      }
    }
  }

  onOverrideCellValueChanged(event: CellValueChangedEvent){

    this.checkValidations(event, 5.0);

    let node: RowNode = <RowNode>event.node;
    node.data['overrideDate'] = getFinalDate(new Date(this.getAsOfDate()));

    let marktype: string = node.data?.['markType'].toLowerCase();

    if(marktype === 'hedging mark'){
      node.data['showIsReviewed'] = -1;
    }
    else {
      node.data['showIsReviewed'] = 0;
    }

    node.data['review'] = false;
    node.data['useModelValuation'] = false;
    node.data['comment'] = '';
    node.data['modifiedBy'] = this.dataSvc.getCurrentUserName();
    node.data['modifiedOn'] = new Date();
    node.data['createdBy'] = this.dataSvc.getCurrentUserName();
    node.data['createdOn'] = new Date();

    this.getAdaptableApi().gridApi.refreshCells([node], this.getColumnDefs().map(col => col.field));
  }

  onDeltaSpreadDiscountCellValueChanged(params: CellValueChangedEvent){

    let node: RowNode =<RowNode> params.node;
    node.data['isModelValuationStale'] = true;

    this.getAdaptableApi().gridApi.refreshCells([node], this.getColumnDefs().map(col => col.field));
  }

  onIndexCellValueChanged(params: CellValueChangedEvent){

    let index: string = params?.data?.['spreadBenchmarkIndex'];

    let node: RowNode = <RowNode>params.node;
    node.data['benchmarkIndexYield'] = this.getBenchmarkIndexes()[index]?.['benchmarkIndexYield'];
    node.data['currentBenchmarkSpread'] = this.getBenchmarkIndexes()[index]?.['currentBenchmarkSpread'];
    node.data['benchmarkIndexPrice'] = this.getBenchmarkIndexes()[index]?.['benchmarkIndexPrice'];
    node.data['effectiveDate'] = this.getBenchmarkIndexes()[index]?.['effectiveDate'];

    node.data['deltaSpreadDiscount'] = node.data?.['currentBenchmarkSpread'] ?? 0.0;
    this.getAdaptableApi().gridApi.refreshCells([node], this.getColumnDefs().map(col => col.field));
  }

  isEditable = (params: EditableCallbackParams) => {
    return this.isCellEditable(params);
  }

  isCellEditable(params: EditableCallbackParams | CellClassParams){

    if(params?.data?.['markType'] === 'Hedging Mark' || params?.data?.['markType'] === 'Impaired Cost'){
      if(params.column.getColId() === 'override')
        return this.isEditing(params.node as RowNode);
      else
        return false;
    }
    else 
        return this.isEditing(params.node as RowNode);
  }

  clearEditingState(hideWarnings: boolean = false){

    if(!this.lockEdit){

      if(!hideWarnings){
        this.dataSvc.setWarningMsg(`Editing state already cleared`, 'Dismiss', 'ark-theme-snackbar-normal');
      }
      return;
    }

    this.getGridApi().stopEditing(true);

    let nodes: RowNode[] = <RowNode[]>this.getAdaptableApi().gridApi.getAllRowNodes({
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
      this.dataSvc.setWarningMsg(`Editing state has been cleared`, `Dismiss`, `ark-theme-snackbar-normal`)
    }
  }

  updateModelValuation(vals: { 
    assetID: number, modelValuation: number, modelValuationMinus100: number, modelValuationPlus100: number, deltaSpreadDiscount: number }[]
  ){
    
    let valMap = {};
    vals.forEach(val => valMap[val.assetID] = { ...val, 'assetID': Number(val?.['assetID']) });
      
    let assetIDs: number[] = vals.map(val => Number(val?.['assetID']));
    let nodes: RowNode[] = <RowNode[]>this.getAdaptableApi().gridApi.getAllRowNodes({
      includeGroupRows: false, filterFn: (node: RowNode) => { 
        return assetIDs.includes(node.data?.['assetID']) && (String(node.data?.['markType']).toLowerCase() === 'mark to market') 
      }
    })

    let updatedData: any[] = []
    for(let i: number = 0; i < nodes.length; i+= 1){
      let data = nodes[i].data;
      data = { ...data, ...valMap[data?.['assetID']], 'usedSpreadDiscount': valMap[data?.['assetID']]?.['deltaSpreadDiscount'], 'useModelValuation': false };
      // Not updating showIsReviewed as that is dependent on the value of the actual override cell which is not affected by this update.
      updatedData.push(data);
    }

    this.getAdaptableApi().gridApi.updateGridData(updatedData);

    this.getAdaptableApi().gridApi.refreshCells(nodes, this.getColumnDefs().map(col => col.field))

    this.dataSvc.setWarningMsg(`Updated valuation for ${assetIDs.length || 0} assets`,`Dismiss`,'ark-theme-snackbar-normal');

  }

  updateGridOnReview(reviewedAssets: any) {
    // { assetID: number, markType: string, status: 'Updated' | '', comment: string }

    let nodeData = []

    for(let i: number = 0; i < reviewedAssets.length; i+= 1){

      let nodes: RowNode[] = <RowNode[]>this.getAdaptableApi().gridApi.getAllRowNodes({
        includeGroupRows: false,
        filterFn: (node: RowNode) => {
          return (node.data?.['assetID'] === reviewedAssets[i]?.['assetID']) && (node.data?.['markType'].toLowerCase() === reviewedAssets[i]?.['markType'].toLowerCase())
        }
      })
      
      let nData = {}
      if(nodes.length === 1){
        nData = nodes[0].data;
      }

      if(['Updated', 'Failed'].includes(reviewedAssets[i].status)){
        nData['wsoStatus'] = reviewedAssets[i].status;
        nData['comment'] = reviewedAssets[i].comment;

        nData['showIsReviewed'] = 1;    // Important. Still mark it as reviewed if it failed to mark.
        nData['reviewedBy'] = this.dataSvc.getCurrentUserName();
        nData['reviewedOn'] = new Date();
      }

      nodeData.push(nData);

    }

    this.getGridApi().applyTransaction({
      update: nodeData
    })

    this.getGridApi().refreshCells({
      force: true
    })
  }

  setAllAssetsForReview(){

    let nodes: RowNode[] = <RowNode[]>this.getAdaptableApi().gridApi.getAllRowNodes({
      includeGroupRows: false,
      filterFn: (node: RowNode) => {
        return (node.data?.['showIsReviewed'] === 0)
      }
    })

    let reviewingNodes: RowNode[] = nodes.filter(node => !node.data?.['review']);

    let rowNodeData: any[] = [];

    // If all possible rows are already marked for review then we discard all such rows for review.
    if(reviewingNodes.length === 0){
      rowNodeData = nodes.map(node => { return { ...node.data, 'review': false }});
    }

    else if(reviewingNodes.length > 0){
      rowNodeData = reviewingNodes.map(rnode => { return { ...rnode.data, 'review': true } })
    }

    this.getGridApi().applyTransaction({
      update: rowNodeData
    })

    this.getAdaptableApi().gridApi.refreshCells(nodes, this.getColumnDefs().map(col => col.field))
  }

  getAllFilteredMTMAssets(): number[] {

    let assetIDs: number[] = []
    this.getGridApi().forEachNodeAfterFilter((node: RowNode, idx: number) => {
      if(node.data?.['markType'].toLowerCase() === 'mark to market'){
        assetIDs.push(Number(node.data?.['assetID']));
      }
    })

    return [...new Set(assetIDs)];
  }

  onPositionsCountClicked(params: CellClickedEvent){

    let req: DetailedView = <DetailedView> {};
    req.screen = 'Valuation-Positions';
    req.param1 = String(params.data?.['assetID']);
    req.param2 = params.data?.['markType'];
    req.param3 = this.getAsOfDate();
    req.param4 = this.getFunds().join(',');
    req.param5 = ''; 
    req.strParam1 = this.getFunds();

    const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent, {
      data: {
        detailedViewRequest: req,
        noFilterSpace: true,
        grid: 'Valuation-Positions',
        header: 'Positions'
      },
      width: '90vw', height: '80vh'
    })
  }
}