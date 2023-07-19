import { CellClassParams, GridApi, IAggFuncParams, ITooltipParams, RowNode } from "@ag-grid-community/core"
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
      let col: string = p.column.getDefinition().headerName;
      if (!p.node.group && p.data['state'] !== 'edit'){
        if(col === 'Mark Ovrd')
          return "Mark Override Audit"
        else if(col === 'Hedging Mark')
          return "Hedging Mark Audit"
        else return null;
      }
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
      if(p.rowNode.group){
        
        let parentGroups: string[] = [];
        let node: RowNode =<RowNode> p.rowNode;
        while(node){
          parentGroups.push(node?.rowGroupColumn?.getColId());
          node = node.parent
        }
        if(parentGroups.includes('asset')){
          
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



      if(params.node.group){

        let parentGroups: string[] = [];
        let node: RowNode = <RowNode>params.node;
        while(node){
          parentGroups.push(node?.rowGroupColumn?.getColId());
          node = node.parent
        }

        if(parentGroups.includes('asset')){
          let nodes = getNodes(params.node as RowNode);
          let notEmptyRows = nodes.filter(n => n[colidref]);
          let notEmptyLevelRows = nodes.filter(n => n[colid])
          let uniqueVals = [...new Set(nodes.map(n => n[colidref]))].filter(n => n);

          if(uniqueVals.length === 1 && notEmptyRows.length === nodes.length && nodes.length === notEmptyLevelRows.length){
            style = { ...style, backgroundColor: 'lightgreen' }
          }
          else if(uniqueVals.length > 1 && nodes.length === notEmptyLevelRows.length)
            style = { ...style, backgroundColor: '#f79a28'}
        }
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
            style = { ...style, borderColor: '#0590ca' }
          }
          
          return style;
        }
        else {
        
          if(params.data?.['state'] === 'edit'){
            style = { borderColor: '#0590ca' }
          }
          if(value === 0){
            if(params.node.data?.[this.overrideColMap[colid].original]!== value){
              style = {...style,backgroundColor: '#ffcc00' }
            }else{
              style = { ...style, backgroundColor: '#f79a28' }
            }
          }
          if(value != params.node.data[this.overrideColMap[colid].original]){
            style = { ...style, backgroundColor: '#ffcc00' }
          }
          else if(value){
            style = { ...style, backgroundColor: '#f79a28' }
          }
          return style;
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