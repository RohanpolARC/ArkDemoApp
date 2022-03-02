export interface FilterPane{
    AsOfDateRange: boolean;
    Funds: boolean;
    FacilityDetails: boolean;
}

export interface AsOfDateRange{
    start: string;
    end: string;
}

export interface FacilityDetailsFilter{
    asOfDate: string;
    funds: {id: number, fund: string}[];
}