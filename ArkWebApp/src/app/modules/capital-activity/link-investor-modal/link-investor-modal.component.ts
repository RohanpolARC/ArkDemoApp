import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import {
  GridOptions,
  Module,
  ColDef,
  ClientSideRowModelModule
} from '@ag-grid-community/all-modules';
import { dateFormatter, dateTimeFormatter, amountFormatter, nonAmountNumberFormatter, formatDate } from 'src/app/shared/functions/formatter';

import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';

import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
  ActionColumnButtonContext,
  CheckboxColumnClickedInfo,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { AssociateInvestment, CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription } from 'rxjs';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule, MenuModule, RowGroupingModule, SetFilterModule } from '@ag-grid-enterprise/all-modules';
import * as moment from 'moment';



@Component({
  selector: 'app-link-investor-modal',
  templateUrl: './link-investor-modal.component.html',
  styleUrls: ['./link-investor-modal.component.scss']
})
export class LinkInvestorModalComponent implements OnInit, OnChanges {

  @Input() message: {
    actionType: string,
    capitalAct: CapitalActivityModel,
    investmentData: any[]
  };
  
  @Input() disableCreateNew: {
    disable: boolean
  };

  @Output() closePopUpEvent = new EventEmitter<any>();
  @Output() isAlreadyLinkedEmit = new EventEmitter<boolean>();
  isAlreadyLinkedEmmited: boolean = false;
  isAlreadyLinked: boolean = null

  subscriptions: Subscription[] = []
  receivedCapitalAct: any[] = null;
  receivedCapitalID: number = null;

  updateMsg: string = null;
  isSuccess: boolean = false;
  isFailure: boolean = false;

  isCreateNew: boolean = false;
  newCapitalAct: CapitalActivityModel = null;

  agGridModules: Module[] = [ClientSideRowModelModule, RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

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
    { field: 'wsoAssetID', headerName: 'Asset ID', type:'abColDefNumber',valueFormatter: nonAmountNumberFormatter},
    { field: 'narrative', headerName: 'Narrative', type:'abColDefString'},
    { field: 'source', headerName: 'Source', type:'abColDefString'},
    // { field: 'isLinked', headerName: 'Is Linked', type: 'abColDefBoolean'},
    { field: 'linkedAmount', headerName: 'Linked Amount', type: 'abColDefNumber', valueFormatter: amountFormatter},
    { field: 'Link', headerName: 'Link', type:'abColDefBoolean', editable: true},
    { field: 'resultCategory', headerName: 'Result Category', type:'abColDefString'},
  ]

  buttonText: string = 'Create New';

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
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
    rowGroupPanelShow: 'always',
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
    userName: this.msalService.getUserName(),
    adaptableId: '',
    adaptableStateKey: 'Linking Key',

