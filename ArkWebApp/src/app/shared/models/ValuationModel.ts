export interface Valuation {
    assetID: number,
    markType: 'Impaired Cost' | 'Mark To Market' | 'Hedging Mark',
    override: number,
    overrideDate: Date,
    initialYieldCurveSpread: number,
    initialCreditSpread: number,
    creditSpreadIndex: string,
    deltaSpreadDiscount: number,
    modifiedBy: string
}