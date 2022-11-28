import { AdaptableApi, ColumnSort, Layout } from "@adaptabletools/adaptable-angular-aggrid";
import { ColDef, ValueFormatterParams } from "@ag-grid-community/core";
import { amountFormatter, dateFormatter, dateTimeFormatter } from "./formatter";

const GENERAL_FORMATTING_EXCEPTIONS = ['account', 'accountid', 'account id', 'issuer', 'id', 'positionid', 'position id', 'issuerid', 'issuer id', 'asset id', 'assetid', 'extract id', 'loanxid', 
'issuershortname', 'asset', 'fund', 'fundhedging', 'issuer', 'issuer short name',
'AttributeValue'    //Added for Fixing Details - Attribute name detailed view
];

const GENERAL_DATETIME_FORMATTING_COLUMNS = ['createdon','created on','modified on', 'modifiedon']

export { GENERAL_FORMATTING_EXCEPTIONS } 

export { GENERAL_DATETIME_FORMATTING_COLUMNS }

export function saveAndSetLayout(columnDefs: ColDef[], adaptableApi: AdaptableApi, layoutName: string = 'Basic Layout', columnSorts: ColumnSort[] = null){

  if(adaptableApi == null)
    return;

  // Existing layout doesn't get updated is the layout object doesnt exactly match properties(existing layout) = properties (new layout). To update an exisiting layout, you need to have it's Uuid as well. Only layout name is not enough.

  let layout: Layout, existingLayout: Layout = adaptableApi?.layoutApi.getLayoutByName(layoutName);
  if(existingLayout != null){
    layout = existingLayout     // Will have Uuid and other dynamically added properties.
    layout.Columns = columnDefs.map(col => col.field)
    layout.ColumnSorts = columnSorts
  }
  else{
    layout = {
      Columns: columnDefs.map(col => col.field),
      Name: layoutName,
      ColumnSorts: columnSorts
    }
  }

  if(layout.Columns.length > 0){
    adaptableApi?.layoutApi.saveLayout(layout)
    adaptableApi?.layoutApi.setLayout(layout.Name)  
  }
}

export function parseFetchedData(data: {
    columnValues: {
      column: string,
      value: string
    }[]
  }[]){

    let rowData = []
    for(let i: number = 0; i < data?.length; i+= 1){
      let row = {};
      for(let j: number = 0; j < data[i]?.columnValues.length; j+= 1){
        row[data[i]?.columnValues[j].column] = isNaN(Number(data[i]?.columnValues[j].value)) ? data[i]?.columnValues[j].value : Number(data[i]?.columnValues[j].value);
      }
      rowData.push(row);
    }

  return rowData;
}

export function createColumnDefs(
    row: {column: string, value: string}[],
    exceptions: string[] =  GENERAL_FORMATTING_EXCEPTIONS,
    dateTimeColumns: string[] = GENERAL_DATETIME_FORMATTING_COLUMNS
): any[]{

    exceptions = exceptions.map(col => col.toLowerCase())
    
    let columnDefs = []

    for(let i:number = 0; i < row.length; i+= 1){
      let col: string = row[i].column;
      let colDef: ColDef = {
        field: col,
        tooltipField: col,
        valueFormatter: (params: ValueFormatterParams) => {
          if(!params.value)
            return ""
          return String(params.value)
        }
      }
      if(col.toLowerCase().includes('date') || col.toLowerCase()==='createdon'|| col.toLowerCase()==='modifiedon'){
        colDef.valueFormatter = dateFormatter;
        colDef.type = 'abColDefDate'
        colDef.cellClass = 'dateUK'
      }
      else if(dateTimeColumns.includes(col.toLowerCase())){
        colDef.valueFormatter = dateTimeFormatter;
        colDef.type = 'abColDefDate'
        colDef.cellClass = 'dateUK'
      }
      else if(exceptions.includes(col.toLowerCase())){
        colDef.valueFormatter = null;
      }
      else if(!isNaN(parseFloat(row[i].value))){
        colDef.valueFormatter = amountFormatter;
        colDef.type = 'abColDefNumber'
      }
      columnDefs.push(colDef);
    }
    return columnDefs;
  }

