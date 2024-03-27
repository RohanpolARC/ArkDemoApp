import * as moment from 'moment';
import { getUniqueOptions } from '../utilities/utility';
import { formatDate } from 'src/app/shared/functions/formatter';

let actualCols: string[] = [
    'Cash Flow Date',
    'Call Date',
    'Fund Hedging',
    'Fund Currency',
    'Amount (in Fund Ccy)',
    'Capital Type',
    'Capital Subtype',
    'Wso Asset ID',
    'Asset (optional)',
    'Narative (optional)',
    'Strategy',
    'Override Currency'
]

let dateCols: string[] = [
    'Cash Flow Date',
    'Call Date'
]

let refData;
let refOptions;
let invalidMsg: string = '';

export function validateColumns(fileColumns: string[]): {isValid: boolean, col?: string} {

    for(let i: number = 0; i<fileColumns.length; i+=1){
        if(actualCols.indexOf(fileColumns[i]) !== -1 || fileColumns[i] === '_ROW_ID')
            continue;
        else
            return {isValid: false, col: fileColumns[i]};   // Invalid col found
    }

    return {isValid: true} // No mismatch col found
}

export function validateRowForEmptiness(row: any): void{
    for (let i: number = 0; i < actualCols.length; i += 1) {
        if (!row[actualCols[i]] &&
            [
                // 'Issuer Short Name(optional)',
                'Asset (optional)',
                'Narative (optional)',
                // 'Wso Issuer ID',
                'Wso Asset ID',
                'Strategy',
                'Override Currency'
                // 'Fund Currency',
                // 'GIR Override'
            ].indexOf(actualCols[i]) === -1) {
            let errorMessage = '';     
            if(dateCols.includes(actualCols[i])){         
              errorMessage = `Invalid ${actualCols[i]}`;
            }
            else {
                errorMessage = `${actualCols[i]} cannot be empty`;
            }
            invalidMsg += (invalidMsg === '') ? errorMessage : `, ${errorMessage}`;
        }
    }   
}

export function validateRowValueRange(row: any, lockDate: Date): void{

    if(Number(new Date(moment(row['Cash Flow Date']).format('YYYY-MM-DD')).getFullYear) < 2012){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Cashflow date cannot be < 2012`
    }

    if((new Date(moment(row['Cash Flow Date']).format('YYYY-MM-DD'))) <= (new Date(lockDate))){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` The capital activities till `+formatDate(lockDate) +` are locked.`
    }

    if(Number(new Date(moment(row['Call Date']).format('YYYY-MM-DD')).getFullYear) < 2012){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Calldate cannot be < 2012`
    }

    if(Number(row['Amount (in Fund Ccy)']) === 0){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Amount (in Fund Ccy) cannot be 0`
    }

    // if(Number(row['GIR (Pos - Fund ccy)']) <= 0){
    //     invalidMsg += (invalidMsg === '') ? '' : ','
    //     invalidMsg += ` GIR should be > 0`
    // }

    // if(!['Yes', 'No'].includes(String(row['GIR Override']))){
    //     invalidMsg += (invalidMsg === '') ? '' : ','
    //     invalidMsg += ` GIR Override can be either Yes/No`
    // }

    if(!!row['Fund Hedging'] && (refOptions.fundHedgings.indexOf(String(row['Fund Hedging']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Fund Hedging ${String(row['Fund Hedging'])} not in range`
    }


    if(!!row['Fund Currency'] && (refOptions.fundCcys.indexOf(String(row['Fund Currency']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Fund Currency ${String(row['Fund Currency'])} not in range`
    }

    if(!!row['Strategy'] && (refOptions.strategies.indexOf(String(row['Strategy']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ',';
        invalidMsg += ` Strategy ${String(row['Strategy'])} not in range`;
    }

    if(!!row['Override Currency'] && (refOptions.fundCcys.indexOf(String(row['Override Currency']).trim()) === -1)){
        invalidMsg += (invalidMsg === '') ? '' : ','
        invalidMsg += ` Override Currency ${String(row['Override Currency'])} not in range`
    }

    // if(!!row['Position Currency'] && (refOptions.posCcys.indexOf(String(row['Position Currency']).trim()) === -1)){
    //     invalidMsg += (invalidMsg === '') ? '' : ','
    //     invalidMsg += ` Position Currency ${String(row['Position Currency'])} not in range`
    // }

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
}

export function validateRowValueMappings(row:any):void{

    if(row['Wso Asset ID']){
        let filteredAssetData = refData.filter((rdata) => {
            return (Number(rdata['wsoAssetID']) ===  Number(row['Wso Asset ID'])) &&
                (rdata['fundHedging'] === row['Fund Hedging']) &&
                (rdata['fundCcy']===row['Fund Currency'])
                // && (rdata['positionCcy'] === row['Position Currency'])
        })

        if(filteredAssetData.length === 0){
            invalidMsg += (invalidMsg === '') ? '' : ','
            invalidMsg += `WSO Asset ID ${String(row['Wso Asset ID'])} doesn't exist for fund hedging ${String(row['Fund Hedging'])} and fund currency ${String(row['Fund Currency'])}`
        }
    }
}

export function validateRow(row: any,lockDate: Date):void {
    validateRowForEmptiness(row);
    validateRowValueRange(row, lockDate);
    validateRowValueMappings(row);
}

export function validateExcelRows(rows: any[], ref: {capitalTypes: string[], capitalSubTypes: string[], strategies: string[], overrideCurrencies: string[], refData: any, lockDate: Date}): {isValid: boolean, invalidRows?: {row: any, remark: string}[]} {

    refData = ref.refData
    refOptions = getUniqueOptions(ref);

    let invalidRows: any[] = [];

    for(let i:number = 0; i < rows.length; i+=1){
        invalidMsg = ''
        validateRow(rows[i],ref.lockDate);

        if(invalidMsg === '')
            continue;
        else
            invalidRows.push({row: rows[i], remark: invalidMsg});
    }

    if(invalidRows.length === 0)
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