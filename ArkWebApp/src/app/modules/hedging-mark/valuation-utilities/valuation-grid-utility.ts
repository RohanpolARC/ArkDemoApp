import { CellClassParams, CellClickedEvent, GridApi, IAggFuncParams, ITooltipParams, RowNode } from "@ag-grid-community/core"
import { MatDialog } from "@angular/material/dialog"
import { DetailedViewComponent } from "src/app/shared/components/detailed-view/detailed-view.component"
import { DetailedView } from "src/app/shared/models/GeneralModel"
import { getNodes } from "../../capital-activity/utilities/functions"

export class ValuationUtility {

    constructor(protected overrideColMap){}

    isEditable = (params: CellClassParams)=>{
        if(params.node.group && params.node.groupData['state']==='edit'){
          return true
        }
        if(params.data?.state==='edit'){
          return true
        }else{
          return false
        }
    }

    tooltipValueGetter = (p: ITooltipParams) => {
      if (!p.node.group && p.data['state'] !== 'edit')
        return "Mark Override Audit"
      else return null;
    }
    
    cellEditorParams = (p) => {
      return {
        options: p.node.group ? ['Position', 'Asset'] : ['Position'],
        isStrict: true,
        oldValRestoreOnStrict: true
      }
    }

    maxAggFunc(p: IAggFuncParams){  
      if(p.rowNode.group && p.rowNode.field === 'asset'){
        
        if(p.rowNode?.groupData?.['state'] === 'edit'){
          return;
        }

        let colid: string = p.column.getColId();
        if(['cost', 'mark', 'markOverride', 'markOverrideLevel', 'lastMarkOverrideDate', 'hedgingMark', 'hedgingMarkLevel', 'lastHedgingMarkDate'].includes(colid)){
  
          let uniqueVals = [...new Set(p.values)]
  
          if(uniqueVals.length === 1)
            return uniqueVals[0];
          else return null;
        }  
      }
    }

    levelCellStyle = (params: CellClassParams) => {
      let value = params.value;
      let colid: string = params.column.getColId();
      let colidref: string;
      let style = {};

      if(colid === 'markOverrideLevel')
        colidref = 'markOverride';
      else if(colid === 'hedgingMarkLevel')
        colidref = 'hedgingMark';

      if(value === undefined)
        value = null;

      if(params.node.group && params.node.field === 'asset'){
          let nodes = getNodes(params.node);
          let notEmptyRows = nodes.filter(n => n[colidref]);
          let uniqueVals = [...new Set(nodes.map(n => n[colidref]))].filter(n => n);

          if(uniqueVals.length === 1 && notEmptyRows.length === nodes.length){
            style = { ...style, 'background': 'lightgreen' }
          }
          else if(uniqueVals.length > 1)
            style = { ...style, 'background': '#f79a28'}
      }
      return style;
    }
    
    editableCellStyle = (params: CellClassParams) => {

        let value = params.value;
    
        // Since we are updating all original values to null if not present. undefined can cause mismatch issues.
        if(value === undefined)
          value = null;

        let colid = params.column.getColId();
        let style = {};

        if(params.node.group){

          if(params.node.groupData?.['state'] === 'edit'){
            style = { ...style, 'border-color': '#0590ca' }
          }
          
          return style;
        }
        else {
        
          if(params.data?.['state'] === 'edit'){
            style = { 'border-color': '#0590ca' }
          }
          if(value === 0){
            if(params.node.data?.[this.overrideColMap[colid].original]!== value){
              style = {...style,'background': '#ffcc00' }
            }else{
              style = { ...style, 'background': '#f79a28' }
            }
          }
          if(value != params.node.data[this.overrideColMap[colid].original]){
            style = { ...style, 'background': '#ffcc00' }
          }
          else if(value){
            style = { ...style, 'background': '#f79a28' }
          }
          return style;
        }
    }
    
    onOverrideCellClicked(p: CellClickedEvent, asOfDate: string, dialog: MatDialog) {
      if (!p.node.group && p.data['state'] !== 'edit') {
  
        let m = <DetailedView>{};
        m.screen = 'Valuation/Hedging Mark';
        m.param1 = String(p.data?.['positionId']) //positionId;
        m.param2 = asOfDate; // AsOfDate
        m.param3 = p.column.getColId();
        m.param4 = ' ';
        m.param5 = ' ';
  
        dialog.open(DetailedViewComponent, {
          data: {
            detailedViewRequest: m
          },
          width: '90vw',
          height: '80vh'
        })
      }
    }

    updateAllSiblingsLevelToPosition(node: RowNode, colid: 'markOverrideLevel' | 'hedgingMarkLevel', gridApi: GridApi) {

      let parentNode: RowNode = node.parent;
      let childNodes = getNodes(parentNode);
      let lvl: string;
  
      if (node.group)
        lvl = 'Asset'
      else lvl = 'Position'
  
      let cntAssetLevel: number = childNodes.filter(cn => cn?.[colid] === 'Asset').length;
      let cntPositionLevel: number = childNodes.filter(cn => cn?.[colid] === 'Position').length;
  
      if ((cntPositionLevel + cntAssetLevel === childNodes.length) && (cntPositionLevel === 1 && lvl === 'Position')) {
      }
      else {
        return;
      }
  
      childNodes = childNodes.map(cNode => {
        cNode[colid] = lvl;
        return cNode;
      })
  
      gridApi.applyTransaction({ update: childNodes })
    }
}