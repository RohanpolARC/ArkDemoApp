import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import * as XLSX from 'xlsx';
import { ColDef } from '@ag-grid-community/core';
import { amountFormatter } from 'src/app/shared/functions/formatter';
import { dateFormatter } from '../utilities/utility';
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription } from 'rxjs';
import {
  GridOptions,
  Module,
} from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import {
  AdaptableOptions,
  AdaptableApi
} from '@adaptabletools/adaptable/types';
import { validateColumns, validateExcelRows } from './validation';
import { DataService } from 'src/app/core/services/data.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import * as moment from 'moment';
import { CommonConfig } from 'src/app/configs/common-config';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss']
})
export class BulkUploadComponent implements OnInit {

  isHovering: boolean;
  selectedFile: File = null;

  files: File[] = []; /** Can Read multiple files at once */

  adapTableApi: AdaptableApi;
  gridApi;
  gridColumnApi;

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES

  validationErrorMsg: string = null;
  isValid: boolean = false;

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  };
  gridOptions: GridOptions;

  subscriptions: Subscription[] = [];
  updateMsg: string = null;
  isSuccess: boolean;
  isFailure: boolean;
  disableSubmit: boolean;

  tooltipShowDelay:number = 0;
  
  constructor(public dialogRef: MatDialogRef<BulkUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private capitalActivityService: CapitalActivityService, 
    private dataSvc: DataService) { }

  columnDefs: ColDef[] = [
    { field: 'Cash Flow Date', maxWidth: 150, valueFormatter: dateFormatter, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Cash Flow Date'},
    { field: 'Call Date', maxWidth: 150, valueFormatter: dateFormatter, allowedAggFuncs: ['Min', 'Max'], tooltipField: 'Call Date'},
    { field: 'Fund Hedging', maxWidth: 150, tooltipField: 'Fund Hedging'},
    { field: 'Fund Currency', headerName: 'Fund Ccy', maxWidth: 150, tooltipField: 'Fund Currency'},
    { field: 'Position Currency', headerName: 'Position Ccy', maxWidth: 150, tooltipField: 'Position Currency'},
    { field: 'GIR (Pos - Fund ccy)', headerName: 'GIR (Pos -> Fund)', maxWidth: 300,  allowedAggFuncs: ['sum', 'avg', 'first', 'last', 'count', 'min', 'max'], tooltipField: 'GIR (Pos - Fund ccy)'},
    { field: 'GIR Override', maxWidth: 150 },
    { field: 'Amount (in Fund Ccy)', headerName: 'Amount (in Fund Ccy)', maxWidth: 150, cellClass: 'ag-right-aligned-cell', valueFormatter: amountFormatter, allowedAggFuncs: [ 'sum', 'avg', 'first', 'last', 'count', 'min', 'max'], tooltipField:'Amount (in Fund Ccy)'},
    { field: 'Capital Type', maxWidth: 150, tooltipField:'Capital Type'},
    { field: 'Capital Subtype', maxWidth: 170, tooltipField:'Capital Subtype'},
    { field: 'Wso Asset ID', headerName: 'WSO Asset ID', tooltipField:'Wso Asset ID'},
    { field: 'Asset (optional)', maxWidth: 150, headerName: 'Asset', tooltipField:'Asset (optional)'},
    { field: 'Narative (optional)', maxWidth: 150, headerName: 'Narrative', tooltipField:'Narative (optional)'},
    { field: 'remark', width: 500, tooltipField: 'remark'},
    { field: '_ROW_ID', headerName: 'Row', maxWidth: 100},
  ]
   
  aggFuncs = {
    'Min': params => {
      let minDate = new Date(8640000000000000);
      params.values.forEach(value => {
        if(value < minDate)
          minDate = value
      })
      return minDate
    },
    'Max': params => {
      let maxDate = new Date(-8640000000000000);
      params.values.forEach(value => {
        if(value > maxDate)
          maxDate = value
      })
      return maxDate
    } 
  }
  bulkRowData = [];
  invalidRowData = [];

  onSave(): void {
    this.disableSubmit = true;

    let bulkUploadData: CapitalActivityModel[] = this.makeBulkCapitalActivity();
    this.subscriptions.push(this.capitalActivityService.bulkPutCapitalActivity(bulkUploadData).subscribe({
      next : response =>{
        if(response.isSuccess){
          this.disableSubmit = true;
          this.updateMsg = `Capital Activity(s) Inserted (${response.data[0].value}), Updated (${response.data[1].value})`;
          this.isSuccess = true;
          this.isFailure = false;
          return;
        }
        else console.error("Failed to add/update capital activities");
      },
      error: error => {
        this.disableSubmit = false;
        this.updateMsg = "Failed to bulk add/update capital activities";
        this.isSuccess = false;
        this.isFailure = true;

        console.error("Failed to bulk add capital activities");
      }
    }))
  }

  makeBulkCapitalActivity(): CapitalActivityModel[]{

    let bulkCapitalActivities: CapitalActivityModel[] = [];
    for(let i: number = 0; i < this.bulkRowData.length; i+=1){
      bulkCapitalActivities.push(this.JSONtoCapitalActivity(this.bulkRowData[i]));
    }
    return bulkCapitalActivities;
  }

  JSONtoCapitalActivity(obj: {}): CapitalActivityModel {

    let model = <CapitalActivityModel>{};
    model.valueDate = new Date(moment(obj['Cash Flow Date'], 'DD/MM/YYYY').format('YYYY-MM-DD'));
    model.callDate = new Date(moment(obj['Call Date'], 'DD/MM/YYYY').format('YYYY-MM-DD'));
    model.narrative = obj['Narative (optional)'];
    model.capitalType = obj['Capital Type'];
    model.capitalSubType = obj['Capital Subtype'];
    model.fundHedging = obj['Fund Hedging'];
    model.totalAmount = Number(obj['Amount (in Fund Ccy)']);
    model.asset = obj['Asset (optional)'];
    model.fundCcy = obj['Fund Currency'];
    model.wsoAssetID = Number(obj['Wso Asset ID']);
    model.posCcy = obj['Position Currency'];
    model.fxRate = Number(obj['GIR (Pos - Fund ccy)']);
    model.fxRateOverride = Boolean(obj['GIR Override'] === 'Yes');
    model.createdBy = model.modifiedBy = this.dataSvc.getCurrentUserName();
    model.createdOn = model.modifiedOn = new Date();
    model.source = 'ArkUI - template';
    model.sourceID = 3;
    return model;    
  }

  ngOnInit(): void {

    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true,
      rowGroupPanelShow: 'always',
      aggFuncs: this.aggFuncs
    }

    this.updateMsg = null;
    this.isSuccess = this.isFailure = false;
    this.disableSubmit = true;
  }

  public adaptableOptions: AdaptableOptions = {
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    autogeneratePrimaryKey: true,
     primaryKey:'',
     userName: this.dataSvc.getCurrentUserName(),
     adaptableId: "Capital Activity - Bulk Upload",
     adaptableStateKey: `Bulk Upload Key`,
 
    //  toolPanelOptions: {
    //    toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
    //  },
     exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

     teamSharingOptions: {
      enableTeamSharing: true,
      setSharedEntities: setSharedEntities.bind(this),
      getSharedEntities: getSharedEntities.bind(this)
    },

     predefinedConfig: {
       Dashboard: {
         Revision: 1,
         ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
         IsCollapsed: true,
         Tabs: [],
         DashboardTitle: ' '
       },
       FormatColumn: {
        FormatColumns: [
          {
            Scope: {
              ColumnIds: ['remark'],
            },
            Style: {
              ForeColor: '#FF0000',
            },
          }
        ]
      },
       Layout: {
         Revision: 4,
         CurrentLayout: 'Bulk Grid',
         Layouts: [{
           Name: 'Bulk Grid',
           Columns: [
            'Cash Flow Date',
            'Call Date',
            'Fund Hedging',
            'Fund Currency',
            'Position Currency',
            'GIR (Pos - Fund ccy)',
            'GIR Override',
            'Amount (in Fund Ccy)',
            'Capital Type',
            'Capital Subtype',
            'Wso Asset ID',
            'Asset (optional)',
            'Narative (optional)',
            '_ROW_ID'
           ],
           PinnedColumnsMap: {
            _ROW_ID: 'left'
          },
          ColumnWidthMap: {
            _ROW_ID: 5
          },
           RowGroupedColumns : [],
         },
         {
           Name: 'Invalid Excel Grid',
           Columns: [
            'Cash Flow Date',
            'Call Date',
            'Fund Hedging',
            'Fund Currency',
            'Position Currency',
            'GIR (Pos - Fund ccy)',
            'GIR Override',
            'Amount (in Fund Ccy)',
            'Capital Type',
            'Capital Subtype',
            'Wso Asset ID',
            'Asset (optional)',
            'Narative (optional)',
            'remark',
            '_ROW_ID',
           ],
           PinnedColumnsMap: {
             _ROW_ID: 'left',
             remark: 'right'
           },
           ColumnWidthMap: {
             _ROW_ID: 5,
             remark: 300
           }          
         }
        ]
       }
     }
   }

   onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;

    if(this.invalidRowData.length > 0){
      //this.adapTableApi.gridApi.loadGridData(this.invalidRowData)
      this.adapTableApi.layoutApi.setLayout('Invalid Excel Grid')
    }
    else if(this.bulkRowData.length > 0){
      //this.adapTableApi.gridApi.loadGridData(this.bulkRowData)
      this.adapTableApi.layoutApi.setLayout('Bulk Grid')
    }

    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  readFile(file: File){
    if(file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
      this.bulkRowData = this.invalidRowData = [];
      this.isValid = false;
      this.validationErrorMsg = `Invalid file type: ${file.type}"`;
      this.disableSubmit = true;

      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = (loadEvent: any) => {

      let binaryData = loadEvent.target.result;
      let workbook = XLSX.read(binaryData, { type: 'binary'});

      const data: any = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], 
        {
          header: 1,            // sheet_to_aoa.
          raw: false,           // preserves date as string. 
          blankrows: false      // removes intermediate blank rows.
      });

      /*
       header : 0 --> Converts into Objects
       header : 1 --> Converts into Array of Arrays (aoa).

      Reference: 
       https://github.com/SheetJS/sheetjs/issues/1729#issuecomment-582595816

      */

       let extractedCols: string[] = data[0];

       for(let i = 1; i < data.length; i++){       // Skipping header's row
         for(let j = 0; j < data[i].length; j++){
           if(['GIR (Pos - Fund ccy)', 'Amount (in Fund Ccy)'].includes(data[0][j])){
             data[i][j] = parseFloat(String(data[i][j]).replace(/,/g,''));      // Remove commas, blanks from number read from excel
           }
         }
       }

      if(validateColumns(extractedCols).isValid){
        
        let jsonRowData = []
        for(let i: number = 1; i < data.length; i+=1){
          let obj = {}
          for(let j: number= 0; j < extractedCols.length; j+= 1){
            if(['GIR (Pos - Fund ccy)', 'Amount (in Fund Ccy)'].includes(extractedCols[j]))
              obj[extractedCols[j]] = parseFloat(data[i][j])
            else if(['Call Date', 'Cash Flow Date'].includes(extractedCols[j])){
              obj[extractedCols[j]] = moment(data[i][j], 'DD/MM/YYYY', true).toDate()
              if(obj[extractedCols[j]] == 'Invalid Date')
                obj[extractedCols[j]] = null 
            }
            else
              obj[extractedCols[j]] = data[i][j];

              obj['_ROW_ID'] = i + 1
          }
          jsonRowData.push(obj);
        }

        let validationResult: {isValid: boolean, invalidRows?: {row: any, remark: string}[]} = validateExcelRows(jsonRowData, {
          capitalTypes: this.data.capitalTypes,
          capitalSubTypes: this.data.capitalSubTypes,
          refData: this.data.refData
        });

        this.isValid = validationResult.isValid;

        if(this.isValid){
          this.bulkRowData = jsonRowData.filter(row => row['Cash Flow Date'] !== undefined && row['Cash Flow Date'] !== null)
          this.invalidRowData = [];
          this.isValid = true;  
          this.disableSubmit = false;
        }
        else{
          this.bulkRowData = [];

          let invalidRows = [];
          for(let i:number = 0; i < validationResult.invalidRows.length; i+=1){
            let temp = validationResult.invalidRows[i].row;
            temp['remark'] = validationResult.invalidRows[i].remark;
            invalidRows.push(temp);
          }

          this.invalidRowData = invalidRows;
          this.disableSubmit = true;
        }
      }
      else{
        this.bulkRowData = this.invalidRowData = [];

        this.isValid = false;
        this.validationErrorMsg = `Invalid column found "${validateColumns(extractedCols).col}"`;
        this.disableSubmit = true;
      }
    }
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {

    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i));
    }
    this.selectedFile = this.files.length >= 1 ? this.files[this.files.length - 1] : null;  /** Read only one file at a time */

    if(this.selectedFile){
      this.readFile(this.selectedFile);
    }
  }

  fileUpload(event){
    this.isValid = false
    this.disableSubmit = true
    this.bulkRowData = this.invalidRowData = [];
    this.selectedFile = event.target.files[0];

    if(this.selectedFile){
      this.readFile(this.selectedFile);
    }      
  }

  closeDialog(): any{
    this.dialogRef.close({isSuccess: this.isSuccess})
  }
}
