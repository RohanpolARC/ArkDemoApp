import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableColumn, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module, GridApi, CellValueChangedEvent, RowNode, CellClassParams, CellClickedEvent, ITooltipParams, IAggFuncParams } from '@ag-grid-community/core';
import { Component, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG,  DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy, formatDate} from 'src/app/shared/functions/formatter';
import { AMOUNT_COLUMNS_LIST, DATE_COLUMNS_LIST, GRID_OPTIONS,  POSITIONS_COLUMN_DEF } from '../positions-screen/grid-structure';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { DetailedView, NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { getNodes } from '../capital-activity/utilities/functions';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { DetailedViewComponent } from 'src/app/shared/components/detailed-view/detailed-view.component';

interface HedgingMarkOverride {
  AssetId :number,
  PositionId: number,
  Level: 'Asset' | 'Position',
  HedgingMark: number,
  LastHedgingMarkDate: string
}

interface MarkOverride {
  AssetId: number,
  PositionId: number,
  Level: 'Asset' | 'Position',
  MarkOverride: number,
  LastMarkOverrideDate: string
}

interface Overrides{
  ModifiedBy: string,
  HedgingMarkOverrides: HedgingMarkOverride[],
  MarkOverrides: MarkOverride[]
}

@Component({
  selector: 'app-hedging-mark',
  templateUrl: './hedging-mark.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./hedging-mark.component.scss']
})
export class HedgingMarkComponent implements OnInit {

  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  rowData:any = []
  adaptableOptions: AdaptableOptions
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  columnDefs: ColDef[]
  gridApi: GridApi;
  adaptableApi: AdaptableApi;
  asOfDate: string;

  lockEdit: boolean = false;
  
