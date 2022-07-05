export interface PortfolioMapping {
    mappingID: number,
    fund: string,
    fundLegalEntity: string,
    fundHedging: string,
    fundStrategy: string,
    fundPipeline2: string,
    fundSMA: boolean,
    fundInvestor: string,
    wsoPortfolioID: number,
    fundPipeline: string,
    fundCcy: string,
    fundAdmin: string,
    portfolioAUMMethod: string,
    fundRecon: string,
    legalEntityName: string,
    lei: string,
    isCoinvestment: boolean,
    excludeFxExposure: boolean,
    portfolioName: string,
    solvencyPortfolioName: string,
    userName: string
}

export interface PortfolioMappingApproval{
    stagingID: number,
    actionType: string,
    approval: boolean,
    approvedBy: string
}