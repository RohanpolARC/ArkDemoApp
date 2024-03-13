import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableColumn, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module, GridApi, CellValueChangedEvent, RowNode, CellClickedEvent, TabToNextCellParams, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { getMomentDateStr, presistSharedEntities,loadSharedEntities, autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG } from 'src/app/shared/functions/formatter';
import { AMOUNT_COLUMNS_LIST, GRID_OPTIONS, POSITIONS_COLUMN_DEF } from '../positions-screen/grid-structure';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { DetailedView, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { getNodes } from '../capital-activity/utilities/functions';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { ValuationUtility } from './valuation-utilities/valuation-grid-utility';
import { HedgingMarkDetails } from './valuation-utilities/valuation-model';
import { ValuationValidation } from './valuation-utilities/valuation-grid-validation';
import { ValutationAdaptableGridUtility } from './valuation-utilities/adaptable-grid-utility';
import { HedgingMarkService } from './service/hedging-mark.service';
import { AuditFilterComponent } from './audit-filter/audit-filter.component';
import { AfterViewInit } from '@angular/core';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';
import { DetailedViewService } from 'src/app/shared/modules/detailed-view/detailed-view.service';
import { ConfirmPopupComponent } from 'src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import {  IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';

let overrideColMap: {
  [col: string] : {
    type: 'hedgingMark' | 'Mark',
    original: string
  }
} = {
  hedgingMark: { type: 'hedgingMark' ,original: 'originalHedgingMark' },
  markOverride: { type: 'Mark' ,original: 'originalMarkOverride' },
  hedgingMarkLevel: { type: 'hedgingMark' ,original: 'originalHedgingMarkLevel' },
  markOverrideLevel: {  type: 'Mark' ,original: 'originalMarkOverrideLevel' },
  lastHedgingMarkDate: { type: 'hedgingMark' ,original: 'originalLastHedgingMarkDate' },
  lastMarkOverrideDate: { type: 'Mark' ,original: 'originalLastMarkOverrideDate' },
  isOverriden: { type: 'hedgingMark' ,original: 'originalIsOverriden' },
  isOvrdMark: { type: 'Mark' ,original: 'originalIsOvrdMark' }
}

@Component({
  selector: 'app-hedging-mark',
  templateUrl: './hedging-mark.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './hedging-mark.component.scss']
})
export class HedgingMarkComponent extends ValuationUtility implements OnInit, AfterViewInit {

  @ViewChild('filterspace') filterspace: TemplateRef<AuditFilterComponent>

  ngAfterViewInit(){
    this.hedgingMarkSvc.filterspace = this.filterspace
  }

  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  rowData: any = []
  adaptableOptions: AdaptableOptions
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  columnDefs: ColDef[]
  gridApi: GridApi;
  adaptableApi: AdaptableApi;
  asOfDate: string;
  lockEdit: boolean = false;
  oCols: string[];
  isWriteAccess: boolean;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  auditingPositions: number[];

  checkMarkOverride = ValuationValidation.checkMarkOverride
  checkWarningsBefore = ValuationValidation.checkWarningsBefore
  checkWarningsAfter = ValuationValidation.checkWarningsAfter

  constructor(
    private dataSvc: DataService,
    public positionScreenSvc: PositionScreenService,
    private accessService: AccessService,
    private hedgingMarkSvc: HedgingMarkService,
    private detailedVwSvc: DetailedViewService,
    private filterSvc: GeneralFilterService,
    public dialog: MatDialog
  ) { super(overrideColMap) }

  afterGetPositionsData(data: any[]){
    if (data.length === 0) {
      this.noRowsToDisplayMsg = 'No data found for applied filter.'
    }
    this.gridApi?.hideOverlay();
    for (let i: number = 0; i < data?.length; i += 1) {

      let oCols: string[] = Object.keys(this.overrideColMap);

      oCols.forEach(col => {
        if (this.overrideColMap[col].type === 'hedgingMark') {
          if (data[i]['isOverriden'])
            data[i][this.overrideColMap[col].original] = data[i][col]
          else
            data[i][col] = null;
        }
      })

      oCols.forEach(col => {
        if (this.overrideColMap[col].type === 'Mark') {
          if (data[i]['isOvrdMark'])
            data[i][this.overrideColMap[col].original] = data[i][col]
          else
            data[i][col] = null;
        }
      })
    }
    this.rowData = data;
  }

  clearEditingState(hideWarnings: boolean = false) {
    let rowNode: RowNode[] = <RowNode[]>this.adaptableApi.gridApi.getAllRowNodes({ 
      includeGroupRows: true, filterFn: (rowNode: RowNode) => {
        if(rowNode.group){
          return rowNode.groupData['state'] === 'edit'
        }
        else  return rowNode.data['state'] === 'edit'
      }
    }); 

    if(rowNode.length > 1){
      this.dataSvc.setWarningMsg(`Error clearing editing state. Please reload.`, 'Dismiss', 'ark-theme-snackbar-error')
    }
    else if(rowNode.length === 1){
      this.clearRoworRowGroup(rowNode[0]);
    }
    else {
      if(!hideWarnings)
      this.dataSvc.setWarningMsg(`Editing state already cleared`, 'Dismiss', 'ark-theme-snackbar-normal');
    }
  }

  clearRoworRowGroup(node: RowNode){
    this.gridApi.stopEditing(true);

    let childNodes = []
    let oCols: string[] = Object.keys(this.overrideColMap);

    if (node.group) {
      childNodes = getNodes(node);
    }
    else {
      childNodes = getNodes(node.parent);
    }

    childNodes = childNodes.map(cNode => {
      oCols.forEach(col => {
        cNode[col] = cNode[this.overrideColMap[col].original];
      })
      return cNode;
    })

    if (node.group) {
      node.groupData['state'] = ' '
      if (node.data) {
        oCols.forEach(col => { node.data[col] = null })
      }
    }
    else {
      node.data['state'] = ' '
    }

    this.gridApi.applyTransaction({ update: childNodes });
    this.lockEdit = false
    this.gridApi.refreshCells({ force: true })
  }

  getPositionsData() {

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if (isHit) {
        this.clearEditingState(true);
        this.gridApi.stopEditing(true);
        this.lockEdit = false
        this.gridApi.showLoadingOverlay();

        this.positionScreenSvc.currentSearchDate.subscribe(asOfDate => {
          this.asOfDate = asOfDate
        })

        this.positionScreenSvc.getPositions(this.asOfDate).subscribe({
          next: (d) => {
            this.afterGetPositionsData(d)
          },
          error: (e) => {
            console.error(`Failed to get the Positions: ${e}`)
          }
        })
      }
    }))
  }

  ngOnInit(): void {
    this.subscriptions.push(this.filterSvc.filterValueChanges.subscribe((filters: IFilterPaneParams)=>{
      if(filters){
        if(filters[321]){
          this.positionScreenSvc.changeSearchDate(getMomentDateStr(filters[321].value))
        }
      }
    }))

    this.isWriteAccess = false;
    for (let i: number = 0; i < this.accessService.accessibleTabs.length; i += 1) {
      if (this.accessService.accessibleTabs[i].tab === 'Hedging Mark' && this.accessService.accessibleTabs[i].isWrite) {
        this.isWriteAccess = true;
        break;
      }
    }

    this.oCols = Object.keys(this.overrideColMap);

    let positionColDefs: ColDef[] = POSITIONS_COLUMN_DEF.filter(cd => !['cost', 'mark'].includes(cd.field));

    let customColDefs: ColDef[] = [
      { field: 'cost', type: 'abColDefNumber', aggFunc: 'Max', maxWidth: 90 },
      { field: 'mark', type: 'abColDefNumber', aggFunc: 'Max', maxWidth: 90 }
    ]

    this.columnDefs = <AdaptableColumn[]>[
      ...positionColDefs,
      ...customColDefs,
      {
        field: 'markOverride', headerName: 'Mark Ovrd', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefNumber',
        cellStyle: this.editableCellStyle.bind(this), width: 150,
        tooltipValueGetter: this.tooltipValueGetter, aggFunc: 'Max'
      },
      {
        field: 'markOverrideLevel', headerName: 'Mark Ovrd Lvl', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefString',
        cellEditor: 'autocompleteCellEditor', cellStyle: this.levelCellStyle.bind(this),
        cellEditorParams: this.cellEditorParams, aggFunc: 'Max'
      },
      { field: 'lastMarkOverrideDate', headerName: 'Last Mark Ovrd Date', maxWidth: 141, type: 'abColDefDate', aggFunc: 'Max' },
      {
        field: 'hedgingMark', headerName: 'Hedging Mark', type: 'abColDefNumber', editable: this.isEditable.bind(this),
        cellStyle: this.editableCellStyle.bind(this), width: 150,
        tooltipValueGetter: this.tooltipValueGetter, aggFunc: 'Max'
      },
      {
        field: 'hedgingMarkLevel', headerName: 'Hedging Mark Lvl', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefString',
        cellEditor: 'autocompleteCellEditor', cellStyle: this.levelCellStyle.bind(this),
        cellEditorParams: this.cellEditorParams, aggFunc: 'Max'
      },
      {
        field: 'lastHedgingMarkDate', headerName: 'Last Hedging Mark Date', type: 'abColDefDate',
        cellClass: 'dateUK', filter: false, sortable: false, width: 210, aggFunc: 'Max'
      },
      { field: 'isOvrdMark', headerName: 'Is Ovrd', type: 'abColDefBoolean', maxWidth: 100 },
      { field: 'isOverriden', headerName: 'Is Ovrd(Hedging Mark)', type: 'abColDefBoolean', width: 100, filter: false, sortable: false },
      { field: 'modifiedBy', type: 'abColDefString', filter: false, sortable: false },
      {
        field: 'modifiedOn',
        type: 'abColDefDate',
        cellClass: 'dateUK',
        valueGetter: dateNullValueGetter,
        filter: false,
        sortable: false
      },
      { field: 'mark_override', width: 130, headerName: 'Override', type: 'abSpecialColumn', cellClass: 'ag-right-aligned-cell', filter: false, sortable: false }
    ].map(coldef => {
      coldef = coldef as ColDef
      if (coldef.type === 'abColDefNumber') {
        coldef.cellClass = 'ag-right-aligned-cell'
      }
      return coldef
    })


    this.gridOptions = {
      ...GRID_OPTIONS,

      components: {
        autocompleteCellEditor: MatAutocompleteEditorComponent
      },
      stopEditingWhenCellsLoseFocus: false,
      tabToNextCell: (p: TabToNextCellParams) => {
        return null;
      },

      context: {
        componentParent: this
      },
      rowData: this.rowData,
      singleClickEdit: true,
      columnDefs: this.columnDefs,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;
      },
      enableGroupEdit: true,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },

      aggFuncs: {
        'Max': this.maxAggFunc
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'positionId',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'HedgingMark',
      adaptableStateKey: 'Hedging Mark Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      actionOptions: {
        actionColumns: [
          {
            columnId: 'mark_override',
            friendlyName: 'Action',
            includeGroupedRows: true,
            actionColumnSettings: {
              suppressMenu: true,
              suppressMovable: true,
              resizable: true
            },
            actionColumnButton: [
              {
                onClick: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext) => {

                    let pids: number[] = [];

                    let nodes = getNodes(context.rowNode as RowNode);
                    pids = nodes.map(n => n['positionId'])

                    this.hedgingMarkSvc.updateAuditPositions(pids);

                    let m = <DetailedView>{};
                    m.screen = 'Valuation/Hedging Mark';
                      m.param1 = '' //positionId;
                      m.param2 = this.asOfDate; // AsOfDate
                      m.param3 = '';
                      m.param4 = ' ';
                      m.param5 = ' ';
                
                      const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent, {
                        data: {
                          detailedViewRequest: m,
                          grid: 'Audit - Valuation',

                          filterTemplateRef: this.filterspace
                        },
                        width: '90vw',
                        height: '80vh'
                      })
                  },
                icon:{
                    src: '../assets/img/info.svg',
                    style: {
                      height: 25, width: 25
                    }
                },
              },
              {
                onClick: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext) => {
                  if (!this.isWriteAccess) {
                    this.dataSvc.setWarningMsg(`No authorized access`, `Dismiss`, `ark-theme-snackbar-warning`);
                    return
                  }
                  if (this.lockEdit) {
                    this.dataSvc.setWarningMsg(`Please save or discard the existing override`, `Dismiss`, `ark-theme-snackbar-warning`);
                    return
                  }

                  this.hedgingMarkSvc.onAdaptableEditClick(context, this.gridApi);

                  this.lockEdit = true
                },
                hidden: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  if (context.rowNode.group) {

                    let parentGroups: string[] = [];
                    let node: RowNode = <RowNode>context.rowNode;
                    while(node){
                      parentGroups.push(node?.rowGroupColumn?.getColId());
                      node = node.parent
                    }

                    let assetIdx: number = parentGroups.indexOf('asset');
                    let issuerShortNameIdx: number = parentGroups.indexOf('issuerShortName');

                    if(assetIdx >= 0 && issuerShortNameIdx >= 0 && assetIdx < issuerShortNameIdx){
                      return context.rowNode.groupData["state"] === 'edit'
                    }
                    else return true;
                  }
                  return context.rowNode.data['state'] === 'edit'
                },
                tooltip: 'Edit',
                icon: {
                  src: '../assets/img/edit.svg',
                  style: {
                    height: 25,
                    width: 25
                  }
                }
              },
              {
                onClick: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext) => {

                  let node: RowNode = <RowNode>context.rowNode

                  if(node.data?.['hedgingMark'] === ""){

                    const dialogRef = this.dialog.open(ConfirmPopupComponent, {
                      data:{
                        headerText:'Are you sure you want to clear override for this date ?',
                      },
                    })

                    this.subscriptions.push(dialogRef.afterClosed().subscribe((val) => {
                      if(val?.['action'] === 'Confirm'){

                     // Applies the cell editor value to the grid if user hasn't come out of editing state before hitting save
                      this.gridApi.stopEditing();
                      setTimeout(() => {
                        this.saveOverrides(context)
                      }, 200)
                      //We are wrapping entire logic to save overrides into setTimeout because the onCellValueChangeEvent sometime gets delayed 
                      //which causes empty values to get passed in put request 

                      }
                    }))
                  }
                  else if(node.data?.['hedgingMark'] || node.data?.['markOverride']){
                    this.gridApi.stopEditing();
                    setTimeout(() => {
                      this.saveOverrides(context)
                    }, 200)
                  }
                  else if(!node.data?.['hedgingMark'] && !node.data?.['markOverride']){
                    this.dataSvc.setWarningMsg('Cannot save empty values')
                  }
                },
                hidden: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  if (context.rowNode.group) {
                    return (context.rowNode.groupData["state"] === 'edit') ? false : true;

                  }
                  return (context.rowNode.data['state'] === 'edit') ? false : true

                },
                tooltip: 'Save',
                icon: {
                  src: '../assets/img/save_black_24dp.svg',
                  style: {
                    height: 25,
                    width: 25
                  }
                }
              },
              {
                onClick: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext) => {

                  let node: RowNode = <RowNode>context.rowNode;
                  this.clearRoworRowGroup(node);

                },
                hidden: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  if (context.rowNode.group) {
                    return (context.rowNode.groupData["state"] === 'edit') ? false : true;
                  }
                  return (context.rowNode.data['state'] === 'edit') ? false : true
                },
                tooltip: 'Cancel',
                icon: {
                  src: '../assets/img/cancel.svg',
                  style: {
                    height: 25,
                    width: 25
                  }
                }
              },

            ]
          }
        ]
      },

      userInterfaceOptions: {
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', [...AMOUNT_COLUMNS_LIST])
        ],
      },
      predefinedConfig: ValutationAdaptableGridUtility.getPredefinedConfig(this.columnDefs)
    }

  }

  saveOverrides(context: ActionColumnContext) {
    let node: RowNode =<RowNode> context.rowNode


    let hedgingMarkDetails: HedgingMarkDetails = this.hedgingMarkSvc.savePreprocessor(context, this.dataSvc.getCurrentUserName());

    this.subscriptions.push(
      this.positionScreenSvc.updateHedgingMark(hedgingMarkDetails).subscribe({
        next: data => {

          this.hedgingMarkSvc.savePostprocessor(this.gridApi, context, this.overrideColMap, this.dataSvc.getCurrentUserName());

          this.lockEdit = false

          this.dataSvc.setWarningMsg(`Successfully updated overrides`, `Dismiss`, `ark-theme-snackbar-success`)
        },
        error: (error) => {
          this.dataSvc.setWarningMsg(`Failed to update overrides`, `Dismiss`, `ark-theme-snackbar-error`)
          console.error(error)

        }
      })
    )
  }


  onCellValueChanged(params?: CellValueChangedEvent) {

    let colid: string = params.column.getColId();
    let val: string | number = params.data[colid];
    let rows = []
    let lvl: string;

    if(!this.checkWarningsBefore(params, this.asOfDate, this.dataSvc)){
      // Not allowed to continue.
      return;
    };

    if(params.node.group){
      lvl = 'Asset'
    }
    else lvl = 'Position'

    if (colid === 'markOverride' || colid === 'hedgingMark') {

      let dateCol: 'lastMarkOverrideDate' | 'lastHedgingMarkDate';
      let levelCol: 'markOverrideLevel' | 'hedgingMarkLevel';

      if (colid === 'markOverride') {
        dateCol = 'lastMarkOverrideDate';
        levelCol = 'markOverrideLevel';
      }
      else if (colid === 'hedgingMark') {
        dateCol = 'lastHedgingMarkDate';
        levelCol = 'hedgingMarkLevel';
      }

      let childNodes = getNodes(params.node as RowNode)

      childNodes = childNodes.map(cNode => {
        cNode[colid] = val;

        // Only update level if it is not set already.
        if(!cNode[levelCol])
          cNode[levelCol] = lvl;
  
        // Don't set asOfDate to lastDate if value is cleared. Clear the level when clearing the value. 
        if(val === ""){
          cNode[levelCol] = null;
        }
        else{
          cNode[dateCol] = this.asOfDate;
        }
        return cNode;
      })

      if(params.node.group){
        params.node.data[dateCol] = this.asOfDate;
        if(val === ""){
          params.node.data[levelCol] = null;
        }

        // Not setting the level now on the group directly, as it gets cleared when editing and the below line used to set it to asset even if all underlying positions were set to position.

        // else if(!params.node.data[levelCol])
        //   params.node.data[levelCol] = lvl;  
      }

      this.gridApi.applyTransaction({ update: childNodes })
    }
    else if (colid === 'markOverrideLevel' || colid === 'hedgingMarkLevel') {
      lvl = <string>val;
      let childNodes = []
      let parentNode: RowNode;

      if (params.node.group) {
        parentNode = <RowNode>params.node;
        childNodes = getNodes(parentNode)

        childNodes = childNodes.map(cNode => {
          cNode[colid] = lvl
          return cNode;
        })
        this.gridApi.applyTransaction({ update: childNodes })
      }
    }

    this.checkWarningsAfter(params, this.asOfDate, this.dataSvc)
    this.gridApi.refreshClientSideRowModel('aggregate');
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getPositionsData();
    this.adaptableApi.columnApi.autosizeAllColumns()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}