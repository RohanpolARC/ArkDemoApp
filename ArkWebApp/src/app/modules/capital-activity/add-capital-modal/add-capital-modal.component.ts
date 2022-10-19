import { Component, OnInit, Inject, ViewChild, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { Subscription } from 'rxjs';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import * as moment from 'moment';
import { UpdateConfirmComponent } from '../update-confirm/update-confirm.component';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ColDef, GridOptions, GridReadyEvent } from '@ag-grid-community/core';

import { dateFormatter, amountFormatter } from 'src/app/shared/functions/formatter';
import { LinkInvestorModalComponent } from '../link-investor-modal/link-investor-modal.component';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-add-capital-modal',
  templateUrl: './add-capital-modal.component.html',
  styleUrls: ['./add-capital-modal.component.scss'],
})
export class AddCapitalModalComponent implements OnInit{

  @ViewChild('linkComponent')
  private childLinkComponent: LinkInvestorModalComponent;

  capitalAct: CapitalActivityModel = <CapitalActivityModel>{};

  subscriptions: Subscription[] = [];
  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[]= [];
  fundHedgingOptions = [];
  issuerOptions = []; 
  issuerSNOptions = [];
  wsoIssuerIDOptions = [];
  assetOptions = [];
  assetIDOptions = [];
  fundCcyOptions = [];
  positionCcyOptions = [];

  header: string;
  buttontext: string;

  isSuccess: boolean;
  isFailure: boolean;
  updateMsg:string;
  disableSubmit: boolean = true;
  valueErrorMessage: string = null;

  capitalTypeFilteredOptions: Observable<string[]>;
  capitalSubTypeFilteredOptions: Observable<string[]>;
  
  fundHedgingFilteredOptions: Observable<string[]>;
  assetFilteredOptions: Observable<[string, number][]>;
  issuerFilteredOptions: Observable<[string, string, number][]>;
  fundCcyFilteredOptions: Observable<string[]>;
  posCcyFilteredOptions: Observable<string[]>;

  netISS: [string, string, number][] = []; // [ issuer, issuerShortName, wsoIssuerID] []
  netAssets: [string, number][] = [] // [asset, assetID] []
  selectedIssuerID: number = null;
  selectedAssetID: number = null;

  gridData: any[] = [];
  
  placeHolderGIR: string = null;

  isFormPurelyNotValid: {
    disable: boolean
  } = {
    disable: true
  }; // To be sent to link investor component.
  isAlreadyLinked: boolean = null;
  linkStatus
  fxRateSource: string;
  posCcyChangeMsg: string = 'Rate will flow to Asset GIR only if position currency matches that on investment side'

  validateField(options: string[], control: AbstractControl, field: string): string | null{
      //  Validates individual fields and returns fetched value if it's an allowed value.

    let val: string = control.get(field).value;
    if(val !== null && val !== ''){
      for(let i = 0; i < options.length; i+= 1){
        if(options[i].trim() === val.trim())
          return options[i];
      }
    }
    if((val === '' || val === null) && (field === 'issuerShortName' || field === 'asset'))
      return val;

    control.get(field).setErrors({invalid: true});
    return null;
  }

  capitalValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let issuerShortName: string = this.validateField(this.issuerSNOptions, control, 'issuerShortName');

    let asset: string = this.validateField(this.assetOptions, control, 'asset');

    let narrative: string = control.get('narrative').value;
    let callDate: string = moment(control.get('callDate').value).format('YYYY-MM-DD');
    let valueDate: string = moment(control.get('valueDate').value).format('YYYY-MM-DD');

    let fundHedging: string = this.validateField(this.fundHedgingOptions, control, 'fundHedging');
    let capitalType: string = this.validateField(this.capitalTypeOptions, control, 'capitalType');
    let capitalSubType: string = this.validateField(this.capitalSubTypeOptions, control, 'capitalSubType');
    let currency: string = this.validateField(this.fundCcyOptions, control, 'fundCcy');
    let posCcy: string = this.validateField(this.positionCcyOptions, control, 'posCcy');

    let totalAmount: number = control.get('totalAmount').value;
    let fxRate: number  = control.get('fxRate').value;
    
