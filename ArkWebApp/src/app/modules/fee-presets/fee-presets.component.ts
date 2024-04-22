import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { FeePresetsService } from 'src/app/core/services/FeePresets/fee-presets.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER,DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy, formatDate } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { PresetsFormComponent } from './presets-form/presets-form.component';

export enum PresetGridAction {
  ADD, EDIT, CLONE
}

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
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

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

    this.columnDefs = this.feePresetsSvc.columnDefs;

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
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
      rowHeight: 30,
      headerHeight: 30,
      groupHeaderHeight: 30,
      pivotHeaderHeight: 30,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'presetID',
      adaptableId: 'Fee Presets ID',
      adaptableStateKey: 'Fee Presets Key',
      // toolPanelOptions: {
      //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
      // },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      actionColumnOptions: {
        actionColumns: [
          {
            columnId: 'Action',
            friendlyName: ' ',
            actionColumnButton: [
              {
                onClick: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {

                  if(!this.isWriteAccess){
                    this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
                    return;
                  }

                  let rowData = context.rowNode.data;
                  let presetName: string = rowData?.['presetName'];

                  // To open dialog after successfull fetch
                  this.fetchFundInvestmentData(presetName, true, PresetGridAction.EDIT, {
                    fundFee: rowData,
                    presetID: rowData?.['presetID']
                  });       
                },
                icon: {
                  src: '../assets/img/edit.svg',
                  style: {height: 25, width: 25}
                },
                tooltip: 'Edit'
              },
              {
                onClick: ( button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext ) => {
                  if(!this.isWriteAccess){
                    this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning');
                    return;
                  }

                  let rowData = JSON.parse(JSON.stringify(context.rowNode.data));
                  let presetName: string = rowData?.['presetName'];   // This presetName is used to fetch the investment data from the DB.
                  rowData['presetName'] = null;             // For cloned rows, presetName is set as empty

                  // To open dialog after successfull fetch
                  this.fetchFundInvestmentData(presetName, true, PresetGridAction.CLONE, {
                    fundFee: rowData,
                    presetID: null
                  })
                },
                icon: {
                  src: '../assets/img/copy.png',
                  style: { height: 25, width: 25 }
                },
                tooltip: 'Clone'
              }
            ]
          }
        ]
      },
      formatColumnOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.feePresetsSvc.AMOUNT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nonAmountNumberFormatter2Dec',this.feePresetsSvc.NON_AMOUNT_2DEC_COLUMNS)
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 2,
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
          Revision: 11,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [ ...this.columnDefs.map(colDef => colDef.field), 'Action'],
            PinnedColumnsMap: { 
              Action: 'right' 
            },
            ColumnWidthMap: {
              Action: 15
            }
          }]
        },
        FormatColumn:{
          Revision:14,
          FormatColumns:[



            BLANK_DATETIME_FORMATTER_CONFIG([...this.feePresetsSvc.DATETIME_COLUMNS,...this.feePresetsSvc.DATE_COLUMNS]),
            DATE_FORMATTER_CONFIG_ddMMyyyy(this.feePresetsSvc.DATE_COLUMNS),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(this.feePresetsSvc.DATETIME_COLUMNS),
            CUSTOM_FORMATTER(this.feePresetsSvc.AMOUNT_COLUMNS,['amountFormatter']),
            CUSTOM_FORMATTER(this.feePresetsSvc.NON_AMOUNT_2DEC_COLUMNS,['nonAmountNumberFormatter2Dec'])

          ]
        },
        StatusBar: {
          Revision: 2,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['Filter']
            },
            {
              Key: 'Right Panel',
              StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
            },
          ],
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
    this.adaptableApi.columnApi.autosizeAllColumns()

  }

  fetchFundInvestmentData(presetName: string, 
    openDialogAfter: boolean = false, 
    action: PresetGridAction,
    ref: {
      fundFee: any,
      presetID: number
      // fundInvestment: any
    }){
    this.subscriptions.push(this.feePresetsSvc.getFundInvestmentData(presetName).subscribe({
      next: (fundInvestment: any[]) => {
        if(openDialogAfter){
          this.openDialog(action, ref.presetID, ref.fundFee, fundInvestment[0])       // For a presetName, only one investment datarow should come.
        }
      },
      error: (error) => {
        console.error(`Failed to fetch investment data for ${presetName}`)

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
          row['useGIRAdjustment'] = row['useGIRAdjustment'] ? 'Yes' : 'No';
          row['isPerfFeeAfterMgmtFee'] = row['isPerfFeeAfterMgmtFee'] ? 'Yes' : 'No';
          
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

  openDialog(action: PresetGridAction = PresetGridAction.ADD, presetID: number = -1, fundFee = [], fundInvestment = []) { 
    
    if(!this.isWriteAccess){
      this.dataSvc.setWarningMsg('No Access', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    const dialogRef = this.dialog.open(PresetsFormComponent, {
      data: { 
        action: action,
        presetID: presetID,
        fundFee: fundFee,
        fundInvestment: fundInvestment,
        adaptableApi: this.adaptableApi,
      },
      maxHeight: '95vh',
      minHeight: '60vh'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe())
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }
}