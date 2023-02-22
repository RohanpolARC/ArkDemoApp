import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableColumn, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module, GridApi, CellValueChangedEvent, RowNode, CellClickedEvent, TabToNextCellParams } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { CUSTOM_DISPLAY_FORMATTERS_CONFIG } from 'src/app/shared/functions/formatter';
import { AMOUNT_COLUMNS_LIST, GRID_OPTIONS, POSITIONS_COLUMN_DEF } from '../positions-screen/grid-structure';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { getNodes } from '../capital-activity/utilities/functions';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { ValuationUtility } from './valuation-utilities/valuation-grid-utility';
import { HedgingMarkDetails } from './valuation-utilities/valuation-model';
import { ValuationValidation } from './valuation-utilities/valuation-grid-validation';
import { ValutationAdaptableGridUtility } from './valuation-utilities/adaptable-grid-utility';
import { HedgingMarkService } from './service/hedging-mark.service';

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
export class HedgingMarkComponent extends ValuationUtility implements OnInit {

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

  checkMarkOverride = ValuationValidation.checkMarkOverride
  checkWarningsBefore = ValuationValidation.checkWarningsBefore
  checkWarningsAfter = ValuationValidation.checkWarningsAfter

  constructor(
    private dataSvc: DataService,
    public positionScreenSvc: PositionScreenService,
    private accessService: AccessService,
    private hedgingMarkSvc: HedgingMarkService,
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

  getPositionsData() {

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if (isHit) {
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

  onOverrideCellClick(p: CellClickedEvent){
    this.onOverrideCellClicked(p, this.asOfDate, this.dialog)
  }

  ngOnInit(): void {

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
      { field: 'cost', type: 'abColDefNumber', aggFunc: 'Max' },
      { field: 'mark', type: 'abColDefNumber', aggFunc: 'Max' }
    ]

    this.columnDefs = <AdaptableColumn[]>[
      ...positionColDefs,
      ...customColDefs,
      {
        field: 'markOverride', headerName: 'Mark Ovrd', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefNumber',
        cellStyle: this.editableCellStyle.bind(this), width: 150, onCellClicked: this.onOverrideCellClick.bind(this),
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
        cellStyle: this.editableCellStyle.bind(this), width: 150, onCellClicked: this.onOverrideCellClick.bind(this),
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
      { field: 'isOverriden', headerName: 'Is Ovrd(Hedging Mark)', type: 'abColDefBoolean', width: 100, filter: false, sortable: false },
      { field: 'isOvrdMark', headerName: 'Is Ovrd', tpe: 'abColDefBoolean', maxWidth: 100 },
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
      }
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'positionId',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'HedgingMark',
      adaptableStateKey: 'Hedging Mark Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
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
                    if (context.rowNode?.rowGroupColumn?.getColId() === 'asset' && context.rowNode?.parent?.rowGroupColumn?.getColId() === 'issuerShortName')
                      return context.rowNode.groupData["state"] === 'edit'
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

                  let node: RowNode = context.rowNode

                  if (!node.data?.['hedgingMark'] && node.data?.['hedgingMark'] !== 0 && !node.data?.['markOverride'] && node.data?.['markOverride'] !== 0) {
                    if(node.data?.['hedgingMarkLevel'] === 'Position' || node.data?.['markOverrideLevel'] === 'Position'){

                      let childNodes = getNodes(node);
                      let nonEmptyHMVals = childNodes.map(n => n['hedgingMark']).filter(n => n);
                      let nonEmptyMVals = childNodes.map(n => n['markOverride']).filter(n => n);
                      if(nonEmptyHMVals.length + nonEmptyMVals.length < 1){
                        this.dataSvc.setWarningMsg(`Empty value cannot be provided`, `Dismiss`, `ark-theme-snackbar-warning`);
                        return;  
                      }
                    }
                    else{
                      this.dataSvc.setWarningMsg(`Empty value cannot be provided`, `Dismiss`, `ark-theme-snackbar-warning`);
                      return  
                    }
                  }
                  else {
                    this.dataSvc.setWarningMsg(`Please wait while we save your changes`, `Dismiss`, `ark-theme-snackbar-normal`)
                  }
                
                  // Applies the cell editor value to the grid if user hasn't come out of editing state before hitting save
                  this.gridApi.stopEditing();
                  setTimeout(() => {
                    this.saveOverrides(context)
                  }, 200)
                  //We are wrapping entire logic to save overrides into setTimeout because the onCellValueChangeEvent sometime gets delayed 
                  //which causes empty values to get passed in put request 


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

                  let node: RowNode = context.rowNode;
                  let oCols: string[] = Object.keys(this.overrideColMap);
                  let childNodes
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
    let node: RowNode = context.rowNode


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

    if (colid === 'markOverride' || colid === 'hedgingMark') {

      if (params.node.group) {
        lvl = 'Asset'
      }
      else
        lvl = 'Position'

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

      let childNodes = getNodes(params.node)

      childNodes = childNodes.map(cNode => {
        cNode[colid] = val;
        cNode[dateCol] = this.asOfDate;
        cNode[levelCol] = lvl;

        return cNode;
      })

      params.node.data[dateCol] = this.asOfDate;
      params.node.data[levelCol] = lvl;

      // // When leaf node is updated, lvl will be updated for corresponding level column. But it won't directly flow to all sibling nodes
      // if (lvl === 'Position') {
      //   if (colid === 'markOverride')
      //     this.updateAllSiblingsLevelToPosition(params.node, 'markOverrideLevel', this.gridApi)
      //   else if (colid === 'hedgingMark')
      //     this.updateAllSiblingsLevelToPosition(params.node, 'hedgingMarkLevel', this.gridApi)
      // }

      this.gridApi.applyTransaction({ update: childNodes })
    }
    else if (colid === 'markOverrideLevel' || colid === 'hedgingMarkLevel') {
      lvl = <string>val;
      let childNodes = []
      let parentNode: RowNode;

      if (params.node.group) {
        parentNode = params.node;
        childNodes = getNodes(parentNode)

        childNodes = childNodes.map(cNode => {
          cNode[colid] = lvl
          return cNode;
        })
        this.gridApi.applyTransaction({ update: childNodes })
      }
      // else {
      //   this.updateAllSiblingsLevelToPosition(params.node, colid, this.gridApi);
      // }
    }

    this.checkWarningsAfter(params, this.asOfDate, this.dataSvc)
    this.gridApi.refreshClientSideRowModel('aggregate');
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getPositionsData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}