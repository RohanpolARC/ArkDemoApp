import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { getAmountNumber, getAmountStr, getMomentDate, _filter } from 'src/app/shared/functions/utilities';
import { UnfundedAsset } from 'src/app/shared/models/UnfundedAssetModel';

@Component({
  selector: 'app-unfunded-assets-editor',
  templateUrl: './unfunded-assets-editor.component.html',
  styleUrls: ['./unfunded-assets-editor.component.scss']
})
export class UnfundedAssetsEditorComponent implements OnInit {

  action: 'ADD' | 'EDIT'
  subscriptions: Subscription[] = []
  assetRef
  issuerSNOptions: string[]
  assetOptions: string[]
  issuerSNFilteredOptions: Observable<string[]>
  assetFilteredOptions: Observable<string[]>
  ccyOptions: string[] = ['CAD', 'EUR', 'JPY', 'GBP', 'USD']
  ccyFilteredOptions: Observable<string[]>
  
  assetID: number
  adaptableApi: AdaptableApi
  isSuccess: boolean
  isFailure: boolean
  updateMsg: string
  disableSubmit: boolean

  originalRowData

  constructor(
    public dialogRef: MatDialogRef<UnfundedAssetsEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private decimalPipe: DecimalPipe,
    private unfundedAssetsSvc: UnfundedAssetsService,
    private msalSvc: MsalUserService
  ) { }

  form: FormGroup

  formValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    
    let model: UnfundedAsset = this.getUnfundedAssetModel();

    let isAssetValid: boolean = false;
    let isIssuerValid: boolean = false;
    let isCcyValid: boolean = false;
    let istobefundedAmountValid: boolean = false;
    let isfundingDateValid: boolean = false;

    if(this.action === 'EDIT'){
      isAssetValid = this.assetOptions.includes(model.asset) || this.originalRowData?.['asset'] === model.asset;
      isIssuerValid = this.issuerSNOptions.includes(model.issuerShortName) || this.originalRowData?.['issuerShortName'] === model.issuerShortName;
    }
    else{
      isAssetValid = this.assetOptions.includes(model.asset);
      isIssuerValid = this.issuerSNOptions.includes(model.issuerShortName);
    }

    isCcyValid = this.ccyOptions.includes(model.ccy)
    istobefundedAmountValid = !isNaN(getAmountNumber(model.tobefundedAmount));
    isfundingDateValid = !!model.fundingDate && (String(model.fundingDate) !== 'Invalid Date')

