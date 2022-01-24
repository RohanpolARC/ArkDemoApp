import * as moment from 'moment';

export function dateFormatter(params) {
    let formattedDate = moment(params.value).format('DD/MM/YYYY');

        // For capital acitivity bulk update, date read from excel might be invalid, hence format supplied. 
    if(formattedDate === 'Invalid date')
        formattedDate = moment(params.value, 'DD/MM/YYYY').format('DD/MM/YYYY')

    if(formattedDate!=undefined)
        return formattedDate;
    else{
        return ""
    }
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

export function zeroFormatter(params){
    if(params.value == undefined || Number(params.value) == 0)
        return null;
    else return Number(params.value)
}
