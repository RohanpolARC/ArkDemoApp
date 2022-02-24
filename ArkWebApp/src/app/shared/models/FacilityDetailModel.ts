export interface FacilityDetailModel{
    issuerShortName: string,
    asset: string,
    assetID: number,
    assetTypeName: string,
    ccy: string,
    faceValueIssue: number,
    costPrice: number,
    mark: number,
    maturityDate: Date,
    benchMarkIndex: string,
    spread: number,
    pikmargin: number,
    unfundedMargin: number,
    floorRate: number,
    expectedDate?: Date,
    expectedPrice?: number
}