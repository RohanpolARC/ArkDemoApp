import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import * as XLSX from 'xlsx';
import { ColDef } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';

import { dateFormatter, amountFormatter } from 'src/app/shared/functions/formatter';
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { addToGrid, getColumnTitle } from '../utilities/utility';


import {
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import {
  AdaptableOptions,
  AdaptableApi,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';

import { validateColumns, validateExcelRows } from './validation';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss']
})
export class BulkUploadComponent implements OnInit {

  isHovering: boolean;
  selectedFile: File = null;

  files: File[] = []; /** Can Read multiple files at once */

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {

    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i));
    }
    this.selectedFile = this.files.length >= 1 ? this.files[this.files.length - 1] : null;  /** Read only one file at a time */

    // Reading file only after adaptable is initialized, else it won't switch layouts if not loaded before file read.
    if(this.selectedFile){
      this.readFile(this.selectedFile);
    }
      
  }

  adapTableApi: AdaptableApi;
  gridApi;
  gridColumnApi;

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

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

  constructor(public dialogRef: MatDialogRef<BulkUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService,
    private httpClient: HttpClient) { }

  columnDefs: ColDef[] = [
    {field: 'Fund Hedging', maxWidth: 150},
    {field: 'Cash Flow Date', maxWidth: 150, valueFormatter: dateFormatter},
    {field: 'Capital Type', maxWidth: 150},
    {field: 'Capital Subtype', maxWidth: 150},
    {field: 'Fund Currency', maxWidth: 100},
    {field: 'Amount (fund ccy)', headerName: 'Amount', maxWidth: 150, cellClass: 'ag-right-aligned-cell', valueFormatter: amountFormatter},
    {field: 'Wso Issuer ID', headerName: 'WSO Issuer ID'},
    {field: 'Issuer Short Name(optional)', headerName: 'Issuer Short Name'},
    {field: 'Asset (optional)', maxWidth: 150, headerName: 'Asset'},
    {field: 'Narative (optional)', maxWidth: 150, headerName: 'Narrative'},
    {field: 'remark', maxWidth: 500},
    {field: '_COLUMN_TITLE', headerName: 'Column', maxWidth: 300}
  ]
   
  bulkRowData = [];
  invalidRowData = [];

  onSave(): void {
    this.disableSubmit = true;

    let bulkUploadData: CapitalActivityModel[] = this.makeBulkCapitalActivity();
    this.subscriptions.push(this.capitalActivityService.bulkPutCapitalActivity(bulkUploadData).subscribe({
      next : response =>{
        this.disableSubmit = true;
        this.updateMsg = "Capital Activity(s) added";
        this.isSuccess = true;
        this.isFailure = false;

        if(response.isSuccess){
          addToGrid(this.data.adaptableApiInvestor, bulkUploadData, response.data, 'capitalID');
        }
        else console.error("Failed to add capital activities");
      },
      error: error => {
        this.disableSubmit = false;
        this.updateMsg = "Failed to bulk add capital activities";
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
    model.valueDate = new Date(moment(obj['Cash Flow Date'], 'DD/MM/YYYY').format('YYYY-MM-DD'))
    model.callDate = new Date(moment(obj['Cash Flow Date'], 'DD/MM/YYYY').format('YYYY-MM-DD'))
    model.narrative = obj['Narative (optional)'];
    model.capitalType = obj['Capital Type'];
    model.capitalSubType = obj['Capital Subtype'];
    model.fundHedging = obj['Fund Hedging'];
    model.totalAmount = Number(obj['Amount (fund ccy)']);
    model.issuerShortName = obj['Issuer Short Name(optional)'];
    model.asset = obj['Asset (optional)'];
    model.fundCcy = obj['Fund Currency'];
    model.wsoIssuerID = obj['Wso Issuer ID'];

    model.createdBy = model.modifiedBy = this.msalService.getUserName();
    model.createdOn = model.modifiedOn = new Date();
    return model;    
  }

  ngOnInit(): void {

    this.gridOptions = {
      enableRangeSelection: false,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true
    }

    this.updateMsg = null;
    this.isSuccess = this.isFailure = false;
    this.disableSubmit = true;
  }

  public adaptableOptions: AdaptableOptions = {
    autogeneratePrimaryKey: true,
     primaryKey:'',
     userName: 'TestUser',
     adaptableId: "",
     adaptableStateKey: `Bulk Update Key`,
 
     toolPanelOptions: {
       toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
     },
 
     predefinedConfig: {
       Dashboard: {
         ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
         IsCollapsed: true,
         Tabs: [],
       },
       FormatColumn: {
        FormatColumns: [
          {
            Scope: {
              ColumnIds: ['remark'],
            },
            Style: {
              BackColor: '#FFFFFF',
              ForeColor: '#FF0000',
            },
          }]},
       Layout: {
         CurrentLayout: 'Bulk Grid',
         Layouts: [{
           Name: 'Bulk Grid',
           Columns: [
             'Fund Hedging',
             'Cash Flow Date',
             'Capital Type',
             'Capital Subtype',
             'Fund Currency',
             'Amount (fund ccy)',
             'Wso Issuer ID',
             'Issuer Short Name(optional)',
             'Asset (optional)',
             'Narative (optional)',
             '_COLUMN_TITLE'
           ],
           PinnedColumnsMap: {
            _COLUMN_TITLE: 'right'
          },
          ColumnWidthMap: {
            _COLUMN_TITLE: 5
          },
           RowGroupedColumns : [],
         },
         {
           Name: 'Invalid Excel Grid',
           Columns: [
            'Fund Hedging',
            'Cash Flow Date',
            'Capital Type',
            'Capital Subtype',
            'Fund Currency',
            'Amount (fund ccy)',
            'Wso Issuer ID',
            'Issuer Short Name(optional)',
            'Asset (optional)',
            'Narative (optional)',
            'remark',
            '_COLUMN_TITLE'
           ],
           PinnedColumnsMap: {
             _COLUMN_TITLE: 'right',
             remark: 'right'
           },
           ColumnWidthMap: {
             _COLUMN_TITLE: 5,
             remark: 300
           }
         }
        ]
       }
     }
   }

   onGridReady(params) {
    console.log('GRID INITIED');
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

  }

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
      
    }
  ) {
    console.log(`ADAPTABLE INITED`);
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

    this.adapTableApi = adaptableApi;
/* Closes right sidebar on start */

    this.readFile(this.selectedFile);
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

       const rawTransposed = [];
       for (let i=0; i<data.length; i++) {
         for (let j=0; j<data[i].length; j++) {
           if (!rawTransposed[j]) rawTransposed[j] = [];
           rawTransposed[j][i] = data[i][j]; 
         }
       }

       let extractedCols: string[] = rawTransposed[0];

      if(validateColumns(extractedCols).isValid){
        
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.aoa_to_sheet(rawTransposed);

        XLSX.utils.book_append_sheet(wb, ws, "Capital Activity");

        let jsonRowData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]).filter(row => row['Cash Flow Date'] !== undefined && row['Cash Flow Date'] !== null);

        for(let i:number = 0; i < jsonRowData.length; i+=1){
          jsonRowData[i]['_COLUMN_TITLE'] = getColumnTitle(i+2);
        }

        console.log(jsonRowData)

        let validationResult: {isValid: boolean, invalidRows?: {row: any, remark: string}[]} = validateExcelRows(jsonRowData, {
          capitalTypes: this.data.capitalTypes,
          capitalSubTypes: this.data.capitalSubTypes,
          refData: this.data.refData
        });

        this.isValid = validationResult.isValid;

        console.log(validationResult)

        console.log(this.adapTableApi);

        if(this.isValid){
          console.log("I m VALID")
          this.bulkRowData = jsonRowData.filter(row => row['Cash Flow Date'] !== undefined && row['Cash Flow Date'] !== null)
          this.invalidRowData = [];
          this.isValid = true;  
          this.disableSubmit = false;
          console.log(this.disableSubmit);
          this.adapTableApi.layoutApi.setLayout('Bulk Grid');
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

          console.log(this.disableSubmit)
          this.adapTableApi.layoutApi.setLayout('Invalid Excel Grid')
        }
      }
      else{
        this.bulkRowData = this.invalidRowData = [];

        this.isValid = false;
        this.validationErrorMsg = `Invalid column found "${validateColumns(extractedCols).col}"`;
        this.disableSubmit = true;
      }
      console.log(this.disableSubmit)
    }
    console.log(this.disableSubmit)
  }

  fileUpload(event){
    this.isValid = false
    this.disableSubmit = true

    this.bulkRowData = this.invalidRowData = [];

    this.selectedFile = event.target.files[0];

    // Reading file only after adaptable is initialized, else it won't switch layouts if not loaded before file read.
    if(this.selectedFile){
      this.readFile(this.selectedFile);
    }
      
  }

}
