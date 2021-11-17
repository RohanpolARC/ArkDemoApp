import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { environment } from 'src/environments/environment';  
import { MsalUserService } from './Auth/msaluser.service';  

import { BehaviorSubject } from 'rxjs';

@Injectable({  
    providedIn: 'root'  
})  
export class DataService {  
    private url = environment.baseUrl + 'api/employee';  
  
    httpOptions = {  
        headers: new HttpHeaders({  
            'Content-Type': 'application/json'  
        })  
    };  
  
    private searchDateMessage = new BehaviorSubject<string>(null);
    currentsearchDate = this.searchDateMessage.asObservable();

    changeSearchDate(searchDate: string){
        this.searchDateMessage.next(searchDate);
    }

    constructor(private http: HttpClient, private msalService: MsalUserService  
    ) { }  
  
    getEmployees(): Observable<any[]> {  
         
        this.httpOptions = {  
            headers: new HttpHeaders({  
                'Content-Type': 'application/json',  
                'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
            })  
  
        };  
  
        return this.http.get(this.url, this.httpOptions)  
            .pipe((response: any) => {  
                return response;  
            });  
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
}    