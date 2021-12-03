export interface CapitalActivityModel{
    capitalID: number,
    asset: string;
    callDate: Date;
    valueDate: Date;
    capitalType: string;
    capitalSubType: string;
    fundHedging: string;
    issuer: string;
    narrative: string;
    source: string;
    sourceID: number;
    totalAmount: number;
    createdOn: Date;
    createdBy: string;
    modifiedOn: Date;
    modifiedBy: string;
}