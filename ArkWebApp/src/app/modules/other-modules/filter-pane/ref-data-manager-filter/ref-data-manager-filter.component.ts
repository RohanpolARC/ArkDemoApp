import { Component, Input,OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { RefDataManagerService } from 'src/app/core/services/RefDataManager/ref-data-manager.service';

@Component({
  selector: 'app-ref-data-manager-filter',
  templateUrl: './ref-data-manager-filter.component.html',
  styleUrls: ['./ref-data-manager-filter.component.scss']
})
export class RefDataManagerFilterComponent implements OnInit {

  @Input() refDataFilter

  refDataFilterSettings: IDropdownSettings
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'text',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
    // maxHeight: 100
  };
  preSelectedRefDataFilter

  constructor(private refDataManagerSvc: RefDataManagerService) { }

  ngOnInit(): void {
    this.refDataFilterSettings = { ...this.dropdownSettings, ...{  textField: 'Reference' } }
  }

  ngOnChanges(changes: SimpleChanges){

    if(changes?.['refDataFilter']){
      this.preSelectedRefDataFilter = changes['refDataFilter'].currentValue
    }
  }
  
  onRefDataFilterChange(value){
    this.refDataManagerSvc.changeFilterValues(value)
  }
}
