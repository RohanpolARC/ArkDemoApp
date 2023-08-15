import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi } from '@ag-grid-community/core';
import { EventEmitter, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { EmitParams } from 'src/app/shared/models/IRRCalculationsModel';

@Injectable()
export class ComponentReaderService {
  
  component: IPropertyReader
  registerComponent(comp: IPropertyReader){
    this.component = comp;
  }

  constructor() { }

  isLocal(): FormControl {
    return this.component.readProperty<FormControl>('isLocal')
  }
  
  asOfDate(): string {
    return this.component.readProperty<string>('asOfDate')
  }

  adaptableApi(): AdaptableApi {
    return this.component.readProperty<AdaptableApi>('adapTableApi')
  }

  gridApi(): GridApi {
    return this.component.readProperty<GridApi>('gridApi')
  }

  selectedModelID(): number {
    return this.component.readProperty<number>('selectedModelID')
  }

  calcParamsEmitter(): EventEmitter<EmitParams> {
    return this.component.readProperty<EventEmitter<EmitParams>>('calcParamsEmitter')
  }

  selectedPositionIDs(): number[] {
    return this.component.readProperty<number[]>('selectedPositionIDs')
  }
}
