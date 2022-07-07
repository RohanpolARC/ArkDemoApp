import * as moment from 'moment';
import { getUniqueOptions } from '../utilities/utility';

let actualCols: string[] = [         
    'Cash Flow Date',
    'Call Date',
    'Fund Hedging',
    'Fund Currency',
    'Position Currency',
    'GIR (Pos - Fund ccy)',
    'Amount',
    'Capital Type',
    'Capital Subtype',
    // 'Wso Issuer ID',
    // 'Issuer Short Name(optional)',
    'Wso Asset ID',
    'Asset (optional)',
    'Narative (optional)',
    // 'Action'
]

let refOptions;
let invalidMsg: string = '';

export function validateColumns(fileColumns: string[]): {isValid: boolean, col?: string} {

    for(let i: number = 0; i<fileColumns.length; i+=1){
        if(actualCols.indexOf(fileColumns[i]) !== -1 || fileColumns[i] === '_COLUMN_TITLE')
            continue;
        else 
            return {isValid: false, col: fileColumns[i]};   // Invalid col found
    }

    return {isValid: true} // No mismatch col found 
}

export function validateRowForEmptiness(row: any): void{
    
    for(let i:number = 0; i < actualCols.length; i+=1){
        if(!row[actualCols[i]] && 
        [
            // 'Issuer Short Name(optional)', 
            'Asset (optional)',
            'Narative (optional)', 
            // 'Wso Issuer ID', 
            'Wso Asset ID',
            'Fund Currency'
        ].indexOf(actualCols[i]) === -1){
            invalidMsg += (invalidMsg === '') ? `${actualCols[i]} cannot be empty` :  `, ${actualCols[i]} cannot be empty`;
        }
    }
}

export function validateRowValueRange(row: any): void{
    if(Number(new Date(moment(row['Cash Flow Date']).format('YYYY-MM-DD')).getFullYear) < 2012){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Cashflow date cannot be < 2012`
    }

    if(Number(new Date(moment(row['Call Date']).format('YYYY-MM-DD')).getFullYear) < 2012){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Calldate cannot be < 2021`
    }

    if(Number(row['Amount']) === 0){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Amount cannot be 0`
    }

    if(Number(row['GIR (Pos - Fund ccy)']) <= 0){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` GIR should be > 0`
    }
        
    if(!!row['Fund Hedging'] && (refOptions.fundHedgings.indexOf(String(row['Fund Hedging']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Fund Hedging ${String(row['Fund Hedging'])} not in range`
    }


    if(!!row['Fund Currency'] && (refOptions.fundCcys.indexOf(String(row['Fund Currency']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Fund Currnecy ${String(row['Fund Currency'])} not in range`
    }

    // Set(posCcy) = Set(fundCcy)

    if(!!row['Position Currency'] && (refOptions.fundCcys.indexOf(String(row['Position Currency']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Position Currency ${String(row['Position Currency'])} not in range`
    }

    if(!!row['Capital Type'] && (refOptions.capitalTypes.indexOf(String(row['Capital Type']).trim()) === -1)){     
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Capital type ${String(row['Capital Type'])} not in range`
    }

    if(!!row['Capital Subtype'] && (refOptions.capitalSubTypes.indexOf(String(row['Capital Subtype']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Capital Subtype ${String(row['Capital Subtype'])} not in range`
    }

    if(!!row['Wso Asset ID'] && (refOptions.wsoAssetIDs.indexOf(parseInt(row['Wso Asset ID'])) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Wso Asset ID '${String(row['Wso Asset ID'])}' doesn't exist.`
    }

    // Subtype is 'Investment', 'Income' && WsoIssuerID is null
    
    // if(!row['Wso Issuer ID']){
    //     if(['Investment', 'Income'].indexOf(String(row['Capital Subtype']).trim()) !== -1){
    //         return {
    //             isValid: false,
    //             remark: `Wso Issuer ID cannot be empty for subtype '${String(row['Capital Subtype'])}'`
    //         };  
    //     }
    // }
    
}



export function validateRow(row: any):void {
    validateRowForEmptiness(row);
    validateRowValueRange(row);
}

export function validateExcelRows(rows: any[], ref: {capitalTypes: string[], capitalSubTypes: string[], refData: any}): {isValid: boolean, invalidRows?: {row: any, remark: string}[]} {

    refOptions = getUniqueOptions(ref);
    
    let invalidRows: any[] = [];

    for(let i:number = 0; i < rows.length; i+=1){ 
        invalidMsg = ''
        validateRow(rows[i]);
 
        if(invalidMsg === '')
            continue;
        else
            invalidRows.push({row: rows[i], remark: invalidMsg});
    }
    
    if(invalidRows === [])
        return {
            isValid: true
        }
    else if(invalidRows.length > 0){
        return {
            isValid: false,
            invalidRows: invalidRows
        }
    }

    return {isValid: true};
}