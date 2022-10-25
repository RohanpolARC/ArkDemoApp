export interface DetailedView{
    screen: string,
    param1: string,
    param2: string,
    param3: string,
    param4: string,
    param5: string,
}

export interface PutAccessModel{
    associations: string,   /* (Tab|Role:Association,)+ */
    username: string
}

export interface RefDataProc{
    filterValue: string,
    param1: string,
    param2: string,
    param3: string,
    param4: string,
    param5: string,
}