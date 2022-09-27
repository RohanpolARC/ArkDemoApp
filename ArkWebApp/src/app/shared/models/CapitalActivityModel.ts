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
    
    wsoIssuerID: number;
    wsoAssetID: number;
    action: string;
    localAmount: number;
    fxRate: number;
    
    posCcy: string;
    linkedAmount: number;
    isLinked: boolean;
    
    positionIDCashdateTypeStr: string;
    fxRateOverride: boolean;
    fxRateSource: string;
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

    capitalIDs?: number[];
    valueDate?: Date;   /* For inserting/updating AssetGIR (To be populated as AsOfDate) */
    fxRate?: number;    /* For inserting/updating AssetGIR (To be populated as FxRate/GIR) */

    createdOn: Date;
    createdBy: string;
    modifiedOn: Date;
    modifiedBy: string;

}


export interface AssociateInvestment{
    positionIDCashdateTypeStr: string,
    capitalIDs: number[],
    username: string
}