    toolPanelOptions: {
      toolPanelOrder: ['columns', 'AdaptableToolPanel']
    },
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
        Revision: 6,
        Layouts:[{
          Name: 'Associate Grid layout',
          Columns:[
            'fundCcy',
            'totalAmount',
            'linkedAmount',
            'callDate',
            'valueDate',
            'capitalType',
            'capitalSubType',
            'fundHedging',
            'issuerShortName',
            'asset',
            'wsoAssetID',
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
          RowGroupedColumns: ['resultCategory'],
          AggregationColumns: {
            totalAmount: 'sum',
            linkedAmount: 'sum'
          }
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
    else if(type === 'Update Link')
      this.associate(this.checkedCapitalIDs, 'ASSOCIATE');
  }

  associate(capitalIDs?: number[], action?: string){

    let pIDcashDtStr: string = '';
    let cIDActionStr: string = '';

    this.message.investmentData.forEach(investment => {
      pIDcashDtStr += `${investment.positionID}|${formatDate(investment.cashDate, true)},`
    })
    
    if(pIDcashDtStr.length)
      pIDcashDtStr = pIDcashDtStr.slice(0, -1);
    
    console.log(`PositionIDs|CashDate : ${pIDcashDtStr}`)

    let model: AssociateInvestment = <AssociateInvestment> {};
    model.positionIDCashdateStr = pIDcashDtStr;
    model.capitalIDs = this.checkedCapitalIDs;
    model.username = this.msalService.getUserName();

    if(action === 'ASSOCIATE'){

      this.subscriptions.push(this.capitalActivityService.associateCapitalInvestments(model).subscribe({
        next: result => {
          if(result.isSuccess){
            this.disableCreateNew = {
              disable: true
            };
            this.updateMsg = 'Successfully updated investment associations';
            this.isSuccess = true;
            this.isFailure = false;
          }
        },
        error: error => {
          console.error(`Failed to update associations: ${error}`)
          this.disableCreateNew = {
            disable: false
          };
          this.updateMsg = 'Failed to update investment associations';
          this.isSuccess = false;
          this.isFailure = true;

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

      this.message.capitalAct.source = 'ArkUI - link';
      this.message.capitalAct.sourceID = 4;

      this.subscriptions.push(this.capitalActivityService.putCapitalActivity(this.message.capitalAct).subscribe({
        next: received => {

          let newCapitalID: number = received.data;
          model.capitalIDs = [newCapitalID]
          this.subscriptions.push(this.capitalActivityService.associateCapitalInvestments(model).subscribe({
            next: result => {
              if(result.isSuccess){
                this.disableCreateNew = {
                  disable: true
                };
                this.updateMsg = 'Successfully updated investment associations';
                this.isSuccess = true;
                this.isFailure = false;

                this.newCapitalAct = JSON.parse(JSON.stringify(this.message.capitalAct));
                this.newCapitalAct.capitalID = newCapitalID;
              }
            },
            error: error => {
              console.error(`Failed to update associations: ${error}`)
              this.disableCreateNew = {
                disable: false
              };
              this.updateMsg = 'Failed to update investment associations';
              this.isSuccess = false;
              this.isFailure = true;
    
            }    
          }))
        },
        error: error => {
          console.error(`Failed to add capital activity before linking`)
          this.isFailure = true;
          this.isSuccess = false;
          this.updateMsg = 'Create new and link failed';
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
    adaptableApi.columnApi.autosizeAllColumns()
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

    this.clearFilter();

    this.adapTableApi.eventApi.on(
      'CheckboxColumnClicked',
      (info: CheckboxColumnClickedInfo) => {
        this.checkedCapitalIDs = [];
        let gridData = this.adapTableApi.gridApi.getVendorGrid().rowData;

        let allCids: number[] = []

        for(let i:number = 0; i < gridData.length; i+=1){
          if(!!gridData[i].capitalID)
            allCids.push(Number(gridData[i].capitalID));

          if(gridData[i].Link === true){
            if(this.checkedCapitalIDs.includes(gridData[i].capitalID))
              continue;
            else this.checkedCapitalIDs.push(gridData[i].capitalID);
          }
        }

        this.checkedCapitalIDs = this.checkedCapitalIDs.filter(cID => cID !== null && cID !== undefined)
        this.buttonText = (this.checkedCapitalIDs.length === 0) ? 'Create New' : 'Update Link';

        if(this.isAlreadyLinked){
          this.buttonText = 'Update Link'
        }
        else if(!this.isAlreadyLinked && this.checkedCapitalIDs.length === 0){
          this.buttonText = 'Create New'
        }
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

    this.message.capitalAct.positionIDs = '';
    let ids: string = '';
    for(let i: number = 0; i < this.message.investmentData.length; i+= 1){
      ids += String(this.message.investmentData[i].positionID) + ','
    }
    ids = ids.slice(0, -1);
    this.message.capitalAct.positionIDs = ids;

    /** Assuming that investmentData has a valid cashDate on 1st row */
    this.message.capitalAct.cashDate = new Date(moment(this.message.investmentData[0].cashDate).format('YYYY-MM-DD'));
    this.subscriptions.push(this.capitalActivityService.lookUpCapitalActivity(this.message.capitalAct).subscribe({
      next: data => {

        this.isAlreadyLinkedEmmited = false;
        this.disableCreateNew = {
          disable: true
        }

        for(let i = 0; i < data.length; i+= 1){
          if((data[i].resultCategory.trim().toLowerCase() === 'linked')){
            data[i]['Link'] = true
            this.disableCreateNew = {
              disable: false
            }
            this.buttonText = 'Update Link'

            if(!this.isAlreadyLinkedEmmited){
              this.isAlreadyLinkedEmit.emit(true)
              this.isAlreadyLinked = true
              this.isAlreadyLinkedEmmited = true
            }

          }
          else data[i]['Link'] = false;
        }

        this.receivedCapitalAct = data;
        
        if(!this.isAlreadyLinkedEmmited){
          this.isAlreadyLinkedEmit.emit(false)
          this.isAlreadyLinked = false
          this.isAlreadyLinkedEmmited = true
        }
//        this.disableCreateNew = true;
      },
      error: error => {
        console.error('Failed to fetched looked up capital activities')
      }
    }))
  }

  ngOnChanges(changes: SimpleChanges){
    console.log(changes)
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
