import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { AssociateInvestment, CapitalActivityModel, CapitalInvestment, InvestmentSmall } from 'src/app/shared/models/CapitalActivityModel';
import { APIReponse } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class ModalService {

  mode: string
  constructor(private capitalActivitySvc: CapitalActivityService,
    private msalSvc: MsalUserService) {
      this.init();
    }

  private createOrUpdateCapitalActivity(): Observable<string> {
    let capitalActivity: CapitalActivityModel = this.capitalActivity
    return this.capitalActivitySvc.putCapitalActivity(capitalActivity).pipe(
      take(1),
      map((response: APIReponse) => {
        let isSuccess: boolean = response.isSuccess;
        this.updateActionSuccessful(isSuccess)
        if(isSuccess){
          this.saveState = 'SUCCESS';
          return response.returnMessage;
        }
        else {
          this.saveState = 'FAILURE';
          return response.returnMessage
        }
      })
    )
  }

  private createAndLinkNewInvestorCashflow(): Observable<string> {

    let capitalactivity: CapitalActivityModel = this.capitalActivity;
    return this.capitalActivitySvc.putCapitalActivity(capitalactivity).pipe(
      take(1),
      switchMap((response: APIReponse) => {
        let isSuccess: boolean = response.isSuccess;
        this.updateActionSuccessful(isSuccess);
        if(isSuccess){
          let newcapitalID: number = response.data;
          return this.updateInvestmentAssociations([newcapitalID])
        }
        else {
          this.saveState = "FAILURE"
          return of(response.returnMessage);
        }
      })
    )
  }

  private updateInvestmentAssociations(capitalIDs: number[]): Observable<string> {
    let investmentsSmall: InvestmentSmall[] = [];
            
    this.investmentData?.forEach(investment => {
      let inv: InvestmentSmall = {
        positionID: investment.positionID,
        cashDate: investment.cashDate,
        type: investment.type
      };
      investmentsSmall.push(inv);
    });
  
    let model: AssociateInvestment = {
      investments: investmentsSmall,
      capitalIDs: capitalIDs || [],
      username: this.msalSvc.getUserName()
    };

    return this.capitalActivitySvc.associateCapitalInvestments(model).pipe(
      take(1),
      map((response: APIReponse) => {
        let isSuccess: boolean = response.isSuccess;
        if(isSuccess){
          this.saveState = 'SUCCESS'
        }
        else{
          this.saveState = 'FAILURE'
        }
        this.updateActionSuccessful(isSuccess)
        return response.isSuccess
          ? 'Successfully updated investment associations'
          : 'Failed to update investment associations';
      })
    );
  }

  validationMessage$: Observable<string>;

  private hideSubmitButton = new BehaviorSubject<boolean>(false);
  hideSubmitButton$ = this.hideSubmitButton.asObservable();
  updateHideSubmitButton(value:boolean){
    this.hideSubmitButton.next(value);
  }


  private formValidation = new BehaviorSubject<string>('');
  formValidation$ = this.formValidation.asObservable();
  updateFormValidation(text:string){
    this.formValidation.next(text);
  }

  submitBtnText$: Observable<string> = of('Submit')

  private submitBtnText = new BehaviorSubject<string>('Submit');
  submitBtnTextListener$ = this.submitBtnText.asObservable();
  updateSubmitBtnText(text: string){
    this.submitBtnText.next(text);
  }
  private isAlreadyLinked = new BehaviorSubject<boolean>(false);
  isAlreadyLinked$ = this.isAlreadyLinked.asObservable();
  updateIsAlreadyLinked(isalreadylinked: boolean){
    this.isAlreadyLinked.next(isalreadylinked);
  }

  private linkingCapitalIDs = new BehaviorSubject<number[]>([]);
  linkingCapitalIDs$ = this.linkingCapitalIDs.asObservable();
  updateLinkingCapitalIDs(capitalids: number[]){
    this.linkingCapitalIDs.next(capitalids)
  }

  private submitBtnClick = new BehaviorSubject<boolean>(false);
  submitBtnClick$ = this.submitBtnClick.asObservable();
  updateSubmitBtnClick(click: boolean){
    this.submitBtnClick.next(click)
  }
  // This model gets updated from the form after it's status gets updated
  capitalActivity: CapitalActivityModel
  investmentData: CapitalInvestment[]

  saveState: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'WARNING'

  onSubmit = (mode: string) => {
    this.updateSubmitBtnClick(true)
  }

  private actionSuccessful = new BehaviorSubject<boolean>(false);
  actionSuccessful$ = this.actionSuccessful.asObservable();
  updateActionSuccessful(success: boolean){
    this.actionSuccessful.next(success)
  }

  private formStatus = new BehaviorSubject<boolean>(false);
  formStatus$ = this.formStatus.asObservable();
  updateFormStatus(status: boolean){
    this.formStatus.next(status)
  }
  
  disableSubmit$: Observable<boolean>

  closeSave$ = new Subject<any>();
  init(){

    this.submitBtnText$ = combineLatest([
      this.isAlreadyLinked$,
      this.linkingCapitalIDs$
    ]).pipe(
      map(([isAlreadyLinked, capitalids]) => {
        if(this.mode !== 'LINK-ADD')
          return 'Submit'
        if(isAlreadyLinked)
          return 'Update Link'
        else if(capitalids?.length)
          return 'Update Link'
        else if(!isAlreadyLinked && !capitalids?.length)
          return 'Create and Link'

        return 'Submit'
      }),
      tap((text) => { 
        this.updateSubmitBtnText(text)
      })
    )

    this.validationMessage$ = combineLatest([this.submitBtnClick$, this.formValidation$]).pipe(
      switchMap(([submitBtnClick ,formValidation]) => {
        
        if(submitBtnClick){
          return combineLatest([this.submitBtnTextListener$, this.linkingCapitalIDs$, this.actionSuccessful$]).pipe(
            take(1),
            switchMap(([submitBtnText, linkingCapitalIDs, actionSuccessful]) => {
              this.updateSubmitBtnClick(false)
              if(!actionSuccessful){
                if (submitBtnText === 'Update Link') {
                  return this.updateInvestmentAssociations(linkingCapitalIDs);
                } else if(submitBtnText === 'Create and Link'){
                  return this.createAndLinkNewInvestorCashflow()
                } else if(submitBtnText === 'Submit'){
                  return this.createOrUpdateCapitalActivity()
                }  
              }
    
              return of('')
            })
          )
        }
        else {
          this.saveState = 'WARNING'
          return of(formValidation)
        }
      })
    )

    this.disableSubmit$ = combineLatest([
      this.formStatus$, 
      this.submitBtnText$,
      this.actionSuccessful$
    ]).pipe(
      map(([status, submitBtnText, actionSuccessful]) => {

        if(actionSuccessful)
          return true;
        else if(submitBtnText === 'Create and Link' && status)
          return false;
        else if(submitBtnText === 'Submit' && status)
          return false
        else if(submitBtnText === 'Update Link')
          return false;

        return true;
        
      })
    )
  }

}