import * as moment from 'moment';

export function dateFormatter(params) {
    if(params.value != undefined && params.value != '0001-01-01T00:00:00')
        return moment(params.value).format('DD/MM/YYYY')
    else return ""
}
    
export function dateTimeFormatter(params) {
    if(params.value==undefined || params.value=="0001-01-01T00:00:00")
        return ""
    else 
        return moment(params.value).format('DD/MM/YYYY HH:mm');
}

export function amountFormatter(params){
    if(params.value!=undefined&&Number(params.value)!=0)
    return Number(params.value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    else if(Number(params.value)==0) {
        return "-"
    } else{
        return ""
    }
}

export function nullOrZeroFormatter(params){
    if(params.value == null || Number(params.value) == 0)
        return "";
    else return Number(params.value).toLocaleString(undefined, {
    });
}

export function removeDecimalFormatter(params){
    if(params.value != null && Number(params.value)!= 0){
        return String(parseInt(params.value));
    }
    else if(Number(params.value) == 0)
        return "-"
    else
        return ""
}
