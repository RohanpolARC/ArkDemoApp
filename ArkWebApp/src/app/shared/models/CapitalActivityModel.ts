export interface CapitalActivityModel{
    capitalID: number,
    asset: string;
    callDate: Date;
    valueDate: Date;
    capitalType: string;
    capitalSubType: string;
    fundHedging: string;
    issuerShortName: string;
    narrative: string;
    source: string;
    sourceID: number;
    fundCcy: string;
    totalAmount: number;
    createdOn: Date;
    createdBy: string;
    modifiedOn: Date;
    modifiedBy: string;

    localAmount: number;
    fxRate: number
}

export interface CapitalInvestment{
    positionID: number;
    amount: number;
    cashDate: Date;
    issuerShortName: string;
    asset: string;
    fundHedging: string;
    fund: string;
    fundCcy: string;
    positionCcy: string;
    portfolio: string;
    totalBase: number;
    totalEur: number;

    capitalID?: number;

    createdOn: Date;
    createdBy: string;
    modifiedOn: Date;
    modifiedBy: string;

}