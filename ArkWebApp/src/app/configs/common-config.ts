import {  AdaptableOptions, ExportOptions, FilterOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { AdaptableModuleButtons } from "@adaptabletools/adaptable/src/PredefinedConfig/Common/Types";
import {  ColumnResizedEvent,  ExcelStyle, GridOptions, Module, ProcessCellForExportParams, VirtualColumnsChangedEvent } from "@ag-grid-community/core";

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
      onGridSizeChanged(event) {
        autosizeColumnExceptResized(event)
      },
      onFirstDataRendered(event) {
        autosizeColumnExceptResized(event)
      },
      onRowDataUpdated(event) {
        autosizeColumnExceptResized(event)
      },
      onRowGroupOpened(event) {
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
      filterOptions:{
        showDistinctFilteredValuesOnly:true,
        maxFilterValuesToDisplay:Number.MAX_SAFE_INTEGER
      }
    }
    
    public static AG_GRID_LICENSE_KEY: string = `Using_this_AG_Grid_Enterprise_key_( AG-047834 )_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_( legal@ag-grid.com )___For_help_with_changing_this_key_please_contact_( info@ag-grid.com )___( Arcmont Asset Management )_is_granted_a_( Single Application )_Developer_License_for_the_application_( ArkWebApp )_only_for_( 2 )_Front-End_JavaScript_developers___All_Front-End_JavaScript_developers_working_on_( ArkWebApp )_need_to_be_licensed___( ArkWebApp )_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_AG_Grid_Enterprise_versions_released_before_( 20_November_2024 )____[v2]_MTczMjA2MDgwMDAwMA==04166316939c075cadbe13ececc580cc`
    
    public static ADAPTABLE_LICENSE_KEY: string = `AppName=ArkWebApp|Owner=Arcmont|StartDate=2023-10-25|EndDate=2024-10-25|Ref=AdaptableLicense|TS=1698057807480|C=1400174890,3196349643,1260976079,1719080318,2748328944,3250147371,2536545759`   

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

    public static DASHBOARD_MODULE_BUTTONS: AdaptableModuleButtons = ['SettingsPanel', 'TeamSharing', 'Export', 'Layout', 'Filter'] 
}