import { Component, OnInit } from '@angular/core';
import { Observable, Subscription} from 'rxjs';
import {
  AdaptableOptions,
  AdaptableApi,
  AdaptableButton,
} from '@adaptabletools/adaptable/types';
import {DataService} from '../../core/services/data.service'
import {BtnCellRenderer} from './btn-cell-renderer.component'
import {PortfolioHistoryService} from '../../core/services/PortfolioHistory/portfolio-history.service'
import {MatDialog } from '@angular/material/dialog';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { ColDef, GridOptions, ICellRendererParams, Module, ValueGetterParams } from '@ag-grid-community/core';
import { ActionColumnContext } from '@adaptabletools/adaptable-angular-aggrid';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { DetailedView, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { CheckboxEditorComponent } from 'src/app/shared/components/checkbox-editor/checkbox-editor.component';
import { AssetGIRModel } from 'src/app/shared/models/AssetGIRModel';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';
import { ConfirmPopupComponent } from 'src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component';

let adapTableApi: AdaptableApi;

@Component({
  selector: 'app-portfolio-history',
  templateUrl: './portfolio-history.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './portfolio-history.component.scss']
})


export class PortfolioHistoryComponent implements OnInit {

  rowData: Observable<any[]>;

  modules: Module[] = CommonConfig.AG_GRID_MODULES

  public gridOptions: GridOptions;
  public getRowNodeId;
  public userName: String;
  public dialogRef;
  public rowGroupPanelShow;
  public defaultColDef;
  public sideBar;
  public frameworkComponents;
  public autoGroupColumnDef;

  public subscriptions: Subscription[] = [];

  columnDefs: ColDef[] = [
  { headerName: "Position Id", field: 'positionId',hide: true, type:'abColDefNumber' },
  { headerName: "Asset Id", field: 'assetId',hide: true, type:'abColDefNumber'},
  { headerName: "Issuer Short Name ",field: 'issuerShortName',enableValue: true, type:'abColDefString' },
  { headerName: "Asset",field : 'asset',enableValue: true, type:'abColDefString' },
  { headerName: "Fund",field : 'fund', type:'abColDefString' },
  { headerName: "Fund Hedging", field: 'fundHedging', type:'abColDefString' },
  { headerName: "Fund Ccy",  field: 'fundCcy', type:'abColDefString' },
  { headerName: "As Of Date ", field: 'asOfDate',  cellClass: 'dateUK' ,hide: true, type:'abColDefDate' },
  { headerName: "Trade Date", field: 'tradeDate', rowGroup: true, hide: true, cellClass: 'dateUK' , type:'abColDefDate' },
  { headerName: "Type", field : 'typeDesc', type:'abColDefString'},
  { headerName: "Settle Date", field: 'settleDate',  cellClass: 'dateUK' , type:'abColDefDate' },
  { headerName: "Position Ccy", field: 'positionCcy', type:'abColDefString'},
  { headerName: "Amount",field : 'amount',enableValue: true , type:'abColDefNumber' },
  { headerName: "Par Amount", field: 'parAmount' , type:'abColDefNumber' },
  { headerName: "ParAmountLocal",field : 'parAmountLocal' , type:'abColDefNumber'},
  { headerName: "FundedParAmountLocal",field : 'fundedParAmountLocal' , type:'abColDefNumber'},
  { headerName: "CostAmountLocal",field : 'costAmountLocal', type:'abColDefNumber'},
  { headerName: "FundedCostAmountLocal",field : 'fundedCostAmountLocal', type:'abColDefNumber'},
  { headerName: "Edited Going In Rate",field: 'fxRateBaseEffective', type:'abColDefNumber'},
  { headerName: "Modified By",  field: 'modifiedBy', type:'abColDefString'},
  { headerName: "Modified On",  
    field: "modifiedOn", 
    type:'abColDefDate', 
    cellClass: 'dateUK',
    valueGetter:dateNullValueGetter
  },
  { headerName: "Reviewed By",  field: 'reviewedBy', type:'abColDefString'},
  {field : "reviewedOn", type:'abColDefDate', cellClass:'dateUk', valueGetter:(params:ValueGetterParams)=>{
    return dateNullValueGetter(params,'reviewedOn')
  }},
  {
    headerName:"",
    field: 'actionNew',
    cellRenderer: 'btnCellRenderer',
    pinned: 'right',
    width: 40,
    type:'abColDefObject'
  },

  { headerName: 'GIR Override', field: 'isOverride', type: 'abColDefString' },
  { headerName: 'GIR Source', field: 'girSource', type: 'abColDefString' },
  { headerName: 'GIR SourceID', field: 'girSourceID', type: 'abColDefNumber' },
  { headerName: 'GIR Date', field:'girDate',type:'abColDefDate'},
  { headerName: 'GIR Editable', field:'isEditable',type:'abColDefBoolean'},
  { field:'uniqueID', type:'abColDefNumber'},
  { field: 'pgh_FXRateBaseEffective', headerName: 'Effective Going In Rate', cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber'},
  { field: 'colour', type: 'abColDefString' },
  { field: 'reason', type: 'abColDefString',width:400 },
  { headerName: "isReviewed", 
    cellRenderer: 'agGridCheckboxRenderer',
      cellRendererParams:()=>{
        return{
          screen:'gir editor',
          onCheckboxcolChanged: this.onCheckboxChange,
          adaptableApi: this.adaptableApi
        }
      },
      field:'isReviewed', type:'abColDefBoolean',width:30
    },


];
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';
  assetGIR: any;
  updateMsg: string;
  adaptableApi: AdaptableApi;

  constructor(
    private portfolioHistoryService: PortfolioHistoryService,
    public dialog: MatDialog, 
    private dataSvc: DataService) {

    this.gridOptions = {

      enableRangeSelection: true,
      sideBar:  ['columns','adaptable','filters'],
      suppressMenuHide: true,
      singleClickEdit: true,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent' },
        ],
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey: true,
      context: {
        adaptableApi: adapTableApi,
        component: this

      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },

    };

    this.defaultColDef = {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      filter: true,
      tooltipField:'reason'
    };

    this.autoGroupColumnDef = {
      sort: 'desc',
      sortable: true,
    };

    //this.sideBar = ['columns','adaptable','filters'];
    this.frameworkComponents = {
      btnCellRenderer: BtnCellRenderer,
      agGridCheckboxRenderer: CheckboxEditorComponent,

    }
    this.rowGroupPanelShow = 'always';


  }

  onCheckboxChange(params: ICellRendererParams){
    const confirmdialogRef = params.context.component.dialog.open(ConfirmPopupComponent, {
      data:{
        headerText:`Are you sure you want to mark GIR as  ${params.value?'reviewed':'unreviewed'}?`,
      },
    })
    params.context.component.subscriptions.push(
      confirmdialogRef
      .afterClosed()
      .subscribe((val)=>{
        let updatedData = [{...params.data, ...{
          'isReviewed':!params.value //to reset the original checkbox value on cancel
        }}]
        params.api.applyTransaction({
          update: updatedData
        }) 
        if(val?.['action']==='Confirm'){
           if(params.data?.['isOverride']==='No' && !params.value){
              params.context.component.performDelete(params,true)
            }else{
              params.context.component.updateCheckboxSelection(params)
            }
        }
      })
      
      )

    
    
  }

  performDelete(params,markUnreviewed:boolean=false){

    let AssetGIR: AssetGIRModel = this.portfolioHistoryService.getModel(params.data)


      this.subscriptions.push(
        this.portfolioHistoryService.deleteAssetGIR(AssetGIR).subscribe({
          next: message => {

            this.updateMsg = markUnreviewed   ? "GIR review status updated" : "GIR successfully deleted";
            
            params.node.data.isOverride = 'No';
            params.node.data.isReviewed = params.value;


            params.node.data.girSource = null;
            params.node.data.girSourceID = null;
            params.node.data.fxRateBaseEffective = 0;
            params.node.data.modifiedBy = ' ';
            params.node.data.modifiedOn = null;
            params.node.data.reviewedBy = ' ';
            params.node.data.reviewedOn = null;
            params?.adaptableApi.gridApi.refreshRowNode(params.node)
            this.dataSvc.setWarningMsg(this.updateMsg,'dismiss','ark-theme-snackbar-success')

          },
          error: error => {

            this.updateMsg = markUnreviewed   ? "failed to updated the review status" : "GIR Delete Failed";
            this.dataSvc.setWarningMsg(this.updateMsg,'dismiss','ark-theme-snackbar-error')

            console.error("Error deleting row." + error);
          }
        }));
  
  }

  updateCheckboxSelection(params){
    
    this.assetGIR=new AssetGIRModel()

    this.assetGIR = params.context.component.portfolioHistoryService.getModel(params.data)
    
    this.assetGIR.isReviewed = params.value;           
    this.assetGIR.id = 0;
    this.assetGIR.fxRateOverride =  (params.data.isOverride==='Yes')?true:false;            // GIR is always overriden if update happens from GIREditor.

    this.assetGIR.ModifiedOn = params.data.modifiedOn??new Date(null)

    this.assetGIR.CreatedBy = params.data.createdBy
    this.assetGIR.CreatedOn = params.data.createdOn

    this.assetGIR.ReviewedOn =    new Date(); 


    params.context.component.subscriptions.push(params.context.component.portfolioHistoryService.putAssetGIR([this.assetGIR]).subscribe({
          next: data => {     
            
         
            this.updateMsg = "GIR review status updated";
            
            if(params.value){
              params.node.data['reviewedBy'] =  params.context.component.dataSvc.getCurrentUserInfo().name;
              params.node.data['reviewedOn'] =  new Date()

            }else{
              params.node.data['reviewedBy'] =  ' '
              params.node.data['reviewedOn'] =  null
              
            }
            params.node.data['colour'] = ' '
            params.node.data['isReviewed'] =  params.value

            params.context.component.gridOptions.api?.refreshCells({ force: true, rowNodes: [params.node], columns: ['reviewedBy','reviewedOn','isReviewed','modifiedOn'] })

            params?.adaptableApi.gridApi.refreshRowNode(params.node)
            this.dataSvc.setWarningMsg(this.updateMsg,'dismiss','ark-theme-snackbar-success')
          },
          error: error => {
              console.error('There was an error!', error);

              this.updateMsg = "failed to updated the review status";
              this.dataSvc.setWarningMsg(this.updateMsg,'dismiss','ark-theme-snackbar-error')

          }
    
      }));
  }




  ngOnInit(): void {
    this.rowData = this.portfolioHistoryService.getPortfolioHistory()
      .pipe(
        map((historyData: any[]) => historyData.map(row => {
          //row['isEdited'] = row['isEdited'] ? 'Yes' : 'No';
          row['isOverride'] = row['isOverride'] ? 'Yes' : 'No';
          return row;
        }))
      )
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  public adaptableOptions: AdaptableOptions = {
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    primaryKey: "uniqueID",
    userName: this.dataSvc.getCurrentUserName(),
    adaptableId: "Portfolio History",
    adaptableStateKey: `Portfolio State Key`,

    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,


    layoutOptions: {
      autoSaveLayouts: true,
    },

    teamSharingOptions: {
      enableTeamSharing: true,
      setSharedEntities: setSharedEntities.bind(this),
      getSharedEntities: getSharedEntities.bind(this)
    },

    actionOptions:{
      actionColumns:[
        {
          columnId: 'ActionDelete',
          friendlyName: 'Delete',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {

              let dialogRef = this.dialog.open(ConfirmPopupComponent,{
                data: {
                  headerText: context.rowNode.data?.isOverride === 'Yes'  ? 'Are you sure to delete this GIR?'  : 'There is no GIR to delete.',
                  displayConfirmButton:context.rowNode.data?.isOverride === 'Yes'
                }});
              this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
                if(result.action==='Confirm'){
                  this.performDelete({
                    data:context.rowNode.data,
                    adaptableApi:context.adaptableApi,
                    node:context.rowNode
                  })
                  this.gridOptions.api?.refreshCells({ force: true, rowNodes: [context.rowNode], columns: ['fxRateBaseEffective',  'modifiedOn', 'modifiedBy','reviewedBy','reviewedOn', 'isOverride', 'isReviewed','girSource', 'girSourceID'] })
                }
              }));
            },
            icon:{
              src: '../assets/img/trash.svg',
              style: {
                height: 25, width: 25
              }
            }
          }
        },
        {
          columnId: 'ActionInfo',
          friendlyName: 'Info',
          actionColumnButton: {
            onClick: (
              button: AdaptableButton<ActionColumnContext>,
              context: ActionColumnContext
            ) => {

              this.onOverrideCellClicked(context, this.dialog)

            },
            icon:{
              src: '../assets/img/info.svg',
              style: {
                height: 25, width: 25
              }
            }
          }
        }
      ]
    },
    generalOptions: {

      /* Adaptable calls this on grid init */
      /* Custom comparator for descending order */  
      customSortComparers: [
        {
          scope: {
            ColumnIds: ['tradeDate']
          },
          comparer: (valueA: Date, valueB: Date) => {
            if(valueA > valueB)
              return 1;
            else if(valueA < valueB)
              return -1;
            else
              return 0; 
          }
        }
      ]
    },

    userInterfaceOptions:{
      customDisplayFormatters: [
        CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountZeroFormat',['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal'])
        ],
    },

    predefinedConfig: {
      Dashboard: {
        Revision: 1,
        ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
        IsCollapsed: true,
        Tabs: [{
          Name:'Layout',
          Toolbars: ['Layout'],
        }],
        DashboardTitle: ' '
      },
      QuickSearch: {
        QuickSearchText: '',
        Style: {
          BackColor: '#ffff00',
          ForeColor: '#808080',
        },
      
      },
      Export: {
        CurrentReport: 'Portfolio History',
        CurrentDestination: 'Excel'
      },

      Layout:{
        Revision: 10,
        CurrentLayout: 'Basic Portfolio History',
        Layouts: [{
          Name: 'Basic Portfolio History',
          Columns: [
            'issuerShortName',
            'asset',
            'fund',
            'fundHedging',
            'settleDate',
            'typeDesc',
            'positionCcy',
            'fundCcy',
            'fxRateBaseEffective',
            'pgh_FXRateBaseEffective',
            'girSource',
            'girDate',
            'reason',
            'amount',
            'parAmount',
            'parAmountLocal',
            'fundedParAmountLocal',
            'costAmountLocal',
            'fundedCostAmountLocal',
            'assetId',
            'modifiedBy',
            'modifiedOn',
            'isOverride',
            'actionNew',
            'isReviewed',
            'ActionDelete',
            'ActionInfo'
          ],
          PinnedColumnsMap: {
            actionNew: 'right',
            ActionDelete: 'right',
            isReviewed:'right',
            ActionInfo:'right'
          },
          ColumnWidthMap:{
            ActionDelete: 50,
            ActionInfo:50,
          },
          ColumnFilters: [{
            ColumnId: 'typeDesc',
            Predicate: {
              PredicateId: 'Values',
              Inputs: ['Borrowing', 'Buy Trade']
            }
          }],        
          ColumnSorts: [
            {
              ColumnId: 'tradeDate',
              SortOrder: 'Desc',
            },
          ],
        }]
      },

      FormatColumn: {
        Revision: 30,
        FormatColumns: [
          {
            Scope: { ColumnIds:this.columnDefs.filter(def=>![            'actionNew',
            'isReviewed',
            'ActionDelete',
          'ActionInfo'].includes(def.field)).map(def=>def.field)},
            Style: {
              BackColor: '#FFDBA4', FontWeight: 'Bold'
            },
            Rule: {
              BooleanExpression: `[colour] = "Orange"`
            }
          },
          {
            Scope:  { ColumnIds:this.columnDefs.filter(def=>![            'actionNew',
            'isReviewed',
            'ActionDelete',
          'ActionInfo'].includes(def.field)).map(def=>def.field)},
            Style: {
              BackColor: '#FFB3B3', FontWeight: 'Bold'
            },
            Rule: {
              BooleanExpression: `[colour] = "Red"`
            }
          },
          {
            Scope:  { ColumnIds:this.columnDefs.filter(def=>![            'actionNew',
            'isReviewed',
            'ActionDelete',
          'ActionInfo'].includes(def.field)).map(def=>def.field)},
            Style: {
              BackColor: '#9BCB3C', FontWeight: 'Bold'
            },
            Rule: {
              BooleanExpression: `[colour] = "Green"`
            }
          },
          {
            Scope:  { ColumnIds:this.columnDefs.filter(def=>![            'actionNew',
            'isReviewed',
            'ActionDelete',
          'ActionInfo'].includes(def.field)).map(def=>def.field)},
            Style: {
              BackColor: '#C1EFFF', FontWeight: 'Bold'
            },
            Rule: {
              BooleanExpression: `[colour] = "Blue"`
            }
          },
          
          
          BLANK_DATETIME_FORMATTER_CONFIG(['asOfDate', 'tradeDate', 'settleDate', 'modifiedOn','reviewedOn','girDate']),
          DATE_FORMATTER_CONFIG_ddMMyyyy(['asOfDate', 'tradeDate', 'settleDate','girDate']),
          DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn','reviewedOn']),
          AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['fxRateBaseEffective', 'pgh_FXRateBaseEffective'], 8),
          AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal'] ),
          AMOUNT_FORMATTER_CONFIG_Zero(['amount','parAmount', 'parAmountLocal', 'fundedParAmountLocal', 'costAmountLocal', 'fundedCostAmountLocal','fxRateBaseEffective', 'pgh_FXRateBaseEffective'],2,['amountZeroFormat'])
        ]
      }
    }
  }

  onOverrideCellClicked(p: ActionColumnContext, dialog: MatDialog) {

      let m = <DetailedView>{};
      m.screen = 'GIR Editor';
      m.param1 = p.data?.['fundHedging']; // AsOfDate
      m.param2 =  p.data?.['fundCcy'];
      m.param3 = p.data?.['tradeDate'] //asofdate;
      m.param4 = String(p.data?.['assetId']);
      m.param5 = ' ';
      m.strParam1 = []

      dialog.open(DefaultDetailedViewPopupComponent, {
        data: {
          detailedViewRequest: m,
          noFilterSpace: true,
          grid: 'GIR Editor'
        },
        width: '90vw',
        height: '80vh'
      })
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adapTableApi = adaptableApi;
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi = adapTableApi
    // use AdaptableApi for runtime access to Adaptable
  };

}