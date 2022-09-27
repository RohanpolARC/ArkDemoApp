import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { FormBuilder } from '@angular/forms';
import { PutAccessModel } from '../../models/GeneralModel';
import { DataService } from 'src/app/core/services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.scss']
})
export class AccessControlComponent implements OnInit {

  allTabs
  allRoles
  subscriptions: Subscription[] = []
  tabRoles
  originalAssociation;
  tabRoleForm: FormArray;
  form: FormGroup;
  isFormReady: boolean = false;
  data

  constructor(
    private accessService: AccessService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private warningMsgPopUp: MatSnackBar
  ) { }

  setWarningMsg(message: string, action: string, type: string = 'ark-theme-snackbar-normal'){
    this.warningMsgPopUp.open(message, action, {
      duration: 5000,
      panelClass: [type]
    });
  }

  parseFetchedAssociation(data: {
    tabID: number,
    tab: string,
    roleAssociation: {
      role: string,
      isAssociated: boolean
    }[]
  }[] = null){

    let parsedData = [];
    for(let i=0; i<data.length; i+= 1){
      let row = {};
      // row['tabID'] = data[i]['tabID']
      row['tab'] = data[i]['tab']
      for(let j = 0; j < data[i].roleAssociation.length; j+=1){
        let roleAssociationPair = data[i].roleAssociation[j];
        row[roleAssociationPair.role] = Boolean(roleAssociationPair.isAssociated)
      }
      parsedData.push(row);
    }
    return parsedData;
  }

  fetchRoleTabs(){
    this.subscriptions.push(this.accessService.getRolesTabs().subscribe({
      next: tabRoles => {
        this.tabRoles = tabRoles;
        this.data = this.parseFetchedAssociation(tabRoles);

        this.allRoles = Object.keys(this.data[0]).filter(x => !['tab','tabid'].includes(x));
        this.allTabs = [... new Set(this.data.map(x => x.tab))]
    
        this.tabRoleForm = this.formBuilder.array([]);
    
        for(let i = 0; i < this.data.length; i+= 1){
          this.tabRoleForm.push(this.buildFormArray(this.data[i]));
        }
    
        this.form = new FormGroup({
          association: this.tabRoleForm
        })
            // To send only the changed associations.
        this.originalAssociation = this.form.value?.['association'];    
        this.isFormReady = true;
      },
      error: error => {
        console.error("Failed to fetch accessible tabs " + error);
      }
    }))  
  }

  buildFormArray(row: {}): FormArray {
    let obj = this.formBuilder.array([]);

    for(const [key, value] of Object.entries(row)){
      if(key !== 'tab'){
        obj.push(new FormControl(Number(value) === 1))
      }
    }
    return obj;
  }

  ngOnInit(): void {

    this.fetchRoleTabs();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit(){
    let mat: boolean[][];
    mat = this.form.value?.['association'];

    let associations: string = '';
    for(let i = 0; i < mat.length; i+= 1){
      for(let j = 0; j < mat[i].length; j+= 1){
        if(mat[i][j] !== this.originalAssociation[i][j]){
          
          associations += this.allTabs[i] + '|' + this.allRoles[j] + ':' + (mat[i][j] ? '1' : '0') + ','
        }
      }
    }
    associations = associations.slice(0, -1);
    let model: PutAccessModel = <PutAccessModel>{};
    model.associations = associations;
    model.username = this.dataService.getCurrentUserName();

    if(!!associations){
      this.subscriptions.push(this.accessService.putAssociations(model).subscribe({
        next: result => {
          if(result.isSuccess){
            this.originalAssociation = this.form.value?.['association'];
            this.setWarningMsg("Successfully updated access", "Dismiss", "ark-theme-snackbar-success")
          }
        },
        error: error => {
          this.setWarningMsg("Failed to update access", "Dismiss", "ark-theme-snackbar-error")
          console.error("Failed to update associations");
        }
      }))  
    }
    else{
      this.setWarningMsg("No change in association", "Dismiss", "ark-theme-snackbar-warning")
    }
  }
}
