export interface UnfundedAsset{
    rowID: number,
    issuerShortName: string,
    asset: string,
    assetID: number,
    ccy: string,
    commitmentAmount: number,
    unfundedAmount: number,
    fundedAmount: number,
    tobefundedAmount: number,
    fundingDate: Date,
    username: string
}