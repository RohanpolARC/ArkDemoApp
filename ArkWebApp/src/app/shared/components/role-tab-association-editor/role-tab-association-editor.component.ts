import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-role-tab-association-editor',
  templateUrl: './role-tab-association-editor.component.html',
  styleUrls: ['./role-tab-association-editor.component.scss']
})
export class RoleTabAssociationEditorComponent implements OnInit {

  allTabs
  allRoles
  subscriptions: Subscription[] = []
  tabRoles
  selectedTabs = new FormControl();
  selectedRoles: FormGroup;

  originalAssociation;
  tabRoleForm;
  form: FormGroup;

  data = [
    {
      tab: 'Going in Rates Editor',
      'Finance.Read': 0,
      'Finance.Write': 1,
      'Operation.Read': 0,
      'Operation.Write': 1
    },
    {
      tab: 'Cash Balance',
      'Finance.Read': 1,
      'Finance.Write': 0,
      'Operation.Read': 1,
      'Operation.Write': 0
    }
  ]

  constructor(
    private accessService: AccessService,
    private formBuilder: FormBuilder
  ) { }

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
      },
      error: error => {
        console.error("Failed to fetch accessible tabs " + error);
      }
    }))  
  }

  onTabSelect(event){
    let tab = this.selectedTabs.value[0];
    let associatedRoles = []
    for(let i = 0; i < this.tabRoles.length; i++){
      if(tab === this.tabRoles[i].tab){
        associatedRoles.push(this.tabRoles[i].role);
      }
    }

    let formObj = {}
    for(let i =0; i < this.allRoles.length; i+= 1){
      if(associatedRoles.includes(this.allRoles[i])){
        formObj[this.allRoles[i]] = true;
      }
      else formObj[this.allRoles[i]] = false;
    }

    this.formBuilder.group(formObj);
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

/**
 *      Role ->
 *  Tab
*    |
*    v
 */

  ngOnInit(): void {

    this.fetchRoleTabs();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit(){
    let mat: boolean[][];
    mat = this.form.value?.['association'];

    let res = [];
    for(let i = 0; i < mat.length; i+= 1){
      for(let j = 0; j < mat[i].length; j+= 1){
        if(mat[i][j] !== this.originalAssociation[i][j]){
          res.push({
            tab: this.allTabs[i],
            role: this.allRoles[j],
            associated: mat[i][j]
          })
        }
      }
    }
  }
}
