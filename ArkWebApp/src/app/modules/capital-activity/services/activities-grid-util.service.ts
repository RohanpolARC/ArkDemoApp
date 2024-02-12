import { Injectable } from '@angular/core';
import { getAmountNumber, getDateFromStr, getMomentDate } from 'src/app/shared/functions/utilities';
import { validateExcelRows } from '../bulk-upload/validation';
import { DataService } from 'src/app/core/services/data.service';

@Injectable()
export class ActivitiesGridUtilService {
  
  constructor(   
    private dataService: DataService
    ) {}

  hideDropzone: boolean
  boolValidateHeaders : boolean

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
    'Strategy/Currency'
  ]

  handleTemplateUpload(templateName: string, allowedHeaders: string[], data: any[], fileheaders: string[]): boolean {
    if (data.length === 0) {
      this.dataService.setWarningMsg(`You have uploaded an empty sheet!`);
      this.hideDropzone = false;
      return false;
    }
  
     this.boolValidateHeaders = this.validateHeaders(allowedHeaders, fileheaders);
    if (!this.boolValidateHeaders) {
      this.dataService.setWarningMsg(`Please upload the correct ${templateName} template!`);
      this.hideDropzone = false;
      return false;
    }
  
    if (data.length === 1) {
      this.dataService.setWarningMsg(`No data in the ${templateName} template uploaded!`);
      this.hideDropzone = false;
      return false;
    }
      return true
  }
  
  validateHeaders(actualColumns: string[], fileColumns: string[]): boolean {
    let invalidColumnFound = false;

    for(let i: number = 0; i<actualColumns.length; i+=1){
      if(actualColumns.indexOf(fileColumns[i]) !== -1 || fileColumns[i] === '_ROW_ID')
        continue;
      else
        invalidColumnFound = true;           
    }
    if (invalidColumnFound){
      return false
    }
    else{
      return true
    }
  }

  preprocessData(headers: string[], data: any[]): any[]{

    let jsonRowData = []
    for(let i: number = 0; i < data.length; i+=1){
      let obj = {}
      for(let j: number= 0; j < headers.length; j+= 1){
        if(['Amount (in Fund Ccy)'].includes(headers[j]))
          obj[headers[j]] = getAmountNumber(data[i][j])
        else if(['Call Date', 'Cash Flow Date'].includes(headers[j])){
          obj[headers[j]] = getDateFromStr(data[i][j], 'DD/MM/YYYY');
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
      capitalTypes: string[], capitalSubTypes: string[], strategies: string[], refData: any, lockDate?: Date
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