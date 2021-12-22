import { ActionColumnButtonContext } from "@adaptabletools/adaptable/types";

export function validateLinkSelect(context: ActionColumnButtonContext){

    if(context.rowNode.group){
            // Verfiy if leaf group
        if(!context.rowNode.leafGroup)
            return 'Please select the grouping at lowest level';

        let children: any[] = context.rowNode.childrenAfterFilter;

        let ISS: string = children[0].data.issuerShortName
        let POSCCY: string = children[0].data.positionCcy
        for(let i:number = 1; i < children.length; i+= 1){

                // Verfiy issuer is same for all underlying nodes.
            if(ISS !== children[i].data.issuerShortName)
                return 'Issuer not matching for all the rows in this group';

                // Verify position Ccy is same for all underlying nodes.
            if(POSCCY !== children[i].data.positionCcy)
                return 'Position currency not matching for all the rows in this group';
        }
        return null;        
    }
    else{
        return null;
    }


}
export function getNodes(context: ActionColumnButtonContext){
    let list = [];
    if(context.rowNode.group){
        if(context.rowNode.leafGroup){
            for(let i = 0; i < context.rowNode.childrenAfterFilter.length; i+= 1){
                list.push(context.rowNode.childrenAfterFilter[i].data);
            }    
        }
        else{
            console.error("Choose a leaf group (last level) for group addition.");
        }
   }
   else{
       list.push(context.rowNode.data);
   }
   return list;  
}