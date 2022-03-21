import { NativeDateAdapter } from "@angular/material/core";

export class InputDateAdapter extends NativeDateAdapter {
    parse(value: any): Date | null {
        const currentDate = new Date();
        let year: number = currentDate.getFullYear();
        let month: number = currentDate.getMonth();
        let day: number = currentDate.getDate();

        if ((typeof value === 'string') && 
             ((value.indexOf('/') > -1) || (value.indexOf('.') > -1)  || (value.indexOf('-') > -1))) {

            const str = value.split(/[\./-]/);

            // if(str[0].toString().length > 2)
            //     return null;
            
            if(parseInt(str[0]) > 31 || parseInt(str[0]) < 1)
                return null;

            if(parseInt(str[1]) > 12 || parseInt(str[1]) < 1)
                return null;

            day = !!str[0] ? +str[0] : day;
            month = !!str[1] ? +str[1] - 1 : month;
            year = !!str[2] ?
                  // If year is less than 3 digit long, we add 2000.
                 +str[2].length <= 3 ? +str[2] + 2000 : +str[2] : year ;

            return new Date(year, month, day);
        }
        return null
    }
}