import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { environment } from 'src/environments/environment';  
import { MsalUserService } from './Auth/msaluser.service';  

import { BehaviorSubject } from 'rxjs';
import { AsOfDateRange, FacilityDetailsFilter } from 'src/app/shared/models/FilterPaneModel';
import { APIConfig } from 'src/app/configs/api-config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({  
    providedIn: 'root'  
})  
export class DataService {  
    httpOptions = {  
        headers: new HttpHeaders({  
            'Content-Type': 'application/json'  
        })  
    };  
  
    private filterApplyBtnHit = new BehaviorSubject<boolean>(null);
    filterApplyBtnState = this.filterApplyBtnHit.asObservable();
    changeFilterApplyBtnState(isHit: boolean){
        this.filterApplyBtnHit.next(isHit);

            // Set to false after action taken.
        this.filterApplyBtnHit.next(false);
    }

    private searchDateMessage = new BehaviorSubject<string>(null)
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

    private facilityFilterMessage = new BehaviorSubject<FacilityDetailsFilter>(null);
    currentFacilityFilter = this.facilityFilterMessage.asObservable();

    changeFacilityFilter(filter: FacilityDetailsFilter){
        this.facilityFilterMessage.next(filter)
    }

    constructor(private http: HttpClient, private msalService: MsalUserService  
    ) { }  
  
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
}    