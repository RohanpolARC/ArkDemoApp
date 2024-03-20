import { AdaptableApi } from "@adaptabletools/adaptable-angular-aggrid";

export interface CapitalActivityModel{
    capitalID: number,
    asset: string;
    callDate: Date;
    valueDate: Date;
    capitalType: string;
    capitalSubType: string;
    strategy: string;
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
    linkedAmount: number;
    minLinkedDate: Date;
    isLinked: boolean;
    
    positionIDCashdateTypeStr: string;
}

export interface CapitalInvestment{ 
    positionID: number;
    cashDate: Date;
    type: string;
    amount: number;
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
    strategy: string;

    createdOn: Date;
    createdBy: string;
    modifiedOn: Date;
    modifiedBy: string;

}

export interface InvestmentSmall {
    positionID: number,
    cashDate: Date,
    type: string
}
export interface AssociateInvestment{
    investments: InvestmentSmall[],
    capitalIDs: number[],
    username: string
}

export interface IModal {
    rowData: CapitalInvestment[],
    adaptableApi: AdaptableApi,
    adaptableApiInvstmnt: AdaptableApi,
    actionType: string,
    capitalTypes: string[],
    capitalSubTypes: string[],
    gridData: CapitalInvestment[]
}

export interface INAVQuarterly {
    fundHedging: string,
    quarterEnd: Date,
    navPerFS: number,
    deferredLoanOriginationFeeIncome: number,
    currentPeriodRebates: number,
    organisationalCostsUnamortised: number,
    subscriptionCostsUnamortised: number,
    advancedTax: number,
    carriedInterestProvision: number,
    rebateITD: number,
    netForwardContractMovementsITDRealised: number,
    netForwardContractMovementsITDUnrealised: number,
    financeCostITD: number,
    totalForeignExchangeMovementsITD: number,
    totalOperatingExpITD: number,
    GPSITD: number,
    Strategy: string,
    username: string
}

export interface ICapitalActivityConfig {
    lockDate : Date,
    addedBy : string,
    numberOfLockedRecords? : number
    addedOn? : Date
}

