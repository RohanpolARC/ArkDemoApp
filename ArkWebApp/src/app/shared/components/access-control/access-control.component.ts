import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { PutAccessModel } from '../../models/GeneralModel';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.scss']
})
export class AccessControlComponent implements OnInit {

  allTabs
  allRoles
  subscriptions: Subscription[] = []
  isFormReady: boolean = false;
  data
  columns: string[] = []
  mappingChanges = {}
  mappings: string = ''

  constructor(
    private accessService: AccessService,
    private dataSvc: DataService,
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

  onCheckboxChange(event, role, tabIndex){
    let key: string = `${this.data[tabIndex].tab}|${role}:${Number(event.checked)}`;
    let opp: string = `${this.data[tabIndex].tab}|${role}:${Number(!Boolean(event.checked))}`;

    if(this.mappingChanges[opp])
      delete this.mappingChanges[opp];
    else this.mappingChanges[key] = true

    this.mappings = Object.keys(this.mappingChanges).join(',')
  }

  fetchRoleTabs(){
    this.subscriptions.push(this.accessService.getRolesTabs().subscribe({
      next: tabRoles => {
        this.data = this.parseFetchedAssociation(tabRoles);

        if(this.data?.length > 0){
          this.columns = Object.keys(this.data[0])
        }

        this.allRoles = Object.keys(this.data[0]).filter(x => !['tab','tabid'].includes(x));
        this.allTabs = [... new Set(this.data.map(x => x.tab))]
    
        this.isFormReady = true;
      },
      error: error => {
        console.error("Failed to fetch accessible tabs " + error);
      }
    }))  
  }

  ngOnInit(): void {
    this.fetchRoleTabs();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit(){
    let model: PutAccessModel = <PutAccessModel>{};
    model.associations = this.mappings;
    model.username = this.dataSvc.getCurrentUserName();

    if(!!model.associations){
      this.subscriptions.push(this.accessService.putAssociations(model).subscribe({
        next: result => {
          if(result.isSuccess){
            this.mappingChanges = {};
            this.mappings = ``;
            this.dataSvc.setWarningMsg("Successfully updated access", "Dismiss", "ark-theme-snackbar-success")
          }
        },
        error: error => {
          this.dataSvc.setWarningMsg("Failed to update access", "Dismiss", "ark-theme-snackbar-error")
          console.error("Failed to update associations");
        }
      }))  
    }
    else{
      this.dataSvc.setWarningMsg("No change in association", "Dismiss", "ark-theme-snackbar-warning")
    }
  }
}