    return isAssetValid && isIssuerValid && isCcyValid && istobefundedAmountValid && isfundingDateValid ? { isValid: true } : { isValid: false};
  };

  initForm(){

    this.form = new FormGroup({
      asset: new FormControl(null, Validators.required),
      issuerShortName: new FormControl(null, Validators.required),
      commitmentAmount: new FormControl(null, Validators.required),
      ccy: new FormControl(null, Validators.required),
      fundedAmount: new FormControl(null, Validators.required),
      unfundedAmount: new FormControl(null, Validators.required),
      tobeFundedAmount: new FormControl(null, Validators.required),
      fundingDate: new FormControl(null, Validators.required) 
    }, {
      validators: this.formValidator
    })

    if(this.action === 'EDIT'){

      let asset: string = this.data.rowData['asset']
      let issuerShortName: string = this.data.rowData['issuerShortName'];
      let ccy: string = this.data.rowData['ccy'];
      let commitmentAmount: string = this.data.rowData['commitmentAmount'];
      let fundedAmount: string = this.data.rowData['fundedAmount'];
      let unfundedAmount: string = this.data.rowData['unfundedAmount'];
      let tobefundedAmount: string = this.data.rowData['tobefundedAmount'];
      let fundingDate: Date = this.data.rowData['fundingDate'];
  
      this.form.patchValue({
        asset: asset,
        issuerShortName: issuerShortName,
        commitmentAmount: getAmountStr(this.decimalPipe, commitmentAmount),
        ccy: ccy,
        fundedAmount: getAmountStr(this.decimalPipe, fundedAmount),
        unfundedAmount: getAmountStr(this.decimalPipe, unfundedAmount),
        tobeFundedAmount: getAmountStr(this.decimalPipe, tobefundedAmount),
        fundingDate: fundingDate
      }, {
        emitEvent: true
      })
  
      this.assetID = this.data.rowData['assetID']  

      this.setAssetOptions(issuerShortName);
    }
  }

  ngOnInit(): void {

    this.assetRef = this.data.assetRef
    this.adaptableApi = this.data.adaptableApi

    this.originalRowData = JSON.parse(JSON.stringify(this.data.rowData));
    this.action = this.data.action
    this.isSuccess = this.isFailure = false;
    this.disableSubmit = true;


    this.issuerSNOptions = [... new Set<string>(this.assetRef?.map(ref => String(ref['issuerShortName'])))]
    this.assetOptions = this.assetRef.map(ref => ref['asset'])

    this.initForm();

    this.changeListeners();
  }

  ngOnDestroy(){

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changeListeners(){

    this.subscriptions.push(this.form.statusChanges.pipe(
      debounceTime(350)
    ).subscribe(() => {

      this.disableSubmit = !this.form.errors?.['isValid']
    }))

    this.subscriptions.push(this.form.get('issuerShortName').valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((val) => {

      this.setAssetOptions(val)
      if(!this.issuerSNOptions.includes(val) && this.originalRowData?.['issuerShortName'] !== val){
        this.form.get('issuerShortName').setErrors({ invalid: true })
      }
    }))

    this.subscriptions.push(this.form.get('asset').valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((val) => {
    
      let issuerSN: string = this.form.get('issuerShortName').value;
      let idx: number = -1;
      
      for(let i = 0 ; i < this.assetRef?.length; i+=1){
        if(this.assetRef[i]['issuerShortName'] === issuerSN && this.assetRef[i]['asset'] === val){
          idx = i;
          break;
        }
      }

      if(idx !== -1){

        this.form.patchValue({
          asset: this.assetRef[idx]['asset'],
          commitmentAmount: getAmountStr(this.decimalPipe, this.assetRef[idx]['commitmentAmount']),
          fundedAmount: getAmountStr(this.decimalPipe, this.assetRef[idx]['fundedAmount']),
          unfundedAmount: getAmountStr(this.decimalPipe, this.assetRef[idx]['unfundedAmount']),
          tobeFundedAmount: null,
          fundingDate: null,
          ccy: this.assetRef[idx]['ccy']
        })
      
        this.assetID = parseInt(this.assetRef[idx]['assetID'])
      }
      else if(val === this.originalRowData?.['asset']){

        this.form.patchValue({
          asset: this.originalRowData?.['asset'],
          commitmentAmount: this.originalRowData?.['commitmentAmount'],
          fundedAmount: this.originalRowData?.['fundedAmount'],
          unfundedAmount: this.originalRowData?.['unfundedAmount'],
          tobeFundedAmount: this.originalRowData?.['tobefundedAmount'],
          fundingDate: this.originalRowData?.['fundingDate'],
          ccy: this.originalRowData?.['ccy'],
        })

        this.assetID = this.originalRowData?.['assetID'];
      }
      else{
        this.assetID = null;
        this.form.get('asset').setErrors({ invalid: true})
      }

    }))

    this.issuerSNFilteredOptions = this.form.get('issuerShortName').valueChanges.pipe(
      startWith(''),
      map(value => _filter(this.issuerSNOptions, value))
    )

    this.assetFilteredOptions = this.form.get('asset').valueChanges.pipe(
      startWith(''),
      map(value => _filter(this.assetOptions, value))
    )

    this.ccyFilteredOptions = this.form.get('ccy').valueChanges.pipe(
      startWith(''),
      map(value => _filter(this.ccyOptions, value)),
    );
  }

  setAssetOptions(issuer: string){
    
    this.assetOptions = [
      ... new Set<string>(this.assetRef
        .filter(ref => ref['issuerShortName'] === issuer))
      ].map(ref => ref['asset'])

  }

  onIssuerSelect(event: MatAutocompleteSelectedEvent){

    this.setAssetOptions(event.option.value);
    this.form.get('asset').reset();
    this.assetID = null;
    this.form.get('commitmentAmount').reset();
    this.form.get('unfundedAmount').reset();
    this.form.get('fundedAmount').reset();
    this.form.get('tobeFundedAmount').reset();
    this.form.get('ccy').reset();
    this.form.get('fundingDate').reset();
  }

  getUnfundedAssetModel(): UnfundedAsset{

    let model: UnfundedAsset = <UnfundedAsset> {};
    
    if(this.action === 'EDIT')
      model.rowID = this.data.rowData['rowID']
    else  
      model.rowID = null
    model.issuerShortName = this.form?.get('issuerShortName').value;
    model.asset = this.form?.get('asset').value;
    model.assetID = this.assetID;
    model.ccy = this.form?.get('ccy').value;
    model.commitmentAmount = getAmountNumber(this.form?.get('commitmentAmount').value);
    model.unfundedAmount = getAmountNumber(this.form?.get('unfundedAmount').value);
    model.fundedAmount = getAmountNumber(this.form?.get('fundedAmount').value);
    model.tobefundedAmount = getAmountNumber(this.form?.get('tobeFundedAmount').value);
    model.fundingDate = getMomentDate(this.form?.get('fundingDate').value);

    model.username = this.msalSvc.getUserName();
    return model;
  }

  onSubmit(){

    let model: UnfundedAsset = this.getUnfundedAssetModel();

    this.disableSubmit = true
    this.subscriptions.push(this.unfundedAssetsSvc.putUnfundedAsset(model).subscribe({
      next: (resp: any) => {

        if(resp.isSuccess){

          this.isSuccess = true
          this.isFailure = false

          this.updateMsg = `Successfully ${resp.returnMessage.toLowerCase()} the unfunded asset`;
          model.rowID = Number(resp.data);
          if(resp.returnMessage === 'Inserted')
            this.adaptableApi?.gridApi.addGridData([model])
          else if(resp.returnMessage === 'Updated')
            this.adaptableApi?.gridApi.updateGridData([model])

          this.form.disable()
        }
        else{
          this.updateMsg = `Failed to insert/update the unfunded asset`
          this.isSuccess = false;
          this.isFailure = true;
        }
      },
      error: (error) => {

        this.disableSubmit = false;
        this.updateMsg = `Failed to insert/update the unfunded asset`
        this.isSuccess = false
        this.isFailure = true
      }
    }))
    
  }

  onClose(){
    this.dialogRef.close();
  }
}
