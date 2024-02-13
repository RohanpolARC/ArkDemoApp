import { ActionColumnContext, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { Injectable, OnDestroy } from '@angular/core';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { UtilService } from './util.service';
import { take } from 'rxjs/operators';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { ConfigurationService } from './configuration.service';
import { SIGPWR } from 'constants';

@Injectable()
export class InvestorGridUtilService implements OnDestroy {

  constructor(private capitalActivitySvc: CapitalActivityService,
    private utilSvc: UtilService,
    private configSvc: ConfigurationService
    ) {
      this.init()
    }
 
  subscriptions: Subscription[] = []
  private editActionClick = new Subject<boolean>();
  editActionClick$ = this.editActionClick.asObservable();
  updateEditActionClick(click: boolean){
    this.editActionClick.next(click)
  }

  rowData:any
  isLocked:boolean
  investments:any[]

  init()  
 {
  this.subscriptions.push(this.editActionClick$.pipe(
    switchMap(() => this.capitalActivitySvc.getCapitalInvestment(this.rowData.capitalId).pipe(take(1)))
  ).subscribe({
   next: data => {
     this.investments = data;
     this.utilSvc.openDialog(this.rowData, 'EDIT', this.investments, this.isLocked);
   },
   error: error => {
     console.error("Couldn't fetch investments for this capitalID");
   }
  }))
 }

  editActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext,args:boolean[]) {
    
    this.isLocked = this.hideEditActionColumn(button,context)
    this.rowData =  context.rowNode?.data;
    this.investments = []; 
    this.updateEditActionClick(true)
  }

  hideEditActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext){
    let lockDate = this.configSvc?.config?.lockDate;
    if(lockDate){
      let rowData = context.rowNode?.data;
      return new Date(rowData?.valueDate) <= new Date(lockDate)  
    }
    else {
      return false;
    }  
  }

  hideLockActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext){
    let lockDate = this.configSvc?.config?.lockDate;
    if(lockDate){
      let rowData = context.rowNode?.data;
      return new Date(rowData?.valueDate) > new Date(lockDate)  
    }
    else {
      return true;
    }
  }

  showHideLockIcon(params){
    if(new Date(params.node?.data?.valueDate) <= new Date(this.configSvc.config?.lockDate))
      return '<span><img src="../assets/img/lock.svg"></span>'
    else
      return ''
  }
  
  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe()); 
  }
}
