export interface FeeCalcParams {

    //  positionIDs, runID for virtual portfolio runs.
    
    asOfDate: string, // 'YYYY-MM-DD'
    entity: string,
    positionIDs ?: number[],
    runID ?: string
}