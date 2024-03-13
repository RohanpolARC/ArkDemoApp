import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, RowNode, ValueGetterParams } from "@ag-grid-community/core";
import { NoRowsOverlayComponent } from "@ag-grid-community/core/dist/cjs/es5/rendering/overlays/noRowsOverlayComponent";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subscription, combineLatest, observable } from "rxjs";
import { CommonConfig } from "src/app/configs/common-config";
import { IRRCalcService } from "src/app/core/services/IRRCalculation/irrcalc.service";
import { DataService } from "src/app/core/services/data.service";
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from "src/app/shared/functions/utilities";
import { ModelUtilService } from "../portfolio-modeller/model/model-util.service";
import { VModel, VPortfolioDeleteModel, VPortfolioModel } from "src/app/shared/models/IRRCalculationsModel";
import { map, mergeMap, switchMap, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmPopupComponent } from "src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component";
import { PortfolioSaveRunModelComponent } from "../portfolio-save-run-model/portfolio-save-run-model.component";
import { MsalService } from "@azure/msal-angular";
import { MsalUserService } from "src/app/core/services/Auth/msaluser.service";

@Injectable()
export class PortfolioManageModelService{

    /* this behaviour subject will only be used once - when config audit component is initialized */
    firstLoad = new BehaviorSubject<boolean>(false);
    firstLoad$ = this.firstLoad.asObservable();
    updateFirstLoad(firstLoad: boolean){
        this.firstLoad.next(firstLoad)
    }

