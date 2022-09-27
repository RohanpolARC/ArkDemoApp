import * as moment from 'moment';

export function dateFormatter(params) {
    if(params.value != undefined && params.value != '0001-01-01T00:00:00' && !!params.value){
        let str: string = moment(params.value).format('DD/MM/YYYY');
        if(str === 'Invalid date')
            str = params.value
        return str;
    }
    else return ""
}
    
export function dateTimeFormatter(params) {
    if(params.value==undefined || params.value=="0001-01-01T00:00:00")
        return ""
    else 
        return moment(params.value).format('DD/MM/YYYY HH:mm');
}

export function amountFormatter(params){
    
    if(params.value!=undefined && Number(Number(params.value).toFixed(2))!=0    ){
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
    else if(Number(Number(params.value).toFixed(2))==0) {
        return "-"
    } else{
        return ""
    }
}

export function nonAmountNumberFormatter(params){
    // Non amount number requires no locale.
    if(params.value == null || Number(params.value) == 0)
        return " ";
    else return String(params.value);
}

export function noDecimalAmountFormatter(params){
    
    if(params.value!=undefined && Number(Number(params.value).toFixed(0))!=0){
        return Number(params.value).toLocaleString(undefined,{
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }
    else if(Number(Number(params.value).toFixed(0))==0) {
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

export function nonAmountNumberFormatter2Dec(params){
    if(params.value!=undefined && Number(Number(params.value).toFixed(2))!=0    ){
        if(Number.isInteger(Number(Number(params.value).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
            return Number(params.value).toFixed(0)
        }
        else{
            return Number(params.value).toFixed(2)
        }
    }
    else return "-"
}
export function formatDate(inputFormat, forCompare: boolean = false) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return forCompare 
        ? [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('/') // YYYY-MM-DD
        : [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')  // DD-MM_YYYY
}