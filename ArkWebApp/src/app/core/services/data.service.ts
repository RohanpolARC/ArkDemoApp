import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { MsalUserService } from './Auth/msaluser.service';  

import { BehaviorSubject } from 'rxjs';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { APIConfig } from 'src/app/configs/api-config';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';


@Injectable({  
    providedIn: 'root'  
})  
export class DataService {  

    constructor(
        private http: HttpClient, 
        private msalService: MsalUserService,
        public snackBar: MatSnackBar
    ) { }  
    
    httpOptions = {  
        headers: new HttpHeaders({  
            'Content-Type': 'application/json'  
        })  
    };  
  
    private filterApplyBtnHit = new BehaviorSubject<boolean>(false);
    filterApplyBtnState = this.filterApplyBtnHit.asObservable();
    changeFilterApplyBtnState(isHit: boolean){
        this.filterApplyBtnHit.next(isHit);

    }

    private searchDateMessage = new BehaviorSubject<string>(getMomentDateStr(getLastBusinessDay()))
    currentSearchDate = this.searchDateMessage.asObservable();
    changeSearchDate(asOfDate: string){
        this.searchDateMessage.next(asOfDate);
    }

    private searchDateRangeMessage = new BehaviorSubject<any>(null);
    currentSearchDateRange = this.searchDateRangeMessage.asObservable();
    changeSearchDateRange(range: AsOfDateRange){
        this.searchDateRangeMessage.next(range);
    }

    private searchTextValuesMessage = new BehaviorSubject<any>(null)
    currentSearchTextValues = this.searchTextValuesMessage.asObservable();
    changeSearchTextValues(values: string[]){
        this.searchTextValuesMessage.next(values);
    }

    private numberFieldMessage = new BehaviorSubject<number>(null)
    currentNumberField = this.numberFieldMessage.asObservable();
    changeNumberField(value: number){
        this.numberFieldMessage.next(value);
    }


  
    getCurrentUserInfo(){  
       return this.msalService.getCurrentUserInfo();  
    }
    
    getCurrentUserName(){  
        this.msalService.GetAccessToken() 
        let userInfo = this.msalService.getCurrentUserInfo();  
        return userInfo.name
     }  

    logout(){  
        this.msalService.logout();  
    }
    
    getFundHedgingsRef(){
        return this.http.get<any[]>(`${APIConfig.REFDATA_GET_FUNDHEDGINGS_API}`, this.httpOptions).pipe(
            catchError((ex) => throwError(ex)));      
    }

    getWSOPortfolioRef(){
        return this.http.get<any[]>(`${APIConfig.REFDATA_GET_WSOPORTFOLIO_API}`, this.httpOptions).pipe(
            catchError((ex) => throwError(ex)));
    }

    getUniqueValuesForField(field: string){
        return this.http.get<{id: number, value: string}[]>(`${APIConfig.REFDATA_GET_UNIQUE_VALUES_API}/?field=${field}`).pipe(
            catchError((ex) => throwError(ex)));
    }

    getDetailedView(model: DetailedView){
        return this.http.post<any[]>(`${APIConfig.GET_DETAILED_VIEW}`, model, this.httpOptions).pipe(
            catchError((ex) => throwError(ex)));      
    }

    saveAdaptableState(adaptableID: string, state: string){
        return this.http.post<any[]>(`${APIConfig.SAVE_ADAPTABLE_STATE_API}`, {'adaptableID': adaptableID, 'adaptableState': state, 'username': this.getCurrentUserName()}, this.httpOptions).pipe(
            catchError((ex) => throwError(ex))
        );
    }

    getAdaptableState(adaptableID: string){
        return this.http.get<string>(`${APIConfig.GET_ADAPTABLE_STATE_API}/?adaptableID=${adaptableID}`, this.httpOptions).pipe(
            catchError((ex) => throwError(ex))
        );
    }

    setWarningMsg(message: string, action: string, type: 'ark-theme-snackbar-normal' | 'ark-theme-snackbar-warning' | 'ark-theme-snackbar-error' | 'ark-theme-snackbar-success' = 'ark-theme-snackbar-normal'){
        this.snackBar.open(message, action, {
          duration: 5000,
          panelClass: [type]
        });
      }
    
}