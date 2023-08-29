export interface IPropertyReader {
    readProperty<T>(prop: string): T
}

export interface IUniqueValuesForField {
    id: number, 
    value: string
}

export interface APIReponse {
    isSuccess: boolean,
    returnMessage: string,
    data: any
}

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

  export type ConfirmComponentConfigure={
    headerText?:            string,
    displayConfirmButton?:  boolean,
    showTextField?:         boolean,
    textFieldValue?:        string,
    textFieldLabelValue?:   string,
    showCustomForm?:        boolean
    data?:                  any
  }

export type FilterConfig={
        id: number,
        label: string,
        type: string,
        order: number ,
        default:string,
        options?:string,
        optionsList?:any,
        value?:any,
        isReport:boolean,
        reportParamName?:string
}



export type NoRowsCustomMessages = 'Please apply the filter.'|'No data found for applied filter.'|'No data found.'