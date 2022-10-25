import { ExportOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { ClientSideRowModelModule, Module } from "@ag-grid-community/all-modules";
import { SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule, RowGroupingModule } from "@ag-grid-enterprise/all-modules";


export class CommonConfig{

    public static GENERAL_EXPORT_OPTIONS: ExportOptions = {
        exportDateFormat: 'yyyy/MM/dd',
        exportFormatType: 'formattedValue'
    }

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
}