export interface FilterPane{
    AsOfDateRange: boolean;
    AsOfDate: boolean;
    Funds: boolean;
    FacilityDetails: boolean;
    TextValueSelect: boolean;
}

export interface AsOfDateRange{
    start: string;
    end: string;
}

export interface FacilityDetailsFilter{
    asOfDate: string;
    funds: {id: number, fund: string}[];
}