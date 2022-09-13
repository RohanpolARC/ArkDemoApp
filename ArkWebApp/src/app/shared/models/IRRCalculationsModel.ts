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
    asOfDate: string,
    positionIDs: number[],
    modelID: number,
    modelName: string,
    irrAggrType: string // single type
}

export interface MonthlyReturnsCalcParams {
    positionIDs: string,
    baseMeasure: string,
    baseMeasureID: number,

    modelID?: number,
    modelName?: string,
    asOfDate?: string
}