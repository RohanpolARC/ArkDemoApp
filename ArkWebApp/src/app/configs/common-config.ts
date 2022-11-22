import { AdaptableButton, DashboardOptions, ExportOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ExcelStyle, Module } from "@ag-grid-community/core";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { AdaptableModuleButtons } from "@adaptabletools/adaptable/src/PredefinedConfig/Common/Types";

export class CommonConfig{

    public static AG_GRID_LICENSE_KEY: string = `CompanyName=Arcmont Asset Management,LicensedApplication=ArkWebApp,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=2,LicensedProductionInstancesCount=0,AssetReference=AG-035059,SupportServicesEnd=21_November_2023_[v2]_MTcwMDUyNDgwMDAwMA==ef536150b8d9d3fcd89f7771890b0cf1`
    
    public static ADAPTABLE_LICENSE_KEY: string = `AppName=ArkWebApp|Owner=Arcmont|StartDate=2022-10-24|EndDate=2023-10-24|Ref=AdaptableLicense|TS=1666602091846|C=1746416962,3532872810,1260976079,3570867046,1923092690,3250147371,2536545759`   

    public static GENERAL_EXPORT_OPTIONS: ExportOptions = {
        exportDateFormat: 'yyyy/MM/dd',
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
        FiltersToolPanelModule,
        ClipboardModule,
        SideBarModule,
        RangeSelectionModule,
        RowGroupingModule
      ];

    public static DASHBOARD_MODULE_BUTTONS: AdaptableModuleButtons = ['SettingsPanel', 'TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'] 
}