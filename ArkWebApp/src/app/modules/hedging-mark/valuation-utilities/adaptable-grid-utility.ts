import { PredefinedConfig } from "@adaptabletools/adaptable-angular-aggrid";
import { ColDef } from "@ag-grid-community/core";
import { CommonConfig } from "src/app/configs/common-config";
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from "src/app/shared/functions/formatter";
import { DATE_COLUMNS_LIST, AMOUNT_COLUMNS_LIST } from "../../positions-screen/grid-structure";

export class ValutationAdaptableGridUtility {
    
    constructor(){}

    public static getPredefinedConfig(columnDefs: ColDef[]): PredefinedConfig{

        return {
            Dashboard: {
              Revision: 9,
              ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
              IsCollapsed: true,
              Tabs: [{
                Name: 'Layout',
                Toolbars: ['Layout']
              }],
              IsHidden: false,
              DashboardTitle: ' '
            },
            Layout: {
              CurrentLayout: 'Hedging Mark Override Layout',
              Revision: 60,
              Layouts: [{
                Name: 'Hedging Mark Override Layout',
                Columns: columnDefs.map(def => def.field),
                PinnedColumnsMap: {
                  cost: 'right',
                  mark: 'right',
                  markOverride: 'right',
                  markOverrideLevel: 'right',
                  lastMarkOverrideDate: 'right',
                  hedgingMark: 'right',
                  hedgingMarkLevel: 'right',
                  lastHedgingMarkDate: 'right',
                  isOverriden: 'right',
                  isOvrdMark: 'right',
                  mark_override: 'right'
    
                },
                RowGroupedColumns: ['valuationMethod', 'issuerShortName', 'asset'],
                AggregationColumns: {
                  cost: true, mark: true, 
                  markOverride: true
                  , markOverrideLevel: true, lastMarkOverrideDate: true, hedgingMark: true, hedgingMarkLevel: true, lastHedgingMarkDate: true
                },
                SuppressAggFuncInHeader: true,
                ColumnFilters: [{
                  ColumnId: 'status',
                  Predicate: {
                    PredicateId: 'Values',
                    Inputs: ['Open']
                  }
                }, {
                  ColumnId: 'isFinancing',
                  Predicate: {
                    PredicateId: 'Values',
                    Inputs: ['false']
                  }
                }]
              }]
    
            },
            FormatColumn: {
              Revision: 9,
              FormatColumns: [
                BLANK_DATETIME_FORMATTER_CONFIG([...DATE_COLUMNS_LIST, 'lastHedgingMarkDate', 'modifiedOn', 'lastMarkOverrideDate']),
                DATE_FORMATTER_CONFIG_ddMMyyyy([...DATE_COLUMNS_LIST, 'lastHedgingMarkDate', 'lastMarkOverrideDate']),
                DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn']),
    
    
                AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(AMOUNT_COLUMNS_LIST, 2, ['amountFormatter']),
                AMOUNT_FORMATTER_CONFIG_Zero(AMOUNT_COLUMNS_LIST, 2, ['amountFormatter']),
    
              ]
            }
          }
    }
}