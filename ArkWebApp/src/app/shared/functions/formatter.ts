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
    
    if(params.value!=undefined && Number(params.value)!=0){
        if(Number.isInteger(Number(Number(params.value).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
            return Number(params.value).toLocaleString(undefined,{
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
        }
        else{
            return Number(params.value).toLocaleString(undefined, {     // Show 2 trailing digits if non integer
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });    
        }
    }
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

export function formatDate(inputFormat, forCompare: boolean = false) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return forCompare 
        ? [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('/') 
        : [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
}