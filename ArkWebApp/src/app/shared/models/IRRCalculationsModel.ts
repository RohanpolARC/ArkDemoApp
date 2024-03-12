import { ColumnFilter } from "@adaptabletools/adaptable-angular-aggrid"

export type OverrideColumnMap =
    {
        [col: string] : {
        local: string, global: string
        }
    }

export type VPortfolioModel = {
    modelName: string,
    modelDesc: string,
    rules: string,
    positionIDs: string,
    username: string,
    modelID: number,  // If modalID = null, then create, else update 
    isLocal: string,
    autoManualOption: string,
    isShared: string,
    latestWSOStatic: boolean,
    localOverrides: VPortfolioLocalOverrideModel[],
    irrAggrType: string, // `type1 > type2 > type3`,
    curveRateDelta: number,   // percentage with direction (+/-)
    fundCurrency: number,
    feePreset: string,
    isAdmin: boolean
}

export type VPortfolioDeleteModel = {
    modelID: number,
    username: string
}

export type VPortfolioLocalOverrideModel = {
    assetID: number,
    positionID: number,
    key: string,
    value: string
}

export interface IRRCalcParams  {
    runID: string,
    asOfDate: string,
    positionIDs: number[],
    modelID: number,
    modelName: string,
    // Optional since can be used to fetch PositionCashflows for the model
    irrAggrType?: string // single type,
    curveRateDelta?: number,
    
    // Dynamically created aggregations order
    aggrStr?: string[]
    mapGroupCols?: string[],
    latestWSOStatic: boolean,
    fundCurrency: string
}

export interface MonthlyReturnsCalcParams  {
    runID: string,
    positionIDs: string,
    baseMeasure: string,
    baseMeasureID: number,

    modelID?: number,
    modelName?: string,
    asOfDate?: string
}

export interface CashFlowParams  {
    runID: string
}

export interface PerfFeesCalcParams  {
    runID: string,
    positionIDs: number[],
    feePreset: string,
    feePresetID: number,

    modelID?: number,
    modelName?: string,
    asOfDate?: string
}

export interface PortfolioModellerCalcParams {
    // runID: string,
    modelID: number,
    positionIDs: number[],
    asOfDate: string,
    feePreset: string,
    irrAggrType: string,
    curveRateDelta: number,
    latestWSOStatic: boolean,
    fundCurrency: string,
    runBy: string
}

export type VPositionModel = {
    positionID? :number,
    fundHedging:string
    assetID? :number,
    issuerShortName :string,
    asset :string,
    fund :string,
    assetTypeName:string,
    fundCcy: string,
    ccy :string,
    faceValueIssue :number,
    costPrice :number,
    entryDate :string,
    expectedExitDate:string,
    expectedExitPrice:number,
    benchMarkIndex:string,
    maturityDate:string,
    createdBy? :string,
    modifiedBy? :string,
    spread ?: number,
    pikMargin ?: number,
    unfundedMargin ?: number,
    floorRate ?: number, 
    dealTypeCS ?: string,
    dealType ?: string,
    seniority ?: string
}

export type VModel = {
    modelID: number, modelName: string, displayName: string, modelDesc: string, 
    rules: ColumnFilter[], positionIDs: number[], 
    isLocal: string, autoManualOption: string, username: string, isShared: string, aggregationType: string,
    fundCurrency: string, latestWSOStatic: boolean, feePreset: string, rulesStr : string, createdBy: string
}

export type TabType =  `IRR` | `Monthly Returns` | `Performance Fees`  | `Portfolio Modeller` | `Cashflows`

export type TabContext = {
    runID?: string,
    type?: TabType,
    baseMeasure?: string,
    feePreset?: string,
    irrAggrType?: string,
    aggrStr?: string[],
    mapGroupCols?: string[],
    curveRateDelta: number,
    latestWSOStatic?: boolean,
    fundCurrency: string
}

export type EmitParams = {
  parentDisplayName: string,
  tabs:{
    tabName: string,
    tabType: TabType,
    calcParams: ResultCalcParams
  }[]
}
export type LoadStatus = `Loading` | `Loaded` | `Failed`;

export type ResultTab = {
    displayName: string,
    status: LoadStatus,
    resultType: TabType,
    calcParams?: ResultCalcParams
} 

export type ResultCalcParams = IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams | CashFlowParams

export type ParentTabType = {
    parentDisplayName: string,
    parentActualName: string,
    status: LoadStatus,
    tabset: ResultTab[],
    index?:number,
    isReIndexed?:boolean
}  

export type ScrollPosition = {
    lastScrollPositionVertical: number,
    lastScrollPositionHorizontal: string
}

export class TabGroupSelected {
    public parentTabSelectedIndex:number;
    public childTabSelectedIndex:number;
  }

  export type TabLevel = 'Parent' | 'Child';