    // fxRateOverride will be always valid since it can be either true/false (checked/unchecked). So, not considering it here.

    let localAmount: number = control.get('localAmount').value;

    let CD: boolean = (callDate !== null && callDate !== 'Invalid date')
    let VD: boolean = (valueDate !== null && valueDate !== 'Invalid date')
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
        
    let POSCcy: boolean = (posCcy !== null && posCcy !== '');
    let FX: boolean = (fxRate !== null)
    let LA: boolean = (localAmount !== null)

    if(this.data.actionType === 'LINK-ADD')
      return ((CD && VD && FH && CT && CST && CCY && TA && (((ISN && AS)|| NR || ISN) && ISN_AS_NR) && FX && LA)) ? { 
        validated : true 
      }: { 
        validated : false
      };
    else if(this.data.actionType === 'ADD' || this.data.actionType === 'EDIT')
      return (CD && VD && FH && CT && CST && CCY && TA && POSCcy && (((ISN && AS)|| NR || ISN) && ISN_AS_NR)) ? { 
        validated : true 
      }: { 
        validated : false
      };

    return {
      validated: false
    }
  }

  capitalActivityForm= new FormGroup({
    valueDate: new FormControl(null, Validators.required),
    callDate: new FormControl(null, Validators.required),
    narrative: new FormControl(null),
    capitalType: new FormControl(null, Validators.required),
    capitalSubType: new FormControl(null, Validators.required),
    fundCcy: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    fundHedging: new FormControl(null, Validators.required),
    issuerShortName: new FormControl(null),
    asset: new FormControl(null),


    localAmount: new FormControl(null, Validators.required),
    fxRate: new FormControl(null, Validators.required),
    fxRateOverride: new FormControl(null, Validators.required),
    posCcy: new FormControl(null, Validators.required),
  },{
    validators: this.capitalValidator
  }
  );

  constructor(public dialogRef: MatDialogRef<AddCapitalModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: {
      rowData : any,
      adapTableApi: AdaptableApi,
      adapTableApiInvstmnt: AdaptableApi,
      actionType: string,
      capitalTypes: string[],
      capitalSubTypes: string[],
      refData: any,
      gridData: any
    },
    public dialog: MatDialog,
    private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService,
    private dataSvc: DataService) { }

  createNetISS(issuers: string[], issuerSN: string[], issuerIDs: number[]){
    this.netISS = [];
    let seen = new Map();
    for(let i = 0; i < issuers.length; i+= 1){
      if(!!issuers[i] && !!issuerSN[i] && !!issuerIDs[i]){
        if(seen.has(issuers[i]) === null || seen.has(issuers[i]) === false){
          seen.set(issuers[i],true)
          this.netISS.push([issuers[i], issuerSN[i], issuerIDs[i]])
        }  
      }
    }
  }

  createNetAssets(assets: string[], assetIDs: number[]){
    this.netAssets = [];
    let seen = new Map();
    for(let i: number = 0; i<assets.length; i+=1){
      if(!!assets[i] && !!assetIDs[i]){
        if(!seen.has(assets[i])){
          seen.set(assets[i], true);
          this.netAssets.push([assets[i], assetIDs[i]])
        }  
      }
    }    
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
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push(<string>row.issuer);
            issuerSN.push(<string>row.issuerShortName);
            issuerIDs.push(<number>row.wsoIssuerID);
            assets.push(<string>row.asset);
            assetIDs.push(<number>row.wsoAssetID);
          }
        });

        // this.assetOptions = [...new Set(assets)];
        this.createNetAssets(assets, assetIDs);
        this.createNetISS(issuers, issuerSN, issuerIDs);
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
        this.data.refData.forEach(row => {
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

        this.createNetAssets(assets, assetIDs);
        this.createNetISS(issuers, issuerSN, issuerIDs);
      }
    }
    else{    
        /**
         *  Options: FETCH ALL OPTIONS.
         *  Invoked during initial load for ADD. 
         */
  
      for(let i = 0; i < this.data.refData.length; i+= 1){
        if(!!this.data.refData[i].issuer){
          this.issuerOptions.push(this.data.refData[i].issuer);
          this.issuerSNOptions.push(this.data.refData[i].issuerShortName)
          this.wsoIssuerIDOptions.push(this.data.refData[i].wsoIssuerID)
        }
        if(!!this.data.refData[i].asset){
          this.assetOptions.push(this.data.refData[i].asset);
          this.assetIDOptions.push(<number>this.data.refData[i].wsoAssetID);  
        }
      }

      // this.assetOptions = [...new Set(this.assetOptions)] 

      this.createNetAssets(this.assetOptions, this.assetIDOptions);
      this.createNetISS(this.issuerOptions, this.issuerSNOptions, this.wsoIssuerIDOptions);      

    }
  }   

  setFundCcy(FH: string): void{
    for(let i: number = 0; i < this.data.refData.length; i+= 1){
      let row = this.data.refData[i];
      if(row.fundHedging === FH){
        this.capitalActivityForm.patchValue({
          fundCcy: row.fundCcy
        })
        break;
      }        
    }
  }

  setPositionCcy(FH: string, ISN: string, AS: string): void{
    if(FH && ISN && AS){
      for(let i: number = 0; i < this.data.refData.length; i+= 1){
        let row = this.data.refData[i];
        if(row.fundHedging === FH && row.issuerShortName === ISN && row.asset === AS){
          this.capitalActivityForm.patchValue({
            posCcy: row.positionCcy
          })
          break;
        }
      }
    }
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
    return options.filter(op => op.toLowerCase().includes(filterValue));
  }

  setIssuerID(ISS: [string, string, number]){
    //ISS: [Issuer + IssuerShortName, IssuerShortName, wsoIssuerID]
    this.selectedIssuerID = ISS[2];
    this.getFormCapitalAct();   // getFormCapitalAct() on statusChanges() gets called before setting selectedIssuerID
  }
 
  setAssetID(asset: [string, number]){
    this.selectedAssetID = asset[1];
    this.getFormCapitalAct();   // getFormCapitalAct() on statusChanges() gets called before setting selectedAssetID
  }
