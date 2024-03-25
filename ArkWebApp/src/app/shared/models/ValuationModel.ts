export interface Valuation {
    assetID: number,
    markType: 'Impaired Cost' | 'Mark To Market' | 'Hedging Mark',
    override: number,
    overrideDate: Date,
    overrideSource: 'Model Valuation' | 'New Mark',  
    forceOverride: boolean
    // yieldCurve: string,
    // initialYCYield: number,
    // spreadBenchmarkIndex: string,
    // initialBenchmarkYield: number,
    initialSpreadDate: Date,
    initialSpread: number,
    currentSpread: number,
    deltaSpreadDiscount: number,
    modifiedBy: string,
}


export interface YieldCurve {
    name: string, rate: number, currency: string 
}

export interface SpreadBenchmarkIndex {
    bloombergTicker: string,
    currentBenchmarkSpread: number,
    benchmarkIndexPrice: number,
    benchmarkIndexYield: number,
    effectiveDate: Date,
    securityID: string,
    securityName: string
}