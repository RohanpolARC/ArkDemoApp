import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { FeePresetsService } from 'src/app/core/services/FeePresets/fee-presets.service';
import { amountFormatter, dateFormatter, dateTimeFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { PresetsFormComponent } from './presets-form/presets-form.component';

@Component({
  selector: 'app-fee-presets',
  templateUrl: './fee-presets.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './fee-presets.component.scss']
})
export class FeePresetsComponent implements OnInit {

  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[] = []
  gridApi: GridApi
  adaptableApi: AdaptableApi
  rowData: Observable<any>
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  isWriteAccess: boolean = false;

  constructor(
    private feePresetsSvc: FeePresetsService,
    public dialog: MatDialog,
    private dataSvc: DataService,
    private accessSvc: AccessService
    ) { }

  ngOnInit(): void {

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Fee Presets' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    this.columnDefs = [
        { field: 'fundName' },
        { field: 'commitment', valueFormatter: amountFormatter },
        { field: 'currentCapitalCalled', valueFormatter: amountFormatter },
        { field: 'startDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
        { field: 'curveCurrency' },
        { field: 'curveName' },
        { field: 'entity' },
        
        { field: 'financingCommitment' },
        { field: 'financingEndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
        { field: 'financingMaxCapitalDeploymentPerMonth' },
        { field: 'financingStartDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
        
        { field: 'financingStage1Ratio' },
        { field: 'financingStage2Ratio' },
        { field: 'financingStage3Ratio' },
        { field: 'financingStage1EndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
        { field: 'financingStage2EndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },

        { field: 'holdback' },
        { field: 'holdingDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
        { field: 'maxCapitalDeploymentPerMonth' },
        { field: 'reinvestInterest' },

        { field: 'catchupRate' },
        { field: 'hasCatchup' },
        { field: 'hurdleCompoundingYears' },
        { field: 'hurdleRate' },
        { field: 'includeMgmtFee' },
        { field: 'includeOtherExpense' },
        { field: 'investmentDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
        { field: 'isMgmtFeesPaidAtEnd' },
        { field: 'isPerfFeesPaidAtEnd' },
        { field: 'isQuarterEndMgmtFees' },
        { field: 'mgmtFeesRate' },
        { field: 'otherExpenseRate' },
        { field: 'perfFeesRate' },
        { field: 'undrawnCommitFeesRate' },

        { field: 'overrideExpected' },
        { field: 'useFXHedgingCashflows' },
        { field: 'otherExpensesFixed' },

        // { field: 'isParallel' },
        { field: 'modifiedBy' },
        { field: 'modifiedOn', valueFormatter: dateTimeFormatter, cellClass: 'dateUK' },
        { field: 'createdBy' },
        { field: 'createdOn', valueFormatter: dateTimeFormatter },
    ].map(col => { 
      col['tooltipField'] = col.field;
      return col;  
    });

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      sideBar: true,
      onGridReady: this.onGridReady.bind(this),
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true  
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'fundName',
      adaptableId: 'Fee Presets ID',
      adaptableStateKey: 'Fee Presets Key',
      // toolPanelOptions: {
      //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
      // },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      actionOptions: {
        actionColumns: [
          {
            columnId: 'ActionEdit',
            friendlyName: 'Edit',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
              ) => {

                if(!this.isWriteAccess){
                  this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
                  return;
                }

                let rowData = context.rowNode.data;
                let fundName: string = rowData?.['fundName'];

                // To open dialog after successfull fetch
                this.fetchFundInvestmentData(fundName, true, {
                  fundFee: rowData
                });       
              },
              icon: {
                src: '../assets/img/edit.svg',
                style: {height: 25, width: 25}
              }
            }
          }
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 1,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 7,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [ ...this.columnDefs.map(colDef => colDef.field), 'ActionEdit'],
            PinnedColumnsMap: { 
              ActionEdit: 'right' 
            },
            ColumnWidthMap: {
              ActionEdit: 18
            }
          }]
        }
      }
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.fetchFundFeeData();
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }

  fetchFundInvestmentData(fundName: string, 
    openDialogAfter: boolean = false, 
    ref: {
      fundFee: any,
      // fundInvestment: any
    }){
    this.subscriptions.push(this.feePresetsSvc.getFundInvestmentData(fundName).subscribe({
      next: (fundInvestment: any[]) => {
        if(openDialogAfter){
          this.openDialog('EDIT', ref.fundFee, fundInvestment[0])       // For a fundName, only one investment data should come.
        }
      },
      error: (error) => {
        console.error(`Failed to fetch investment data for ${fundName}`)

      }
    }))
  }

  fetchFundFeeData(){
    this.rowData = this.feePresetsSvc.getFundFeeData()
      .pipe(
        map((feeData: any[]) => feeData.map(row => {
          row['hasCatchup'] = row['hasCatchup'] ? 'Yes' : 'No';
          row['includeMgmtFee'] = row['includeMgmtFee'] ? 'Yes' : 'No';
          row['includeOtherExpense'] = row['includeOtherExpense'] ? 'Yes' : 'No';
          row['isMgmtFeesPaidAtEnd'] = row['isMgmtFeesPaidAtEnd'] ? 'Yes' : 'No';
          row['isPerfFeesPaidAtEnd'] = row['isPerfFeesPaidAtEnd'] ? 'Yes' : 'No';
          row['isQuarterEndMgmtFees'] = row['isQuarterEndMgmtFees'] ? 'Yes' : 'No';
          row['overrideExpected'] = row['overrideExpected'] ? 'Yes' : 'No';
          row['reinvestInterest'] = row['reinvestInterest'] ? 'Yes' : 'No';
          row['useFXHedgingCashflows'] = row['useFXHedgingCashflows'] ? 'Yes' : 'No';
          
          let dateFields: string[] = ['financingEndDate', 'financingStartDate', 'holdingDate', 'investmentDate', 'startDate', 'financingStage1EndDate', 'financingStage2EndDate', 'modifiedOn', 'createdOn'];

          dateFields.forEach((col) => {
            // row[col] = formatDate(row[col]);
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(formatDate(row[col])))
              row[col] = null
          })

          return row;
        }))
      );
  }

  openDialog(action: 'ADD' | 'EDIT' = 'ADD', fundFee = [], fundInvestment = []) { 
    
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    const dialogRef = this.dialog.open(PresetsFormComponent, {
      data: { 
        action: action,
        fundFee: fundFee,
        fundInvestment: fundInvestment,
        adaptableApi: this.adaptableApi,
      },
      maxHeight: '95vh',
      minHeight: '60vh'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe())
  }
}