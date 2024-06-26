import {
  SharedEntitiesContext,
  SharedEntity,
} from '@adaptabletools/adaptable-angular-aggrid';
import {
  BodyScrollEvent,
  ColDef,
  Column,
  ColumnEventType,
  ColumnResizedEvent,
  FirstDataRenderedEvent,
  RowDataUpdatedEvent,
  RowGroupOpenedEvent,
  RowNode,
  VirtualColumnsChangedEvent,
} from '@ag-grid-community/core';
import { DecimalPipe } from '@angular/common';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { formatDate } from './formatter';

/**
 *
 * @param adaptableId AdaptableOptions.adaptableID
 * @returns Async function to get all `team` shared adaptable resources for that `adaptableID / grid from ArkDB`
 */
export async function loadSharedEntities(context: SharedEntitiesContext) {
  return new Promise((resolve) => {
    this.dataSvc
      .getAdaptableState(context.adaptableId)
      .pipe(first())
      .subscribe({
        next: (state) => {
          try {
            state = state.split('|').join('"');
            resolve(JSON.parse(state) || '[]');
          } catch (e) {
            console.log('Failed to parse');
            resolve([]);
          }
        },
      });
  });
}

export async function presistSharedEntities(
  entries: SharedEntity[],
  context: SharedEntitiesContext
): Promise<void> {
  return new Promise((resolve) => {
    this.dataSvc
      .saveAdaptableState(
        context.adaptableId,
        JSON.stringify(entries).replace(/"/g, '|')
      )
      .pipe(first())
      .subscribe({
        next: (data) => {
          resolve();
        },
      });
  });
}

/**
 * Returns supplied `amount` as comma separated string with
 *    `minimum digits before decimal` = `1`
 *    `minimum digits after decimal` = `0`
 *    `maximum digits after decimal` = `2`
 *
 * @param transformer Injected decimal pipe
 * @param amount value to be converted
 * @returns converted comma separated `amount` string
 */
export function getAmountStr(
  transformer: DecimalPipe,
  amount: number | string
): string {
  return transformer.transform(
    Number(String(amount).replace(/,/g, '')),
    '1.0-2'
  );
}

/**
 * Removes `spaces` and `commas` from amount string
 * @param amount Comma separated amount in string or number
 * @returns `amount` in number
 */
export function getAmountNumber(amount: string | number): number {
  const cleanedAmount = String(amount).replace(/[^0-9.-]/g, '');

  // Check if the cleaned amount is empty and return Null if it is.
  if (cleanedAmount.trim() === '') {
    return null;
  }

  return Number(cleanedAmount);
}

/**
 * Generic filter for MatAutocomplete input
 *
 * @param options List of possible string options
 * @param value Current search value
 * @returns List of all options that has `value` as a substring
 */
export function _filter(options: string[], value: string): string[] {
  if (value === null) return options;
  const filterValue = value.toLowerCase();
  return options.filter((op) => op?.toLowerCase().includes(filterValue));
}

export function preprocessEditableDateFields(row: any, fields: string[]) {
  for (let i = 0; i < fields.length; i += 1) {
    row[fields[i]] = formatDate(row[fields[i]]);
    if (
      ['01/01/1970', '01/01/01', '01/01/1', 'NaN/NaN/NaN'].includes(
        row[fields[i]]
      )
    )
      row[fields[i]] = null;
  }

  return row;
}

/**
 * API Requests can convert date parameters unknowingly due to undesired timezone conversion.
 * Moment date conversion stabilises the date and keeps the date intact.
 *
 * Eg: Unstable behaviour:
 *
 *  `2022-07-28 00:00:00 BST` -> `2022-07-27 23:00:00 UTC` (Undesirable)
 *
 * NOTE: If supplied date is not valid, it returns `Invalid Date`. Useful for checking if date returned is valid or not.
 *
 * @param date Date that needs to be stablised
 * @returns Stable `Date` | string: `Invalid Date`
 */
export function getMomentDate(date: Date): Date {
  return new Date(moment(date).format('YYYY-MM-DD'));
}

export function getMomentDateStrFormat(date: Date, format: string): string {
  if (moment(date).format(format) === 'Invalid date') {
    return null;
  }
  return moment(date).format(format);
}

export function getMomentDateStr(date: Date): string {
  return moment(date).format('YYYY-MM-DD');
}

export function getMomentDateStr_ddmmyyyy(date: Date): string {
  return moment(date).format('DD/MM/YYYY');
}

export function getDateFromStr(
  date: string,
  format:
    | 'DD-MM-YYYY'
    | 'YYYY-MM-DD'
    | 'DD/MM/YYYY'
    | 'YYYY/MM/DD' = 'YYYY-MM-DD'
): Date {
  return new Date(moment(date, format).format('YYYY-MM-DD'));
}

export function getFinalDate(date: Date): Date | null {
  let dt: Date = getMomentDate(date);

  if (dt.getFullYear() <= 1970) return null;
  return dt;
}

/**
 *
 * @returns Returns last business date from today
 */
export function getLastBusinessDay() {
  let workday = moment();
  let day = workday.day();
  let diff = 1; // returns yesterday
  if (day == 0 || day == 1) {
    // is Sunday or Monday
    diff = day + 2; // returns Friday
  }
  return workday.subtract(diff, 'days').toDate();
}

export function getLastQuarterEnd() {
  return moment().subtract(1, 'quarter').endOf('quarter').toDate();
}

export function getLastToLastQuarterEnd() {
  return moment().subtract(2, 'quarter').endOf('quarter').toDate();
}

export function getRowNodes(node: RowNode, rowNodes: any[] = []) {
  /** Get all filtered children nodes recursively (Depth First Search)*/
  if (node.group) {
    for (let i = 0; i < node.childrenAfterFilter.length; i += 1) {
      getRowNodes(node.childrenAfterFilter[i], rowNodes);
    }
  } else {
    rowNodes.push(node);
  }
  return rowNodes;
}

export function getCurrentDate() {
  return moment().toDate();
}

export function getWrapWidth(cd: ColDef): number[] {
  if (cd.colId) {
    if (cd.colId.length < 7) {
      return [cd.colId.length * 0.4 * 14, 100];
    }
    return [cd.colId.length * 0.4 * 14, cd.colId.length * 0.7 * 14];
  }
  return [50, 150];
}

export function autosizeColumnExceptResized(
  event: FirstDataRenderedEvent | RowDataUpdatedEvent | RowGroupOpenedEvent
) {

  let resizedColumnList: string[] = event.context?.['resizedColumnList'];

  let autosizeColumns: string[] = event.api.getAllGridColumns()
                                           .map((column: Column) => column.getColId())
                                           .filter((colId: string) => !resizedColumnList.includes(colId));

  event.api?.autoSizeColumns(autosizeColumns);
}

export function handleResizedColumns(params: ColumnResizedEvent) {

  let eventSource: ColumnEventType = params.source;

  if (eventSource != 'api') {

    let resizedColumnSet: Set<string> = new Set(params.context?.resizedColumnList);

    let coldef: ColDef<any> = params.column?.getColDef();

    if(coldef){
      let columnName: string = coldef.colId;

      resizedColumnSet.add(coldef.colId);
      params.context.resizedColumnList = Array.from(resizedColumnSet);
  
      let sizes: {
        rowHeight: number;
        headerHeight: number;
      } = params.api.getSizesForCurrentTheme();
      
      let wrapSizes: number[] = getWrapWidth(coldef);
  
      let columnWidth: number = params.column?.getActualWidth();
      
      if (columnWidth > wrapSizes[0] && columnWidth < wrapSizes[1]) {
  
        coldef.headerClass = 'header-font-size-small';
        coldef.headerTooltip = coldef.headerName;
  
        if (sizes.headerHeight > 30) {
          coldef.wrapHeaderText = true;
        }
      } 
      else {
        coldef.headerClass = ' ';
        coldef.wrapHeaderText = false;
      }
  
      let columnDefs = <ColDef[]> params.api.getColumnDefs();
  
      columnDefs.forEach((def, index) => {
        if(def.colId === columnName){
          def = coldef
        }
      });
  
      params.api.setGridOption("columnDefs", columnDefs);  
    }
  }  
}
