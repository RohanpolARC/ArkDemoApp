import { ActionColumnContext, AdaptableApi, AdaptableButton, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module, GridApi, CellValueChangedEvent, RowNode, CellClassParams } from '@ag-grid-community/core';
import { Component, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { amountFormatter, AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero, AMOUNT_FORMATTER_CONFIG_Zero, BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG,  DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy, formatDate} from 'src/app/shared/functions/formatter';
import { AMOUNT_COLUMNS_LIST, DATE_COLUMNS_LIST, GRID_OPTIONS,  POSITIONS_COLUMN_DEF } from '../positions-screen/grid-structure';
import { getRowNodes } from 'src/app/shared/functions/utilities';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

interface Override {
  PositionId :number,
  HedgingMark: number,
  LastHedgingMarkDate: string
}

interface HedgingMarkDetails{
  ModifiedBy:string,
  HedgingMarkOverrides:Override[]
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

  overrideMap: {
    [key:string]:{
      localHedgingMark:number,
      globalHedgingMark:number,
      localHedgingMarkDate:string
    }
  } = {}


  
  overrideColMap: {
    [col: string] : {
      local: string, global: string
    }
  } = {
    hedgingMark: { local: 'localHedgingMark', global: 'originalHedgingMark' }
  }
  isWriteAccess: boolean;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  withZeroAmountFormatter(params){
    if(params.value===0){
      return "0"
    }else{
      return amountFormatter(params)
    }
  }



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
              // data[i] = this.getDateFields(data[i], [
              //   'lastHedgingMarkDate','asOfDate'])
                data[i]['originalHedgingMark'] =  data[i]['isOverriden'] ? data[i]['hedgingMark'] : null
                data[i]['hedgingMark'] = data[i]['isOverriden']  ? data[i]['hedgingMark']  :  null 
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
      if(params.value === 0){
        if(params.node.data?.[this.overrideColMap[colid].global]!==params.value){
          style = {...style,'background': '#ffcc00' }
        }else{
          style = { ...style, 'background': '#f79a28' }
        }
      }
      if(params.value !== params.node.data[this.overrideColMap[colid].global]){
        style = { ...style, 'background': '#ffcc00' }
      }
      else if(params.value){
        style = { ...style, 'background': '#f79a28' }
      }
      return style;
    }
  }


  getDateFields(row: any, fields: string[]){
    for(let i = 0; i < fields.length; i+= 1){
      row[fields[i]] = formatDate(row[fields[i]]);
      if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(row[fields[i]]))
        row[fields[i]] = null;
    }

    return row;
  }

  ngOnInit(): void {

    
    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessService.accessibleTabs.length; i+= 1){
      if(this.accessService.accessibleTabs[i].tab === 'Hedging Mark' && this.accessService.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }
    
    this.columnDefs = [
      ...POSITIONS_COLUMN_DEF,
      {
        field:'hedgingMark',headerName:'Hedging Mark',type:'abColDefNumber',editable:this.isEditable.bind(this),valueFormatter:this.withZeroAmountFormatter,
        cellStyle:this.editableCellStyle.bind(this),width: 150
      },
      {field:'lastHedgingMarkDate',headerName:'Last Hedging Mark Date',type:'abColDefDate',
      cellClass:'dateUK',filter:false,sortable:false,width:210
      },
      {field:'isOverriden',type:'abColDefString',width: 100,filter:false,sortable:false},
      
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
      autogeneratePrimaryKey: true,
      primaryKey: '',
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
                    context.adaptableApi.gridApi.refreshCells([node],['mark_override','hedgingMark','lastHedgingMarkDate'])

                    this.gridApi.startEditingCell({
                      rowIndex:context.rowNode.rowIndex,
                      colKey: "hedgingMark"
                    })
                    this.lockEdit = true

                },
                hidden:(
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                )=>{
                  if(context.rowNode.group){
                    return context.rowNode.groupData["state"]==='edit'

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
                      let hedgingMarkOverrides: Override[] = []
                      if(!context.rowNode.data?.hedgingMark && context.rowNode.data?.hedgingMark !== 0){
                        this.dataSvc.setWarningMsg(`Empty value can not be provided for hedging mark`, `Dismiss`, `ark-theme-snackbar-warning`);
                        return 
                      }
                      let childNodes = getRowNodes(node);
                      childNodes.forEach(childNode=>{
                        let override:Override ={
                        PositionId : (childNode.data.positionId as number),
                        HedgingMark : (childNode.data.hedgingMark as number),
                        LastHedgingMarkDate : (formatDate(childNode.data.lastHedgingMarkDate) as string)
                        }
                        hedgingMarkOverrides.push(override)

                      })

                      let hedgingMarkDetails:HedgingMarkDetails = {

                        HedgingMarkOverrides: hedgingMarkOverrides,
                        ModifiedBy : this.dataSvc.getCurrentUserName()
                      }
                      this.subscriptions.push(
                        this.positionScreenSvc.updateHedgingMark(hedgingMarkDetails).subscribe({
                          next:data=>{
                            let nodes = getRowNodes(node)
                            nodes.forEach(childNode=>{
                              let row = childNode
                              row.data['isOverriden'] = true
                              row.data['originalHedgingMark'] = row.data['hedgingMark']
                              row.data['modifiedBy'] = this.dataSvc.getCurrentUserName()
                              row.data['modifiedOn'] = new Date()
                              
                            })
                            if(node.group){
                              context.rowNode.groupData['state'] = ' '
                              context.rowNode.data['hedgingMark'] = null
                              context.rowNode.data['lastHedgingMarkDate'] = null
                              nodes.push(context.rowNode)
                            }else{
                            let node = context.rowNode
                            node.data['state'] = ' '
                            }
                            context.adaptableApi.gridApi.refreshCells(nodes,['mark_override','lastHedgingMarkDate','hedgingMark','modifiedOn','modifiedBy','isOverriden','originalHedgingMark'])
                            this.lockEdit = false

                            this.dataSvc.setWarningMsg(`Successfully updated hedging mark overrides`, `Dismiss`, `ark-theme-snackbar-success`)
                          },
                          error:(error)=>{
                            this.dataSvc.setWarningMsg(`Failed to update hedging mark`, `Dismiss`, `ark-theme-snackbar-error`)
                            console.error(error)
                            this.lockEdit = false

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
                    let rowNodes = getRowNodes(context.rowNode)
                      rowNodes.forEach(childNode=>{
                          childNode.data['hedgingMark'] = childNode.data['originalHedgingMark']
                          childNode.data['lastHedgingMarkDate'] = childNode.data['isOverriden']?this.asOfDate:null
                      })
                    if(context.rowNode.group){
                      context.rowNode.groupData['state'] = ' '
                      if(context.rowNode.data){
                        context.rowNode.data['hedgingMark'] = null
                        context.rowNode.data['lastHedgingMarkDate'] = null
                      }
                        rowNodes.push(context.rowNode)
                      }else{
                      context.rowNode.data['state'] = ' '
                    }
                    context.adaptableApi.gridApi.refreshCells(rowNodes,['mark_override','hedgingMark','lastHedgingMarkDate','isOverriden'])
                    this.lockEdit = false
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
          Revision: 43,
          Layouts: [{
            Name: 'Hedging Mark Override Layout',
            Columns: this.columnDefs.map(def => def.field),
            PinnedColumnsMap: {
              cost:'right',
              mark:'right',
              hedgingMark: 'right',
              isOverriden:'right',
              lastHedgingMarkDate:'right',
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
          Revision:8,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG([...DATE_COLUMNS_LIST,'lastHedgingMarkDate','modifiedOn']),
            DATE_FORMATTER_CONFIG_ddMMyyyy([...DATE_COLUMNS_LIST,'lastHedgingMarkDate']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn']),

            
            AMOUNT_FORMATTER_CONFIG_DECIMAL_Non_Zero(AMOUNT_COLUMNS_LIST,2,['amountFormatter']),
            AMOUNT_FORMATTER_CONFIG_Zero(AMOUNT_COLUMNS_LIST,2,['amountFormatter']),
            
          ]
        }
      }
    }

  }
  onCellValueChanged(params?:CellValueChangedEvent){

    let rows = []
    if(params.node.group){
      let childNodes = getRowNodes(params.node)
      childNodes.forEach(childNode=>{
        if(params.data?.['hedgingMark'] || params.data?.['hedgingMark']===0){
          childNode.data['hedgingMark'] = params.data['hedgingMark']
        }
          //childNode.data['lastHedgingMarkDate'] =  formatDate(this.asOfDate)
          childNode.data['lastHedgingMarkDate'] =  this.asOfDate


      })
      params.node.data['lastHedgingMarkDate'] =  this.asOfDate
      rows = [...childNodes,params.node]

    }else{
      let colid = params.column.getColId()
      if(colid ==='hedgingMark'){
          params.node.data['lastHedgingMarkDate'] =  this.asOfDate
      }

      rows = [params.node]
    }

    this.adaptableApi.gridApi.refreshCells(rows,['mark_override','lastHedgingMarkDate','hedgingMark','isOverriden'])
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
