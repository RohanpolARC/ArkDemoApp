export interface Valuation {
    assetID: number,
    markType: 'Impaired Cost' | 'Mark To Market' | 'Hedging Mark',
    override: number,
    overrideDate: Date,
    overrideSource: 'Model Valuation' | 'New Mark',  
    // initialYieldCurveSpread: number,
    // initialCreditSpread: number,
    spreadBenchmarkIndex: string,
    deltaSpreadDiscount: number,
    modifiedBy: string
}


export interface YieldCurve {
    name: string, rate: number, currency: string 
}