    refreshGrid = new BehaviorSubject<boolean>(false);
    refreshGrid$ = this.refreshGrid.asObservable();
    updateRefreshGrid(refreshGrid: boolean){
        this.refreshGrid.next(refreshGrid)
    }

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
        { field: 'latestWSOStaticStr', tooltipField: 'latestWSOStaticStr', headerName: 'Uses Latest WSO Static', type: 'abColDefString'},
        { field: 'rulesAndPositionIDs', tooltipField: 'rulesAndPositionIDs', headerName: 'Rules/Position IDs', type: 'abColDefString', maxWidth:700, valueGetter: this.getRulesAndPositionIDs},
        { field: 'createdBy', tooltipField: 'createdBy', headerName: 'Owner', type: 'abColDefString'}
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
        noRowsOverlayComponent: NoRowsOverlayComponent,
        noRowsOverlayComponentParams: {
          noRowsMessageFunc: () => `No data found.`,
        },
        onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
          autosizeColumnExceptResized(event)
        },
    }

    adaptableOptions: AdaptableOptions ={
        licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
        primaryKey: 'modelID',
        userName: this.dataSvc.getCurrentUserName(),
        adaptableId: 'Manage Model',
        adaptableStateKey: 'Manage Model Key',
        gridOptions: this.gridOptions,
        teamSharingOptions: {
          enableTeamSharing: true,
          persistSharedEntities: presistSharedEntities.bind(this), 
          loadSharedEntities: loadSharedEntities.bind(this)
        },
        
        actionOptions: {
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
                            ) => {                
                                let rowData = context.rowNode.data;
                                this.openDialog('CLONE', rowData); 
                            },
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
                                if(this.msalUserSvc.isUserAdmin() || context.rowNode?.data.createdBy == this.dataSvc.getCurrentUserName())
                                {
                                  return false
                                }
                                else{
                                  return true
                                }                             
                            },
                            onClick: (
                            button: AdaptableButton<ActionColumnContext>,
                            context: ActionColumnContext
                            ) => {
                            let rowData = context.rowNode.data;
                            this.openDialog('DELETE', rowData); 
                            },
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
            Revision: 2,
            FormatColumns: [
            ]
          },
          Layout: {
            Revision: 18,
            CurrentLayout: 'Basic',
            Layouts:[
              {
                Name: 'Basic',
                Columns: [
                    'modelName',
                    'modelDesc',
                    'feePreset',
                    'fundCurrency',
                    'irrAggrType',
                    'isLocal',
                    'isShared',
                    'latestWSOStaticStr',
                    'autoManualOption',
                    'rulesAndPositionIDs',
                    'createdBy',                
                    'Actions',
                ],                
                PinnedColumnsMap: {
                    Actions: 'right'
                },
              }
            ],
          }
        }
    }
    subscriptions: Subscription[] = [];

    constructor(
        private dataSvc: DataService,
        private irrCalcService: IRRCalcService,
        public modelSvc: ModelUtilService,
        public dialog: MatDialog,
        private msalUserSvc: MsalUserService,
    ){
        this.init()
    }

    init(){
      this.rowData$ = combineLatest([this.firstLoad$, this.refreshGrid$]).pipe(
        switchMap(() => {
          let fetchAllModels:boolean
          if(this.msalUserSvc.isUserAdmin()){
            fetchAllModels = true;
          }
          return this.irrCalcService.getPortfolioModels(this.dataSvc.getCurrentUserName(), fetchAllModels).pipe(
            map((data:any) => {
              return this.modelSvc.parseFetchedModels(data)
            })
          )
        }),
        tap(()=>{
          this.adaptableApi.filterApi.setColumnFilters([{
            ColumnId: 'createdBy',
            Predicate: {
              PredicateId: 'Values',
              Inputs: [this.msalUserSvc.getUserName()]
            }
          }])
        })
      )   
    }  
    
    getRulesAndPositionIDs(params: ValueGetterParams){
      if(params.data.autoManualOption == 'Automatic')
        return params.data.rulesStr
      else
        return params.data.positionIDs        
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

    openDialog(action: 'CLONE' | 'DELETE' = 'CLONE', portfolioModelData:VModel) { 

        if(action === 'DELETE'){

          let isDeleteAccess:boolean
          if(this.msalUserSvc.isUserAdmin() || portfolioModelData.createdBy == this.dataSvc.getCurrentUserName()){
            isDeleteAccess = true;
          }

          if(!isDeleteAccess){
            this.dataSvc.setWarningMsg('No Access to delete model', 'Dismiss', 'ark-theme-snackbar-warning')
            return
          }

          let confirmTextString = 'Are you sure you want to delete this Model ?'
          const dialogRef = this.dialog.open(ConfirmPopupComponent, { 
            data:{
                headerText:confirmTextString,
                showTextField:false,
            },
            maxHeight: '95vh'
          })
          this.subscriptions.push(dialogRef.afterClosed().subscribe((value)=>{
            if(value.action==='Confirm'){
                let model:VPortfolioDeleteModel = 
                {
                    modelID:portfolioModelData.modelID,
                    username:this.dataSvc.getCurrentUserName()
                }
                this.deletePortfolioModel(model)
            }
          }))
        }
        else if(action === 'CLONE')
        {
          portfolioModelData.modelID = null
          portfolioModelData.modelName = null
          portfolioModelData.displayName = null
          const dialogRef = this.dialog.open(PortfolioSaveRunModelComponent, {
              data: {
                adaptableApi: this.adaptableApi, 
                model: portfolioModelData, 
                asOfDate: null, 
                autoManualOption: portfolioModelData.autoManualOption, 
                isLocal: portfolioModelData.isLocal,
                isShared: portfolioModelData.isShared,
                positionIDs: portfolioModelData.positionIDs,
                aggregationType: portfolioModelData.aggregationType,
                updatedValues: null,
                clonnedRules : portfolioModelData.rules,
                context: 'Save',
                isClonnedModel: true
              },
              maxHeight: '100vh',
              width: '80vw',
              maxWidth: '2000px'
            })
          this.subscriptions.push(dialogRef.afterClosed().subscribe(()=>{
              this.updateRefreshGrid(true)
          }))
        }
    }

    deletePortfolioModel(model:VPortfolioDeleteModel){
      this.subscriptions.push(this.irrCalcService.deletePortfolioModel(model).subscribe((result:any)=>{
        if(result.isSuccess===true){          
          this.updateRefreshGrid(true)
          this.dataSvc.setWarningMsg('Portfolio Model deleted successfully','Dismiss','ark-theme-snackbar-success')
        }else{
          this.dataSvc.setWarningMsg('Portfolio Model could not be deleted','Dismiss','ark-theme-snackbar-error')
        }
      }))
    }


}