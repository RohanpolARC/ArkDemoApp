import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, ValueGetterParams } from "@ag-grid-community/core";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from "rxjs";
import { CommonConfig } from "src/app/configs/common-config";
import { DataService } from "src/app/core/services/data.service";
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from "src/app/shared/functions/utilities";
import { first, map, switchMap, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { BLANK_DATETIME_FORMATTER_CONFIG, DATE_FORMATTER_CONFIG_ddMMyyyy } from "src/app/shared/functions/formatter";
import { VModel } from "src/app/shared/models/GeneralModel";

@Injectable()
export class PortfolioManageModelService implements OnDestroy{



    isActionSuccessful:boolean

    columnDefs: ColDef[] = [
        { field: 'modelID', tooltipField: 'modelID', headerName: 'Model ID', type: 'abColDefNumber'},
        { field: 'modelName', tooltipField: 'modelName', headerName: 'Model Name', type: 'abColDefString'},
        { field: 'modelDesc', tooltipField: 'modelDesc', headerName: 'Model Description', type: 'abColDefString'},
        { field: 'feePreset', tooltipField: 'feePreset', headerName: 'Fee Preset', type: 'abColDefString'},
        { field: 'fundCurrency', tooltipField: 'fundCurrency', headerName: 'Fund Currency', type: 'abColDefString'},
        { field: 'irrAggrType', tooltipField: 'irrAggrType', headerName: 'IRR Aggr Type', type: 'abColDefString'},
        { field: 'isLocal', tooltipField: 'isLocal', headerName: 'Has Local Overrides', type: 'abColDefString'},
        { field: 'autoManualOption', tooltipField: 'autoManualOption', headerName: 'Automatic/Manual', type: 'abColDefString'},
        { field: 'isShared', tooltipField: 'isShared', headerName: 'Is Shared Model', type: 'abColDefString'},
        { field: 'includeFutureUpfrontFeesStr', tooltipField: 'includeFutureUpfrontFeesStr', headerName: 'Include Future Upfront Fees', type: 'abColDefString'},
        { field: 'rulesAndPositionIDs', tooltipField: 'rulesAndPositionIDs', headerName: 'Rules/Position IDs', type: 'abColDefString', maxWidth:700},
        { field: 'createdBy', tooltipField: 'createdBy', headerName: 'Owner', type: 'abColDefString'},
        { field: 'createdOn', tooltipField: 'createdOn', headerName: 'Created On', type: 'abColDefDate'},
        { field: 'modifiedOn', tooltipField: 'modifiedOn', headerName: 'Modified On', type: 'abColDefDate'},
    ]

    gridApi: GridApi
    adaptableApi: AdaptableApi
    rowData$: Observable<VModel[]>
    

    gridOptions: GridOptions = {
        ...CommonConfig.GRID_OPTIONS,
        columnDefs: this.columnDefs,
        defaultColDef: {
          resizable: true,
          enableValue: true,
          enableRowGroup: true,
          sortable: true,
          filter: true,
        },
        headerHeight: 30,
        rowHeight: 30,
        groupHeaderHeight: 30,
        tooltipShowDelay: 0,
        enableRangeSelection: true,
        suppressScrollOnNewData: true,
        onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
          autosizeColumnExceptResized(event)
        },
    }

    adaptableOptions: AdaptableOptions ={
        ...CommonConfig.ADAPTABLE_OPTIONS,
        primaryKey: 'modelID',
        userName: this.dataSvc.getCurrentUserName(),
        adaptableId: 'Manage Model',
        adaptableStateKey: 'Manage Model Key',
        teamSharingOptions: {
          enableTeamSharing: true,
          persistSharedEntities: presistSharedEntities.bind(this), 
          loadSharedEntities: loadSharedEntities.bind(this)
        },
        
        actionColumnOptions: {
          actionColumns: 
            [
                {
                    columnId: 'Actions',
                    friendlyName: 'Actions',
                    actionColumnButton: [
                        {
                            tooltip: 'Clone Model',
                            onClick: (
                              button: AdaptableButton<ActionColumnContext>,
                              context: ActionColumnContext
                            ) => { },
                            icon: {
                              src: '../assets/img/copy.png',
                              style: {height: 25, width: 25}
                            }
                        },
                        {
                            tooltip: 'Delete Model',
                            hidden: (
                            button: AdaptableButton<ActionColumnContext>,
                            context: ActionColumnContext
                            ) => {
                              return false
                                                          
                            },
                            onClick: (
                            button: AdaptableButton<ActionColumnContext>,
                            context: ActionColumnContext
                            ) => {},
                            icon: {
                            src: '../assets/img/trash.svg',
                            style: {height: 25, width: 25}
                            }
                            
                        }
                        
                    ]
                },
                
                
            ]
      },
        exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
        predefinedConfig: {
          Dashboard: {
            Revision: 2,
            ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
            IsCollapsed: true,
            Tabs: [{
              Name: 'Layout', Toolbars: ['Layout']
            }],
            IsHidden: false, DashboardTitle: ' '
          },
          FormatColumn: {
            Revision: 3,
            FormatColumns: [
              BLANK_DATETIME_FORMATTER_CONFIG(['createdOn', 'modifiedOn']), 
              DATE_FORMATTER_CONFIG_ddMMyyyy(['createdOn', 'modifiedOn'])              
            ]
          },
          Layout: {
            Revision: 20.1,
            CurrentLayout: 'Basic',
            Layouts:[
              {
                Name: 'Basic',
                Columns: [
                    'modelName',
                    'autoManualOption',
                    'createdBy',
                    'createdOn',
                    'modifiedOn',
                    'isShared',
                    'rulesAndPositionIDs',
                    'modelDesc',
                    'isLocal',
                    'feePreset',
                    'fundCurrency',
                    'irrAggrType',
                    'includeFutureUpfrontFees',               
                    'Actions',
                ],                
                PinnedColumnsMap: {
                    Actions: 'right',
                    modelName: 'left'
                },
              }
            ],
          }
        }
    }
    subscriptions: Subscription[] = [];

    constructor(
        private dataSvc: DataService,
        public dialog: MatDialog,
    ){
        this.init()
    }

    init(){
      let data : VModel[] = [
        {
          modelID: 1, 
          modelName: 'test', 
          displayName: 'test', 
          modelDesc: '', 
          rules: [], 
          positionIDs: [1,2,3], 
          isLocal: 'Yes', 
          autoManualOption: 'Automatic', 
          username: 'user', 
          isShared: 'Yes', 
          aggregationType: '',
          fundCurrency: 'EUR', 
          includeFutureUpfrontFees: true, 
          feePreset: 'fee preset', 
          rulesStr : '', 
          createdBy: '',
          createdOn: '', 
          modifiedOn: ''
        }
      ]
      
      
      this.rowData$ = of(data)
      
    }  
    
 

    getColumnDefs(): ColDef[] {
        return this.columnDefs
    }

    getGridOptions(): GridOptions{
        return this.gridOptions  
    }

    getAdaptableOptions(): AdaptableOptions{
        return this.adaptableOptions
    }

   

    ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }


}