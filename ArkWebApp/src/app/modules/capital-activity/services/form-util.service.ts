import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { formatDate } from 'src/app/shared/functions/formatter';
import { getAmountNumber, getMomentDate } from 'src/app/shared/functions/utilities';
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';

export type NetISS = [string, string, number]
export type NetAsset = [string, number]

@Injectable()
export class FormUtilService {
  constructor(private dataSvc: DataService) { }
  refData: any[]
  capitalTypeSubtypeAssociation: any[]
  actionType: 'LINK-ADD' | 'ADD' | 'EDIT'
  netISS: NetISS[] = []; // [ issuer, issuerShortName, wsoIssuerID] []
  netAssets: NetAsset[] = [] // [asset, assetID] []
  selectedIssuerID: number = null;
  selectedAssetID: number = null;
  issuerSNOptions: string[] = []
  issuerOptions: string[] = []
  assetOptions: string[] = []
  fundHedgingOptions: string[] = []
  capitalTypeOptions: string[] = []
  capitalSubTypeOptions: string[] = []
  strategyOptions: string[] = []
  overrideCurrencyOptions: string[] = []
  fundCcyOptions: string[] = []
  wsoIssuerIDOptions: number[] = []
  assetIDOptions: number[] = []

  validateField(options: string[], control: AbstractControl, field: string): string | null{
    //  Validates individual fields and returns fetched value if it's an allowed value.

    let val: string = control.get(field).value;
    if(val !== null && val !== ''){
      for(let i = 0; i < options.length; i+= 1){
        if(options[i].trim() === val.trim())
          return options[i];
      }
    }
    if((val === '' || val === null) && (['issuerShortName', 'asset', 'strategy','overrideCurrency'].includes(field)))
      return val;

    control.get(field).setErrors({invalid: true});
    return null;
  }

  capitalValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let issuerShortName: string = this.validateField(this.issuerSNOptions, control, 'issuerShortName');

    let asset: string = this.validateField(this.assetOptions, control, 'asset');

    let narrative: string = control.get('narrative').value;
    let callDate: string = formatDate(control.get('callDate').value, true)
    let valueDate: string = formatDate(control.get('valueDate').value, true)

    let fundHedging: string = this.validateField(this.fundHedgingOptions, control, 'fundHedging');
    let capitalType: string = this.validateField(this.capitalTypeOptions, control, 'capitalType');
    let capitalSubType: string = this.validateField(this.capitalSubTypeOptions, control, 'capitalSubType');
    let currency: string = this.validateField(this.fundCcyOptions, control, 'fundCcy');
    let strategy: string = this.validateField(this.strategyOptions, control, 'strategy');
    let overrideCurrency: string = this.validateField(this.overrideCurrencyOptions, control, 'overrideCurrency');
    let totalAmount: number = getAmountNumber(control.get('totalAmount').value);

    let CD: boolean = (callDate !== null && callDate !== 'Invalid date' && callDate > '2000/01/01')
    let VD: boolean = (valueDate !== null && valueDate !== 'Invalid date' && valueDate > '2000/01/01')
    let FH: boolean = (fundHedging !== null && fundHedging !== '')
    let CT: boolean = (capitalType !== null && capitalType !== '')
    let CST: boolean = (capitalSubType !== null && capitalSubType !== '')
    let CCY: boolean = (currency !== null && currency !== '')
    let TA: boolean = (totalAmount !== null) 

    let ISN_AS_NR = !control.get('issuerShortName')?.errors?.['invalid']
                  && !control.get('asset')?.errors?.['invalid']
                  && !control.get('narrative')?.errors?.['invalid']

    let ISN: boolean = (issuerShortName !== null && issuerShortName !== '');
    let AS: boolean = (asset !== null && asset !== '');
    let NR: boolean = (narrative !== null && narrative !== '');

    let ST = !control.get('strategy')?.errors?.['invalid']
    let OC = !control.get('overrideCurrency')?.errors?.['invalid']

    if(capitalType === 'NAV'){
      return (CD && VD && FH && CT && CST && CCY && TA && ST && OC) ? { validated: true} : { validated: false }
    }
    
