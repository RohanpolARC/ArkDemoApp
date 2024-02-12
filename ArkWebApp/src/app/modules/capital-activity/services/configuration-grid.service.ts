import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions } from "@ag-grid-community/core";
import { NoRowsOverlayComponent } from "@ag-grid-community/core/dist/cjs/es5/rendering/overlays/noRowsOverlayComponent";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import {  map, switchMap } from "rxjs/operators";
import { CommonConfig } from "src/app/configs/common-config";
import { CapitalActivityService } from "src/app/core/services/CapitalActivity/capital-activity.service";
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from "src/app/shared/functions/utilities";
import { ConfigurationService } from "./configuration.service";
import { AdaptableApi, AdaptableOptions } from "@adaptabletools/adaptable-angular-aggrid";
import { DataService } from "src/app/core/services/data.service";
import { BLANK_DATETIME_FORMATTER_CONFIG, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from "src/app/shared/functions/formatter";
import { ConfigurationFormService } from "./configuration-form.service";
import { ICapitalActivityConfig } from "src/app/shared/models/CapitalActivityModel";

@Injectable()
export class ConfigurationGridService {

    auditGridDataLoaded$: Observable<boolean>

    /* this behaviour subject will only be used once - when config audit component is initialized */
    firstLoad = new BehaviorSubject<boolean>(false);
    firstLoad$ = this.firstLoad.asObservable();
    updateFirstLoad(firstLoad: boolean){
        this.firstLoad.next(firstLoad)
    }



    columnDefs: ColDef[] = [
        { field: 'lockDate', tooltipField: 'lockDate', headerName: 'Lock Date', type: 'abColDefDate'},
        { field: 'numberOfLockedRecords', tooltipField: 'numberOfLockedRecords', headerName: 'Number Of Locked Records', type: 'abColDefNumber'},
        { field: 'addedBy', tooltipField: 'addedBy', headerName: 'Added By', type: 'abColDefString'},
        { field: 'addedOn', tooltipField: 'addedOn', headerName: 'Added On', type: 'abColDefDate'},
    ]

    gridApi: GridApi
    adaptableApi: AdaptableApi

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
        autogeneratePrimaryKey: true,
        primaryKey: '',
        userName: this.dataSvc.getCurrentUserName(),
        adaptableId: 'Capital Activity Config Audit',
        adaptableStateKey: 'Capital Activity Config Audit Key',
        gridOptions: this.gridOptions,
        teamSharingOptions: {
          enableTeamSharing: true,
          persistSharedEntities: presistSharedEntities.bind(this), 
          loadSharedEntities: loadSharedEntities.bind(this)
        },
        exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
        predefinedConfig: {
          Dashboard: {
            Revision: 1,
            ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
            IsCollapsed: true,
            Tabs: [{
              Name: 'Layout', Toolbars: ['Layout']
            }],
            IsHidden: false, DashboardTitle: ' '
          },
          FormatColumn: {
            Revision: 1,
            FormatColumns: [
              BLANK_DATETIME_FORMATTER_CONFIG(['lockDate', 'addedOn']), 
              DATE_FORMATTER_CONFIG_ddMMyyyy(['lockDate']), 
              DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['addedOn'])
            ]
          },
          Layout: {
            Revision: 2,
            CurrentLayout: 'Basic',
            Layouts:[
              {
                Name: 'Basic',
                Columns: [ 'lockDate','numberOfLockedRecords','addedBy','addedOn']  
              }
            ]
          }
        }
      }
    


    constructor(
        private capitalActivitySvc: CapitalActivityService,
        private dataSvc: DataService,
        private configurationFormSvc: ConfigurationFormService,
        private configurationSvc: ConfigurationService
    ){
        this.init()
    }

    init(){

        this.auditGridDataLoaded$ = combineLatest([this.firstLoad$,this.configurationFormSvc.isActionSuccessful$,this.configurationSvc.capitalActivityConfig$]).pipe(
            switchMap(([firstLoad,isActionSuccessful,updatedConfig]:[boolean,boolean,ICapitalActivityConfig])=>{
                this.gridApi?.showLoadingOverlay()
                // This block will be executed when user submits the form and we add 1 new record. Redrawing entire grid is expensive.
                if(isActionSuccessful){
                    return this.capitalActivitySvc.getCapitalActivityConfig(false).pipe(
                        /* After submission of config form we get the latest record and update the row data by inserting record at 0th index */
                        map((updatedData : ICapitalActivityConfig[]) => {
                            if(updatedData.length > 0){
                                let updatedDataRow = updatedData[0]
                                this.adaptableApi?.gridApi?.addGridData([{
                                    lockDate: updatedDataRow.lockDate,
                                    numberOfLockedRecords: updatedDataRow.numberOfLockedRecords,
                                    addedBy: updatedDataRow.addedBy,
                                    addedOn: updatedDataRow.addedOn
                                }],{addIndex:0})
                            }else{
                                this.dataSvc.setWarningMsg('Could not update grid. Please reopen the window.','dismiss','ark-theme-snackbar-error')
                            }
                            this.gridApi?.hideOverlay()
                            return true
                        })
                    )
                }
                else if(firstLoad){
                  // This block will be executed on the first load of the grid, we need to check for if firstLoad === true and then only make the db request. If we remove this check the db request is made twice.
                    return this.capitalActivitySvc.getCapitalActivityConfig(true).pipe(
                        /* Get request for entire config audit dataset */
                        map((data: ICapitalActivityConfig[]) => {
                          if(data.length === 0){
                            this.gridApi.showNoRowsOverlay()
                          }
                          else{
                            this.adaptableApi?.gridApi?.setGridData(data)
                            this.gridApi?.hideOverlay()
                          }
                            return true
                        })
                    )
                }
                else{
                  // Since we need to return Observable<boolean> to SwitchMap. We return this simple observable which returns true.
                  return of(true)
                }
            })
        )
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
    


}