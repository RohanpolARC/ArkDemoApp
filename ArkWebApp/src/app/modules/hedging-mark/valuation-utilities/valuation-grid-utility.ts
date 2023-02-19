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
      if(p.rowNode.field === 'asset'){
  
        let colid: string = p.column.getColId();
        if(['cost', 'mark'].includes(colid)){
  
          let uniqueVals = [...new Set(p.values)]
  
          if(uniqueVals.length === 1)
            return uniqueVals[0];
          else return null;
        }
      }
    }

    editableCellStyle = (params: CellClassParams) => {

        let value = params.value;
    
        // Since we are updating all original values to null if not present. undefined can cause mismatch issues.
        if(value === undefined)
          value = null;
    
        if(params.node.group){
          if(params.node.groupData?.['state'] === 'edit'){
            return {
              'border-color': '#0590ca'
            }
          }
          else return null;
        }
        else {
    
          let colid = params.column.getColId();
          let style = {};
    
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