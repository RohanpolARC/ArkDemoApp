import { AdaptableApi } from "@adaptabletools/adaptable/types";
import * as XLSX from 'xlsx';
import * as moment from 'moment';

export function readExcelFromDrop(selectedFile: File){
    const fileReader = new FileReader();

    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (loadEvent: any) => {

      let binaryData = loadEvent.target.result;
      let workbook = XLSX.read(binaryData, { type: 'binary'});

      const data: any = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1, raw: false, blankrows: false});
    }
}
export function readExcelFromURL(URL: string, sheetName: string): any[] {
    fetch(URL, {mode: 'no-cors'})
    .then(response => response.blob())
    .then(blob => {
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(blob);
      fileReader.onload = (loadEvent: any) => {

        let binaryData = loadEvent.target.result;
        let workbook = XLSX.read(binaryData, { type: 'binary'});
        const data: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1, raw: false});

        return data;
      }
    })

    return null;
}

export function addToGrid(adaptableApi: AdaptableApi, newRowData: any[], ID: any[], idName: string): void{
    if(newRowData.length === ID.length){
        for(let i:number = 0; i < ID.length; i+= 1){
            newRowData[i][idName] = ID[i];
        }
        adaptableApi.gridApi.addGridData(newRowData);  
    }
}

export function getUniqueOptions(ref: {capitalTypes: string[], capitalSubTypes: string[], refData: any}): any {
    let capitalTypes: string[] = getUniqueOptionsFor(ref.capitalTypes);
    let capitalSubTypes: string[] = getUniqueOptionsFor(ref.capitalSubTypes);
    let fundHedgings: string[] = [];
    let fundCcys: string[] = [];
    let issuerShortNames: string[] = [];
    let assets: string[] = [];
    let wsoIssuerIDs: number[] = [];
    let wsoAssetIDs: number[] = [];

    for(let i:number = 0; i < ref.refData.length; i+=1){
        fundHedgings.push(ref.refData[i].fundHedging);
        fundCcys.push(ref.refData[i].fundCcy);
        issuerShortNames.push(ref.refData[i].issuerShortName);
        assets.push(ref.refData[i].asset);
        wsoIssuerIDs.push(ref.refData[i].wsoIssuerID);
        wsoAssetIDs.push(ref.refData[i].wsoAssetID);
    }

    fundHedgings = getUniqueOptionsFor(fundHedgings);
    fundCcys = getUniqueOptionsFor(fundCcys);
    issuerShortNames = getUniqueOptionsFor(issuerShortNames);
    assets = getUniqueOptionsFor(assets);    
    wsoIssuerIDs = getUniqueOptionsFor(wsoIssuerIDs);
    wsoAssetIDs = getUniqueOptionsFor(wsoAssetIDs);

    return {capitalTypes, capitalSubTypes, fundHedgings, issuerShortNames, assets, fundCcys, wsoIssuerIDs, wsoAssetIDs};
}

export function getUniqueOptionsFor(options: any[]): any[] {
    return [... new Set(options)];
}

export function getColumnTitle(idx: number): string | null{
    if(idx === 0)
        return null;
    let col: string = '';
    while(idx > 0){
        let rem = idx % 26;
        let n_digits = parseInt(String(idx / 26));
        if(rem === 0){
            rem = 26;
            n_digits -= 1;
        }
        col += String.fromCharCode(64 + rem);
        idx = n_digits
    }
    return col.split('').reverse().join('');
}

export function dateFormatter(params){
    let formattedDate = moment(params.value, 'DD/MM/YYYY').format('DD/MM/YYYY')

    if(formattedDate === 'Invalid date')
        formattedDate = null

    if(formattedDate!=undefined)
        return formattedDate;
    else{
        return null
    }
}