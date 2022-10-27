import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { ContractHistoryService } from 'src/app/core/services/ContractHistory/contract-history.service';
import { DataService } from 'src/app/core/services/data.service';
import { createColumnDefs, GENERAL_FORMATTING_EXCEPTIONS, parseFetchedData, saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-contract-history',
  templateUrl: './contract-history.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./contract-history.component.scss']
})

export class ContractHistoryComponent implements OnInit {

  subscriptions: Subscription[] = []
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  
  columnDefs: ColDef[] = []
  gridApi: GridApi;
  gridColumnApi: any;
  adaptableApi: AdaptableApi;
  funds
  isLatest

  rowData = []

  preSelectedColumns: string[] = []
  gridOptions: GridOptions = {
    enableRangeSelection: true,
    columnDefs: this.columnDefs,
    tooltipShowDelay: 0,
    // components: {
    //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    // },
    onGridReady: this.onGridReady.bind(this),
    defaultColDef: {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: true
    },
    rowData: this.rowData,
    sideBar: true,
    excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
  }

  adaptableOptions: AdaptableOptions = {
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    primaryKey: '',
    userName: this.dataSvc.getCurrentUserName(),
    autogeneratePrimaryKey: true,
    adaptableId: 'Contracts history ID',
    adaptableStateKey: 'Contracts history state key',

    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

    
    // toolPanelOptions: {
    //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
    // },

    teamSharingOptions: {
      enableTeamSharing: true,
      setSharedEntities: setSharedEntities.bind(this),
      getSharedEntities: getSharedEntities.bind(this)

    },

    layoutOptions: {
      autoSizeColumnsInLayout: true
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
      }
    }
  }

  constructor(
    private contractHistorySvc: ContractHistoryService,
    private dataSvc: DataService
  ) { }

  changeListeners() {
    this.subscriptions.push(this.contractHistorySvc.currentfundValues.subscribe(funds => {
      this.funds = funds
    }))
    this.subscriptions.push(this.contractHistorySvc.currentisLatestValue.subscribe(isLatest => {
      this.isLatest = isLatest
    }))


  }

  ngOnInit(): void {
    this.changeListeners();
  }

  ngOnDestroy(): void {
    this.gridApi.destroy();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  refreshGrid(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){

        this.gridApi?.showLoadingOverlay()
        this.subscriptions.push(forkJoin(
          [
            this.contractHistorySvc.getContractHistory({
              funds: this.funds?.join(','),
              isLatest: this.isLatest
            }),
            this.dataSvc.getGridDynamicColumns('Contract History')
          ]
          ).pipe(first()).subscribe({
          next: data => {
            let contractData = data[0]
            let dynamicColumns = parseFetchedData(data[1])

            this.preSelectedColumns = dynamicColumns.filter(r => r?.['IsDefault'] === 'True').map(r => r?.['Column'].toLowerCase())
            let doNotFormat: string[] = dynamicColumns.filter(r => r?.['EscapeGridFormat'] === 'True').map(r => r?.['Column'].toLowerCase());

            if(contractData.length > 0)
              this.columnDefs = createColumnDefs(contractData[0].columnValues, [...GENERAL_FORMATTING_EXCEPTIONS, ...doNotFormat])
            
            this.rowData = parseFetchedData(contractData)
            
            this.gridApi?.setColumnDefs(this.columnDefs);
            this.gridColumnApi?.autoSizeAllColumns(true);

            this.gridApi?.hideOverlay();

            let selectedColDef: ColDef[] = [];
            this.preSelectedColumns.forEach(colName => {
              let colDefs: ColDef[] = this.columnDefs.filter(def => def.field.toLowerCase() === colName)
              if(colDefs.length > 1){
                console.warn(`Duplicate columnDefs for field: ${colName}`)
              }
              if(colDefs.length > 0)
                selectedColDef.push(colDefs[0])
            })
            saveAndSetLayout(selectedColDef, this.adaptableApi);
            this.gridApi?.setRowData(this.rowData)
          },
          error: error => {
            console.error(error)
            this.gridApi?.hideOverlay();
          }
        }))
      }
    }))

  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.refreshGrid();
    params.api.closeToolPanel()
  }
  
  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }
}
