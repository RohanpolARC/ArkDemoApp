import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { FilterConfig } from '../../models/GeneralModel';
import {  Subscription } from 'rxjs';
import { getLastBusinessDay, getLastQuarterEnd, getLastToLastQuarterEnd, getMomentDateStr } from '../../functions/utilities';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataService } from 'src/app/core/services/data.service';
import { debounceTime, distinctUntilChanged, first } from 'rxjs/operators';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FilterValueChangeParams } from '../../models/FilterPaneModel';

@Component({
  selector: 'app-general-filter',
  templateUrl: './general-filter.component.html',
  styleUrls: ['./general-filter.component.scss']
})
export class GeneralFilterComponent implements OnInit {

  @Input() screen:string

  subscriptions : Subscription[]=[]
  filters:FilterConfig[]
  dropdownSettingsMultiple: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  dropdownSettingsSingle: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'value',
    itemsShowLimit: 1,
    allowSearchFilter: true
  }
  optionsListObject :  any[] = []
  dateRange: UntypedFormGroup



  constructor(
    private filterSvc:GeneralFilterService,
    private DataSvc:DataService
  ) { }

  ngOnInit(): void {
        this.subscriptions.push(this.filterSvc.getFilters(this.screen).pipe(
          first()
        ).subscribe((data:FilterConfig[])=>{
          this.filters = data
          this.filters.forEach(filter=>{
            if(filter.type==='date'){
              filter.value = this.setDefaultDateValue(filter.default)
              this.onChange(filter.value,filter.id,filter.isReport,filter.reportParamName) //event emitter call to notify default values are set
  
            }else if(filter.type === 'multi-select'){
              //filter.options has field values (fund,fundhedging) to retrieve the drop down data
              this.subscriptions.push(this.DataSvc.getUniqueValuesForField(filter.options).pipe(
                first()
              ).subscribe({
                next: (data: any[]) => {
                
                if(filter.default){
                  //if all is provided for fund/fundhedging all data gets selected
                  if(filter.default.toLowerCase()==='all'){
                    filter.value = data
                  }else{
                    let preselectedList = filter.default.split(',') // default values of multi-select list

                    filter.value  = data.filter(x=> preselectedList.includes(x?.['value']))
  
                  }
                }else{
                  filter.value = []
                }
                filter.optionsList = data
                this.onChange(filter.value,filter.id,filter.isReport,filter.reportParamName) //event emitter call to notify default values are set

                  
              }}))
            }else if(filter.type === 'single-select'){
    
              
              this.subscriptions.push(this.DataSvc.getUniqueValuesForField(filter.options).pipe(
                first()
              ).subscribe({
                next: (data: any[]) => {
                
                let preselectedList = filter.default.split(',')

                filter.value  = data.filter(x=> preselectedList.includes(x?.['value']))
                filter.optionsList = data
                this.onChange(filter.value,filter.id,filter.isReport,filter.reportParamName) //event emitter call to notify default values are set

                  
              }}))
            } else if (filter.type==='toggle'){
              filter.value = this.setDefaultBooleanValue(filter.default)         
              this.onChange(filter.value,filter.id,filter.isReport,filter.reportParamName) //event emitter call to notify default values are set

  
            }else if(filter.type ==='date-range'){
              let defaultValues  = []
              defaultValues = filter.default?.split(',') //comma separated start date and end date default are given in database
              let defaultStartDate = this.setDefaultDateValue(defaultValues?.[0])
              let defaultEndDate
              if(defaultValues.length<2){
                defaultEndDate = defaultStartDate //if only one default value is provided in database
              }else{
                defaultEndDate = this.setDefaultDateValue(defaultValues?.[1])
              }

              this.dateRange = new UntypedFormGroup({
                start: new UntypedFormControl(defaultStartDate),
                end: new UntypedFormControl(defaultEndDate),
              });             
              this.onChange({
                start:defaultStartDate,
                end:defaultEndDate
              },filter.id,filter.isReport,filter.reportParamName)
  
  
              this.subscriptions.push(this.dateRange.valueChanges.pipe(
                debounceTime(200),
                distinctUntilChanged()
              ).subscribe(dtRange => {
  
                this.onChange({
                start: getMomentDateStr(dtRange.start),
                end: getMomentDateStr(dtRange.end)
                },filter.id,filter.isReport,filter.reportParamName)
  
              }))
  
              filter.value = this.dateRange
  
  
            }else{
              filter.value = filter.default
              this.onChange(filter.value,filter.id,filter.isReport,filter.reportParamName)
  
            }
            this.filterSvc.emitFilterConfig()
          })
        })
        )
  }


  emitFilterConfig(filterValues: any[]){
    this.filterSvc.emitFilterConfig()
  }

  getPlaceholder(option,isSingleSelect=0){
    if(isSingleSelect){
      return 'Select '+option
    }
    return 'Select '+option+ '(s)'
  }

  setDefaultBooleanValue(value:string){
    if(value.toLowerCase() === 'true'){
      return true
    }else {
      return false
    }
  }


  setDefaultDateValue(defaultValue?:string):any{
    if(defaultValue.toLowerCase() === 'lastbusinessday'){
      return getMomentDateStr(getLastBusinessDay());
    }else if(defaultValue.toLowerCase()==='lastquarterend'){
      return getMomentDateStr(getLastQuarterEnd())
    }
    else if(defaultValue.toLowerCase()==='lasttolastquarterend'){
      return getMomentDateStr(getLastToLastQuarterEnd())
    }
    return getMomentDateStr(getLastBusinessDay());
  }


  getFilterValueChangeParams(
    value : any,
    id : number,
    isReport : boolean,
    reportParamName : string
  ){
    let filterValueChange:FilterValueChangeParams = {
      value : value
    }
    if(isReport){
      filterValueChange.reportParamName = reportParamName
      filterValueChange.isReport = true
    }

    this.filterSvc.filterValues[id] = filterValueChange
    return filterValueChange
  }

  onChange(
    value : any,
    id : number,
    isReport : boolean,
    reportParamName : string)
  {
    this.getFilterValueChangeParams(value,id,isReport,reportParamName)
    this.filterSvc.emitFilterConfig()
    
  }

  ngOnDestroy():void{
    this.subscriptions.forEach(_=>_.unsubscribe())
  }

}
