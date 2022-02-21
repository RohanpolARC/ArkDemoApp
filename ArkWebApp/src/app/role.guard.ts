import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AccessService } from './core/services/Auth/access.service';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate{

  tabs: string[];
  subscriptions: Subscription[] = [];
  constructor(private accessService: AccessService,
              private router: Router){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


    let tabs: string[] = this.accessService.accessibleTabs;

    if(tabs?.includes(route?.data?.tab)){
      return true;
    }
    else{
      this.router.navigate(['/unauthorized'])
      return false;
    }
  }  
}
