export interface FeeCalcParams {

    //  positionIDs, runID for virtual portfolio runs.
    
    asOfDate: string, // 'YYYY-MM-DD'
    presetName: string,
    positionIDs ?: number[],
    runID ?: string
}