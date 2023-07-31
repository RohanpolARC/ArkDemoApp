import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { MsalUserService } from './Auth/msaluser.service';  

import { BehaviorSubject } from 'rxjs';
import { APIConfig } from 'src/app/configs/api-config';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({  
    providedIn: 'root'  
})  
export class DataService {  

    constructor(
        private http: HttpClient, 
        private msalService: MsalUserService,
        public snackBar: MatSnackBar
    ) { }  
  
    private filterApplyBtnHit = new BehaviorSubject<boolean>(false);
    filterApplyBtnState = this.filterApplyBtnHit.asObservable();
    changeFilterApplyBtnState(isHit: boolean){
        this.filterApplyBtnHit.next(isHit);
    }

    getCurrentUserInfo(){  
       return this.msalService.getCurrentUserInfo();  
    }
    
    getCurrentUserName(){  
        // this.msalService.GetAccessToken() 
        let userInfo = this.msalService.getCurrentUserInfo();  
        return userInfo?.name
     }  

    logout(){  
        this.msalService.logout();  
    }
    
    getFundHedgingsRef(){
        return this.http.get<any[]>(`${APIConfig.REFDATA_GET_FUNDHEDGINGS_API}`).pipe(
            catchError((ex) => throwError(ex)));      
    }

    getWSOPortfolioRef(){
        return this.http.get<any[]>(`${APIConfig.REFDATA_GET_WSOPORTFOLIO_API}`).pipe(
            catchError((ex) => throwError(ex)));
    }

    getUniqueValuesForField(field: string){
        return this.http.get<{id: number, value: string}[]>(`${APIConfig.REFDATA_GET_UNIQUE_VALUES_API}/?field=${field}`).pipe(
            catchError((ex) => throwError(ex)));
    }

    getRefDatatable(tableName: string){
        return this.http.get<any[]>(`${APIConfig.REFDATA_GET_DATATABLE}/?tableName=${tableName}`).pipe(
            catchError((ex) => throwError(ex)));
    }

    getDetailedView(model: DetailedView){
        return this.http.post<any[]>(`${APIConfig.GET_DETAILED_VIEW}`, model).pipe(
            catchError((ex) => throwError(ex)));      
    }

    saveAdaptableState(adaptableID: string, state: string){
        return this.http.post<any[]>(`${APIConfig.SAVE_ADAPTABLE_STATE_API}`, {'adaptableID': adaptableID, 'adaptableState': state, 'username': this.getCurrentUserName()}).pipe(
            catchError((ex) => throwError(ex))
        );
    }

    getAdaptableState(adaptableID: string){
        return this.http.get<string>(`${APIConfig.GET_ADAPTABLE_STATE_API}/?adaptableID=${adaptableID}`).pipe(
            catchError((ex) => throwError(ex))
        );
    }

    getGridDynamicColumns(grid: string){
        return this.http.get<any[]>(`${APIConfig.GRID_DYNAMIC_COLUMNS_GET_API}/?grid=${grid}`).pipe(
            catchError((ex) => throwError(ex))
        );
    }

    setWarningMsg(
        message: string, action: string = 'Dismiss', 
        type: 'ark-theme-snackbar-normal' | 'ark-theme-snackbar-warning' | 'ark-theme-snackbar-error' | 'ark-theme-snackbar-success' = 'ark-theme-snackbar-warning',
        time: number = 5000){
        this.snackBar.open(message, action, {
          duration: time,
          panelClass: [type]
        });
      }

      getPortfolioTypeRef(){
        return this.http.get<any[]>(`${APIConfig.REFDATA_GET_PORTFOLIOTYPE_API}`).pipe(
            catchError((ex) => throwError(ex)));
    }
    
}