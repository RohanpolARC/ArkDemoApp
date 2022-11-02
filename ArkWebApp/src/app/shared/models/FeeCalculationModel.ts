export interface FeeCalcParams {
    asOfDate: string, // 'YYYY-MM-DD'
    entity: string,
    positionIDs ?: number[]
}