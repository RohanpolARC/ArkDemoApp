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
    
    dealTypeCS?: string,
    expectedDate?: string,
    expectedPrice?: number,
    maturityPrice?: number,
    spreadDiscount?: number,
    isOverride?: boolean,

    createdOn?: Date,
    createdBy?: string,
    modifiedOn?: Date,
    modifiedBy?: string
}