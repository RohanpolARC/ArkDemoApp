import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AccessService } from './core/services/Auth/access.service';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

// export class RoleGuard implements CanActivate{

//   tabs: string[];
//   subscriptions: Subscription[] = [];
//   constructor(private accessService: AccessService,
//               private router: Router){}
  
//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

//     return this.accessService
//     .accessibleTabs$
//     .pipe(
//       filter(value => value!=null),
//       map((accessibleTabs:{tab: string, isWrite: boolean}[]) => {
//         if (accessibleTabs) {
//           for(let i:number = 0; i < accessibleTabs?.length; i+= 1){
//             if(accessibleTabs[i]?.tab === route?.data?.tab)
//               return true;
//           }
//         }
//         this.router.navigate(['/accessibility'])
//         return false;
//       }),
//       catchError(() => {
//         this.router.navigate(['/accessibility']);
//         return Observable.of(false);
//     }));

//     // let tabs: {tab: string, isWrite: boolean}[] = this.accessService.accessibleTabs;

//     // for(let i:number = 0; i < tabs?.length; i+= 1){
//     //   if(tabs[i]?.tab === route?.data?.tab)
//     //     return true;
//     // } 
//     // this.router.navigate(['/accessibility'])
//     // return false;
//   }  
// }


// https://stackoverflow.com/questions/75564717/angulars-canactivate-interface-is-deprecated-how-to-replace-it
// Class-based Route guards are deprecated in favour of functional guards. An injectable class can be used as a functional guard using the inject function: canActivate: [() => inject(myGuard).canActivate()].

class PermissionsService {
  tabs: string[];
  subscriptions: Subscription[] = [];
  constructor(private accessService: AccessService,
  private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
     return this.accessService
    .accessibleTabs$
    .pipe(
      filter(value => value!=null),
      map((accessibleTabs:{tab: string, isWrite: boolean}[]) => {
        if (accessibleTabs) {
          for(let i:number = 0; i < accessibleTabs?.length; i+= 1){
            if(accessibleTabs[i]?.tab === route?.data?.tab)
              return true;
          }
        }
        this.router.navigate(['/accessibility'])
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/accessibility']);
        return of(false);
    }));

    // let tabs: {tab: string, isWrite: boolean}[] = this.accessService.accessibleTabs;

    // for(let i:number = 0; i < tabs?.length; i+= 1){
    //   if(tabs[i]?.tab === route?.data?.tab)
    //     return true;
    // } 
    // this.router.navigate(['/accessibility'])
    // return false;
  }
}

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    return inject(PermissionsService).canActivate(route, state);
}