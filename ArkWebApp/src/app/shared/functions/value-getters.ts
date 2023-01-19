import { ValueGetterParams, ValueParserParams } from "@ag-grid-community/core";


export function dateNullValueGetter(params: ValueGetterParams<any>, arg1: string='modifiedOn') {
    const rawValue = params.data?.[arg1];
    if (rawValue === '0001-01-01T00:00:00') {
      return null;
    }
    return rawValue
  }