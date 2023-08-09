import { ValueGetterParams } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';

@Injectable()
export class GridUtilService {

  constructor() { }

  valueGetter(params: ValueGetterParams) {
    let val = params.data?.[params.column.getColId()]
    if(params.colDef?.type === 'abColDefDate'){
      return getMomentDateStr(val)
    }
    return val;
  }
}
