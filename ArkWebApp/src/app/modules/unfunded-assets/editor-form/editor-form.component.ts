import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { UnfundedAsset } from 'src/app/shared/models/UnfundedAssetModel';

@Component({
  selector: 'app-editor-form',
  templateUrl: './editor-form.component.html',
  styleUrls: ['./editor-form.component.scss']
})
export class EditorFormComponent implements OnInit {

  subscriptions: Subscription[] = []
  assetRef
  issuerSNOptions: string[]
  assetOptions: string[]
  issuerSNFilteredOptions: Observable<string[]>
  assetFilteredOptions: Observable<string[]>

  assetID: number
  adaptableApi: AdaptableApi
  isSuccess: boolean
  isFailure: boolean
  updateMsg: string
  disableSubmit: boolean

  constructor(
    public dialogRef: MatDialogRef<EditorFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private decimalPipe: DecimalPipe,
    private unfundedAssetsSvc: UnfundedAssetsService,
    private msalSvc: MsalUserService
  ) { }

  form: FormGroup = new FormGroup({
    asset: new FormControl(null, Validators.required),
    assetID: new FormControl(null, Validators.required),
    issuerShortName: new FormControl(null, Validators.required),
    commitmentAmount: new FormControl(null, Validators.required),
    ccy: new FormControl(null, Validators.required),
    fundedAmount: new FormControl(null, Validators.required),
    unfundedAmount: new FormControl(null, Validators.required),
    tobeFundedAmount: new FormControl(null, Validators.required),
    fundingDate: new FormControl(null, Validators.required) 
  })

  ngOnInit(): void {

    this.assetRef = this.data.assetRef
    this.adaptableApi = this.data.adaptableApi

    this.isSuccess = this.isFailure = false;
    this.disableSubmit = false;

    this.issuerSNOptions = [... new Set<string>(this.assetRef.map(ref => String(ref['issuerShortName'])))]
    this.assetOptions = this.assetRef.map(ref => ref['asset'])

    this.changeListeners();
  }

  ngOnDestroy(){

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changeListeners(){

    this.subscriptions.push(this.form.get('issuerShortName').valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((val) => {

      this.setAssetOptions(val)
      if(!this.issuerSNOptions.includes(val)){
        this.form.get('issuerShortName').setErrors({ invalid: true })
      }
    }))

    this.subscriptions.push(this.form.get('asset').valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((val) => {
    
      let idx: number = this.assetRef.map(ref => ref['asset']).indexOf(val);
      if(idx !== -1){

        this.form.patchValue({
          asset: this.assetRef[idx]['asset'],
          assetID: this.assetRef[idx]['assetID'],
          commitmentAmount: this.getAmountStr(this.decimalPipe, this.assetRef[idx]['commitmentAmount']),
          fundedAmount: this.getAmountStr(this.decimalPipe, this.assetRef[idx]['fundedAmount']),
          unfundedAmount: this.getAmountStr(this.decimalPipe, this.assetRef[idx]['unfundedAmount']),
          tobeFundedAmount: null,
          fundingDate: null,
          ccy: this.assetRef[idx]['ccy']
        })
      
        this.assetID = parseInt(this.assetRef[idx]['assetID'])
      }
      else{
        this.assetID = null;
        this.form.get('asset').setErrors({ invalid: true})
      }

    }))

    this.issuerSNFilteredOptions = this.form.get('issuerShortName').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.issuerSNOptions, value))
    )

    this.assetFilteredOptions = this.form.get('asset').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.assetOptions, value))
    )
  }

  _filter(options: string[], value:string): string []{
    if(value === null)
      return options;
    const filterValue = value.toLowerCase();
    return options.filter(op => op?.toLowerCase().includes(filterValue));
  }

  getAmountStr(transformer: DecimalPipe, amount: number | string): string {

    return transformer.transform(parseFloat(String(amount).replace(/,/g,'')), '1.0-2');
  }
  
  getAmountNumber(amount: string | number): number {
    
    return parseFloat(String(amount).replace(/,/,''));
  }

  setAssetOptions(issuer: string){
    
    this.assetOptions = [
      ... new Set<string>(this.assetRef
        .filter(ref => ref['issuerShortName'] === issuer))
      ].map(ref => ref['asset'])

  }

  onIssuerSelect(event: MatAutocompleteSelectedEvent){

    this.setAssetOptions(event.option.value);

    console.log(this.assetOptions)
    this.form.get('asset').reset();
  }

  getUnfundedAssetModel(): UnfundedAsset{

    let model: UnfundedAsset = <UnfundedAsset> {};
    
    model.rowID = null
    model.issuerShortName = this.form.get('issuerShortName').value;
    model.asset = this.form.get('asset').value;
    model.assetID = parseInt(this.form.get('assetID').value);
    model.ccy = this.form.get('ccy').value;
    model.commitmentAmount = this.getAmountNumber(this.form.get('commitmentAmount').value);
    model.unfundedAmount = this.getAmountNumber(this.form.get('unfundedAmount').value);
    model.fundedAmount = this.getAmountNumber(this.form.get('fundedAmount').value);
    model.tobefundedAmount = this.getAmountNumber(this.form.get('tobeFundedAmount').value);
    model.fundingDate = this.form.get('fundingDate').value;

    model.username = this.msalSvc.getUserName();
    return model;
  }

  onSubmit(){

    let model: UnfundedAsset = this.getUnfundedAssetModel();

    console.log(model)

    this.disableSubmit = true
    this.subscriptions.push(this.unfundedAssetsSvc.putUnfundedAsset(model).subscribe({
      next: (resp: any) => {

        if(resp.isSuccess){

          this.isSuccess = true
          this.isFailure = false

          this.updateMsg = `Successfully ${resp.returnMessage} the unfunded asset`;
          model.rowID = Number(resp.data);
          if(resp.returnMessage === 'Inserted')
            this.adaptableApi.gridApi.addGridData([model])
          else if(resp.returnMessage === 'Updated')
            this.adaptableApi.gridApi.updateGridData([model])
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
