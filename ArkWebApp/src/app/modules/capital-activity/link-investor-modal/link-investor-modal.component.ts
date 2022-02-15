import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import {
  GridOptions,
  Module,
  ColDef
} from '@ag-grid-community/all-modules';
import { dateFormatter, dateTimeFormatter, amountFormatter } from 'src/app/shared/functions/formatter';

import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';

import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
  ActionColumnButtonContext,
  CheckboxColumnClickedInfo,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-link-investor-modal',
  templateUrl: './link-investor-modal.component.html',
  styleUrls: ['./link-investor-modal.component.scss']
})
export class LinkInvestorModalComponent implements OnInit, OnChanges {

  @Input() message: any;
  
  @Input() disableCreateNew: boolean = false;

  @Output() closePopUpEvent = new EventEmitter<any>();

  subscriptions: Subscription[] = []
  receivedCapitalAct: any[] = null;
  receivedCapitalID: number = null;

  updateMsg: string = null;
  isSuccess: boolean = false;
  isFailure: boolean = false;

  isCreateNew: boolean = false;
  newCapitalAct: CapitalActivityModel = null;

  rowContext: ActionColumnButtonContext = null;
  columnDefs: ColDef[] = [
    {field: 'capitalID', headerName: 'Capital ID', type: 'abColDefNumber'},
    { field: 'callDate', headerName: 'Call Date', type: 'abColDefDate', valueFormatter: dateFormatter },
    { field: 'valueDate', headerName: 'Value Date', type: 'abColDefDate', valueFormatter: dateFormatter},
    { field: 'capitalType', headerName: 'Capital Type', type:'abColDefString'},
    { field: 'capitalSubType', headerName: 'Capital Subtype', type:'abColDefString'},
    { field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
    { field: 'fundCcy', headerName: 'Currency', type:'abColDefString'},
    { field: 'totalAmount', headerName: 'Total Amount', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    { field: 'issuerShortName', headerName: 'Issuer Short Name', type:'abColDefString'},
    { field: 'asset', headerName: 'Asset', type:'abColDefString'},
    { field: 'narrative', headerName: 'Narrative', type:'abColDefString'},
    { field: 'source', headerName: 'Source', type:'abColDefString'},
    {field: 'Link', headerName: 'Link', type:'abColDefBoolean', editable: true},
    {field: 'resultCategory', headerName: 'Result Category', type:'abColDefString'},
  ]

  buttonText: string = 'Create New';

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: false,
    enablePivot: false,
    sortable: true,
    filter: true,
    autosize:true,
  };

  gridOptions: GridOptions = {
    enableRangeSelection: true,
    sideBar: false,
    suppressMenuHide: true,
    suppressClickEdit: true,
    singleClickEdit: false,
    groupSelectsFiltered: true,
    enableGroupEdit: false,
    components: {
      AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    },
    columnDefs: this.columnDefs,
    allowContextMenuWithControlKey:true

  };
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions = {
    primaryKey: '',
    autogeneratePrimaryKey: true,
    userName: 'TestUser',
    adaptableId: '',
    adaptableStateKey: 'Linking Key',
    predefinedConfig: {
      Dashboard: {
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        IsCollapsed: true,
        Tabs: [],
        IsHidden: true
      },
      FormatColumn: {
        FormatColumns: [
          {
            Scope: {
              ColumnIds: ['Link'],
            },
            ColumnStyle: {
              CheckBoxStyle: true,
            },
            IncludeGroupedRows: false
          }
        ]
      },
      Layout:{
        Layouts:[{
          Name: 'Associate Grid layout',
          Columns:[
            'fundCcy',
            'totalAmount',
            'callDate',
            'valueDate',
            'capitalType',
            'capitalSubType',
            'fundHedging',
            'issuerShortName',
            'asset',
            'narrative',
            'source',
            'capitalID',
            'Link'

          ],
          PinnedColumnsMap: {
            Link: 'right'
          },
          ColumnWidthMap:{
            Link: 20
          },
          RowGroupedColumns: ['resultCategory']
        }]
      }
    }
  };


  closePopUp(){
    if(this.isSuccess)
      this.closePopUpEvent.emit({event: 'Linked Close', capitalAct: this.newCapitalAct, isNewCapital: this.isCreateNew});
    else
      this.closePopUpEvent.emit({event: 'Empty Close', capitalAct: null});
  }

  action(type: string){
    if(type === 'Create New')
      this.associate(null, 'ADD');
    else if(type === 'Link')
      this.associate(this.checkedCapitalIDs, 'ASSOCIATE');
  }

  associate(capitalIDs?: number[], action?: string){

    let models: CapitalInvestment[] = [];

    for(let i = 0; i < this.message.investmentData.length; i+= 1){
      let investment = <CapitalInvestment> this.message.investmentData[i];

      if(action === 'ASSOCIATE'){
        let capitalID = capitalIDs;
        investment.capitalIDs = capitalIDs;
      }
      else investment.capitalIDs = null;

      investment.createdBy = investment.modifiedBy = this.msalService.getUserName()
      investment.createdOn = investment.modifiedOn = new Date();
      investment.valueDate = investment.fxRate = null;

      models.push(investment);
    }

    if(action === 'ASSOCIATE'){
      this.subscriptions.push(this.capitalActivityService.associateCapitalInvestments(models).subscribe({
        next: received => {
          this.receivedCapitalID = received.data; //GroupID is received

          this.isSuccess = true;
          this.isFailure = false;
          this.updateMsg = `Successfully associated investments to capital activities`;
        },
        error: error => {
          this.isFailure = true;
          this.isSuccess = false;
          this.updateMsg = 'Association failed';
        }
      }))
    }
    else if(action === 'ADD'){
      /**
       *  Step 1 - Add new Capital Activity to INVESTOR table and get CapitalID.
       *  Step 2- Use this new CapitalID to add the positions to the Association table.
       */

      // Step 1
      this.message.capitalAct.capitalID = null;
      this.message.capitalAct.createdOn = this.message.capitalAct.modifiedOn = new Date();
      this.message.capitalAct.createdBy = this.message.capitalAct.modifiedBy =this.msalService.getUserName();  

      this.message.capitalAct.source = 'ArkUI';
      this.message.capitalAct.sourceID = null;

      
      this.subscriptions.push(this.capitalActivityService.putCapitalActivity(this.message.capitalAct).subscribe({
        next: received => {

          // Step 2
          let newCapitalID: number = received.data;

          for(let i =0; i < models.length; i+= 1)
            models[i].capitalIDs = [received.data];
            
          this.subscriptions.push(this.capitalActivityService.associateCapitalInvestments(models).subscribe({
            next: received => {
              console.log(`Successfully associated investments to group ID [${received.data}]`);
              this.receivedCapitalID = newCapitalID;
              this.isCreateNew = true;

              this.isSuccess = true;
              this.isFailure = false;
              this.updateMsg = `Successfully associated investments to capital activities`;

              this.newCapitalAct = JSON.parse(JSON.stringify(this.message.capitalAct));
              this.newCapitalAct.capitalID = newCapitalID;
            },
            error: error => {
              console.error("Association failed");

              this.isFailure = true;
              this.isSuccess = false;
              this.updateMsg = 'Association failed';
            }
          }))
    
        },
        error: error => {
          console.error("Add capital activity failed");

          this.isFailure = true;
          this.isSuccess = false;
          this.updateMsg = 'Add capital activity failed';
        }
      }))

    }
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
    this.adapTableApi = adaptableApi;
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

    this.clearFilter();

    this.adapTableApi.eventApi.on(
      'CheckboxColumnClicked',
      (info: CheckboxColumnClickedInfo) => {
        
        this.checkedCapitalIDs = [];
        let gridData = this.adapTableApi.gridApi.getVendorGrid().rowData;

        for(let i:number = 0; i < gridData.length; i+=1){
          if(gridData[i].Link === true){
            if(this.checkedCapitalIDs.includes(gridData[i].capitalID))
              continue;
            else this.checkedCapitalIDs.push(gridData[i].capitalID);
          }
        }

        this.checkedCapitalIDs = this.checkedCapitalIDs.filter(cID => cID !== null && cID !== undefined)

        this.buttonText = (this.checkedCapitalIDs.length === 0) ? 'Create New' : 'Link';

      }
    )

  }

  constructor(
    private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService,
) { }

  clearFilter(): void{
    this.adapTableApi.filterApi.clearAllColumnFilter();
  }

  searchCapitalActivities(){
    this.checkedCapitalIDs = [];
    this.buttonText = 'Create New';

    this.message.capitalAct.posCcy = this.message.investmentData[0].positionCcy;

    this.subscriptions.push(this.capitalActivityService.lookUpCapitalActivity(this.message.capitalAct).subscribe({
      next: data => {

        // ADD

        for(let i = 0; i < data.length; i+= 1){
          data[i]['Link'] = false;
        }
        this.receivedCapitalAct = data;
//        this.disableCreateNew = true;
      },
      error: error => {
        console.error('Failed to fetched looked up capital activities')
      }
    }))
  }

  ngOnChanges(changes: SimpleChanges){
  }

  checkedCapitalIDs: number[] = [];

  ngOnInit(): void {

    this.isSuccess = this.isFailure = false;
    this.searchCapitalActivities();

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
