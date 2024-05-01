import { ColumnFilter } from "@adaptabletools/adaptable-angular-aggrid"

export type VModel = {
    modelID: number, modelName: string, displayName: string, modelDesc: string, 
    rules: ColumnFilter[], positionIDs: number[], 
    isLocal: YesNoType, autoManualOption: AutoManualType, username: string, isShared: YesNoType, aggregationType: string,
    fundCurrency: string, includeFutureUpfrontFees: boolean, feePreset: string, rulesStr : string, createdBy: string,
    createdOn: string, modifiedOn: string
}

export type YesNoType = 'Yes' | 'No'

export type AutoManualType = 'Automatic' | 'Manual'