  overrideColMap: {
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

  oCols: string[];
  isWriteAccess: boolean;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  constructor(
    private dataSvc: DataService,
    public positionScreenSvc: PositionScreenService,
    private accessService: AccessService,
    public dialog: MatDialog
  ) { }

  maxAggFunc(p: IAggFuncParams){
    if(p.rowNode.field === 'asset'){

      let colid: string = p.column.getColId();
      if(['cost', 'mark'].includes(colid)){

        let uniqueVals = [...new Set(p.values)]

        if(uniqueVals.length === 1)
          return uniqueVals[0];
        else return null;
      }
    }
  }

  getPositionsData(){
    
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.lockEdit = false
        this.gridApi.showLoadingOverlay();

        this.positionScreenSvc.currentSearchDate.subscribe(asOfDate => {
          this.asOfDate = asOfDate
        })
    
        this.positionScreenSvc.getPositions(this.asOfDate).subscribe({
          next: (data) => {
            if(data.length === 0 ){
              this.noRowsToDisplayMsg = 'No data found for applied filter.'
            }
            this.gridApi?.hideOverlay();
            for(let i: number = 0; i < data?.length; i+= 1){

              let oCols: string[] = Object.keys(this.overrideColMap);

              oCols.forEach(col => {
                if(this.overrideColMap[col].type === 'hedgingMark'){
                  if(data[i]['isOverriden'])
                    data[i][this.overrideColMap[col].original] = data[i][col]
                  else 
                    data[i][col] = null;
                }
              })

              oCols.forEach(col => {
                if(this.overrideColMap[col].type === 'Mark'){
                  if(data[i]['isOvrdMark'])
                    data[i][this.overrideColMap[col].original] = data[i][col]
                  else 
                    data[i][col] = null;
                }
              })


            }  
            
            this.rowData = data;

          },
          error: (e) => {
            console.error(`Failed to get the Positions: ${e}`)
          }
        })
    
      }
    }))
  }

  isEditable = (params:CellClassParams)=>{
    if(params.node.group && params.node.groupData['state']==='edit'){
      return true
    }
    if(params.data?.state==='edit'){
      return true
    }else{
      return false
    }
  }


  editableCellStyle = (params: CellClassParams) => {

    let value = params.value;

    // Since we are updating all original values to null if not present. undefined can cause mismatch issues.
    if(value === undefined)
      value = null;

    if(params.node.group){
      if(params.node.groupData?.['state'] === 'edit'){
        return {
          'border-color': '#0590ca'
        }
      }
      else return null;
    }
    else {

      let colid = params.column.getColId();
      let style = {};

      if(params.data?.['state'] === 'edit'){
        style = { 'border-color': '#0590ca' }
      }
      if(value === 0){
        if(params.node.data?.[this.overrideColMap[colid].original]!== value){
          style = {...style,'background': '#ffcc00' }
        }else{
          style = { ...style, 'background': '#f79a28' }
        }
      }
      if(value != params.node.data[this.overrideColMap[colid].original]){
        style = { ...style, 'background': '#ffcc00' }
      }
      else if(value){
        style = { ...style, 'background': '#f79a28' }
      }
      return style;
    }
  }

  ngOnInit(): void {

    
    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessService.accessibleTabs.length; i+= 1){
      if(this.accessService.accessibleTabs[i].tab === 'Hedging Mark' && this.accessService.accessibleTabs[i].isWrite){
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
      { field: 'markOverride', headerName: 'Mark Ovrd', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefNumber',
        cellStyle:this.editableCellStyle.bind(this), width: 150, onCellClicked: this.onOverrideCellClicked.bind(this),
        tooltipValueGetter: (p: ITooltipParams) => {
          if(!p.node.group && p.data['state'] !== 'edit')
            return "Mark Override Audit"
          else return null;
        }
      },
      { field: 'markOverrideLevel', headerName: 'Mark Ovrd Lvl', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefString', 
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: (params) => {
          return {
            options: params.node.group ? ['Position', 'Asset'] : ['Position'],
            isStrict: true,
            oldValRestoreOnStrict: true
          }
        }
      },
      { field: 'lastMarkOverrideDate', headerName: 'Last Mark Ovrd Date', maxWidth: 141, type: 'abColDefDate'},
      {
        field:'hedgingMark', headerName:'Hedging Mark',type:'abColDefNumber',editable:this.isEditable.bind(this),
        cellStyle:this.editableCellStyle.bind(this), width: 150, onCellClicked: this.onOverrideCellClicked.bind(this),
        tooltipValueGetter: (p: ITooltipParams) => {
          if(!p.node.group && p.data['state'] !== 'edit')
            return "Hedging Mark Audit"
          else return null;
        } 
      },
      { field: 'hedgingMarkLevel', headerName: 'Hedging Mark Lvl', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefString',
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: (params) => {
          return {
            options: params.node.group ? ['Position', 'Asset'] : ['Position'],
            isStrict: true,
            oldValRestoreOnStrict: true
          } 
        }
      },
      {field:'lastHedgingMarkDate',headerName:'Last Hedging Mark Date',type:'abColDefDate',
      cellClass:'dateUK',filter:false,sortable:false,width:210
      },
      {field:'isOverriden', headerName: 'Is Ovrd(Hedging Mark)',type:'abColDefBoolean',width: 100,filter:false,sortable:false},
      {field: 'isOvrdMark', headerName: 'Is Ovrd', tpe: 'abColDefBoolean', maxWidth: 100 },
      {field:'modifiedBy',type:'abColDefString',filter:false,sortable:false},
      {field:'modifiedOn',
      type:'abColDefDate',
      cellClass:'dateUK',
      valueGetter:dateNullValueGetter,
      filter:false,
      sortable:false},
      { field: 'mark_override', width: 130, headerName: 'Override', type: 'abSpecialColumn',cellClass:'ag-right-aligned-cell' ,filter:false,sortable:false}
    ].map(coldef=>{
      coldef = coldef as ColDef
      if(coldef.type==='abColDefNumber'){
        coldef.cellClass = 'ag-right-aligned-cell'
      }
      return coldef
    })


    this.gridOptions = {
      
      ...GRID_OPTIONS,
      
      components: {
        autocompleteCellEditor: MatAutocompleteEditorComponent
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
      noRowsOverlayComponent:NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },

      aggFuncs:  {
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
      
      actionOptions:{
        actionColumns:[
          {
            columnId:'mark_override',
            friendlyName: 'Action',
            includeGroupedRows: true,
            actionColumnSettings: {
              suppressMenu: true,
              suppressMovable: true,
              resizable: true
            },
            actionColumnButton:[
              {
                onClick:(
                  button: AdaptableButton<ActionColumnContext>, 
                  context:ActionColumnContext)=> {
                    if(!this.isWriteAccess){
                      this.dataSvc.setWarningMsg(`No authorized access`, `Dismiss`, `ark-theme-snackbar-warning`);
                      return       
                    }
                    if(this.lockEdit){
                      this.dataSvc.setWarningMsg(`Please save or discard the existing override`, `Dismiss`, `ark-theme-snackbar-warning`);
                      return 
                    }
                    let node = context.rowNode
                    if(node.group){
                      context.rowNode.groupData["state"] = 'edit'
                    }
                    else{
                      node.data['state'] = 'edit'
                    }

                    this.gridApi.startEditingCell({
                      rowIndex: node.rowIndex,
                      colKey: "hedgingMark"
                    })

                    this.gridApi.startEditingCell({
                      rowIndex: node.rowIndex,
                      colKey: 'markOverride'
                    })

                    context.adaptableApi.gridApi.refreshCells([node],['mark_override','hedgingMark','lastHedgingMarkDate', 'markOverride', 'lastMarkOverrideDate', 'hedgingMarkLevel', 'markOverrideLevel'])

                    this.lockEdit = true
                },
                hidden:(
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                )=>{
                  if(context.rowNode.group){
                    if(context.rowNode.rowGroupColumn.getColId() === 'asset')
                      return context.rowNode.groupData["state"]==='edit'
                    else return true;
                  }
                  return context.rowNode.data['state']==='edit'
                },
                tooltip:'Edit',
                icon:{
                  src:'../assets/img/edit.svg',
                  style:{
                    height:25,
                    width:25
                  }
                }
              },
              {
                onClick:(
                  button: AdaptableButton<ActionColumnContext>, 
                  context:ActionColumnContext)=> {

                    // Applies the cell editor value to the grid if user hasn't come out of editing state before hitting save
                      this.gridApi.stopEditing();
                      setTimeout(() => {
                        this.saveOverrides(context)  
                      }, 200)  
                      //We are wrapping entire logic to save overrides into setTimeout because the onCellValueChangeEvent sometime gets delayed 
                      //which causes empty values to get passed in put request 


                },
                hidden:(
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                )=>{
                  if(context.rowNode.group){
                    return (context.rowNode.groupData["state"]==='edit')?false:true;

                  }
                  return (context.rowNode.data['state']==='edit')?false:true

                },
                tooltip:'Save',
                icon:{
                  src:'../assets/img/save_black_24dp.svg',
                  style:{
                    height:25,
                    width:25
                  }
                }
              },
              {
                onClick:(
                  button: AdaptableButton<ActionColumnContext>, 
                  context:ActionColumnContext)=> {

                    let node: RowNode = context.rowNode;
                    let oCols: string[] = Object.keys(this.overrideColMap);
                    let childNodes
                    if(node.group){
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

                    if(node.group){
                        node.groupData['state'] = ' '
                        if(node.data){
                          oCols.forEach(col => { node.data[col] = null })
                        }
                    }
                    else{
                      node.data['state'] = ' '
                    }

                    this.gridApi.applyTransaction({ update: childNodes});
                    this.lockEdit = false
                    this.gridApi.refreshCells({ force: true})
                },
                hidden:(
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                )=>{
                  if(context.rowNode.group){
                    return (context.rowNode.groupData["state"]==='edit')?false:true;
                  }
                  return (context.rowNode.data['state']==='edit')?false:true
                },
                tooltip:'Cancel',
                icon:{
                  src:'../assets/img/cancel.svg',
                  style:{
                    height:25,
                    width:25
                  }
                }
              },

            ]
          }
        ]
      },

      userInterfaceOptions:{
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...AMOUNT_COLUMNS_LIST])
          ],
      },
      predefinedConfig: {
        Dashboard: {
          Revision:9,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout:{
          CurrentLayout: 'Hedging Mark Override Layout',
          Revision: 49,
          Layouts: [{
            Name: 'Hedging Mark Override Layout',
            Columns: this.columnDefs.map(def => def.field),
            PinnedColumnsMap: {
              cost:'right',
              mark:'right',
              markOverride: 'right',
              markOverrideLevel: 'right',
              lastMarkOverrideDate: 'right',
              hedgingMark: 'right',
              hedgingMarkLevel: 'right',
              lastHedgingMarkDate: 'right',
              isOverriden:'right',
              isOvrdMark: 'right',
              mark_override:'right'

            },
            RowGroupedColumns:['issuerShortName','asset'],
            AggregationColumns: {
              cost: true, mark: true
            },
            SuppressAggFuncInHeader: true,
            ColumnFilters: [{
              ColumnId: 'status',
              Predicate: {
                PredicateId: 'Values',
                Inputs: ['Open']
              }
            },{
              ColumnId:'isFinancing',
              Predicate:{
                PredicateId: 'Values',
                Inputs:['false']
              }
            }]
          }]
          
        },
        FormatColumn:{
          Revision: 9,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG([...DATE_COLUMNS_LIST,'lastHedgingMarkDate','modifiedOn', 'lastMarkOverrideDate']),
            DATE_FORMATTER_CONFIG_ddMMyyyy([...DATE_COLUMNS_LIST,'lastHedgingMarkDate','lastMarkOverrideDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn']),

            
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(AMOUNT_COLUMNS_LIST,2,['amountFormatter']),
            AMOUNT_FORMATTER_CONFIG_Zero(AMOUNT_COLUMNS_LIST,2,['amountFormatter']),
            
          ]
        }
      }
    }

  }

  saveOverrides(context: ActionColumnContext) {
    let node :RowNode = context.rowNode

    if(!node.data?.['hedgingMark'] && node.data?.['hedgingMark'] !== 0 && !node.data?.['markOverride'] && node.data?.['markOverride'] !== 0){
      this.dataSvc.setWarningMsg(`Empty value cannot be provided`, `Dismiss`, `ark-theme-snackbar-warning`);
      return
    }
    else{
      this.dataSvc.setWarningMsg(`Please wait while we save your changes`, `Dismiss`, `ark-theme-snackbar-normal`)
    }

    let childNodes;
    let hedgingMarkOverrides: HedgingMarkOverride[] = []
    let markOverrides: MarkOverride[] = []
    let hedgingMarkDetails: Overrides
    
    if(node.group){

          childNodes = getNodes(node);
          childNodes.forEach(cn => {

            // Hedging Mark

            let lastHedgingMarkDate: string = formatDate(cn?.['lastHedgingMarkDate']);
            let ovrHM: HedgingMarkOverride = {
              PositionId: cn['positionId'] as number,
              AssetId: cn['assetId'] as number,
              Level: cn?.['hedgingMarkLevel'],
              HedgingMark: cn?.['hedgingMark'],
              LastHedgingMarkDate: lastHedgingMarkDate === 'NaN/NaN/NaN' ? null : lastHedgingMarkDate
            }

            hedgingMarkOverrides.push(ovrHM);

            // Mark Override

            let lastMarkOverrideDate: string = formatDate(cn?.['lastMarkOverrideDate']);
            let ovrM: MarkOverride = {
              PositionId: cn['positionId'] as number,
              AssetId: cn['assetId'] as number,
              Level: cn?.['markOverrideLevel'],
              MarkOverride: cn?.['markOverride'],
              LastMarkOverrideDate: lastMarkOverrideDate === 'NaN/NaN/NaN' ? null : lastMarkOverrideDate
            }

            markOverrides.push(ovrM);
          })

    }
    else {

      // Hedging Mark
      if(node.data?.['hedgingMarkLevel'] === 'Position'){

        let parent = node.parent;
        childNodes = getNodes(parent);

        let positionLevelNodes = childNodes.filter(n => n['hedgingMarkLevel'] === 'Position')

        positionLevelNodes.forEach(cn => {

          let lastHedgingMarkDate: string = formatDate(cn?.['lastHedgingMarkDate']);
          let ovrHM: HedgingMarkOverride = {
            PositionId: cn['positionId'] as number,
            AssetId: cn['assetId'] as number,

            Level: "Position",
            HedgingMark: cn['hedgingMark'],
            LastHedgingMarkDate: lastHedgingMarkDate === 'NaN/NaN/NaN' ? null : lastHedgingMarkDate
          }

          hedgingMarkOverrides.push(ovrHM);
        })

      }
      
      // Mark override
      if(node.data?.['markOverrideLevel'] === 'Position'){

        let parent = node.parent;
        childNodes = getNodes(parent);

        let positionLevelNodes = childNodes.filter(cn => cn['markOverrideLevel'] === 'Position')

        positionLevelNodes.forEach(cn => {

          let lastMarkOverrideDate: string = formatDate(cn?.['lastMarkOverrideDate']);
          let ovrM: MarkOverride = {
            PositionId: cn['positionId'] as number,
            AssetId: cn['assetId'] as number,
            Level: "Position",
            MarkOverride: cn['markOverride'],
            LastMarkOverrideDate: lastMarkOverrideDate === 'NaN/NaN/NaN' ? null : lastMarkOverrideDate
          }

          markOverrides.push(ovrM);
        })

      }
    }

    hedgingMarkDetails = {
      MarkOverrides: markOverrides,
      HedgingMarkOverrides: hedgingMarkOverrides,
      ModifiedBy : this.dataSvc.getCurrentUserName()
    }
    this.subscriptions.push(
      this.positionScreenSvc.updateHedgingMark(hedgingMarkDetails).subscribe({
        next:data=>{


          let oCols: string[] = Object.keys(this.overrideColMap);


          let parent: RowNode;
          if(node.group){
            parent = node;
          }
          else{
            parent = node.parent;
          }

          let nodes = getNodes(parent)
          nodes = nodes.map(n => {
            n['isOverriden'] = n['hedgingMark'] ? true : false;
            n['isOvrdMark'] = n['markOverride'] ? true : false; 
            n['modifiedBy'] = this.dataSvc.getCurrentUserName();
            n['modifiedOn'] = new Date();

            oCols.forEach(col => {
              n[this.overrideColMap[col].original] = n[col];
            })

            return n;
          })

          if(node.group){
            node.groupData['state'] = ' '
            node.data['hedgingMark'] = node.data['lastHedgingMarkDate'] = node.data['lastMarkOverrideDate'] = node.data['markOverride'] = node.data['hedgingMarkLevel'] = node.data['markOverrideLevel'] = null; 
          }
          else{
            node.data['state'] = ' '
          }

          this.gridApi.applyTransaction({ update: nodes })

          this.gridApi.refreshCells({
            force: true,
            // columns: this.oCols
          })
          this.lockEdit = false

          this.dataSvc.setWarningMsg(`Successfully updated overrides`, `Dismiss`, `ark-theme-snackbar-success`)
        },
        error:(error)=>{
          this.dataSvc.setWarningMsg(`Failed to update overrides`, `Dismiss`, `ark-theme-snackbar-error`)
          console.error(error)

        }
      })
    )
  }

  checkMarkOverride(row: any[], tolerancePercent: number = 5): boolean{
    
    const MO: string = 'markOverride';

    let markOverride: number = row[MO] ?? 0, mark: number = row['mark'] ?? 0;
    let diffRate: number = Math.abs(((markOverride - mark) * 100)/mark);
    if(diffRate > 5){
      this.dataSvc.setWarningMsg(`Mark Override varying by 5% as compared to mark`)
      return true;
    }
    return false;
  }

  checkWarningsBefore(params: CellValueChangedEvent){

    let colid: string = params.column.getColId();
    let val = params.value;
    let node: RowNode = params.node;
    let parent: RowNode = node.group ? node : node.parent;
    
    let childNodes: any[] = getNodes(parent);

    let asOfDate: string = formatDate(new Date(this.asOfDate));

    if(node.group){
      if((colid === 'markOverrideLevel' && val === 'Asset') || (colid === 'markOverride')){

        let cntPosition: number  = childNodes.filter(cN => {
          return cN['markOverrideLevel'] === 'Position' && formatDate(cN['lastMarkOverrideDate']) === asOfDate
        }).length;
        
        if(cntPosition >= 1){
          this.dataSvc.setWarningMsg(`Warning: Once marked at position level, cannot be changed to asset level`);
        }
      }
    }
  }


  checkWarningsAfter(params: CellValueChangedEvent){

    let colid: string = params.column.getColId();
    let val = params.value;

    let node: RowNode = params.node;
    let parent: RowNode = node.group ? node : node.parent;
    
    let childNodes: any[] = getNodes(parent);

    if(colid === 'markOverride'){
      if(node.group){
        for(let i: number = 0; i < childNodes.length; i += 1){
          if(this.checkMarkOverride(childNodes[i])){
            break;
          }
        }
      }
      else{
        this.checkMarkOverride(params.data);
      }
    }
    else if(colid === 'markOverrideLevel'){

      if(node.group){
        if(val === 'Position')
          this.dataSvc.setWarningMsg(`Each position needs to be marked`);
      }
      else{
        let positionCnt: number = childNodes.filter(cN => cN?.['markOverrideLevel'] === 'Position').length;
    
        // This check happens after all the row levels has been updated to Position from Asset.
        if(positionCnt === childNodes.length && params.oldValue === 'Asset'){
          this.dataSvc.setWarningMsg(`Each position needs to be marked`);
        }
      }
    }
  }

  onCellValueChanged(params?:CellValueChangedEvent){

    let colid: string = params.column.getColId();
    let val: string | number = params.value;
    let rows = []
    let lvl: string;

    this.checkWarningsBefore(params);


    if(colid === 'markOverride' || colid === 'hedgingMark'){

      // setTimeout(() => {
      //   this.checkWarnings(params);
      // }, 0)


      if(params.node.group){
        lvl = 'Asset'
      }
      else 
        lvl = 'Position'
      
      let dateCol: 'lastMarkOverrideDate' | 'lastHedgingMarkDate';
      let levelCol: 'markOverrideLevel' | 'hedgingMarkLevel';

      
      if(colid === 'markOverride'){
        dateCol = 'lastMarkOverrideDate';
        levelCol = 'markOverrideLevel';
      }
      else if(colid === 'hedgingMark'){
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

      // When leaf node is updated, lvl will be updated for corresponding level column. But it won't directly flow to all sibling nodes
      if(lvl === 'Position'){
        if(colid === 'markOverride')
          this.updateAllSiblingsLevelToPosition(params.node, 'markOverrideLevel')
        else if(colid === 'hedgingMark')
          this.updateAllSiblingsLevelToPosition(params.node, 'hedgingMarkLevel')
      }

      this.gridApi.applyTransaction({ update:  childNodes})
    }
    else if(colid === 'markOverrideLevel' || colid === 'hedgingMarkLevel'){
      lvl = params.newValue;
      let childNodes = []
      let parentNode: RowNode;



      // setTimeout(() => {
      //   this.checkWarnings(params);
      // }, 0)

      if(params.node.group){ 


        parentNode = params.node;
        childNodes = getNodes(parentNode)

        childNodes = childNodes.map(cNode => { 
          cNode[colid] = lvl
          return cNode;
        })
        this.gridApi.applyTransaction({ update:  childNodes})

      }
      else{
      this.updateAllSiblingsLevelToPosition(params.node, colid);

      }
    }

    this.checkWarningsAfter(params)
  }

  onOverrideCellClicked(p: CellClickedEvent){
    if(!p.node.group && p.data['state'] !== 'edit'){

      let m = <DetailedView>{};
      m.screen = 'Valuation/Hedging Mark';
      m.param1 = String(p.data?.['positionId']) //positionId;
      m.param2 = this.asOfDate; // AsOfDate
      m.param3 = p.column.getColId();
      m.param4 = ' ';
      m.param5 = ' ';

      this.dialog.open(DetailedViewComponent,{
        data: {
          detailedViewRequest: m
        },
        width: '90vw',
        height: '80vh'
      })
    } 
  }
  

  updateAllSiblingsLevelToPosition(node: RowNode, colid: 'markOverrideLevel' | 'hedgingMarkLevel'){

    let parentNode: RowNode = node.parent;
    let childNodes = getNodes(parentNode);
    let lvl: string;
    
    if(node.group)
      lvl = 'Asset'
    else lvl = 'Position'

    let cntAssetLevel: number = childNodes.filter(cn => cn?.[colid] === 'Asset').length;
    let cntPositionLevel: number = childNodes.filter(cn => cn?.[colid] === 'Position').length;

    if((cntPositionLevel + cntAssetLevel === childNodes.length) && (cntPositionLevel === 1 && lvl === 'Position')){
    }
    else {
      return;
    }
    
    childNodes = childNodes.map(cNode => {
      cNode[colid] = lvl;
      return cNode;
    })

    this.gridApi.applyTransaction({ update: childNodes })
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getPositionsData();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>sub.unsubscribe());
  }
}