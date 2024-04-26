import {  AdaptableOptions, ExportOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { AdaptableModuleButtons } from "@adaptabletools/adaptable/src/PredefinedConfig/Common/Types";
import {  ColumnResizedEvent,  ExcelStyle, FirstDataRenderedEvent, GridOptions, Module, ProcessCellForExportParams, RowDataUpdatedEvent, RowGroupOpenedEvent, VirtualColumnsChangedEvent } from "@ag-grid-community/core";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { autosizeColumnExceptResized,  getMomentDateStrFormat,  handleResizedColumns } from "../shared/functions/utilities";
import { StatusBarModule } from "@ag-grid-enterprise/status-bar";

export class CommonConfig{

    public static GRID_OPTIONS :GridOptions ={
      context:{
        resizedColumnList:[]
      },
      tooltipShowDelay:0,
      

      onVirtualColumnsChanged:(event:VirtualColumnsChangedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      onColumnResized: (params:ColumnResizedEvent)=>{
        handleResizedColumns(params)
      },
      processCellForClipboard(params: ProcessCellForExportParams) {
        if(params.column.getColDef().type === 'abColDefDate' || params.column.getColDef().cellClass === 'dateUK' )
          return getMomentDateStrFormat(params.value,'DD/MM/YYYY')
        return params.value;
      },
      onFirstDataRendered(event: FirstDataRenderedEvent) {
        autosizeColumnExceptResized(event)
      },
      onRowDataUpdated(event: RowDataUpdatedEvent) {
        autosizeColumnExceptResized(event)
      },
      onRowGroupOpened(event: RowGroupOpenedEvent) {
        autosizeColumnExceptResized(event)
      }
    }

    public static ADAPTABLE_GRID_OPTIONS : GridOptions = {
      statusBar:{
        statusPanels:[
          {
            key: 'Left Panel',
            statusPanel: 'AdaptableStatusPanel',
            align: 'left',
          },
          {
            key: 'Center Panel',
            statusPanel: 'AdaptableStatusPanel',
            align: 'center',
          },
          {
            key: 'Right Panel',
            statusPanel: 'AdaptableStatusPanel',
            align: 'right',
          },
        ]
      }
    }

    // Common Adaptable Options
    public static ADAPTABLE_OPTIONS : AdaptableOptions = {

      primaryKey:'',
      columnFilterOptions: {
        valuesFilterOptions: {
          showDistinctFilteredValuesOnly: true,
          maxFilterValuesToDisplay: Number.MAX_SAFE_INTEGER
        }
      }
    }

    public static GENERAL_EXPORT_OPTIONS: ExportOptions = {
      exportFormatType: 'formattedValue'
    }



    public static GENERAL_EXCEL_STYLES: ExcelStyle[] = [{
        id: 'dateUK',
        dataType: 'DateTime',
        numberFormat: {
          format: 'yyyy/MM/dd'
        }
      }]

    public static AG_GRID_MODULES: Module[] = [
        ClientSideRowModelModule,
        SetFilterModule,
        ColumnsToolPanelModule,
        MenuModule,
        ExcelExportModule,
        CsvExportModule,
        FiltersToolPanelModule,
        ClipboardModule,
        SideBarModule,
        RangeSelectionModule,
        RowGroupingModule,
        StatusBarModule
      ];

    public static DASHBOARD_MODULE_BUTTONS: AdaptableModuleButtons = ['SettingsPanel', 'TeamSharing', 'Export', 'Layout', 'GridFilter'] 
}