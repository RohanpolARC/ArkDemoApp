import { ExportOptions } from "@adaptabletools/adaptable-angular-aggrid";

export class CommonConfig{
    
    public static GENERAL_EXPORT_OPTIONS: ExportOptions = {
        exportDateFormat: 'yyyy/MM/dd',
        exportFormatType: 'formattedValue'
    }
}