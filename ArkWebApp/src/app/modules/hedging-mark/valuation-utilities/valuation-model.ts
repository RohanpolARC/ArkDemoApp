export interface HedgingMarkOverride {
    AssetId: number,
    PositionId: number,
    Level: 'Asset' | 'Position',
    HedgingMark: number,
    LastHedgingMarkDate: string
}
  
export interface MarkOverride {
    AssetId: number,
    PositionId: number,
    Level: 'Asset' | 'Position',
    MarkOverride: number,
    LastMarkOverrideDate: string
}
  
export interface Overrides {
    ModifiedBy: string,
    HedgingMarkOverrides: HedgingMarkOverride[],
    MarkOverrides: MarkOverride[]
}

export interface HedgingMarkDetails {
    MarkOverrides: MarkOverride[],
    HedgingMarkOverrides: HedgingMarkOverride[],
    ModifiedBy: string
}