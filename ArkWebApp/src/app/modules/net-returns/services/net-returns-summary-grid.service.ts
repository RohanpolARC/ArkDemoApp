import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER } from 'src/app/shared/functions/formatter';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { DataService } from 'src/app/core/services/data.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';

@Injectable()
export class NetReturnsSummaryGridService {

  gridApi: GridApi
  adaptableApi: AdaptableApi

  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions

  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.'
  
  constructor(
    private dataSvc: DataService
  ) {
      this.init()
  }
    
  init(){
    this.setGridOptions()
    this.setAdaptableOptions()
  }

  filterApply$: Observable<boolean> = this.dataSvc.filterApplyBtnState.pipe(
    tap((isHit: boolean) => {
      if(isHit){
        this.noRowsToDisplayMsg = 'No data found for applied filter.'
        this.gridApi?.showLoadingOverlay();
      }
    })
  )

  columnDefs: ColDef[]  = [
    { field: 'FundCurrency', type: 'abColDefString', headerName: 'Currency' },
    { field: 'NAV', type: 'abColDefNumber' },
    { field: 'AUM', type: 'abColDefNumber' },
    { field: 'AUMEur', type: 'abColDefNumber', headerName: 'AUM Eur' },
    { field: 'GrossCapitalDrawnInvestment', type: 'abColDefNumber', headerName: 'Gross Capital Drawn - Investment'},
    { field: 'GrossCapitalDrawnOpex', type: 'abColDefNumber', headerName: 'Gross Capital Drawn - Opex'},
    { field: 'RecallableCapital', type: 'abColDefNumber', headerName: 'Recallable Capital' },
    { field: 'DistributionsGainsCurrentIncome', type: 'abColDefNumber', headerName: 'Distributions - gains/current income' },
    { field: 'DistributionsPermanentReturnOfCapital', type: 'abColDefNumber', headerName: 'Distributions - permanent return of capital' },
    { field: 'NetCapital', type: 'abColDefNumber', headerName: 'Net Capital' },
    { field: 'Rebates', type: 'abColDefNumber', headerName: 'Rebates' }
  ]

  setGridOptions(): void{
    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      tooltipShowDelay: 0,
      defaultColDef: {
        resizable: true,
        filter: true,
        sortable: true,
        enableValue: true,
        enableRowGroup: true
      },
      headerHeight: 30,
      rowHeight: 30,
      groupHeaderHeight: 30,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      }
    }
  }

  
  getGridOptions(): GridOptions{
    return this.gridOptions  
  }
  
  setAdaptableOptions(): void{
    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: 'Net Returns Summary Grid',
      adaptableStateKey: 'Net Returns Summary Grid Key',
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter')
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 2,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          IsHidden: false,
          DashboardTitle: 'Summary'
        },
        Layout: {
          Revision: 9,
          CurrentLayout: 'Basic Layout',
          Layouts: [{
            Name: 'Basic Layout',
            Columns: this.columnDefs.map(cd => cd.field)
          }]
        },
        FormatColumn: {
          Revision: 5,
          FormatColumns: [
            CUSTOM_FORMATTER(this.columnDefs.map(cd => cd.field),'amountFormatter')
          ]
        },
        StatusBar: {
          Revision: 1,
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

  getAdaptableOptions(): AdaptableOptions{
      return this.adaptableOptions
  }

  setColumnDefs(): void{
    this.gridApi.setColumnDefs(this.columnDefs)
  }




}
