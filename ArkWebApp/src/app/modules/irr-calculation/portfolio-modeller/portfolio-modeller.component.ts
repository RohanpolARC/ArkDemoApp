import { AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, RowNode, GridReadyEvent, GridApi, Module } from '@ag-grid-community/core';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, Subscription, timer } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { EmitParams, PortfolioModellerCalcParams, TabContext } from 'src/app/shared/models/IRRCalculationsModel';
import { EventEmitter } from '@angular/core';
import { PortfolioSaveRunModelComponent } from '../portfolio-save-run-model/portfolio-save-run-model.component';
import { getLastBusinessDay, getMomentDateStr, preprocessEditableDateFields } from 'src/app/shared/functions/utilities';
import { CommonConfig } from 'src/app/configs/common-config';
import { first, switchMap, takeUntil, tap } from 'rxjs/operators';
import { IPropertyReader, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { PortfolioModellerService } from '../service/portfolio-modeller.service';
import { ComponentReaderService } from '../service/component-reader.service';
import { GridConfigService } from './grid/grid-config.service';
import { RefService } from './ref/ref.service';
import { ModelUtilService } from './model/model-util.service';
import { GridUtilService } from './grid/grid-util.service';
import { TabUtilService } from './tab/tab-util.service';

let adaptable_Api: AdaptableApi

@Component({
  selector: 'app-portfolio-modeller',
  templateUrl: './portfolio-modeller.component.html',
  styleUrls: ['./portfolio-modeller.component.scss']
})
export class PortfolioModellerComponent implements OnInit, IPropertyReader {
  closeTimer: Subject<any> = new Subject<any>();
  benchMarkIndexes: string[];
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  rowData: any[] = []//: Observable<any[]>
  constructor(
    private dataSvc: DataService,
    private irrCalcService: IRRCalcService,
    public dialog: MatDialog,
    public refSvc: RefService,
    public portfolioModellerSvc: PortfolioModellerService,
    private compReaderSvc: ComponentReaderService,
    private gridConfigSvc: GridConfigService,
    private gridUtilSvc: GridUtilService,
    public modelSvc: ModelUtilService,
    private tabSvc: TabUtilService
  ) { 
    this.compReaderSvc.registerComponent(this)
  }

  @Output() calcParamsEmitter = new EventEmitter<EmitParams>();

  /*** Implementing the visitor pattern to read component properties in the service.
    https://stackoverflow.com/a/56975850
  */
  readProperty<T>(prop: string): T {
    if(!this.hasOwnProperty(prop)){
      throw Error(`Property ${prop} does not exist`);
    }
    return this[prop];
  }

  multiSelectPlaceHolder: string = null;
  dropdownSettings: IDropdownSettings = null;
  selectedDropdownData: any = null;

  asOfDate: string = getMomentDateStr(getLastBusinessDay())
  selectedModelID: number
  isAutomatic: FormControl
  isLocal: FormControl

  subscriptions: Subscription[] = [];
  selectedPositionIDs: number[] = []
  localOverrides

  gridOptions: GridOptions;
  gridApi: GridApi;
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions;
  fetchIRRPostions() {
    if(this.asOfDate !== null){
      this.gridOptions?.api?.showLoadingOverlay();

      this.subscriptions.push(this.irrCalcService.getIRRPositions(this.asOfDate, this.selectedModelID).subscribe({
        next: data => {
          if(data.length === 0){
            this.noRowsToDisplayMsg = 'No data found for applied filter.'
          }
          this.gridOptions?.api?.hideOverlay();
          for(let i: number = 0; i < data?.length; i+= 1){
            data[i] = preprocessEditableDateFields(data[i], [
              ...['expectedDate', 'localExpectedDate', 'globalExpectedDate', 'entryDate'], 
              ...['maturityDate', 'localMaturityDate', 'globalMaturityDate']])
            data[i]['isOverride'] = this.gridUtilSvc.getIsOverride(data[i])
          }  

          adaptable_Api.gridApi.setGridData(data)

          if(this.selectedModelID){
            if(this.modelSvc.modelMap[this.selectedModelID].positionIDs){

              this.gridApi.deselectAll();
              this.modelSvc.modelMap[this.selectedModelID].positionIDs?.forEach(posID => {
                let node: RowNode = <RowNode>adaptable_Api.gridApi.getRowNodeForPrimaryKey(posID)
                node.setSelected(true);
                this.selectedPositionIDs = this.modelSvc.modelMap[this.selectedModelID].positionIDs
              })
            }
          
            this.gridUtilSvc.selectManualPositions(this.selectedModelID);
          }

          // Refreshing clear_override column based on dataset
          adaptable_Api.gridApi.refreshCells(adaptable_Api.gridApi.getAllRowNodes(), ['clear_override']);

        },
        error: error => {
          this.rowData = []
          this.gridOptions?.api?.showNoRowsOverlay();
          console.error(`Failed to fetch positions data: ${error}`);
        }
      }))
  
    }
  }

  saveModelCashflowsAndOpenTabs(modelID?: number, context: string[] = ['SaveRunIRR'], contextData: TabContext = null){

    if(!modelID)
      console.error(`Model ID not received`)

    // Create params for generating cashflows and trigger the virtual model cashflow generator
    let m = <PortfolioModellerCalcParams> {};
    m.modelID = modelID;
    m.positionIDs = this.selectedPositionIDs;
    m.asOfDate = this.asOfDate;
    m.feePreset = contextData.feePreset;
    m.irrAggrType = contextData?.aggrStr?.join(' > ') ?? '';
    m.curveRateDelta = contextData.curveRateDelta ?? 0.0;
    m.latestWSOStatic = contextData?.latestWSOStatic ?? false;
    m.runBy = this.dataSvc.getCurrentUserName();

    // Load cashflows only if running IRR/Performance fees

    if(context.includes('SaveRunIRR') || context.includes('SaveRunPFees')){
    
      this.irrCalcService.generatePositionCashflows(m).pipe(first()).subscribe({
        next: resp => {

          let runID: string = resp?.['id'];
          this.irrCalcService.terminateCashflowSaveUri = resp?.['terminatePostUri'];

          // After save cashflows instance is registered, setting a new tab for the run.
          this.tabSvc.createNewTabGroup(runID, context, contextData)

          this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Loading' })

          timer(0, 10000).pipe(
            switchMap(() => this.irrCalcService.getIRRStatus(resp?.['statusQueryGetUri'])),
            takeUntil(this.closeTimer)
          ).subscribe({
            next: (res: any) => {

              if(res?.['runtimeStatus'] === 'Completed'){

                this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Loaded' })
                this.dataSvc.setWarningMsg(`Generated ${res['output']['cashflowCount']} cashflows for the selected model`, `Dismiss`, `ark-theme-snackbar-normal`);
                this.closeTimer.next();
              }
              else if(res?.['runtimeStatus'] === 'Terminated'){
                this.closeTimer.next();
              }
              else if(res?.['runtimeStatus'] === 'Failed'){

                this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Failed' })               
                this.dataSvc.setWarningMsg(`Failed to generate the cashflows`, `Dismiss`, `ark-theme-snackbar-error`);
                this.closeTimer.next();
              }
            },
            error: (error) => {
              this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Failed' });
              console.error(`Error in saving cashflows to DB: ${error}`);
              this.closeTimer.next();
            }
          })
        },
        error: error => {
          this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: null, status: 'Failed' });
          console.error(`Error in saving cashflows to DB: ${error}`);
          this.closeTimer.next();
        } 
      })
    }
    else if(context?.length === 1 && context.includes("SaveRunMReturns")){
      this.tabSvc.createNewTabGroup(null, context, contextData)
    }
  }

  fetchPortfolioModels(modelID?: number, context: string[] = ['SaveRunIRR'], contextData: TabContext = null){
    this.subscriptions.push(this.irrCalcService.getPortfolioModels(this.dataSvc.getCurrentUserName()).subscribe({
      next: data => {
        this.modelSvc.modelData = this.modelSvc.parseFetchedModels(data);
        this.modelSvc.modelMap = this.modelSvc.initModelMap(this.modelSvc.modelData)
        this.setSelectedModel(modelID)

        if(modelID)
        this.saveModelCashflowsAndOpenTabs(modelID, context, contextData);
      },
      error: error => {
        console.error(`Failed to fetch Portfolio Rules: ${error}`)
      }
    }))
  }

  ngOnInit(): void {

    this.gridOptions = this.gridConfigSvc.gridOptions
    this.adaptableOptions = this.gridConfigSvc.adaptableOptions

    //This function sets reference data used by Virtual Positions form dropdown
    this.refSvc.loadRefData();

    this.isAutomatic = new FormControl()
    this.isLocal = new FormControl()
      // Toggle layout programmatically
    this.isAutomatic.setValue(false)
      // Don't toggle programmatically
    this.isLocal.setValue(false, {emitEvent: false})


    this.fetchPortfolioModels()

    this.selectedDropdownData = []
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'modelID',
      textField: 'displayName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: 'Select Portfolio Model',
      closeDropDownOnSelection: true,
    }
  }
  rows: number[] 
  setSelectedModel(modelID?: number){
    if(modelID){
      this.selectedDropdownData = [
        {
          modelID: modelID,
          displayName: this.modelSvc.modelMap[modelID].displayName
        }]    
    }
    else this.selectedDropdownData = [];
  }
  checkRunningJobs(): number{

    let runningTabs: string[] = this.irrCalcService.parentTabs
                                    ?.filter(tab => tab.status === 'Loading')
                                    ?.map(x => x.parentDisplayName);

    return runningTabs?.length ?? 0;
  }
  onSavePortfolio(context = 'Save'){

    if(this.checkRunningJobs()){

      this.dataSvc.setWarningMsg(`Please wait for the already triggered process to finish`);
      return
    }

    if(this.selectedDropdownData.length === 0 || this.selectedDropdownData === null){
      this.selectedModelID = null
    }

    if(!this.isAutomatic.value){
      this.selectedPositionIDs = this.gridApi.getSelectedNodes()?.map(node => node.data.positionID)
    }
    const dialogRef = this.dialog.open(PortfolioSaveRunModelComponent, {
      data: {
        adaptableApi: adaptable_Api, 
        model: this.modelSvc.modelMap[this.selectedModelID], 
        asOfDate: this.asOfDate, 
        isAutomatic: this.isAutomatic.value, 
        isLocal: this.isLocal.value,
        isShared: this.modelSvc.modelMap[this.selectedModelID]?.isShared,
        positionIDs: this.selectedPositionIDs,
        aggregationType: this.modelSvc.modelMap[this.selectedModelID]?.aggregationType,
        updatedValues: this.gridUtilSvc.getUpdatedValues(this.gridApi),
        context: context
      },
      maxHeight: '100vh',
      width: '80vw',
      maxWidth: '2000px'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe(res => {
      if(dialogRef.componentInstance?.isSuccess){
        if(this.isAutomatic.value){
          this.selectedPositionIDs = [];
          this.gridApi.forEachNodeAfterFilter(node => 
            {
              if(!!node.data?.positionID)
                this.selectedPositionIDs.push(node.data?.positionID)
            })  
        }
        if(res?.isSuccess){
          this.selectedModelID = dialogRef.componentInstance.modelID
          
          this.fetchPortfolioModels(
            dialogRef.componentInstance.modelID,
            res.context,
            {
              baseMeasure: res?.['baseMeasure'],
              feePreset: res?.['feePreset'],
              irrAggrType: res?.['irrAggrType'],
              curveRateDelta: res?.['curveRateDelta'],
              aggrStr: res?.['aggrStr'],
              mapGroupCols: res?.['mapGroupCols'],
              latestWSOStatic: res?.['latestWSOStatic']
            }
          )
          this.gridUtilSvc.updateLocalFields()
        }
      }
    }))
  }
  runIRRCalc(){
    this.onSavePortfolio('SaveRunIRR');

  }

  onReset(userAction: boolean = false){
    /** Here, we clear all filters applied on the grid, overrides, toggles etc.*/

    adaptable_Api?.filterApi?.clearColumnFilters();
    

    this.selectedDropdownData = [];
    this.selectedPositionIDs = [];

    if(userAction)
      this.isLocal.setValue(false) 
    else
      this.isLocal.setValue(false, {emitEvent: false})

    this.isAutomatic.setValue(false)
    this.localOverrides = null
    this.selectedModelID = null

    if(adaptable_Api){
      adaptable_Api.filterApi.clearColumnFilters();
      this.gridApi.deselectAll();
      if(userAction)
        this.gridUtilSvc.updateGridOverrides('Clear');
    }
  }


  overridenPositionIDs = {}
  fetchOverridesForModel(modelID: number){
    this.subscriptions.push(this.irrCalcService.getLocalOverrides(modelID).subscribe({
      next: overrideInfo => {
        this.localOverrides = overrideInfo
        this.gridUtilSvc.updateGridWithOverrides(overrideInfo, adaptable_Api)        
      },
      error: error => {
        console.error(`Failed to fetch local overrides: ${error}`)
      }
    }))
  }

  /** On portfolio model select, clearing out all exisiting selected positions & applied filters 
 * and apply the ones from the model.
 *  A model is associated to either rules/positionIDs
 *  A model is associated to either having local overrides 
 * 
 * Based on the selected model, fetch its overrides values and apply them onto the grid.
*/

  onPortfolioModelSelect(event){
    this.selectedModelID = event.modelID

    adaptable_Api.filterApi.clearColumnFilters();
    this.gridApi.deselectAll();
    this.selectedPositionIDs = []

    /** On model selection, data will be refetched with overrides, hence we do not want to programmatically set it again, hence emitEvent: false */
    this.isLocal.setValue(this.modelSvc.modelMap[this.selectedModelID].isLocal, {emitEvent: false})

    //emitEvent: true (Default) since we want to switch layouts programmatically. 
    this.isAutomatic.setValue(!this.modelSvc.modelMap[this.selectedModelID].isManual)

    if(this.modelSvc.modelMap[this.selectedModelID].rules){
      adaptable_Api.filterApi.setColumnFilter(this.modelSvc.modelMap[this.selectedModelID].rules)
    }

    this.fetchIRRPostions()
 }

  changeListeners(){
    this.subscriptions.push(this.isAutomatic.valueChanges.subscribe( isAuto => {
      if(isAuto){
        adaptable_Api.layoutApi.setLayout('Automatic')
      }
      else {
        adaptable_Api.layoutApi.setLayout('Manual')
      }
      this.gridApi.onFilterChanged() // On layout change Ag grid is not detecting cleared filters by itself thus we are manually calling this API 
    }))

    this.subscriptions.push(this.isLocal.valueChanges.subscribe(isLocal => {
      
      // Stop editing (i.e. get out of focus on just edited cells, if any)
      this.gridApi.stopEditing();

      this.gridApi.refreshCells({
        force: true,
        suppressFlash: true,
        columns: [ ...Object.keys(this.gridConfigSvc.gridUtilSvc.overrideColMap), 'isOverride'] 
      })
  
      if(!isLocal){
       this.gridUtilSvc.updateGridOverrides('Clear');
       this.gridApi.stopEditing();
      }
      else{
        this.gridUtilSvc.updateGridOverrides('Set')
      }

    }))
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adaptable_Api = adaptableApi;
    this.adapTableApi = adaptableApi
    adaptable_Api.toolPanelApi.closeAdapTableToolPanel();
    adaptable_Api.filterApi.clearColumnFilters();

    this.subscriptions.push(this.irrCalcService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.pipe().subscribe(isHit => {
      if(isHit){
        this.onReset()
        this.fetchIRRPostions();
      }
    }))  

    this.changeListeners()
  }

  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api;
  }
  
  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
    this.irrCalcService.changeSearchDate(null);
  }
}