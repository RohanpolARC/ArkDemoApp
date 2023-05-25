export interface Valuation {
    assetID: number,
    type: 'Hedging Mark' | 'Mark Override',
    valuationMethod: 'Impaired Cost' | 'Mark To Market',
    override: number,
    overrideDate: Date,
    initialYieldCurveSpread: number,
    initialCreditSpread: number,
    creditSpreadIndex: string,
    deltaSpreadDiscount: number,
    modifiedBy: string
}