import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { MsalUserService } from './msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  accessibleTabs: string[] = null;
  
  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };

  constructor(private http: HttpClient, 
              private msalService: MsalUserService) {
  }

  // public getAccessibleTabs(): Promise<any>{
  //   let userRole: string = this.msalService.getUserRole();
  //   console.log(userRole);

  //   return this.http.get<any[]>(`${APIConfig.ARKWEB_ACCESSIBLE_TABS_GET_API}/?userRole=${userRole}`, this.httpOptions).pipe(catchError((ex) => throwError(ex)))
  //     .do(result => {
  //       console.log(result);
  //       this.accessibleTabs = result;
  //       console.log(this.accessibleTabs);
  //     })
  //     .toPromise();
  // } 

  public getAccessibleTabs(): Observable<any>{

    // let userRole: string = this.msalService.getUserRole()

    let userRole: string = 'Finance';

    return this.http.get<any[]>(`${APIConfig.ARKWEB_ACCESSIBLE_TABS_GET_API}/?userRole=${userRole}`, this.httpOptions);
  }

  public getTabs(){
    let userRole: string = 'Finance';
    return this.http.get<any[]>(`${APIConfig.ARKWEB_ACCESSIBLE_TABS_GET_API}/?userRole=${userRole}`, this.httpOptions).toPromise();
  }
}
