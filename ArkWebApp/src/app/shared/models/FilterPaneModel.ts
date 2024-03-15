export interface FilterPane{
    AsOfDateRange: boolean;
    AsOfDate: boolean;
    TextValueSelect: boolean;
    NumberField: boolean;
}

export interface AsOfDateRange{
    start: string;
    end: string;
}

export interface FilterValueChangeParams{
    value:                  any,
    reportParamName?:       string,
    isReport?:               boolean
  }

export interface IFilterPaneParams{
    [id:number] : FilterValueChangeParams
}