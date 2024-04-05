import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqualisationRoutingModule } from './equalisation-routing.module';
import { EqualisationService } from 'src/app/core/services/Equalisation/equalisation.service';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    EqualisationRoutingModule
  ],
  providers: [
    EqualisationService
  ]
})
export class EqualisationModule { }