/** Listening for changing the autocomplete options, based on selected values */  

  issuerSelect(event: MatAutocompleteSelectedEvent){
    let ISN: string = event.option.value;

    /* 
      DO NOT CHANGE THE ORDER:
        1.) setDynamicOptions
        2.) observable trigger (performed by reset() action here)
      This will set the issuerSNOptions & assetOptions 

      Similarly for fundHedgingSelect();
    */
    this.setDynamicOptions(this.capitalActivityForm.get('fundHedging').value, ISN, null);

    /* 
      Clears the asset field and triggers the observable for assetFilteredOptions via reset(). 
      NOTE: If not reseting in future, make sure to TRIGGER OBSERVABLE manually.
      
      Triggering observable makes the newly set assetOptions available to assetFilteredOptions.
    */
    this.capitalActivityForm.get('asset').reset();
  }

  fundHedgingSelect(event: MatAutocompleteSelectedEvent){
    let FH: string = event.option.value;
    this.setDynamicOptions(FH, null, null);
    this.capitalActivityForm.get('issuerShortName').reset();
    this.capitalActivityForm.get('asset').reset();
    this.setFundCcy(FH);
  }

  assetSelect(event: MatAutocompleteSelectedEvent){
    let AS: string = event.option.value;
    let FH: string = this.capitalActivityForm.get('fundHedging').value;
    let ISN: string = this.capitalActivityForm.get('issuerShortName').value;
    this.setPositionCcy(FH, ISN, AS)
  }

  positionCcySelect(event: MatAutocompleteSelectedEvent){
    if(this.capitalActivityForm.get('fxRateOverride').value){
      this.dataSvc.setWarningMsg(this.posCcyChangeMsg, 'Dismiss', 'ark-theme-snackbar-warning')
    }
  }

  changeListeners(): void{

    this.subscriptions.push(this.capitalActivityForm.get('fxRate').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(GIR => {

      if(this.data?.rowData?.fxRate === GIR && this.capitalActivityForm.get('fxRateOverride').value){      // Old GIR != new GIR and Overide
        this.fxRateSource = this.data?.rowData?.fxRateSource      
      }
      else this.fxRateSource = 'CapitalActivity';

      if(this.data.actionType === 'LINK-ADD'){
        this.capitalActivityForm.patchValue({
          totalAmount: GIR * this.capitalActivityForm.get('localAmount').value
        })
      }
    }))

    this.subscriptions.push(this.capitalActivityForm.get('fxRateOverride').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(fxRateOverride => {

      if(fxRateOverride){
        this.dataSvc.setWarningMsg(this.posCcyChangeMsg, `Dismiss`, 'ark-theme-snackbar-warning')
      }

      if(fxRateOverride && this.capitalActivityForm.get('fxRate').value === this.data?.rowData?.fxRate){
        this.fxRateSource = this.data?.rowData?.fxRateSource;
      }
      else if(fxRateOverride && this.capitalActivityForm.get('fxRate').value !== this.data?.rowData?.fxRate)
        this.fxRateSource = 'CapitalActivity';
    }))

    /** For LINK-ADD, update Total Amount, based on changes in FX RATE, LOCAL AMOUNT */
    if(this.data.actionType === 'LINK-ADD'){

      this.subscriptions.push(this.dialogRef.beforeClosed().subscribe(() => {
        this.closePopUp();
      }))
      
      this.subscriptions.push(this.capitalActivityForm.get('localAmount').valueChanges.subscribe(LA => {
        this.capitalActivityForm.patchValue({
          totalAmount: LA * this.capitalActivityForm.get('fxRate').value
        })
      }))
    }

    /** _ since statusChanges returns INVALID form even when it is valid. Hence, using custom cross field validator: `capitalValidator` */

    this.subscriptions.push(this.capitalActivityForm.statusChanges.subscribe(_ => {

      if(this.data.actionType === 'LINK-ADD'){
        this.placeHolderGIR = `${this.data.rowData[0].positionCcy} -> ${this.capitalActivityForm.get('fundCcy').value}`;
        this.getFormCapitalAct();
      }
      else{
        this.placeHolderGIR = `${this.capitalActivityForm.get('posCcy').value} -> ${this.capitalActivityForm.get('fundCcy').value}`;
        if(!this.capitalActivityForm.get('posCcy').value || !this.capitalActivityForm.get('fundCcy').value)
          this.placeHolderGIR = 'Pos ccy -> Fund ccy'
      }


      if(this.capitalActivityForm.errors?.['validated'] && this.capitalActivityForm.touched)
        this.disableSubmit = false;
      else if(!this.capitalActivityForm.errors?.['validated'])
        this.disableSubmit = true;

      this.isFormPurelyNotValid = {
        disable: !this.capitalActivityForm.errors?.['validated']
      }

    }))

    /** Listening for changing the autocomplete options, based on search */
    
    this.fundHedgingFilteredOptions = this.capitalActivityForm.get('fundHedging').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fundHedgingOptions, value))
    );

    this.issuerFilteredOptions = this.capitalActivityForm.get('issuerShortName').valueChanges.pipe(
      startWith(''),
      map(value => this._filterIS(value))
    )

    this.assetFilteredOptions = this.capitalActivityForm.get('asset').valueChanges.pipe(
      startWith(''),
      map(value => {
        return (this._filterAsset(value))
      })
    )
    
    this.fundCcyFilteredOptions = this.capitalActivityForm.get('fundCcy').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fundCcyOptions, value))
    )
      
    this.posCcyFilteredOptions = this.capitalActivityForm.get('posCcy').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.positionCcyOptions, value))
    )

    this.capitalTypeFilteredOptions = this.capitalActivityForm.get('capitalType').valueChanges.pipe( startWith(''), 
      map(value => this._filter(this.capitalTypeOptions, value))
    )

    this.capitalSubTypeFilteredOptions = this.capitalActivityForm.get('capitalSubType').valueChanges.pipe(startWith(''), 
      map(value => this._filter(this.capitalSubTypeOptions, value))
    )
  }

  columnDefs: ColDef[] = [
    {field: 'positionID', headerName: 'Position ID', tooltipField: 'positionID'},
    {field: 'cashDate', headerName: 'Cash Date', valueFormatter: dateFormatter, tooltipField: 'cashDate'},
    {field: 'type', headerName: 'Type', tooltipField: 'type'},
    {field: 'amount', headerName: 'Total', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'amount'},
    {field: 'totalBase', headerName: 'Total Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'totalBase'},
    {field: 'linkedAmount', headerName: 'Linked Amount Base', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', tooltipField: 'linkedAmount'},
    {field: 'positionCcy', headerName: 'Position Ccy', tooltipField: 'positionCcy'},
    {field: 'portfolio', headerName: 'Portfolio', tooltipField: 'portfolio'},
    {field: 'issuerShortName', headerName: 'Issuer', tooltipField: 'issuerShortName'},
    {field: 'asset', headerName: 'Asset', tooltipField: 'asset'},
  ]

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: false,
    sortable: false,
    filter: true,
    autosize:true
  }

  gridOptions: GridOptions = {
    enableRangeSelection: true,
    tooltipShowDelay: 0,
    columnDefs: this.columnDefs,
    defaultColDef: this.defaultColDef,
    rowGroupPanelShow: 'always'
  }

  onGridReady(params: GridReadyEvent){
    params.columnApi.autoSizeAllColumns(false)
  }

  ngOnInit(): void {
    this.setDynamicOptions();

    this.isSuccess = this.isFailure = false;
  
    this.changeListeners();

    this.disableSubmit = true;
    
    /* Set Up Static Options */
    
    this.capitalTypeOptions = this.data.capitalTypes;
    this.capitalSubTypeOptions = this.data.capitalSubTypes;

    for(let i = 0; i < this.data.refData.length; i+= 1){
      if(!!this.data.refData[i].fundHedging){
        this.fundHedgingOptions.push(this.data.refData[i].fundHedging);
      }
      if(!!this.data.refData[i].fundCcy){
        this.fundCcyOptions.push(this.data.refData[i].fundCcy);
      }
      if(!!this.data.refData[i].positionCcy){
        this.positionCcyOptions.push(this.data.refData[i].positionCcy);
      }
    }
    this.fundHedgingOptions = [...new Set(this.fundHedgingOptions)]
    this.fundCcyOptions = [...new Set(this.fundCcyOptions)]
    this.positionCcyOptions = [ ...new Set(this.positionCcyOptions)]

    if(this.data.actionType === 'LINK-ADD'){
      this.header = 'Link Investment';
      this.buttontext = 'Submit';

      this.gridData = this.data.rowData;

      let FH: string = this.data.rowData[0].fundHedging;
      let ISN: string = this.data.rowData[0].issuerShortName;
      let FundCcy: string = this.data.rowData[0].fundCcy;
      let cashDate: Date = this.data.rowData[0].cashDate; 

      let posCcy: string = this.data.rowData[0].positionCcy;

      this.selectedIssuerID = this.data.rowData[0].issuerID;
      
      this.setDynamicOptions(FH, null, null); // This line sets Issuer options.
      this.setDynamicOptions(FH, ISN, null);  // This only sets asset options.

    
      let localAmount: number = 0;
      for(let i = 0; i < this.data.rowData.length; i+= 1)
        localAmount += this.data.rowData[i].amount;


      this.capitalActivityForm.patchValue({
        valueDate: cashDate,
        callDate: cashDate,
        narrative: null,
        capitalType: null,
        capitalSubType: null,
        fundCcy: FundCcy,
        totalAmount: null,
        fundHedging: FH,
        issuerShortName: ISN,
        asset: null,

        localAmount: localAmount,
        fxRate: posCcy === FundCcy ? 1 : null
      })

      /* Initialises capitalAct for sending it to linking grid component */
      this.getFormCapitalAct(); 

    }
    else if(this.data.actionType === 'EDIT')
    {
      this.header = 'Edit Capital';
      this.buttontext = 'Update';

      this.gridData = this.data.gridData;

      this.selectedIssuerID = this.data.rowData.wsoIssuerID;  // Issuer ID for the EDIT row;
      this.selectedAssetID = this.data.rowData.wsoAssetID;
      this.fxRateSource = this.data.rowData.fxRateSource;
      
      // Dynamic options for EDIT
      this.setDynamicOptions(this.data.rowData.fundHedging, this.data.rowData.issuerShortName, this.data.rowData.asset);
      this.capitalActivityForm.patchValue({
        valueDate: this.data.rowData.valueDate,
        callDate: this.data.rowData.callDate,
        narrative: this.data.rowData.narrative,
        capitalType: this.data.rowData.capitalType,
        capitalSubType: this.data.rowData.capitalSubType,
        fundCcy: this.data.rowData.fundCcy,
        totalAmount: this.data.rowData.totalAmount,
        fundHedging: this.data.rowData.fundHedging,
        issuerShortName: this.data.rowData.issuerShortName,
        asset: this.data.rowData.asset,
        posCcy: this.data.rowData.posCcy,

        localAmount: this.data.rowData.localAmount,
        fxRate: this.data.rowData.fxRate,
        fxRateOverride: this.data.rowData.fxRateOverride
      })

        /* totalAmount wasn't getting set from the above patch statement. Hence, manually setting it up */
      this.capitalActivityForm.patchValue({totalAmount: this.data.rowData.totalAmount})
    }
    else{
      this.header = 'Add Capital';
      this.buttontext = 'Submit';
        // Dynamic Options for ADD.
    }

  }

  getFormCapitalAct(): void{

    this.capitalAct = <CapitalActivityModel>{};
    this.capitalAct.valueDate = this.capitalActivityForm.get('valueDate').value;
    this.capitalAct.callDate = this.capitalActivityForm.get('callDate').value;
    this.capitalAct.narrative = this.capitalActivityForm.get('narrative').value;
    this.capitalAct.capitalType = this.capitalActivityForm.get('capitalType').value;
    this.capitalAct.capitalSubType = this.capitalActivityForm.get('capitalSubType').value;
    this.capitalAct.fundCcy = this.capitalActivityForm.get('fundCcy').value;
    this.capitalAct.totalAmount = this.capitalActivityForm.get('totalAmount').value;
    this.capitalAct.fundHedging = this.capitalActivityForm.get('fundHedging').value;
    this.capitalAct.issuerShortName = this.capitalActivityForm.get('issuerShortName').value;
    this.capitalAct.asset = this.capitalActivityForm.get('asset').value;

    this.capitalAct.valueDate = new Date(moment(this.capitalAct.valueDate).format('YYYY-MM-DD'));
    this.capitalAct.callDate = new Date(moment(this.capitalAct.callDate).format('YYYY-MM-DD'));

    this.capitalAct.localAmount = this.capitalActivityForm.get('localAmount').value;
    this.capitalAct.fxRate = this.capitalActivityForm.get('fxRate').value;
    this.capitalAct.fxRateOverride = this.capitalActivityForm.get('fxRateOverride').value;
    this.capitalAct.fxRateSource = this.fxRateSource;

    this.capitalAct.posCcy = (this.data.actionType === 'LINK-ADD') 
                              ? this.data.rowData[0].positionCcy 
                              : this.capitalActivityForm.get('posCcy').value;

    this.capitalAct.wsoIssuerID = this.selectedIssuerID;  // selectedIssuerID is set at everypoint for every actionType

    this.capitalAct.wsoAssetID = this.selectedAssetID;    // selectedAssetID is set at everypoint for every actionType
      // If issuerShortName is NULL and wsoIssuerID isn't; then set it to null (can occur when issuerShortName was set previously, but wsoIssuerID wasn't cleared);
    if(this.capitalAct.issuerShortName === null)
      this.capitalAct.wsoIssuerID = this.selectedIssuerID = null;

    if(this.capitalAct.asset === null)
      this.capitalAct.wsoAssetID = this.selectedAssetID = null;

    if(['ADD', 'EDIT'].includes(this.data.actionType)){
      this.capitalAct.source = 'ArkUI - manual';
      this.capitalAct.sourceID = 1;
    }
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  performSubmit() {
    this.isSuccess = this.isFailure = false;
    this.disableSubmit = true;

    this.getFormCapitalAct();

    // Setting up audit columns.
    if(this.data.actionType === 'EDIT'){
      this.capitalAct.capitalID = this.data.rowData.capitalID;
      this.capitalAct.modifiedOn = new Date();
      this.capitalAct.modifiedBy = this.msalService.getUserName();

      this.capitalAct.createdBy = this.data.rowData.createdBy;
      this.capitalAct.createdOn = this.data.rowData.createdOn;

      this.capitalAct.isLinked = this.data.rowData.isLinked;
      this.capitalAct.linkedAmount = this.data.rowData.linkedAmount;
    }
    else{
      this.capitalAct.capitalID = null;
      this.capitalAct.createdOn = this.capitalAct.modifiedOn = new Date();
      this.capitalAct.createdBy = this.capitalAct.modifiedBy =this.msalService.getUserName();  
  
    }

    this.capitalActivityForm.disable();
    this.subscriptions.push(this.capitalActivityService.putCapitalActivity(this.capitalAct).subscribe({
      next: data => {
        this.isSuccess = true;
        this.isFailure = false;

        if(this.data.actionType === 'ADD'){
          if(data.data != -1)   // .data is the returned data(here, capitalID) of the newly inserted/updated row.
            this.capitalAct.capitalID = data.data;

          this.disableSubmit = true;
          this.updateMsg = `Capital activity successfully added`;

          this.data.adapTableApi.gridApi.addGridData([this.capitalAct]);
          
          this.capitalActivityForm.reset(); // Resets form to invalid state
          this.capitalActivityForm.markAsPristine();
          this.capitalActivityForm.enable();

        // reset() sets number based fields to 0;
        // Set all numeric fields to NULL here
          this.capitalActivityForm.patchValue({
            totalAmount: null
          })

          
          this.selectedIssuerID = null; // Reset wsoIssuerID for a new capital activity
          this.selectedAssetID = null; // Reset wsoAssetID for a new capital activity
        }
        else if(this.data.actionType === 'EDIT'){
          this.disableSubmit = true;
          this.capitalActivityForm.disable();
          this.updateMsg = `Capital activity successfully updated`;
          this.data.adapTableApi.gridApi.updateGridData([this.capitalAct]);
        }
      },
      error: error => {
        this.isFailure = true;
        this.isSuccess = false;

        if(this.data.actionType === 'ADD')
          this.updateMsg = 'Insert failed';
        else if(this.data.actionType === 'EDIT')
          this.updateMsg = 'Update failed';

        this.disableSubmit = false;   // To Enable submit again, if previous submit failed.
        this.capitalActivityForm.enable();
      }
    }));

  }

  onBlurForLink(){
    if(this.data.actionType === 'LINK-ADD')
      this.childLinkComponent.searchCapitalActivities();
  }

  /**
   *  Updating `status` from `link investor` component 
   */
  onLinkStatus(outcome){
    this.linkStatus = outcome
  }

  /** Closing pop up during `LINK-ADD` */
  closePopUp(source?: string){
    let refresh: boolean = false;
    if(this.linkStatus?.event === 'Linked Close'){      
      this.dialogRef.close({event: 'Close with Success'});
    }
    else{
      this.dialogRef.close({event: 'Close'})
    }
  }

  /**
   * 
   * @param isAlreadyLinked To hide form if the investment in `link investor` components is already linked to some investor activities.
   */
  onIsAlreadyLinked(isAlreadyLinked: boolean){
    this.isAlreadyLinked = isAlreadyLinked
  }

  onSubmit(): void {
    this.disableSubmit = true;
    if(this.data.actionType === 'EDIT'){
      const confirmDialog = this.dialog.open(UpdateConfirmComponent,{ 
        data: {
          actionType: 'EDIT'
        }});
      this.subscriptions.push(confirmDialog.afterClosed().subscribe(result => {
        if(result.action === 'Confirm'){
          this.performSubmit();
        }
        else this.disableSubmit = false;
      }));  
    }
    else if(this.data.actionType === 'ADD'){
      this.performSubmit();
    }
  }

  closeDialog(data?: CapitalActivityModel): void {
    if(this.isSuccess)
      this.dialogRef.close({event:'Close with Success', data:data});
    else
      this.dialogRef.close({event:'Close', data:null});
  }
}