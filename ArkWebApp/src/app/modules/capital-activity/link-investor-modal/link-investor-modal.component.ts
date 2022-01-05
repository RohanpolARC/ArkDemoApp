import { Component, OnInit, Inject } from '@angular/core';
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
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-link-investor-modal',
  templateUrl: './link-investor-modal.component.html',
  styleUrls: ['./link-investor-modal.component.scss']
})
export class LinkInvestorModalComponent implements OnInit {

  subscriptions: Subscription[] = []
  receivedCapitalAct: any[] = null;
  receivedCapitalID: number = null;

  updateMsg: string = null;
  isSuccess: boolean = false;
  isFailure: boolean = false;

  isCreateNew: boolean = false;

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
    { field: 'resultCategory', headerName: 'ResultCategory', type:'abColDefString'},
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
    singleClickEdit: true,
    statusBar: {
      statusPanels: [
        { statusPanel: 'agTotalRowCountComponent', align: 'left' },
        { statusPanel: 'agFilteredRowCountComponent' },
      ],
    },
    components: {
      AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    },
    columnDefs: this.columnDefs,
    allowContextMenuWithControlKey:true

  };
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions = {
    primaryKey: 'capitalID',
    userName: 'TestUser',
    userInterfaceOptions: {

      styleClassNames: ['associate-button'],
      actionColumns:[{
        columnId: 'ActionAssociate',
        friendlyName: 'Associate',
        IsReadOnly: true,
        
        actionColumnButton: {
          hidden: (
            button: AdaptableButton<ActionColumnButtonContext>,
            context: ActionColumnButtonContext
          ) => {
            return this.receivedCapitalID !== null;
          },
          buttonStyle: (
            button: AdaptableButton<ActionColumnButtonContext>,
            context: ActionColumnButtonContext
          ) => {
              if(this.buttonText === 'Create New'){
                return {
                  tone: 'neutral'
                }
              }
              else if(this.rowContext?.rowNode?.data?.capitalID === context.rowNode.data.capitalID){
                return {
                  /**
                   * styleClassName defined on top. This CSS class is defined in styles.scss.
                   * 
                   * To change SVG color: 
                   *  Reference: 
                   *    https://stackoverflow.com/questions/22252472/how-to-change-the-color-of-an-svg-element?rq=1
                   *  
                   *    Use this codepen application to generate filter element for the respective color (in HEX)
                   *  https://codepen.io/sosuke/pen/Pjoqqp
                   */
                  className: 'associate-button',
                  tone: 'none'
                }
              }
              return {};
          },
          onClick: (
            button: AdaptableButton<ActionColumnButtonContext>,
            context: ActionColumnButtonContext
          ) => {

            if(context.rowNode.data.capitalID === this.rowContext?.rowNode?.data?.capitalID)
            {
              // If clicked on the same row, then change button text and hence action;
              this.buttonText = 'Create New';
              this.rowContext = null;
            }
            else{
              this.buttonText = 'Link';
              this.rowContext = context;  
            }

            // Validation: No association once already associated in one lifecycle
            
            if(this.receivedCapitalID)
              return;
            
              /**
               *  Loading the grid again as buttonStyles doesn't get updated after the grid has loaded
               *  jumpToCell jumps to the current cell as loading grid changes the selected row position.
               */
            this.adapTableApi.gridApi.loadGridData(this.receivedCapitalAct);
            this.adapTableApi.gridApi.expandRowGroupsForValues([context.rowNode.data.resultCategory]);
            this.adapTableApi.gridApi.jumpToCell(context.primaryKeyValue, 'ActionAssociate');
            
          },
          icon:{
            src:
            '../assets/img/check_black_24dp.svg',
            style:{
              height: 25, width: 25
            },
          }
        },

      }]
    },
    predefinedConfig: {
      Dashboard: {
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        IsCollapsed: true,
        Tabs: [],
        IsHidden: true
      },
      Layout:{
        Layouts:[{
          Name: 'Associate Grid layout',
          Columns:[
            'capitalID',
            'callDate',
            'valueDate',
            'capitalType',
            'capitalSubType',
            'fundHedging',
            'fundCcy',
            'totalAmount',
            'issuerShortName',
            'asset',
            'narrative',
            'source',
            'ActionAssociate',


          ],
          PinnedColumnsMap: {
            ActionAssociate: 'right'
          },
          ColumnWidthMap:{
            ActionAssociate: 30,
          },
          RowGroupedColumns: ['resultCategory']
        }]
      }
    }
  };

  action(type: string){
    if(type === 'Create New')
      this.associate(null, 'ADD');
    else if(type === 'Link')
      this.associate(this.rowContext, 'ASSOCIATE');
  }
  associate(context?: ActionColumnButtonContext, action?: string){

    let models: CapitalInvestment[] = [];

    for(let i = 0; i < this.data.investmentData.length; i+= 1){
      let investment = <CapitalInvestment> this.data.investmentData[i];

      if(action === 'ASSOCIATE'){
        let capitalID = context.rowNode.data.capitalID;
        investment.capitalID = capitalID;
      }
      else investment.capitalID = null;

      investment.createdBy = investment.modifiedBy = this.msalService.getUserName()
      investment.createdOn = investment.modifiedOn = new Date();

      if(this.data.capitalAct.totalAmount < 0){
        // Investment's GIR to be inserted into AssetGIR table.
        investment.valueDate = this.data.capitalAct.valueDate;  
        investment.fxRate = this.data.capitalAct.fxRate;  
      }
      else 
        investment.valueDate = investment.fxRate = null;

      models.push(investment);
    }

    if(action === 'ASSOCIATE'){

      this.subscriptions.push(this.capitalActivityService.associateCapitalInvestments(models).subscribe({
        next: received => {
          this.receivedCapitalID = received.data;

          this.isSuccess = true;
          this.isFailure = false;
          this.updateMsg = `Successfully associated investment to capital ID ${received.data}`;
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
      this.subscriptions.push(this.capitalActivityService.putCapitalActivity(this.data.capitalAct).subscribe({
        next: received => {

          // Step 2
          for(let i =0; i < models.length; i+= 1)
            models[i].capitalID = received.data;
            
          this.subscriptions.push(this.capitalActivityService.associateCapitalInvestments(models).subscribe({
            next: received => {
              console.log(`Successfully associated investments to capital ID ${received.data}`);
              this.receivedCapitalID = received.data;
              this.isCreateNew = true;

              this.isSuccess = true;
              this.isFailure = false;
              this.updateMsg = `Successfully associated investment to capital ID ${received.data}`;
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
  }

  constructor(public dialogRef: MatDialogRef<LinkInvestorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService,
) { }

  ngOnInit(): void {

    this.isSuccess = this.isFailure = false;

    this.subscriptions.push(this.capitalActivityService.lookUpCapitalActivity(this.data.capitalAct).subscribe({
      next: data => {
        this.receivedCapitalAct = data;
      },
      error: error => {
        console.error('Failed to fetched looked up capital activities')
      }
    }))
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  closeDialog(): void{
    if(this.receivedCapitalID){
      this.data.capitalAct.capitalID = this.receivedCapitalID;
      this.dialogRef.close({source: 'Linked Close', capitalAct: this.data.capitalAct, newCapital: this.isCreateNew});
    }
    else
      this.dialogRef.close({source: 'Empty Close'})
  }

}
