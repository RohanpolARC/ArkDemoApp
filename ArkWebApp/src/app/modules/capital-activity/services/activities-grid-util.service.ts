import { Injectable } from '@angular/core';
import { getAmountNumber, getMomentDate } from 'src/app/shared/functions/utilities';
import { validateExcelRows } from '../bulk-upload/validation';
export type ValidateColumn = {isValid: boolean, col?: string};

@Injectable()
export class ActivitiesGridUtilService {
  
  constructor() { }

  allowedHeaders: string[] = [         
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
        if(['Amount (in Fund Ccy)'].includes(headers[j]))
          obj[headers[j]] = getAmountNumber(data[i][j])
        else if(['Call Date', 'Cash Flow Date'].includes(headers[j])){
          obj[headers[j]] = getMomentDate(data[i][j])
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

  validateExcelRows: (rows: any[], 
    ref: {
      capitalTypes: string[], capitalSubTypes: string[], refData: any
    }
  )=> {
    isValid: boolean, invalidRows?: {
      row: any, remark: string
    }[]
  } = validateExcelRows

  generateGridData(isValid, processedData: any[], validationResult: {
    isValid: boolean, 
    invalidRows?: {row: any, remark: string}[]
  }): any[]{
    if(isValid){
      return processedData.filter(row => row['Cash Flow Date']) || []
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
}