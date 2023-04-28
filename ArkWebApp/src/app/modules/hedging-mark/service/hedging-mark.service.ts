import { ActionColumnContext } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi, RowNode } from '@ag-grid-community/core';
import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { formatDate } from 'src/app/shared/functions/formatter';
import { getNodes } from '../../capital-activity/utilities/functions';
import { AuditFilterComponent } from '../audit-filter/audit-filter.component';
import { HedgingMarkDetails, HedgingMarkOverride, MarkOverride } from '../valuation-utilities/valuation-model';

type SAVE_TYPE = 'Hedging Mark' | 'Mark Override';
type LEVEL_TYPE = 'Position' | 'Asset';

@Injectable({
  providedIn: null
})
export class HedgingMarkService {

  filterspace: TemplateRef<AuditFilterComponent>

  private auditingPositions = new BehaviorSubject<number[] | null>(null);
  auditingPositionsState = this.auditingPositions.asObservable();
  updateAuditPositions(ids: number[]){
    this.auditingPositions.next(ids);
  }

  constructor() { }

  getSaveModel(cn, type: SAVE_TYPE, level: LEVEL_TYPE = null): HedgingMarkOverride | MarkOverride{
    
    if(type === 'Hedging Mark'){
      
      let lastHedgingMarkDate: string = formatDate(cn?.['lastHedgingMarkDate']);
      let ovrHM: HedgingMarkOverride = {
        PositionId: cn['positionId'] as number,
        AssetId: cn['assetId'] as number,
        Level: level ?? cn?.['hedgingMarkLevel'],
        HedgingMark: cn?.['hedgingMark'] === "" ? null : cn?.['hedgingMark'],
        LastHedgingMarkDate: lastHedgingMarkDate === 'NaN/NaN/NaN' ? null : lastHedgingMarkDate
      }
      return ovrHM;
    }
    else{

      let lastMarkOverrideDate: string = formatDate(cn?.['lastMarkOverrideDate']);
      let ovrM: MarkOverride = {
        PositionId: cn['positionId'] as number,
        AssetId: cn['assetId'] as number,
        Level: level ?? cn?.['markOverrideLevel'],
        MarkOverride: cn?.['markOverride'] === "" ? null : cn?.['markOverride'],
        LastMarkOverrideDate: lastMarkOverrideDate === 'NaN/NaN/NaN' ? null : lastMarkOverrideDate
      }
      return ovrM;
    }
  }

  onAdaptableEditClick(context: ActionColumnContext, gridApi: GridApi){
    let node = context.rowNode
    if (node.group) {
      context.rowNode.groupData["state"] = 'edit'
    }
    else {
      node.data['state'] = 'edit'
    }

    gridApi.startEditingCell({
      rowIndex: node.rowIndex,
      colKey: "hedgingMark"
    })

    gridApi.startEditingCell({
      rowIndex: node.rowIndex,
      colKey: 'markOverride'
    })

    context.adaptableApi.gridApi.refreshCells([node], ['mark_override', 'hedgingMark', 'lastHedgingMarkDate', 'markOverride', 'lastMarkOverrideDate', 'hedgingMarkLevel', 'markOverrideLevel'])
  }

  savePreprocessor(context: ActionColumnContext, username: string): HedgingMarkDetails{
    let childNodes;
    let hedgingMarkOverrides: HedgingMarkOverride[] = []
    let markOverrides: MarkOverride[] = []
    let hedgingMarkDetails: HedgingMarkDetails

    let node = context.rowNode;

    childNodes = getNodes(node);
    childNodes.forEach(cn => {
      hedgingMarkOverrides.push(<HedgingMarkOverride>this.getSaveModel(cn, 'Hedging Mark'));
      markOverrides.push(<MarkOverride>this.getSaveModel(cn, 'Mark Override'));
    });

    hedgingMarkDetails = {
      MarkOverrides: markOverrides,
      HedgingMarkOverrides: hedgingMarkOverrides,
      ModifiedBy: username
    }

    return hedgingMarkDetails;
  }

  savePostprocessor(gridApi: GridApi, context: ActionColumnContext, overrideColMap, username: string){

    let oCols: string[] = Object.keys(overrideColMap);

    let node: RowNode = context.rowNode;
    let parent: RowNode;

    if (node.group) {
      parent = node;
    }
    else {
      parent = node.parent;
    }

    let nodes = getNodes(parent)
    nodes = nodes.map(n => {
      n['isOverriden'] = n['hedgingMark'] ? true : false;
      n['isOvrdMark'] = n['markOverride'] ? true : false;
      n['modifiedBy'] = username;
      n['modifiedOn'] = new Date();

      oCols.forEach(col => {
        n[overrideColMap[col].original] = n[col];
      })

      return n;
    })

    if (node.group) {
      node.groupData['state'] = ' '
      node.data = node.data ?? {} // When empty values saved, there is no node.data object
      node.data['hedgingMark'] = node.data['lastHedgingMarkDate'] = node.data['lastMarkOverrideDate'] = node.data['markOverride'] = node.data['hedgingMarkLevel'] = node.data['markOverrideLevel'] = null;
    }
    else {
      node.data['state'] = ' '
    }

    gridApi.applyTransaction({ update: nodes })

    gridApi.refreshCells({
      force: true,
      // columns: this.oCols
    })    
  }
}
