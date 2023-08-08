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
    id:                     number,
    value:                  any,
    reportParamName?:       string
  }