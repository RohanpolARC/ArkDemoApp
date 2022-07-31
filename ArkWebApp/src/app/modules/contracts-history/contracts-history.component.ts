import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent, Layout } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ClipboardModule, ColDef, ColumnsToolPanelModule, ExcelExportModule, FiltersToolPanelModule, GridApi, GridOptions, GridReadyEvent, IServerSideDatasource, MenuModule, Module, RangeSelectionModule, ServerSideRowModelModule, ServerSideStoreType, SetFilterModule, SideBarModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ContractHistoryService } from 'src/app/core/services/ContractHistory/contract-history.service';
import { DataService } from 'src/app/core/services/data.service';
import { createColumnDefs, GENERAL_FORMATTING_EXCEPTIONS, parseFetchedData, saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-contracts-history',
  templateUrl: './contracts-history.component.html',
  styleUrls: ['./contracts-history.component.scss']
})
export class ContractsHistoryComponent implements OnInit {

  subscriptions: Subscription[] = []
  agGridModules: Module[] = [
    ClientSideRowModelModule,
    // RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    ClipboardModule,
    SideBarModule,
    RangeSelectionModule
  ];
  
  columnDefs: ColDef[] = []

  rowData = null

  gridOptions: GridOptions = {
    enableRangeSelection: true,
    columnDefs: this.columnDefs,
    tooltipShowDelay: 0,
    components: {
      AdaptableToolPanel: AdaptableToolPanelAgGridComponent
    },
    onGridReady: this.onGridReady.bind(this),
    defaultColDef: {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: true
    },
    rowData: this.rowData,
    sideBar: true
  }
  gridApi: GridApi;
  gridColumnApi: any;

  adaptableOptions: AdaptableOptions = {
    primaryKey: '',
    userName: this.dataSvc.getCurrentUserName(),
    autogeneratePrimaryKey: true,
    adaptableId: 'Contracts history ID',
    adaptableStateKey: 'Contracts history state key',

    toolPanelOptions: {
      toolPanelOrder: ['columns', 'AdaptableToolPanel']
    },

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
        Revision: 1,
        ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
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

  adaptableApi: AdaptableApi;

  constructor(
    private contractHistorySvc: ContractHistoryService,
    private dataSvc: DataService
  ) { }

  funds
  contractTypes
  isLatest

  changeListeners() {
    this.subscriptions.push(this.contractHistorySvc.currentfundValues.subscribe(funds => {
      this.funds = funds
    }))
    this.subscriptions.push(this.contractHistorySvc.currentContractTypeValues.subscribe(contractTypes => {
      this.contractTypes = contractTypes
    }))
    this.subscriptions.push(this.contractHistorySvc.currentisLatestValue.subscribe(isLatest => {
      this.isLatest = isLatest
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){

        console.log(this.funds, this.contractTypes, this.isLatest)
        this.gridApi?.showLoadingOverlay()
        this.subscriptions.push(
            this.contractHistorySvc.getContractHistory({
              funds: this.funds?.join(','), 
              contractTypes: this.contractTypes?.join(','),
              isLatest: this.isLatest
          }).pipe(first()).subscribe({
          next: data => {
            if(data.length > 0)
              this.columnDefs = createColumnDefs(data[0].columnValues, [...GENERAL_FORMATTING_EXCEPTIONS, 'name'])
            this.rowData = parseFetchedData(data)
            
            this.gridApi?.setColumnDefs(this.columnDefs);
            this.gridColumnApi?.autoSizeAllColumns(true);

            this.gridApi?.hideOverlay();

            saveAndSetLayout(this.columnDefs, this.adaptableApi);
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

  ngOnInit(): void {
    this.changeListeners();
  }

  ngOnDestroy(): void {
    this.gridApi.destroy();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.gridApi.setColumnDefs(this.columnDefs);
    this.gridColumnApi.autoSizeAllColumns(true);
    this.gridApi?.hideOverlay();
    this.gridApi?.setRowData(this.rowData)

    saveAndSetLayout(this.columnDefs, this.adaptableApi);
    params.api.closeToolPanel()
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
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }
}
