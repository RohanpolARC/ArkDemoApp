export interface FilterPane{
    AsOfDateRange: boolean;
    AsOfDate: boolean;
    TextValueSelect: boolean;
}

export interface AsOfDateRange{
    start: string;
    end: string;
}