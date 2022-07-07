import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import {
  GridOptions,
  Module,
  ColDef,
  ClientSideRowModelModule,
  SelectionChangedEvent
} from '@ag-grid-community/all-modules';
import { dateFormatter, amountFormatter, nonAmountNumberFormatter, formatDate } from 'src/app/shared/functions/formatter';

import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';

import {
  AdaptableOptions,
  AdaptableApi,
  ActionColumnButtonContext
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { AssociateInvestment, CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription } from 'rxjs';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule, MenuModule, RowGroupingModule, SetFilterModule } from '@ag-grid-enterprise/all-modules';
import * as moment from 'moment';

@Component({
  selector: 'app-link-investor-modal',
  templateUrl: './link-investor-modal.component.html',
  styleUrls: ['./link-investor-modal.component.scss']
})
export class LinkInvestorModalComponent implements OnInit {

  @Input() message: {
    actionType: string,
    capitalAct: CapitalActivityModel,
    investmentData: any[]
  };
  
  @Input() disableCreateNew: {
    disable: boolean
  }

  @Output() linkStatus = new EventEmitter<any>();
  @Output() isAlreadyLinkedEmit = new EventEmitter<boolean>();
  @Output() closePopUpEvent = new EventEmitter<string>();

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
    { field: 'isChecked', headerName: 'Link', type: 'abColDefBoolean', checkboxSelection: true}
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
    rowSelection: 'multiple',
    groupSelectsFiltered: true,
    groupSelectsChildren: true,
    suppressMenuHide: true,
    suppressClickEdit: true,
    singleClickEdit: false,
    rowGroupPanelShow: 'always',
    enableGroupEdit: false,
    components: {
      AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    },
    columnDefs: this.columnDefs,
    allowContextMenuWithControlKey:true,
    onSelectionChanged: this.onSelectionChanged.bind(this)

  };
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions = {
    primaryKey: 'capitalID',
    userName: this.msalService.getUserName(),
    adaptableId: 'Linking',
    adaptableStateKey: 'Linking Key',

    toolPanelOptions: {
      toolPanelOrder: ['columns', 'AdaptableToolPanel']
    },
    predefinedConfig: {
      Dashboard: {
        Revision: 1,
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        IsCollapsed: true,
        Tabs: [],
        IsHidden: true,
        DashboardTitle: ' '
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
        Revision: 7,
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
            // 'Link',
            'isChecked'

          ],
          PinnedColumnsMap: {
            isChecked: 'right'
          },
          ColumnWidthMap:{
            isChecked: 15
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

    if(!this.isSuccess)
      this.linkStatus.emit({event: 'Empty Close', capitalAct: null});
    
    this.closePopUpEvent.emit('Link')
  }

  action(type: string){
    if(type === 'Create New')
      this.associate(null, 'ADD');
    else if(type === 'Update Link')
      this.associate(this.checkedCapitalIDs, 'ASSOCIATE');
  }

  associate(capitalIDs?: number[], action?: string){

    let pIDcashDtStr: string = '';
    let amt: number = 0;

    this.message.investmentData.forEach(investment => {
      pIDcashDtStr += `${investment.positionID}|${formatDate(investment.cashDate, true)},`
      amt += Number(investment.amount)
    })
    
    if(pIDcashDtStr.length)
      pIDcashDtStr = pIDcashDtStr.slice(0, -1);
    
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

            this.linkStatus.emit({event: 'Linked Close', capitalAct: this.newCapitalAct, isNewCapital: this.isCreateNew});      
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

      this.message.capitalAct.linkedAmount = amt
      this.message.capitalAct.isLinked = true
      this.message.capitalAct.capitalID = null;
      this.message.capitalAct.createdOn = this.message.capitalAct.modifiedOn = new Date();
      this.message.capitalAct.createdBy = this.message.capitalAct.modifiedBy =this.msalService.getUserName();  

      this.message.capitalAct.source = 'ArkUI - link';
      this.message.capitalAct.sourceID = 4;

      this.isCreateNew = true
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

                this.linkStatus.emit({event: 'Linked Close', capitalAct: this.newCapitalAct, isNewCapital: this.isCreateNew});      

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

  selectCapitalIDs(){
    this.gridOptions?.api?.forEachLeafNode(node => {
      if(this.prevCheckedCapitalIDs.includes(node.data.capitalID)){
        node.setSelected(true)
      }
    })
  }

  onGridReady(params: any){
    this.selectCapitalIDs();
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
  }

  onSelectionChanged(params: SelectionChangedEvent){
    this.checkedCapitalIDs =  params.api.getSelectedNodes()?.map(node => node.data.capitalID)
    this.buttonText = (this.checkedCapitalIDs.length === 0) ? 'Create New' : 'Update Link';

    if(this.isAlreadyLinked){
      this.buttonText = 'Update Link'
    }
    else if(!this.isAlreadyLinked && this.checkedCapitalIDs.length === 0){
      this.buttonText = 'Create New'
    }
  }

  constructor(
    private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService
) { }

  clearFilter(): void{
    this.adapTableApi.filterApi.clearAllColumnFilter();
  }

  searchCapitalActivities(){
    
    this.checkedCapitalIDs = [];
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

    this.gridOptions?.api?.showLoadingOverlay();
    this.subscriptions.push(this.capitalActivityService.lookUpCapitalActivity(this.message.capitalAct).subscribe({
      next: data => {

        this.gridOptions?.api?.hideOverlay()
        this.receivedCapitalAct = data;
        this.isAlreadyLinkedEmmited = false;
        this.prevCheckedCapitalIDs = [];

        for(let i = 0; i < data.length; i+= 1){
          if((data[i].resultCategory.trim().toLowerCase() === 'linked')){
            this.disableCreateNew = {
              disable: false
            }
            this.buttonText = 'Update Link'
            this.prevCheckedCapitalIDs.push(Number(data[i].capitalID))

            if(!this.isAlreadyLinkedEmmited){
              this.isAlreadyLinkedEmit.emit(true)
              this.isAlreadyLinked = true
              this.isAlreadyLinkedEmmited = true
            }
          }
        }

        if(!this.isAlreadyLinkedEmmited){
          this.isAlreadyLinkedEmit.emit(false)
          this.isAlreadyLinked = false
          this.isAlreadyLinkedEmmited = true
        }
        this.selectCapitalIDs()
      },
      error: error => {
        console.error('Failed to fetched looked up capital activities')
      }
    }))
  }

  prevCheckedCapitalIDs: number[] = [];
  checkedCapitalIDs: number[] = [];
  
  ngOnInit(): void {
    this.isSuccess = this.isFailure = false;
    this.searchCapitalActivities();
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}