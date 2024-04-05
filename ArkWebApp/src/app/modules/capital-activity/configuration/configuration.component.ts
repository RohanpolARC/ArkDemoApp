import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable,} from 'rxjs';
import { ICapitalActivityConfig } from 'src/app/shared/models/CapitalActivityModel';
import { ConfigurationFormService } from '../services/configuration-form.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfigurationGridService } from '../services/configuration-grid.service';
import { ColDef, GridOptions } from '@ag-grid-community/core';
import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  providers:[
    ConfigurationFormService,
    ConfigurationGridService
  ]
})
export class ConfigurationComponent implements OnInit {
  
  constructor(
    public dialogRef: MatDialogRef<ConfigurationComponent>,
    public configurationFormSvc: ConfigurationFormService,
    public dataSvc: DataService,
    public configurationGridSvc: ConfigurationGridService,
    @Inject(MAT_DIALOG_DATA) public data: {}
    ) { } 
    
  /*Returns the display message after user clicks on submit button and API call is made*/
  validationMessage$: Observable<string> = this.configurationFormSvc.validationMessage$

  /* Sets the value of form field eg. lockdate */
  capitalActivityConfig$: Observable<boolean> = this.configurationFormSvc.capitalActivityConfig$

  /* Determines the state of the button by listening to form.valueChanges and if submit button is clicked */
  disableSubmitButton$: Observable<boolean> = this.configurationFormSvc.disableSubmitButton$

  /* Returns true when the confgi audit data is loaded on grid */
  auditGridDataLoaded$ = this.configurationGridSvc.auditGridDataLoaded$

  /* Changes the CSS style of the return message given by API call based on SUCCESS or FAILURE*/
  saveStateMessage$ = this.configurationFormSvc.saveStateMessage$
  
  configurationForm:UntypedFormGroup  = this.configurationFormSvc.configurationForm 

  gridOptions: GridOptions = this.configurationGridSvc.getGridOptions()
  columnDefs: ColDef[] = this.configurationGridSvc.getColumnDefs()
  adaptableOptions: AdaptableOptions = this.configurationGridSvc.getAdaptableOptions()

  ngOnInit(): void {}


  onSubmit: () => void = this.configurationFormSvc.onSubmit.bind(this.configurationFormSvc)


  onClose(){
    this.dialogRef.close()
  }


}
