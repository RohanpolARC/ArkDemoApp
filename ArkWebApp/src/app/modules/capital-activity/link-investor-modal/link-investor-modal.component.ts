import { Component, OnInit, Input } from '@angular/core';
import { GridOptions, Module, ColDef, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { dateFormatter, amountFormatter, nonAmountNumberFormatter } from 'src/app/shared/functions/formatter';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable/types';
import { CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Observable, Subscription, of } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { LinkingService } from '../services/linking.service';

@Component({
  selector: 'app-link-investor-modal',
  templateUrl: './link-investor-modal.component.html',
  styleUrls: ['./link-investor-modal.component.scss'],
  providers: [LinkingService]
})
export class LinkInvestorModalComponent implements OnInit {

  rowData$: Observable<any[]> = of([]);
  @Input() investmentData: CapitalInvestment[]

  subscriptions: Subscription[] = []
  actionSuccessful$: Observable<boolean>;
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  columnDefs: ColDef[] = [
    {field: 'capitalID', headerName: 'Capital ID', type: 'abColDefNumber'},
    { field: 'callDate', headerName: 'Call Date', type: 'abColDefDate', valueFormatter: dateFormatter },
    { field: 'valueDate', headerName: 'Value Date', type: 'abColDefDate', valueFormatter: dateFormatter},
    { field: 'capitalType', headerName: 'Capital Type', type:'abColDefString'},
    { field: 'capitalSubType', headerName: 'Capital Subtype', type:'abColDefString'},
    { field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
    { field: 'fundCcy', headerName: 'Base Ccy', type:'abColDefString'},
    { field: 'totalAmount', headerName: 'Total Amount', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    { field: 'issuerShortName', headerName: 'Issuer Short Name', type:'abColDefString'},
    { field: 'asset', headerName: 'Asset', type:'abColDefString'},
    { field: 'wsoAssetID', headerName: 'Asset ID', type:'abColDefNumber',valueFormatter: nonAmountNumberFormatter},
    { field: 'narrative', headerName: 'Narrative', type:'abColDefString'},
    { field: 'source', headerName: 'Source', type:'abColDefString'},
    { field: 'linkedAmount', headerName: 'Linked Total Base', type: 'abColDefNumber', valueFormatter: amountFormatter},
    { field: 'Link', headerName: 'Link', type:'abColDefBoolean', editable: true},
    { field: 'resultCategory', headerName: 'Result Category', type:'abColDefString'},
    { field: 'isChecked', headerName: 'Link', type: 'abColDefBoolean', checkboxSelection: true}
  ]
  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: false,
    sortable: true,
    filter: true
  };

  onSelectionChanged = this.linkingSvc.onSelectionChanged
  gridOptions: GridOptions = {
    ...CommonConfig.GRID_OPTIONS,
    enableRangeSelection: true,
    sideBar: false,
    rowSelection: 'multiple',
    groupSelectsFiltered: true,
    groupSelectsChildren: true,
    suppressRowClickSelection: true,
    suppressMenuHide: true,
    suppressClickEdit: true,
    singleClickEdit: false,
    rowGroupPanelShow: 'always',
    enableGroupEdit: false,
    columnDefs: this.columnDefs,
    allowContextMenuWithControlKey:true,
    onSelectionChanged: this.onSelectionChanged,
    onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
      autosizeColumnExceptResized(event)
    },
    onRowDataUpdated: this.linkingSvc.onRowDataUpdated,
    rowHeight: 30,
    headerHeight: 30,
    groupHeaderHeight: 30
  };
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions = {
    filterOptions: CommonConfig.ADAPTABLE_FILTER_OPTIONS,
    licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
    primaryKey: 'capitalID',
    userName: this.msalService.getUserName(),
    adaptableId: 'Linking',
    adaptableStateKey: 'Linking Key',

    exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
    predefinedConfig: {
      Dashboard: {
        Revision: 1,
        ModuleButtons: ['Export', 'Layout'],
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
  onGridReady = this.linkingSvc.onGridReady
  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.columnApi.autosizeAllColumns();
  };
  constructor(private msalService: MsalUserService,
    public linkingSvc: LinkingService
) { }

  clearFilter(): void{
    this.adapTableApi.filterApi.clearColumnFilters();
  }
  ngOnInit(): void {
    this.actionSuccessful$ = this.linkingSvc.modalSvc.actionSuccessful$;
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}