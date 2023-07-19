import { ActionColumnContext } from "@adaptabletools/adaptable-angular-aggrid";
import { RowNode } from "@ag-grid-community/core";

export function validateLinkSelect(context: ActionColumnContext){

    let children = getNodes(context.rowNode as RowNode);

    let ISS: string = children[0].issuerShortName
    let POSCCY: string = children[0].positionCcy
    let CD: Date = children[0].cashDate

    for(let i:number = 1; i < children.length; i+= 1){

            // Verfiy issuer is same for all underlying nodes.
        if(ISS !== children[i].issuerShortName)
            return 'Issuer not matching for all the rows in this group';

            // Verify position Ccy is same for all underlying nodes.
        if(POSCCY !== children[i].positionCcy)
            return 'Position currency not matching for all the rows in this group';

            // Verify cashDate is same for all underlying nodes.
        if(CD !== children[i].cashDate)
            return 'Cash Date not matching for all the rows in this group';
    }
    return null;
}

export function getNodes(node: RowNode, rows: any[] = []){
    /** Get all filtered children nodes recursively (Depth First Search)*/
    if(node.group){
        for(let i = 0; i < node.childrenAfterFilter.length; i+= 1){
            getNodes(node.childrenAfterFilter[i], rows);
        }
    }
    else{
        rows.push(node.data);
    }
    return rows;
}
