import { Injectable } from '@angular/core';
import { ValidateColumn } from './activities-grid-util.service';
import { getAmountNumber, getDateFromStr } from 'src/app/shared/functions/utilities';


@Injectable()
export class NavQuarterlyGridUtilService {

  constructor() { }

  allowedHeaders: string[] = [         
    'Fund Hedging','Strategy/Currency','Quarter End','NAV per FS','Deferred loan origination fee income','Current Period Rebates',
    'Organisational costs unamortised','Subscription costs & leverage costs unamortised','Advanced Tax','Carried Interest Provision ',
    'GPS ITD','Rebate ITD','Total foreign exchange movements ITD','Finance Cost ITD','Total Operating exp (excluded GPS) ITD',
    'Net forward contract movements ITD (unrealised)','Net forward contract movements ITD (realised)'

  ]

  validateHeaders(actualColumns: string[], fileColumns: string[]): ValidateColumn {

    for(let i: number = 0; i<fileColumns.length; i+=1){
      if(actualColumns.indexOf(fileColumns[i]) !== -1 || fileColumns[i] === '_ROW_ID')
        continue;
      else 
        return {
          isValid: false, 
          col: fileColumns[i]
        };   // Invalid col found
    }

    return {isValid: true} // No mismatch col found 
  }
  
  preprocessData(headers: string[], data: any[]): any[]{

    let jsonRowData = []
    for(let i: number = 0; i < data.length; i+=1){
      let obj = {}
      for(let j: number= 0; j < headers.length; j+= 1){
        if(['NAV per FS', 'Deferred loan origination fee income', 'Current Period Rebates', 'Organisational costs unamortised', 'Subscription costs & leverage costs unamortised', 'Carried Interest Provision ', 'Rebate ITD', 'Advanced Tax', 'Total foreign exchange movements ITD', 'Net forward contract movements ITD (realised)', 'Total Operating exp (excluded GPS) ITD',  'GPS ITD', 'Finance Cost ITD', 'Net forward contract movements ITD (unrealised)'].includes(headers[j]))
          obj[headers[j]] = getAmountNumber(data[i][j])
        else if(['Quarter End'].includes(headers[j])){
          obj[headers[j]] = getDateFromStr(data[i][j], 'DD/MM/YYYY')
          if(obj[headers[j]] == 'Invalid Date')
            obj[headers[j]] = null 
        }
        else
          obj[headers[j]] = data[i][j];

          obj['_ROW_ID'] = i + 1
      }
      jsonRowData.push(obj);
    }

    return jsonRowData;
  }

  generateGridData(isValid, processedData: any[], validationResult: {
    isValid: boolean, 
    invalidRows?: {row: any, remark: string}[]
  }): any[]{
    if(isValid){
      return processedData.filter(row => row['Quarter End']) || []
    }
    else {
      let invalidRows = [];
      for(let i:number = 0; i < validationResult.invalidRows.length; i+=1){
        let temp = validationResult.invalidRows[i].row;
        temp['remark'] = validationResult.invalidRows[i].remark;
        invalidRows.push(temp);
      }

      return invalidRows || [];
    }
  }

  validateExcelRows(rows: any[], ref: {
    fundhedgings: string[], strategies: string[]
  }): {isValid: boolean, invalidRows?: {row: any, remark: string}[]} {
    
    let invalidRows: any[] = [];

    for(let i: number = 0; i < rows.length; i+= 1){
      let invalidMsg = this.validateRow(rows[i], ref.fundhedgings, ref.strategies) || '';
      if(invalidMsg === '')
        continue;
      else
        invalidRows.push({ row: rows[i], remark: invalidMsg })
    }

    return invalidRows.length ? { isValid: false, invalidRows: invalidRows } : { isValid: true }
  }

  validateRow(row: any, fundhedgings: string[], strategies: string[]): string {
    let invalidmsg: string = '';

    if(Number((new Date(row?.['Quarter End'])).getFullYear) < 2012){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'Quarter End cannot be less than 2012';
    }
    
    if(row['Fund Hedging'] && !fundhedgings?.includes(row['Fund Hedging'])){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'Fund hedging not part of the allowed list';
    }

    if(row['Strategy/Currency'] && !strategies?.includes(row['Strategy/Currency'])){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'Strategy/Currency not part of the allowed list';
    }

    if(row['NAV per FS'] < 0){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'NAV per FS has to positive';
    }
    else if(row['NAV per FS'] < 100000 ){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'NAV per FS is usually in millions';
    }

    if(row['Deferred loan origination fee income'] < 0){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'Deferred loan origination fee income has to be positive';
    }

    if(row['Organisational costs unamortised'] < 0){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'Organisational costs unamortised has to be positive';
    }

    if(row['Subscription costs & leverage costs unamortised'] < 0){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += ' Subscription costs unamortised has to be positive'
    }
    
    // Advanced Tax is optional, hence no check

    if(row['Rebate ITD'] > 0){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'Rebate ITD has to be negative'
    }

    if(row['GPS ITD'] > 0){
      invalidmsg += (invalidmsg === '') ? '' : ','
      invalidmsg += 'GPS ITD has to be negative'
    }
    return invalidmsg;
  }
}