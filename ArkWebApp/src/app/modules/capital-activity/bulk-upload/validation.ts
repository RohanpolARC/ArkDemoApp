import * as moment from 'moment';
import { getUniqueOptions } from '../utilities/utility';

let actualCols: string[] = [         
    'Fund Hedging',
    'Fund Currency',
    'Cash Flow Date',
    'Capital Type',
    'Capital Subtype',
    'Amount (fund ccy)',
    'Wso Issuer ID',
    'Issuer Short Name(optional)',
    'Asset (optional)',
    'Narative (optional)',
    // 'Action'
]

let refOptions;

export function validateColumns(fileColumns: string[]): {isValid: boolean, col?: string} {

    for(let i: number = 0; i<fileColumns.length; i+=1){
        if(actualCols.indexOf(fileColumns[i]) !== -1 || fileColumns[i] === '_COLUMN_TITLE')
            continue;
        else 
            return {isValid: false, col: fileColumns[i]};   // Mismatch col found
    }

    return {isValid: true} // No mismatch col found 
}

export function validateRowForEmptiness(row: any): {isValid: boolean, remark?: string}{
    
    for(let i:number = 0; i < actualCols.length; i+=1){
        if(!row[actualCols[i]] && 
        [
            'Issuer Short Name(optional)', 'Asset (optional)','Narative (optional)', 
            'Wso Issuer ID'
        ].indexOf(actualCols[i]) === -1)
            return {
                isValid: false,
                remark: `${actualCols[i]} cannot be empty`
            }
    }
    return {
        isValid: true
    }
}

export function validateRowValueRange(row: any): {isValid: boolean, remark?: string}{
    if(Number(new Date(moment(row['Cash Flow Date']).format('YYYY-MM-DD')).getFullYear) < 2012)
        return {
            isValid: false,
            remark: 'Cash Flow Date cannot be < 2012'
        };

    if(Number(row['Amount (fund ccy)']) === 0)
        return {
            isValid: false,
            remark: 'Amount cannot be 0'
        };

    if(!!row['Fund Hedging'] && (refOptions.fundHedgings.indexOf(String(row['Fund Hedging']).trim()) === -1)){
        return {
            isValid: false,
            remark: `Fund Hedging '${String(row['Fund Hedging'])}' not in range`
        };
    }

    if(!!row['Fund Currency'] && (refOptions.fundCcys.indexOf(String(row['Fund Currency']).trim()) === -1)){
        return {
            isValid: false,
            remark: `Fund Currency '${String(row['Fund Currency'])}' not in range`
        };
    }

    if(!!row['Capital Type'] && (refOptions.capitalTypes.indexOf(String(row['Capital Type']).trim()) === -1)){
        return {
            isValid: false,
            remark: `Capital Type '${String(row['Capital Type'])}' not in range`
        };
    }

    if(!!row['Capital Subtype'] && (refOptions.capitalSubTypes.indexOf(String(row['Capital Subtype']).trim()) === -1)){
        return {
            isValid: false,
            remark: `Capital Subtype '${String(row['Capital Subtype'])}' not in range`
        };
    }

    if(!!row['Wso Issuer ID'] && (refOptions.wsoIssuerIDs.indexOf(parseInt(row['Wso Issuer ID'])) === -1)){
        return {
            isValid: false,
            remark: `Wso Issuer ID '${String(row['Wso Issuer ID'])}' not in range`
        };
    }


    if(!row['Wso Issuer ID']){
        if(['Investment', 'Income'].indexOf(String(row['Capital Subtype']).trim()) !== -1){
            // Subtype is 'Investment', 'Income' && WsoIssuerID is null
            return {
                isValid: false,
                remark: `Wso Issuer ID cannot be empty for subtype '${String(row['Capital Subtype'])}'`
            };  
        }
    }

    return {
        isValid: true
    };
    
}



export function validateRow(row: any): {isValid: boolean, remark?: string} {
    //Check if year(date) >= 2012
    let emptinessVal = validateRowForEmptiness(row);
    if(!emptinessVal.isValid){
        return emptinessVal;
    }

    let rangeVal = validateRowValueRange(row);
    return rangeVal;
}

export function validateExcelRows(rows: any[], ref: {capitalTypes: string[], capitalSubTypes: string[], refData: any}): {isValid: boolean, invalidRows?: {row: any, remark: string}[]} {

    refOptions = getUniqueOptions(ref);
    
    let invalidRows: any[] = [];

    for(let i:number = 0; i < rows.length; i+=1){
        let res = validateRow(rows[i]);

        if(res.isValid)
            continue;
        else
            invalidRows.push({row: rows[i], remark: res.remark});
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