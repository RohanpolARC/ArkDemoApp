import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first, retry } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { IUniqueValuesForField } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class RefService {

  constructor(private dataSvc: DataService) { }

  issuerShortNameList: string[];
  assetList: string[];
  currencyList: string[];
  benchMarkIndexList: string[];
  dealTypeCSList: string[];
  dealTypeList: string[];
  seniorityList: string[];
  refDataLoadFailed:boolean = false

    
  isRefDataLoaded(){
    return (this.issuerShortNameList?.length && this.benchMarkIndexList?.length && this.currencyList?.length && this.assetList?.length && this.dealTypeCSList?.length && this.dealTypeList?.length && this.seniorityList?.length)
  }

  loadRefData(){
    forkJoin([
      this.dataSvc.getUniqueValuesForField('issuerShortName'),
      this.dataSvc.getUniqueValuesForField('asset'),
      this.dataSvc.getUniqueValuesForField('currency'),
      this.dataSvc.getUniqueValuesForField('BenchMark Index'),
      this.dataSvc.getUniqueValuesForField('Deal Type (CS)'),
      this.dataSvc.getUniqueValuesForField('Seniority'),
      this.dataSvc.getUniqueValuesForField('Deal Type')
    ]).pipe(
      first(),
      retry(1)
    ).subscribe({
      next:(ref: IUniqueValuesForField[][])=>{
        this.issuerShortNameList = ref[0].map(item=>item.value)
        this.assetList = ref[1].map(item=>item.value)
        this.currencyList = ref[2].map(item=>item.value)
        this.benchMarkIndexList = ref[3].map(item=>item.value)
        this.dealTypeCSList = ref[4].map(item=>item.value)
        this.seniorityList = ref[5].map(item=>item.value)
        this.dealTypeList = ref[6].map(item=>item.value)
      },
      error:(err)=>{
        console.error(err)
        this.refDataLoadFailed = true
      }
    })


  }
}
