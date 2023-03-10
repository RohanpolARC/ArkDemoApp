import { CellValueChangedEvent, RowNode } from "@ag-grid-community/core";
import { DataService } from "src/app/core/services/data.service";
import { formatDate } from "src/app/shared/functions/formatter";
import { getNodes } from "../../capital-activity/utilities/functions";

  
export class ValuationValidation {

    constructor(){}

    public static checkMarkOverride(row: any[], tolerancePercent: number = 5, svc: DataService): boolean {

        const MO: string = 'markOverride';
    
        let markOverride: number = row[MO] ?? 0, mark: number = row['mark'] ?? 0;
        let diffRate: number = Math.abs(((markOverride - mark) * 100) / mark);
        if (diffRate > 5) {
          svc.setWarningMsg(`Mark Override varying by ${tolerancePercent}% as compared to mark`)
          return true;
        }
        return false;
    }
    
    public static checkWarningsBefore(p: CellValueChangedEvent, asOfDate: string, svc: DataService): boolean {
        let colid: string = p.column.getColId();
        let colidref: string;
        if(colid === 'hedgingMarkLevel')
            colidref = 'hedgingMark';
        else if(colid === 'markOverrideLevel')
            colidref = 'markOverride';

        let val = p.data[colid];
        let node: RowNode = p.node;

        let childNodes: any[] = getNodes(node);
        asOfDate = formatDate(new Date(asOfDate));

        if (node.group) {
            if ((colid === 'markOverrideLevel' && val === 'Asset') || (colid === 'markOverride')) {
                let cntPosition: number = childNodes.filter(cN => {
                    return cN['markOverrideLevel'] === 'Position' && formatDate(cN['lastMarkOverrideDate']) === asOfDate
                }).length;

                if (cntPosition >= 1) {
                    svc.setWarningMsg(`Warning: Once marked at position level, cannot be changed to asset level for the same mark date`);
                }
            }
        }
        return true;
    }

    public static checkWarningsAfter(p: CellValueChangedEvent, asOfDate: string, svc: DataService) {

        let colid: string = p.column.getColId();
        let val = p.data[colid];

        let node: RowNode = p.node;
        let parent: RowNode = node.group ? node : node.parent;

        let childNodes: any[] = getNodes(parent);

        if (colid === 'markOverride') {
            if (node.group) {
                for (let i: number = 0; i < childNodes.length; i += 1) {
                    if (this.checkMarkOverride(childNodes[i], 5, svc)) {
                        break;
                    }
                }
            }
            else {
                this.checkMarkOverride(p.data, 5, svc);
            }
        }
        else if (colid === 'markOverrideLevel') {

            if (node.group) {
                if (val === 'Position')
                    svc.setWarningMsg(`Each position needs to be marked`);
            }
            else {
                let positionCnt: number = childNodes.filter(cN => cN?.['markOverrideLevel'] === 'Position').length;

                // This check happens after all the row levels has been updated to Position from Asset.
                if (positionCnt === childNodes.length && p.oldValue === 'Asset') {
                    svc.setWarningMsg(`Each position needs to be marked`);
                }
            }
        }
    }    
}  
