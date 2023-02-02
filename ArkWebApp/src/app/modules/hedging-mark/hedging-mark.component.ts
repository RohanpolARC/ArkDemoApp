import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module, GridApi, CellValueChangedEvent, RowNode, CellClassParams } from '@ag-grid-community/core';
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
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { getNodes } from '../capital-activity/utilities/functions';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';

interface HedgingMarkOverride {
  Id :number,
  Level: 'Asset' | 'Position',
  HedgingMark: number,
  LastHedgingMarkDate: string
}

interface MarkOverride {
  Id: number,
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
    private accessService: AccessService
  ) { }

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

    this.columnDefs = <ColDef[]>[
      ...POSITIONS_COLUMN_DEF,
      { field: 'markOverride', headerName: 'Mark Ovrd', editable: this.isEditable.bind(this), maxWidth: 141, type: 'abColDefNumber',
      cellStyle:this.editableCellStyle.bind(this), width: 150 },
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
        field:'hedgingMark',headerName:'Hedging Mark',type:'abColDefNumber',editable:this.isEditable.bind(this),
        cellStyle:this.editableCellStyle.bind(this),width: 150
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
                      
                      let node :RowNode = context.rowNode

                      if(!node.data?.['hedgingMark'] && node.data?.['hedgingMark'] !== 0 && !node.data?.['markOverride'] && node.data?.['markOverride'] !== 0){
                        this.dataSvc.setWarningMsg(`Empty value cannot be provided`, `Dismiss`, `ark-theme-snackbar-warning`);
                        return
                      }


                      let childNodes = getNodes(node);
                      let hedgingMarkOverrides: HedgingMarkOverride[] = []
                      let markOverrides: MarkOverride[] = []

                      if(node.group){

                        childNodes.forEach(cn => {

                          // Hedging Mark

                          let ovrHM: HedgingMarkOverride = {
                            Id: cn?.['hedgingMarkLevel'] === 'Asset' ?  cn?.['assetId'] : cn['positionId'] as number,
                            Level: cn?.['hedgingMarkLevel'],
                            HedgingMark: cn?.['hedgingMark'],
                            LastHedgingMarkDate: formatDate(cn?.['lastHedgingMarkDate'])
                          }

                          hedgingMarkOverrides.push(ovrHM);

                          // Mark Override

                          let ovrM: MarkOverride = {
                            Id: cn?.['markOverrideLevel'] === 'Asset' ?  cn?.['assetId'] : cn['positionId'] as number,
                            Level: cn?.['markOverrideLevel'],
                            MarkOverride: cn?.['markOverride'],
                            LastMarkOverrideDate: formatDate(cn?.['lastMarkOverrideDate'])
                          }

                          markOverrides.push(ovrM);
                        })
                     }

                     let hedgingMarkDetails: Overrides = {
                        MarkOverrides: markOverrides,
                        HedgingMarkOverrides: hedgingMarkOverrides,
                        ModifiedBy : this.dataSvc.getCurrentUserName()
                      }
                      
                      this.subscriptions.push(
                        this.positionScreenSvc.updateHedgingMark(hedgingMarkDetails).subscribe({
                          next:data=>{


                            let oCols: string[] = Object.keys(this.overrideColMap);


                            let nodes = getNodes(node)
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
                    let childNodes = getNodes(node)
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
          Revision: 46,
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
  onCellValueChanged(params?:CellValueChangedEvent){

    let colid: string = params.column.getColId();
    let val: string | number = params.value;
    let rows = []
    let lvl: string;

    if(colid === 'markOverride' || colid === 'hedgingMark'){

      if(params.node.group){
        lvl = 'Asset'
      }
      else 
        lvl = 'Position'
      
      let childNodes = getNodes(params.node)
      if(colid === 'markOverride'){

        // if(params.node.group){
        //   params.node.groupData['markOverrideLevel'] = lvl
        // }

        childNodes = childNodes.map(cNode => { 
          cNode['markOverride'] = val; 
          cNode['lastMarkOverrideDate'] = this.asOfDate;
          cNode['markOverrideLevel'] = lvl

          return cNode;
        })
        params.node.data['lastMarkOverrideDate'] = this.asOfDate;
      }
      else if(colid === 'hedgingMark'){

        // if(params.node.group){
        //   params.node.groupData['hedgingMarkLevel'] = lvl
        // }

        childNodes = childNodes.map(cNode => {
          cNode['hedgingMark'] = val;
          cNode['lastHedgingMarkDate'] = this.asOfDate;
          cNode['hedgingMarkLevel'] = lvl

          return cNode;
        })
        params.node.data['lastHedgingMarkDate'] = this.asOfDate;
      }

      this.gridApi.applyTransaction({ update:  childNodes})
    }
    else if(colid === 'markOverrideLevel' || colid === 'hedgingMarkLevel'){
      lvl = params.newValue;
      let childNodes = []
      let parentNode: RowNode;

      if(params.node.group){ 
        parentNode = params.node;
      }
      else{
        parentNode = params.node.parent;
      }
      
      childNodes = getNodes(parentNode)
      childNodes = childNodes.map(cNode => { 
        cNode[colid] = lvl
        return cNode;
      })
      this.gridApi.applyTransaction({ update:  childNodes})

    }
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