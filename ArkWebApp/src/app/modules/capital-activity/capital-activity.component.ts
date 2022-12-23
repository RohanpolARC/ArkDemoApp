import { Component, OnInit, ViewChild } from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { AddCapitalModalComponent } from './add-capital-modal/add-capital-modal.component';

import {
  GridOptions,
  Module,
  ColDef,
  CellClickedEvent
} from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
  ActionColumnContext,
} from '@adaptabletools/adaptable/types';
import { CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';

import { Subscription } from 'rxjs';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { dateFormatter, dateTimeFormatter, amountFormatter, nullOrZeroFormatter, formatDate, nonAmountNumberFormatter, BLANK_DATETIME_FORMATTER_CONFIG, DATE_FORMATTER_CONFIG_ddMMyyyy, AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, AMOUNT_FORMATTER_CONFIG_Zero, CUSTOM_DISPLAY_FORMATTERS_CONFIG } from 'src/app/shared/functions/formatter';

import { getNodes, validateLinkSelect }from './utilities/functions';
import { UpdateConfirmComponent } from './update-confirm/update-confirm.component';
import { DetailedViewComponent } from '../../shared/components/detailed-view/detailed-view.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { DataService } from 'src/app/core/services/data.service';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { CommonConfig } from 'src/app/configs/common-config';

@Component({
  selector: 'app-capital-activity',
  templateUrl: './capital-activity.component.html',
  styleUrls: ['./capital-activity.component.scss']
})
export class CapitalActivityComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  subscriptions: Subscription[] = [];
  rowData: CapitalActivityModel[];
  rowDataInvstmnt: CapitalInvestment[];
  rowGroupPanelShow:string = 'always';

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES

  onTotalBaseClick(event: CellClickedEvent){
    if(event.node.group){
 
      let leafNodes: any[] = event.node.allLeafChildren.map(row => row?.['data']);      
      let pIDcashDtTypeStr: string = '';
      leafNodes.forEach(investment => {
        pIDcashDtTypeStr += `${investment.positionID}|${formatDate(investment.cashDate, true)}:${investment.type},`
      })
      
      if(pIDcashDtTypeStr.length)
        pIDcashDtTypeStr = pIDcashDtTypeStr.slice(0, -1);
  
      let model: DetailedView = <DetailedView> {};
      model.screen = 'Capital Activity';
      model.param1 = pIDcashDtTypeStr;
      model.param2 = model.param3 = model.param4 = model.param5 = '';

      const dialogRef = this.dialog.open(DetailedViewComponent, {
        data: {
          detailedViewRequest: model,
          failureMsg: leafNodes.length > 50 ? `Please select group having lesser child rows (Max 50)` : null
        },
        width: '90vw',
        height: '80vh'
      })

    }
  }

  columnDefsInvstmnt: ColDef[] = [
    { field: 'unqiueID', tooltipField: 'unqiueID', type: 'abColDefNumber'},
    { field: 'positionID', tooltipField: 'positionID', headerName: 'Position ID', type: 'abColDefNumber'},
    { field: 'cashDate', tooltipField: 'cashDate', headerName: 'Cash Date', type: 'abColDefDate', cellClass: 'dateUK'},
    { field: 'fund', tooltipField: 'fund', headerName: 'Fund', type: 'abColDefString'},
    { field: 'fundHedging', tooltipField: 'fundHedging', headerName: 'Fund Hedging', type: 'abColDefString'},
    { field: 'portfolio', tooltipField: 'portfolio', headerName: 'Portfolio', type: 'abColDefString'},
    { field: 'issuerShortName', tooltipField: 'issuerShortName', headerName: 'Issuer', type: 'abColDefString'},
    { field: 'issuerID', tooltipField: 'issuerID', headerName: 'Issuer ID', type: 'abColDefNumber'},
    { field: 'asset', tooltipField: 'asset', headerName: 'Asset', type: 'abColDefString'},
    { field: 'assetID', tooltipField: 'assetID', headerName: 'AssetID', type: 'abColDefNumber'},
    { field: 'fundCcy', tooltipField: 'fundCcy', headerName: 'Fund Ccy', type: 'abColDefString'},
    { field: 'positionCcy', tooltipField: 'positionCcy', headerName: 'Position Ccy', type: 'abColDefString'},
    { field: 'amount', tooltipField: 'amount', headerName: 'Total', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
    { field: 'linkedAmount', tooltipField: 'linkedAmount', headerName: 'Linked Amount Base', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
    { field: 'totalBase', tooltipValueGetter: (params) => { return "Detailed View" }, headerName: 'Total Base', cellClass: 'ag-right-aligned-cell', onCellClicked: this.onTotalBaseClick.bind(this), 
      cellStyle: (params) => {
        if(params.node.group)
          return { color: '#0590ca' };
        return null;
      }, type: 'abColDefNumber'},
    { field: 'totalEur', headerName: 'Total Eur', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
    { field: 'type', type: 'abColDefString'}
  ]

  columnDefs: ColDef[] = [
    { field: 'capitalID', tooltipField: 'capitalID', headerName: 'Capital ID', type: 'abColDefNumber'},
    { field: 'callDate', tooltipField: 'callDate', headerName: 'Call Date', type: 'abColDefDate', cellClass: 'dateUK' },
    { field: 'valueDate', tooltipField: 'valueDate', headerName: 'Value Date', type: 'abColDefDate', cellClass: 'dateUK'},
    { field: 'capitalType', tooltipField: 'capitalType', headerName: 'Capital Type', type:'abColDefString'},
    { field: 'capitalSubType', tooltipField: 'capitalSubType', headerName: 'Capital Subtype', type:'abColDefString'},
    { field: 'fundHedging', tooltipField: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
    { field: 'fundCcy', tooltipField: 'fundCcy', headerName: 'Fund Ccy', type:'abColDefString'},
    { field: 'posCcy', tooltipField: 'posCcy', headerName: 'Position Ccy', type: 'abColDefString'},
    { field: 'fxRate', tooltipField: 'fxRate', headerName: 'FXRate', valueFormatter: nonAmountNumberFormatter, type: 'abColDefNumber',cellClass: 'ag-right-aligned-cell'},
    { field: 'fxRateOverride', tooltipField: 'fxRateOverride', headerName: 'FXRate Override', type: 'abColDefBoolean' },
    { field: 'fxRateSource', tooltipField: 'fxRateSource', type: 'abColDefString' },
    { field: 'totalAmount', tooltipField: 'totalAmount', headerName: 'Total Amount', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
    { field: 'wsoIssuerID', tooltipField: 'wsoIssuerID', headerName: 'WSO Issuer ID', valueFormatter: nullOrZeroFormatter, type: 'abColDefNumber'},
    { field: 'issuerShortName', tooltipField: 'issuerShortName', headerName: 'Issuer Short Name', type:'abColDefString'},
    { field: 'wsoAssetID', tooltipField: 'wsoAssetID', headerName: 'WSO Asset ID', valueFormatter: nullOrZeroFormatter, type: 'abColDefNumber'},
    { field: 'asset', tooltipField: 'asset', headerName: 'Asset', type:'abColDefString'},
    { field: 'narrative', tooltipField: 'narrative', headerName: 'Narrative', type:'abColDefString'},
    { field: 'source', tooltipField: 'source', headerName: 'Source', type:'abColDefString'},
    { field: 'sourceID', tooltipField: 'sourceID', headerName: 'Source ID', type:'abColDefNumber', valueFormatter: nullOrZeroFormatter},
    { field: 'isLinked', tooltipField: 'isLinked', headerName: 'Is Linked', type:'abColDefBoolean'},
    { field: 'linkedAmount', tooltipField: 'linkedAmount', headerName: 'Linked Total Base', type:'abColDefNumber'},
    { field: 'createdOn', tooltipField: 'createdOn', headerName: 'Created On', type:'abColDefDate', cellClass: 'dateUK'},
    { field: 'createdBy', tooltipField: 'createdBy', headerName: 'Created By', type:'abColDefString'},
    { field: 'modifiedOn', tooltipField: 'modifiedOn', headerName: 'Modified On', type:'abColDefDate', cellClass: 'dateUK'},
    { field: 'modifiedBy', tooltipField: 'modifiedBy', headerName: 'Modified By', type:'abColDefString'},
  ]

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
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions;

  gridOptionsInvstmnt: GridOptions;
  adapTableApiInvstmnt: AdaptableApi;
  adaptableOptionsInvstmnt: AdaptableOptions;

  constructor(public dialog:MatDialog, 
    private capitalActivityService: CapitalActivityService,
    private dataSvc: DataService) { 
  }


  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[] = [];
  refData = [];

  invstmntPanelOpenState = false;
  investorPanelOpenState = false;

  fetchInvestmentData(): void{
    this.gridOptionsInvstmnt.api?.showLoadingOverlay();
    this.subscriptions.push(this.capitalActivityService.getCapitalInvestment().subscribe({
      next: (data: any[]) => {
        this.gridOptionsInvstmnt.api?.hideOverlay();
        this.rowDataInvstmnt = data;
        this.adapTableApiInvstmnt.gridApi.loadGridData(this.rowDataInvstmnt);
      },
      error: error => {
        this.rowDataInvstmnt = [];
        this.gridOptionsInvstmnt.api?.hideOverlay();
        console.error("Capital Investment Data fetch failed" + error);
      }
    }))
  }

  fetchCapitalActivityData(): void{
    this.gridOptions?.api?.showLoadingOverlay();
    this.subscriptions.push(this.capitalActivityService.getCapitalActivity().subscribe({
      next: data => {
        this.gridOptions?.api?.hideOverlay();
        this.rowData = data;
        this.adapTableApi.gridApi.loadGridData(this.rowData);
      },
      error: error => {
        this.rowData = [];
        this.gridOptions?.api?.hideOverlay();
        console.error("Capital Activity Data fetch failed");
      }
    }));
  }

  fetchCapitalRefData(): void{
    this.subscriptions.push(this.capitalActivityService.getCapitalRefData().subscribe({
      next: data => {
        data.capitalType.forEach(x => { this.capitalTypeOptions.push(x) });
        data.capitalSubType.forEach(x => { this.capitalSubTypeOptions.push(x) });

        this.refData = data.portfolio_Info;
      },
      error: error => {
        console.error("Couldn't fetch refData. Form dropdown fields not available");
      }
    }));
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
      allowContextMenuWithControlKey:false,
      suppressScrollOnNewData: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
    }

    this.gridOptionsInvstmnt = JSON.parse(JSON.stringify(this.gridOptions));
    this.gridOptionsInvstmnt.columnDefs = this.columnDefsInvstmnt;

    // this.gridOptionsInvstmnt.components = {
    //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    // },

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'capitalID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Capital Activity - Investor Cashflows',
      adaptableStateKey: `Capital Activity Key`,

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
      },
  
      // toolPanelOptions: {
      //   toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      // },
  
      actionOptions: {
        actionColumns: [
          {
            columnId: 'ActionEdit',
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
              ) => {
  
                let rowData =  context.rowNode?.data;
                let investments = [];
                this.capitalActivityService.getCapitalInvestment(rowData.capitalID).subscribe({
                  next: data => {
                    investments = data;
                    this.openDialog(rowData, 'EDIT', investments);
                  },
                  error: error => {
                    console.error("Couldn't fetch investments for this capitalID");
                  }
                })
              },
              icon: {
                src: '../assets/img/edit.svg',
                style: {
                  height: 25, width: 25
                }
              },
            },
          }
        ]
      },

      userInterfaceOptions:{
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat',['totalAmount','linkedAmount'])
          ],
      },
  
      predefinedConfig: {
        Dashboard: {
          Revision: 3,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 5,
          CurrentLayout: 'Basic Capital Activity',
          Layouts: [{
            Name: 'Basic Capital Activity',
            Columns: [
              'callDate',
              'valueDate',
              'capitalType',
              'capitalSubType',
              'fundHedging',
              'issuerShortName',
              'asset',
              'fundCcy',
              'posCcy',
              'totalAmount',
              'localAmount',
              'fxRate',
              'wsoAssetID',
              'narrative',
              'source',
              'isLinked',
              'linkedAmount',
              'capitalID',
              'ActionEdit',
            ],
            RowGroupedColumns: [],
            ColumnWidthMap:{
              ActionEdit: 50,
            },
            PinnedColumnsMap: {
              ActionEdit: 'right',
            },
  
          }]
        },
        FormatColumn:{
          Revision:5,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['callDate','valueDate','createdOn','modifiedOn']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['callDate','valueDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['createdOn','modifiedOn']),

            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['totalAmount','linkedAmount'],2,['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_Zero(['totalAmount','linkedAmount'],2,['amountZeroFormat']),

          ]
        }
      }
    }

    this.adaptableOptionsInvstmnt = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'uniqueID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Capital Activity - Investment Cashflows',
      adaptableStateKey: `Investment CashFlow Key`,
      
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,


      // toolPanelOptions: {
      //   toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      // },

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
      },
  
      actionOptions: {
        actionColumns: [
          {
            columnId: 'ActionLink',
            includeGroupedRows: true,
            actionColumnButton: {
              onClick: (
                button: AdaptableButton<ActionColumnContext>,
                context: ActionColumnContext
              ) => {

                let error: string = validateLinkSelect(context);
                if(error !== null){
                  const errorDialog = this.dialog.open(UpdateConfirmComponent, {
                    data: {
                      actionType: 'ERROR-MSG',
                      errorMsg: error
                    }
                  })
                  return;
                }

                let linkData = getNodes(context.rowNode);
                this.openDialog(linkData, 'LINK-ADD');
              },
              icon: {
                src: '../assets/img/sync_alt_black_24dp.svg',
                style: {
                  height: 25, width: 25
                }
              },
            },
          }
        ]
      },
  
      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat',['amount','linkedAmount','totalBase','totalEur'])

        ]
      },

      predefinedConfig: {
        Dashboard: {
          Revision: 3,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 11,
          Layouts:[{
            Name: 'Basic Investment Cashflow',
            Columns: [
              'positionID',
              'cashDate',
              'type',
              'fund',
              'fundHedging',
              'portfolio',
              'issuerShortName',
              'asset',
              'fundCcy',
              'positionCcy',
              'amount',
              'linkedAmount',
              'totalBase',
              'totalEur',
              'ActionLink'
            ],
            ColumnWidthMap:{
              ActionLink: 50,
            },
            RowGroupedColumns: ['fundHedging', 'cashDate', 'issuerShortName', 'positionCcy', 'type'],
            PinnedColumnsMap: {
              'ActionLink': 'right'
            },
            AggregationColumns: {
              totalBase: 'sum',
              totalEur: 'sum',
              linkedAmount: 'sum',
            }
          }]
        },
        FormatColumn:{
          Revision:6,
          FormatColumns:[
            DATE_FORMATTER_CONFIG_ddMMyyyy(['cashDate']),

            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['amount','linkedAmount','totalBase','totalEur'],2,['amountZeroFormat']),
            AMOUNT_FORMATTER_CONFIG_Zero(['amount','linkedAmount','totalBase','totalEur'],2,['amountZeroFormat'])
          ]
        }  
      }
    }

    this.fetchCapitalActivityData();
    this.fetchInvestmentData();
    this.fetchCapitalRefData();
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

  openBulkUploadDialog(): void {
    const dialogRef = this.dialog.open(BulkUploadComponent, {
      data: {
        adaptableApiInvestor: this.adapTableApi,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        refData: this.refData

      },
      width: '90vw',
      maxWidth: '90vw',
      height: '80vh',
    })
    this.subscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      // Bulk Upload Dialog Closed.
      if(result?.isSuccess){
        this.fetchCapitalActivityData();
      }
    }))
  }

  openDialog(data? , actionType = 'ADD', gridData = null):void{

    const dialogRef = this.dialog.open(AddCapitalModalComponent, {
      data: {
        rowData : data,
        adapTableApi: this.adapTableApi,
        adapTableApiInvstmnt: this.adapTableApiInvstmnt,
        actionType: actionType,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        refData: this.refData,
        gridData: gridData
      },
      width: '90vw',
      maxWidth: '2000px',
      maxHeight: '99vh'
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      if(actionType === 'LINK-ADD' && result.event === 'Close with Success'){
        this.fetchCapitalActivityData();
        this.fetchInvestmentData();
      }
    }))
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel();
    // use AdaptableApi for runtime access to Adaptable
  };

  onAdaptableInvstmntReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApiInvstmnt = adaptableApi;
    this.adapTableApiInvstmnt.toolPanelApi.closeAdapTableToolPanel();
    // use AdaptableApi for runtime access to Adaptable
  };

}