import { CellClassParams, CellClickedEvent, CellStyleFunc, CellValueChangedEvent, EditableCallbackParams, GridApi, RowNode } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { ComponentReaderService } from '../../service/component-reader.service';
import { OverrideColumnMap, VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { ActionColumnContext, AdaptableApi, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { getNodes } from 'src/app/modules/capital-activity/utilities/functions';
import { PortfolioModellerService } from '../../service/portfolio-modeller.service';
import { ModelUtilService } from '../model/model-util.service';

@Injectable()
export class GridUtilService {

  constructor(private compReaderSvc: ComponentReaderService,
    private portfolioModellerSvc: PortfolioModellerService,
    private modelSvc: ModelUtilService
    ) { }

  // Mapping visible columns against their local and global counterparts.
  overrideColMap: OverrideColumnMap = {
    expectedPrice: { local: 'localExpectedPrice', global: 'globalExpectedPrice' },
    expectedDate: { local: 'localExpectedDate', global: 'globalExpectedDate' },
    positionPercent: { local: 'localPositionPercent', global: 'globalPositionPercent' },
    spreadDiscount: { local: 'localSpreadDiscount', global: 'globalSpreadDiscount' },
    maturityDate: { local: 'localMaturityDate', global: 'globalMaturityDate' },
    benchMarkIndex: { local: 'localBenchMarkIndex', global: 'globalBenchMarkIndex' },
    spread: { local: 'localSpread', global: 'globalSpread' },
    pikMargin: { local: 'localPikMargin', global: 'globalPikMargin' },
    unfundedMargin: { local: 'localUnfundedMargin', global: 'globalUnfundedMargin' },
    floorRate: { local: 'localFloorRate', global: 'globalFloorRate' },
  }

  isEditable = (params: EditableCallbackParams) => {
    return this.compReaderSvc.isLocal().value
  }
  
  editableCellStyle = (params: CellClassParams) => {
    if(params.node.group)
      return null;

    let colID: string = params.column.getColId();
    let row = params.data;
    if(this.compReaderSvc.isLocal().value && Object.keys(this.overrideColMap).includes(colID)){
      if(row[colID] !== row[this.overrideColMap[colID].global]){
        if(row[colID] === row[this.overrideColMap[colID].local])
          // Saved override value
          return {
            borderColor: '#0590ca',
            backgroundColor: '#f79a28'
          }
          // Dirty override value
        else return {                   
          borderColor: '#0590ca',
          backgroundColor: '#ffcc00'
        }
      }
      else
        // No override 
        return { 
          borderColor: '#0590ca'
        }     
    }

    return null;
  }

  onCellValueChanged(params: CellValueChangedEvent){
    /** Updating all the filtered children nodes as Ag/Adaptable isn't doing itself */
    let node: RowNode = <RowNode>params.node, colID: string = params.column.getColId(), colVal = params.data[colID];

    let updates = [];
    if(node.group){
  
      for(let i: number = 0; i < node.allLeafChildren.length; i++){
       let nodeData = node.allLeafChildren[i].data;
       nodeData[colID] = colVal
       nodeData['isOverride'] = 'Yes'
       updates.push(nodeData)
      }
    }
    else {
      if(node.data[colID] !== node.data[this.overrideColMap[colID].global]){
        let nodeData = node.data
        nodeData['isOverride'] = 'Yes'
        updates.push(nodeData)
      }
    }
    this.compReaderSvc.gridApi().applyTransaction({ update: updates})

    if(params.node.group){
      let rownodes = params.node.allLeafChildren;
      this.compReaderSvc.adaptableApi().gridApi.refreshCells(rownodes, ['clear_override',...Object.keys(this.overrideColMap), 'isOverride'])
    }
    else 
    this.compReaderSvc.adaptableApi().gridApi.refreshCells([node], ['clear_override',...Object.keys(this.overrideColMap), 'isOverride']);

  }
  
  // Adaptable action column events
  
  clearOverrideActionColumn(
    button: AdaptableButton<ActionColumnContext>,
    context: ActionColumnContext
  ) {
    let node: RowNode = <RowNode> context.rowNode;
    let rowData = getNodes(node)
    let oCols: string[] = Object.keys(this.overrideColMap);
    for(let i: number = 0; i < rowData?.length; i++){
      for(let j: number = 0; j < oCols?.length; j+= 1){
        rowData[i][oCols[j]] = rowData[i][this.overrideColMap[oCols[j]].global]
      }
      rowData[i]['isOverride'] = 'No'
    }
    this.compReaderSvc.gridApi().applyTransaction({
      update: rowData
    });
  }

  hideClearOverrideActionColumn(
    button: AdaptableButton<ActionColumnContext>,
    context: ActionColumnContext
  ) {
    let rowData: any = context.rowNode?.data;
    if(!context.rowNode.group && this.compReaderSvc.isLocal().value)
      return rowData?.['isOverride'] === 'Yes' ? false : true;
    
      return true;
  }

  applyOverrideActionColumn(
    button: AdaptableButton<ActionColumnContext>,
    context: ActionColumnContext
  ) {
    let node: RowNode = <RowNode>context.rowNode;
    let rowData = getNodes(node)
    let oCols: string[] = Object.keys(this.overrideColMap);
    for(let i: number = 0; i < rowData?.length; i++){
      for(let j: number = 0; j < oCols?.length; j+= 1){
        rowData[i][oCols[j]] = rowData[i][this.overrideColMap[oCols[j]].local]
      }
      rowData[i]['isOverride'] = 'Yes'
    }
    this.compReaderSvc.gridApi().applyTransaction({
      update: rowData
    });
  }

  hideApplyOverrideActionColumn = (
    button: AdaptableButton<ActionColumnContext>,
    context: ActionColumnContext
  ) => {
    let rowData: any = context.rowNode?.data;
    if(!context.rowNode.group && this.compReaderSvc.isLocal().value){

      let isOvrde: boolean = false;
      let oCols: string[] = Object.keys(this.overrideColMap);

      oCols.forEach(c => {
        isOvrde = isOvrde || (rowData[c] !== rowData[this.overrideColMap[c].local]) && (rowData[this.overrideColMap[c].local] !== rowData[this.overrideColMap[c].global])
      })

      return isOvrde ? false : true
    }
      
    return true
  }

  positionIDCellStyle: CellStyleFunc = (params: CellClassParams) => {
    if(params.data?.['isVirtual'])
      return { color: '#0590ca' };
    return null;
  }

  positionIdClick(params: CellClickedEvent) {
    if(params.data?.['isVirtual'])
      this.portfolioModellerSvc.openVirtualPositionsForm('UPDATE', params.node.data);
  }
  setNodes(node: RowNode, rows: any[] = []){
    /** Get all filtered children nodes recursively (Depth First Search)*/
    if(node.group){
        for(let i = 0; i < node.childrenAfterFilter.length; i+= 1){
            this.setNodes(node.childrenAfterFilter[i], rows);
        }
    }
    else{
        rows.push(node.data.positionID);
    }
    return rows;
  }

  getUpdatedValues(gridApi: GridApi): VPortfolioLocalOverrideModel[]{
    let temp: VPortfolioLocalOverrideModel[] = [];

    let gridData = []
    gridApi.forEachLeafNode((node) => gridData.push(node.data))

    let oCols: string[] = Object.keys(this.overrideColMap);

    for(let i = 0 ; i < gridData.length; i++){

      for(let j = 0; j < oCols.length; j+=1){

        if(gridData[i][oCols[j]] !== gridData[i][this.overrideColMap[oCols[j]].global])
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: oCols[j],
            value: gridData[i][oCols[j]]
          });
      }
    }
    return temp;
  }

  
  updateGridWithOverrides(overrideInfo: any, adaptableApi: AdaptableApi){
    for(let i = 0; i < overrideInfo?.length; i+= 1){
      const posID: number = Number(overrideInfo[i].positionID),
            assetID: number = Number(overrideInfo[i].assetID),
            colName: string = overrideInfo[i].key,
            val: string = overrideInfo[i].value

      let node: RowNode = <RowNode>adaptableApi.gridApi.getRowNodeForPrimaryKey(posID)
      let oCols: string[] = Object.keys(this.overrideColMap);

      oCols.forEach(c =>  node.setDataValue(c, val))
    }
  }

  /** 
 * We have a set of 3 columns for each override column:
 *  Eg: expectedPrice
 *    We receive, `<expectedPrice,localExpectedPrice,globalExpectedPrice>`. expectedPrice is the column that is visible and editable on grid.
 *  To get overrides, we compare `expectedPrice` with `localExpectedPrice`.
 * 
 * To clear overrides, we simply set `expectedPrice = globalExpectedPrice` on the UI. 
 * 
 * */
  updateGridOverrides(context: 'Clear' | 'Set' = 'Clear'){

    if(this.compReaderSvc.selectedModelID == null && context === 'Set')
      return

    let gridApi: GridApi = this.compReaderSvc.gridApi();
    let adaptableApi: AdaptableApi = this.compReaderSvc.adaptableApi();

    let gridData: any[]  = [];
    let updates = []
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      if(node.data)
      gridData.push(node.data)
    })

    let oCols: string[] = Object.keys(this.overrideColMap);

    for(let i: number = 0; i < gridData?.length; i++){

      oCols.forEach(c => gridData[i][c] = (context === 'Clear') ? gridData[i][this.overrideColMap[c].global] : gridData[i][this.overrideColMap[c].local])

      gridData[i].isOverride = (context === 'Clear') ? 'No' : this.getIsOverride(gridData[i]); 
      updates.push(gridData[i])
    }


    gridApi.applyTransaction({ update: updates})
    adaptableApi.gridApi.refreshCells(adaptableApi.gridApi.getAllRowNodes(), ['clear_override',...Object.keys(this.overrideColMap), 'isOverride']);
  }

  // Get the override flag value for the row.
  getIsOverride(row: any){
    let cols: string[] = Object.keys(this.overrideColMap)
    let isOverride: boolean = false;
    for(let i = 0 ; i < cols.length; i+= 1){
      isOverride = isOverride || (row[cols[i]] !== row[this.overrideColMap[cols[i]].global])
    }

    return isOverride ? 'Yes' : 'No';
  }

  updateLocalFields(){
    let gridData: any[] = []

    let gridApi: GridApi = this.compReaderSvc.gridApi();

    gridApi.forEachLeafNode(node => gridData.push(node.data))

    for(let i: number = 0; i < gridData.length; i++){

      let oCols: string[] = Object.keys(this.overrideColMap);
      for(let j: number = 0; j < oCols.length; j+= 1){
        gridData[i][this.overrideColMap[oCols[j]].local] = gridData[i][oCols[j]]
      }
    }
    gridApi.applyTransaction({update: gridData})
    gridApi.refreshCells({
      force: true,
      suppressFlash: true,
      columns: [ ...Object.keys(this.overrideColMap), 'isOverride'] 
    })
  }

  selectManualPositions(modelId: number){

    let adaptableApi: AdaptableApi = this.compReaderSvc.adaptableApi(),
        positionIDs: number[] = this.modelSvc.modelMap[modelId].positionIDs;
    
    adaptableApi.gridApi?.deselectAll();
    if(positionIDs != null || positionIDs?.length != 0){
      positionIDs.forEach((posID: number) => {
        let node: RowNode = <RowNode>adaptableApi?.gridApi?.getRowNodeForPrimaryKey(posID);
        node.setSelected(true)
      })
    }
  }
}