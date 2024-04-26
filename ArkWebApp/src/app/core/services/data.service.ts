import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  

import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({  
    providedIn: 'root'  
})  
export class DataService {  

    constructor(
        private http: HttpClient, 
        // private msalService: MsalUserService,
        public snackBar: MatSnackBar
    ) { }  
  
    private filterApplyBtnHit = new BehaviorSubject<boolean>(false);
    filterApplyBtnState = this.filterApplyBtnHit.asObservable();
    changeFilterApplyBtnState(isHit: boolean){
        this.filterApplyBtnHit.next(isHit);
    }

    
    getCurrentUserName(){  

        return 'test user'
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

    
}