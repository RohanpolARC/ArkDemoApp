export interface VPortfolioModel{
    modelName: string,
    modelDesc: string,
    rules: string,
    positionIDs: string,
    username: string,
    modelID: number,  // If modalID = null, then create, else update 
    isLocal: boolean,
    isManual: boolean,
    localOverrides: VPortfolioLocalOverrideModel[]
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
    modelID: number
}