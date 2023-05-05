import { AdaptableFormat, CustomDisplayFormatter, CustomDisplayFormatterContext, FormatColumn } from '@adaptabletools/adaptable-angular-aggrid';
import { ValueFormatterParams, ValueGetterParams } from '@ag-grid-community/core';
import * as moment from 'moment';
import { idText } from 'typescript';



export function dateFormatter(params) {
    if(params.value != undefined && params.value != '0001-01-01T00:00:00' && !!params.value){
        let str: string = moment(params.value).format('DD/MM/YYYY');
        if(str === 'Invalid date')
            str = params.value
        return str;
    }
    else return ""
}
    
export function dateTimeFormatter(params) {
    if(params.value==undefined || params.value=="0001-01-01T00:00:00")
        return ""
    else 
        return moment(params.value).format('DD/MM/YYYY HH:mm');
}

export function amountFormatter(params){
    
    if(params.value!=undefined && Number(Number(params.value).toFixed(2))!=0    ){
        if(Number.isInteger(Number(Number(params.value).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
            return Number(params.value).toLocaleString(undefined,{
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
        }
        else{
            return Number(params.value).toLocaleString(undefined, {     // Show 2 trailing digits if non integer
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });    
        }
    }
    else if(Number(Number(params.value).toFixed(2))==0) {
        return "-"
    } else{
        return ""
    }
}

export function nonAmountNumberFormatter(params){
    // Non amount number requires no locale.
    if(params.value == null || Number(params.value) == 0)
        return " ";
    else return String(params.value);
}

export function noDecimalAmountFormatter(params){
    
    if(params.value!=undefined && Number(Number(params.value).toFixed(0))!=0){
        return Number(params.value).toLocaleString(undefined,{
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }
    else if(Number(Number(params.value).toFixed(0))==0) {
        return "-"
    } else{
        return ""
    }
}

export function customliquiditySummaryFormatter(params:ValueFormatterParams){
    if(!params.node.group){
        if(params.node.data['attr']==='RCF Drawn'){
            return percentFormatter(params)
        }
    }
    if(params.node.group && params.node.key==='RCF Drawn'){
        if(!params.value || params.value ===0 ){
            return "-"
        }
        return `${Number(params.value * 100).toFixed(2)}%`
    }
    if(typeof(params.value)==='string'){
        return params.value
    }
    if(params.value!=undefined && Number(Number(params.value).toFixed(0))!=0){
        
        return Number(params.value).toLocaleString(undefined,{
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }
    else if(Number(Number(params.value).toFixed(0))==0) {
        return "-"
    } else{
        return ""
    }
}

/**
 * 
 * Returns only upto 3 decimals. Eg: 0.971242427825928 -> 0.971
 * @param params ValueFormatterParams
 * @returns 
 */
export function nullOrZeroFormatter(params){
    if(params.value == null || Number(params.value) == 0)
        return "";
    else return Number(params.value).toLocaleString(undefined, {
    });
}

export function removeDecimalFormatter(params){
    if(params.value != null && Number(params.value)!= 0){
        return String(parseInt(params.value));
    }
    else if(Number(params.value) == 0)
        return "-"
    else
        return ""
}

export function nonAmountNumberFormatter2Dec(params){
    if(params.value!=undefined && Number(Number(params.value).toFixed(2))!=0    ){
        if(Number.isInteger(Number(Number(params.value).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
            return Number(params.value).toFixed(0)
        }
        else{
            return Number(params.value).toFixed(2)
        }
    }
    else return "-"
}
export function formatDate(inputFormat, forCompare: boolean = false) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return forCompare 
        ? [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('/') // YYYY-MM-DD
        : [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')  // DD-MM_YYYY
}

export function percentFormatter(params : ValueFormatterParams) {
    if(params.node.group)
      return " "
    else{
      return `${Number(params.value * 100).toFixed(2)}%`
    }
}


export function BLANK_DATETIME_FORMATTER_CONFIG(dateFields: string[], IncludeGroupedRows: boolean = true){   
    let formatCol: FormatColumn = {
        Scope: {
          ColumnIds: dateFields
        }, 
        Rule: {
          Predicates: [{
            PredicateId: 'Before',
            Inputs: ['1753-01-01T00:00:00']
          }]
        },
        DisplayFormat:{
          Formatter: 'DateFormatter',
          Options: {
            Pattern: ' '
          }
        },
        IncludeGroupedRows: IncludeGroupedRows
    }
    return formatCol;
}

export function DATE_FORMATTER_CONFIG_ddMMyyyy(dateFields: string[], format: string = 'dd/MM/yyyy', IncludeGroupedRows: boolean =true){
    let formatCol: FormatColumn = {
        Scope: {
            ColumnIds: dateFields,
        },
        DisplayFormat: {
            Formatter: 'DateFormatter',
            Options: {
                Pattern: format,
            },
        },
        IncludeGroupedRows: IncludeGroupedRows
    }
    return formatCol;
}

export function DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(dateTimeFields: string[], format: string = 'dd/MM/yyyy HH:mm', IncludeGroupedRows: boolean = true){
    let formatCol: FormatColumn = {        
        Scope: {
            ColumnIds: dateTimeFields,
        },
        DisplayFormat: {
            Formatter: 'DateFormatter',
            Options: {
                Pattern: format,
            },
        },
        IncludeGroupedRows: IncludeGroupedRows
    }
    return formatCol;
}

export function AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(fields: string[], decimalPoints: number = 2,customDisplayFormats?){
    return <FormatColumn>{
        Scope: {
            ColumnIds: fields
        },
        Rule: {
            Predicates: [{
                PredicateId: 'NotEquals',
                Inputs: [0, null]
            }]
        }, 
        DisplayFormat: {
            Formatter: 'NumberFormatter',
            Options: {
                FractionDigits: decimalPoints,
                IntegerSeparator: ',',
                CustomDisplayFormats: customDisplayFormats
            }
        },
        IncludeGroupedRows:true,
        CellAlignment: 'Right'
    }   
}

export function AMOUNT_FORMATTER_CONFIG_Zero(fields: string[], decimalPoints: number = 2, customDisplayFormats){
    return <FormatColumn>{
        Scope: {
            ColumnIds: fields
        },
        Rule: {
            Predicates: [{
                PredicateId: 'Equals',
                Inputs: [0, null]
            }]
        }, 
        DisplayFormat: {
            Formatter: 'NumberFormatter',
            Options: {
                CustomDisplayFormats: customDisplayFormats
            }
        },
        IncludeGroupedRows:true,
        CellAlignment: 'Right'
    }   
}


export function CUSTOM_DISPLAY_FORMATTERS_CONFIG(id,columnIds:any[]=[]){
    let handlerFunc
    if(id === 'amountZeroFormat'){
        handlerFunc = (customDisplayFormatterContext: CustomDisplayFormatterContext) =>{
          const currentvalue: any = customDisplayFormatterContext.cellValue;

          return Math.round(currentvalue) == 0 ? '-' : currentvalue;
        }
    }else if(id==='nullableDateFormatter'){
        handlerFunc = (customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            let currentvalue: any = customDisplayFormatterContext.cellValue;
            currentvalue = formatDate(currentvalue);
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(currentvalue))
              currentvalue = null;
            return currentvalue
        }
    }else if(id==='amountFormatter'){
        handlerFunc = (customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            const currentValue:any = customDisplayFormatterContext.cellValue;

            if(currentValue!=undefined && Number(Number(currentValue).toFixed(2))!=0    ){
                if(Number.isInteger(Number(Number(currentValue).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
                    return Number(currentValue).toLocaleString(undefined,{
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })
                }
                else{
                    return Number(currentValue).toLocaleString(undefined, {     // Show 2 trailing digits if non integer
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });    
                }
            }
            else if(Number(Number(currentValue).toFixed(2))==0) {
                return "-"
            } else{
                return ""
            }
        }
    }else if(id==='customDateFormat'){

        handlerFunc = (customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            let currentValue:any = customDisplayFormatterContext.cellValue;
            // currentValue = formatDate(currentValue);
            // if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(currentValue))
            //   currentValue = null;

            return currentValue
        }
    }else if(id==='percentFormatter'){
        handlerFunc =(customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            let curretValue: any = customDisplayFormatterContext.cellValue
            if(customDisplayFormatterContext.rowNode.group)
                return " "
            else{
                return `${Number(curretValue * 100).toFixed(2)}%`
            }
        }
    }else if(id==='nonAmountNumberFormatter2Dec'){
        handlerFunc =(customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            let curretValue: any = customDisplayFormatterContext.cellValue
            if(curretValue!=undefined && Number(Number(curretValue).toFixed(2))!=0    ){
                if(Number.isInteger(Number(Number(curretValue).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
                    return Number(curretValue).toFixed(0)
                }
                else{
                    return Number(curretValue).toFixed(2)
                }
            }
            else return "-"
        }

    }else if(id==='noDecimalAmountFormatter'){
        handlerFunc = (customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            let currentValue:any = customDisplayFormatterContext.cellValue
            if(currentValue!=undefined && Number(Number(currentValue).toFixed(0))!=0){
                return Number(currentValue).toLocaleString(undefined,{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })
            }
            else if(Number(Number(currentValue).toFixed(0))==0) {
                return "-"
            } else{
                return ""
            }
        }
    }else if(id==='dateFormatter'){
        handlerFunc = (customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
            let currentValue:any = customDisplayFormatterContext.cellValue
            if(currentValue != undefined && currentValue != '0001-01-01T00:00:00' && !!currentValue){
                let str: string = moment(currentValue).format('DD/MM/YYYY');
                if(str === 'Invalid date')
                    str = currentValue
                return str;
            }
            else return ""
        }
    }else if(id==='attributeValueFormatter'){
        handlerFunc = (customDisplayFormatterContext:CustomDisplayFormatterContext)=>{
            
        }
    }

    let scope
    if(columnIds.length===0){
        scope = {
            All:true
        }
    }else{
        scope ={
            columnIds:columnIds
        }
    }

    return <CustomDisplayFormatter>{
        id: id,
        label: id,
        scope:scope,
        handler: handlerFunc
        }
}





export function CUSTOM_FORMATTER(fields:string[],customFormatters,align:string='Right',formatter:string='NumberFormatter'){
    return <FormatColumn>{
        Scope: {
            ColumnIds: fields
        }, 
        DisplayFormat: {
            Formatter:formatter,
            Options: {
                CustomDisplayFormats: customFormatters
            }
        },
        IncludeGroupedRows:true,
        CellAlignment: align
    }  
}






export function booleanYesNoFormatter(params : ValueFormatterParams) {
    if(params.value===true || params.value === "true")
      return "Yes"
    else if(params.value===false || params.value === "false"){
      return "No"
    }else{
        return ""
    }
}
