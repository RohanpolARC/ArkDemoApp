export interface VPortfolioModel{
    modelName: string,
    modelDesc: string,
    rules: string,
    positionIDs: string,
    username: string,
    modelID: number,  // If modalID = null, then create, else update 
    isLocal: boolean,
    isManual: boolean,
    isShared: boolean,
    localOverrides: VPortfolioLocalOverrideModel[],
    irrAggrType: string // `type1 > type2 > type3`
}

export interface VPortfolioLocalOverrideModel{
    assetID: number,
    positionID: number,
    key: string,
    value: string
}

export interface IRRCalcParams{
    runID: string,
    asOfDate: string,
    positionIDs: number[],
    modelID: number,
    modelName: string,
    // Optional since can be used to fetch PositionCashflows for the model
    irrAggrType?: string // single type
}

export interface MonthlyReturnsCalcParams {
    runID: string,
    positionIDs: string,
    baseMeasure: string,
    baseMeasureID: number,

    modelID?: number,
    modelName?: string,
    asOfDate?: string
}

export interface CashFlowParams {
    runID: string
}

export interface PerfFeesCalcParams {
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
    runBy: string
}