    if(this.actionType === 'LINK-ADD')
      return ((CD && VD && FH && CT && CST && CCY && TA && (((ISN && AS)|| NR || ISN) && ISN_AS_NR && ST && OC) 
      )) ? { 
        validated : true 
      }: { 
        validated : false
    };
    else if(this.actionType === 'ADD' || this.actionType === 'EDIT')
      return (CD && VD && FH && CT && CST && CCY && TA
        && (((ISN && AS)|| NR || ISN) && ISN_AS_NR) && ST && OC) ? { 
        validated : true 
      }: { 
        validated : false
    };
    return {
      validated: false
    }
  }

  getCapitalActivityForm(form: UntypedFormGroup): CapitalActivityModel {
    let model: CapitalActivityModel = <CapitalActivityModel>{};
    model.valueDate = form.get('valueDate').value;
    model.callDate = form.get('callDate').value;
    model.narrative = form.get('narrative').value;
    model.capitalType = form.get('capitalType').value;
    model.capitalSubType = form.get('capitalSubType').value;
    model.strategy = form.get('strategy').value;
    model.overrideCurrency = form.get('overrideCurrency').value;
    model.fundCcy = form.get('fundCcy').value;
    model.totalAmount = getAmountNumber(form.get('totalAmount').value);
    model.fundHedging = form.get('fundHedging').value;
    model.issuerShortName = form.get('issuerShortName').value;
    model.asset = form.get('asset').value;

    model.valueDate = getMomentDate(model.valueDate)
    model.callDate = getMomentDate(model.callDate)

    model.wsoIssuerID = this.selectedIssuerID;  // selectedIssuerID is set at everypoint for every actionType

    model.wsoAssetID = this.selectedAssetID;    // selectedAssetID is set at everypoint for every actionType
      // If issuerShortName is NULL and wsoIssuerID isn't; then set it to null (can occur when issuerShortName was set previously, but wsoIssuerID wasn't cleared);
    if(model.issuerShortName === null)
      model.wsoIssuerID = this.selectedIssuerID = null;

    if(model.asset === null)
      model.wsoAssetID = this.selectedAssetID = null;

    if(['ADD', 'EDIT'].includes(this.actionType)){
      model.source = 'ArkUI - manual';
      model.sourceID = 1;
    }
    else if(this.actionType === 'LINK-ADD'){
      model.source = 'ArkUI - link';
      model.sourceID = 4;
    }
    model.modifiedBy = this.dataSvc.getCurrentUserName();
    return model;
  }

  setDynamicOptions(FH?: string, IssuerSN?: string, Asset?: string): void {
    if(FH || IssuerSN || Asset){
      if(FH && !IssuerSN && !Asset){
          /**
              Options: Get ISSUERS & ASSETS for selected FundHedging.
           */
        let issuers: string[] = []; 
        let issuerSN: string[] = [];
        let issuerIDs: number[] = [];  
        let assets: string[] = []; 
        let assetIDs: number[] = [];    
        this.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push(<string>row.issuer);
            issuerSN.push(<string>row.issuerShortName);
            issuerIDs.push(<number>row.wsoIssuerID);
            assets.push(<string>row.asset);
            assetIDs.push(<number>row.wsoAssetID);
          }
        });

        // this.assetOptions = [...new Set(assets)];
        this.netAssets = this.createNetAssets(assets, assetIDs);
        this.netISS = this.createNetISS(issuers, issuerSN, issuerIDs);
      }
      else if(FH && IssuerSN){
        /** 
         * GET
         *      ISSUERS for selected FundHedging.
         *      ASSETS for selected FundHedging & Issuer.
         *       
         *  Invoked during initial load for EDIT. 
         */
        let issuers = [];  
        let issuerSN = [];
        let issuerIDs = []; 
        let assets = [];
        let assetIDs: number[] = [];
        this.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push(<string> row.issuer)
            issuerSN.push(<string>row.issuerShortName)
            issuerIDs.push(<number> row.wsoIssuerID)
            if(row.issuerShortName === IssuerSN){
              assets.push(<string> row.asset);
              assetIDs.push(<number> row.wsoAssetID);
            }
          }
        });

        this.netAssets = this.createNetAssets(assets, assetIDs);
        this.netISS = this.createNetISS(issuers, issuerSN, issuerIDs);
      }
    }
    else{    
        /**
         *  Options: FETCH ALL OPTIONS.
         *  Invoked during initial load for ADD. 
         */
  
      for(let i = 0; i < this.refData.length; i+= 1){
        if(!!this.refData[i].issuer){
          this.issuerOptions.push(this.refData[i].issuer);
          this.issuerSNOptions.push(this.refData[i].issuerShortName)
          this.wsoIssuerIDOptions.push(this.refData[i].wsoIssuerID)
        }
        if(!!this.refData[i].asset){
          this.assetOptions.push(this.refData[i].asset);
          this.assetIDOptions.push(<number>this.refData[i].wsoAssetID);  
        }
      }

      this.netAssets = this.createNetAssets(this.assetOptions, this.assetIDOptions);
      this.netISS = this.createNetISS(this.issuerOptions, this.issuerSNOptions, this.wsoIssuerIDOptions);      

    }
  }   
  createNetISS(issuers: string[], issuerSN: string[], issuerIDs: number[]): NetISS[]{
    let netISS: NetISS[] = [];
    let seen = new Map();
    for(let i = 0; i < issuers.length; i+= 1){
      if(!!issuers[i] && !!issuerSN[i] && !!issuerIDs[i]){
        if(seen.has(issuers[i]) === null || seen.has(issuers[i]) === false){
          seen.set(issuers[i],true)
          netISS.push(<NetISS>[issuers[i], issuerSN[i], issuerIDs[i]])
        }  
      }
    }
    return netISS;
  }
  createNetAssets(assets: string[], assetIDs: number[]): NetAsset[]{
    let netAssets: NetAsset[] = [];
    let seen = new Map();
    for(let i: number = 0; i<assets.length; i+=1){
      if(!!assets[i] && !!assetIDs[i]){
        if(!seen.has(assets[i])){
          seen.set(assets[i], true);
          netAssets.push([assets[i], assetIDs[i]])
        }  
      }
    }
    return netAssets;
  }

  setFundCcy(FH: string, form: UntypedFormGroup): void{
    for(let i: number = 0; i < this.refData.length; i+= 1){
      let row = this.refData[i];
      if(row.fundHedging === FH){
        form.patchValue({
          fundCcy: row.fundCcy
        })
        break;
      }        
    }
  }
  setSubtypeOptions(capitalType?: string){
    if(!capitalType){
      this.capitalSubTypeOptions = [... new Set<string>(this.capitalTypeSubtypeAssociation.map(r => r?.['CapitalSubtype']))]
    }else{
      this.capitalSubTypeOptions = this.capitalTypeSubtypeAssociation?.filter(r => r?.['CapitalType'] == capitalType).map(r => r?.['CapitalSubtype'])
    }
  }
  _filterCapitalSubtype(value?: string): string[]{
    if(!value)
      return this.capitalSubTypeOptions;
    const filterValue = value.toLowerCase();
    return this.capitalSubTypeOptions.filter(op => op.toLowerCase().includes(filterValue))
  }
  _filterIS(value?: string): [string, string, number][]{
    if(value === null)
      return this.netISS; 
    const filterValue = value.toLowerCase();
    return this.netISS.filter(op => 
      op[1].toLowerCase().includes(filterValue))  // op = [issuer,issuerShortName, wsoIssuerID]
  }
  _filterAsset(value?: string): [string, number][] {
    if(value === null)
      return this.netAssets;
    const filterValue = value.toLowerCase();
    return this.netAssets.filter(op => 
      op[0].toLowerCase().includes(filterValue))  // op = [asset, wsoAssetID]  
  }
  _filter(options: string[],value:string): string []{
    if(value === null)
      return options;
    const filterValue = value.toLowerCase();
    return options?.filter(op => op.toLowerCase().includes(filterValue));
  }
}