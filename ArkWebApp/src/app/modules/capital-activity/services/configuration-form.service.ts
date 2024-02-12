import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { ICapitalActivityConfig } from 'src/app/shared/models/CapitalActivityModel';
import { APIReponse } from 'src/app/shared/models/GeneralModel';
import { ConfigurationService } from './configuration.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';

export type ValidateColumn = {isValid: boolean, col?: string};

@Injectable()
export class ConfigurationFormService {
  
    /* Set to true when submit button is clicked. */
    submitForm = new BehaviorSubject<boolean>(false);
    submitForm$ = this.submitForm.asObservable();
    updateSubmitForm(submitForm: boolean){
        this.submitForm.next(submitForm)
    }


    /* Set to true when PUT API call is successful. */
    isActionSuccessful = new BehaviorSubject<boolean>(false);
    isActionSuccessful$ = this.isActionSuccessful.asObservable();
    updateIsActionSuccessful(isActionSuccessful: boolean){
        this.isActionSuccessful.next(isActionSuccessful);
    }

    /* The value depends on isActionSuccessful*/
    saveStateMessage = new BehaviorSubject<string>('PENDING');
    saveStateMessage$ = this.saveStateMessage.asObservable();
    updateSaveStateMessage(saveStateMsg: 'PENDING' | 'SUCCESS' | 'FAILURE'){
        this.saveStateMessage.next(saveStateMsg)
    }

    configurationForm: FormGroup  

    validationMessage$: Observable<string>
    disableSubmitButton$: Observable<boolean>
    capitalActivityConfig$: Observable<boolean>


    constructor(
        private capitalActivitySvc: CapitalActivityService,
        private configurationSvc: ConfigurationService,
        private dataSvc: DataService
    ) { 
        this.init()
    }

    init(){
        
        this.configurationForm = new FormGroup({
            lockDate: new FormControl(null, Validators.required),
        })


    
        this.capitalActivityConfig$ = this.configurationSvc.capitalActivityConfig$.pipe(
            map((val) => {
                if(val !== null){
                    /* The val is set to null whenever form is opened but request for get lock date is not complete, 
                        Note - If lock date config table is empty then val is set to undefined in that case we set lockDate as '' which is valid case.
                    */
                    this.configurationForm.controls['lockDate'].setValue(val?.lockDate ?? '')
                    return true
                }
                return false
            })
        )
            
        this.disableSubmitButton$ =  combineLatest([this.configurationForm.statusChanges,this.isActionSuccessful$]).pipe(
            switchMap(([status,isActionSuccessful]) => {
                if(isActionSuccessful || status !== "VALID"){
                    return of(true)
                }else{
                    return of(false)
                }
            })
        )

        this.validationMessage$ = this.submitForm$.pipe(
            switchMap(() => combineLatest([this.isActionSuccessful$, this.submitForm$]).pipe(
                take(1),
                switchMap(([isActionSuccessful, submitForm]) => {
                    if(!isActionSuccessful && submitForm){
                        return this.putCapitalActivityConfig();
                    }

                    return of('')
                })
            ))
        )

    }


    getCapitalActivityConfigObject() : ICapitalActivityConfig {
        let updatedConfig: ICapitalActivityConfig  = {
            lockDate : this.configurationForm.value['lockDate'],
            addedBy : this.dataSvc.getCurrentUserName()
        }

        return updatedConfig
    }

    putCapitalActivityConfig(){

        let updatedConfig = this.getCapitalActivityConfigObject()

        return this.capitalActivitySvc.putCapitalActivityConfig(updatedConfig).pipe(
            take(1),
            map((response: APIReponse) => {
                if(response.isSuccess){
                    this.updateSaveStateMessage('SUCCESS')
                    this.updateIsActionSuccessful(response.isSuccess)
                    this.configurationSvc.updateCapitalActivityConfig(updatedConfig) // this updated data will be used by config grid service to update row in audit grid
                }else{
                    this.updateSaveStateMessage('FAILURE')
                }
                return response.returnMessage
                
            })
        )
    }

    onSubmit(){
          this.updateSubmitForm(true)  // This will trigger validationMessge$ observable.
    }



}