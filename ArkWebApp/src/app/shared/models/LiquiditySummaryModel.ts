export interface LiquiditySummaryAttributeModel{
    id: number,
    isRelative: boolean,
    entryDate: Date,
    relativeDays: number,
    level: string,
    attribute: string,
    username: string
}

export interface LiquiditySummaryUpdateModel{
    level: string,
    attribute: string,
    attributeID: number,
    fundHedgingAmount: string,
    username: string
}