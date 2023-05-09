export interface DetailedView{
    screen: string,
    param1: string,
    param2: string,
    param3: string,
    param4: string,
    param5: string,
    strParam1?: string[]         // Can be used to pass a list of ids.
}

export interface PutAccessModel{
    associations: string,   /* (Tab|Role:Association,)+ */
    username: string
}

export interface RefDataProc{
    filterValue: string,
    param1: string,
    param2: string,
    param3: string,
    param4: string,
    param5: string,
}

export type ReportServerParams={
    reportServer: string 
    reportUrl: string 
    showParameters: string 
    language: string 
    toolbar: string 
    parameters: any
  }

  export type ConfirmComponentConfigure={
    headerText?:string
    showTextField?:boolean,
    textFieldValue?:string,
    textFieldLabelValue?:string,
    showCustomForm?:boolean
    data?:any
  }

export type NoRowsCustomMessages = 'Please apply the filter.'|'No data found for applied filter.'|'No data found.'