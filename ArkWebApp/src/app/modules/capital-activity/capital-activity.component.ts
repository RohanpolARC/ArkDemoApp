import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Module } from '@ag-grid-community/core';
import { CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Observable, combineLatest } from 'rxjs';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { CommonConfig } from 'src/app/configs/common-config';
import { UtilService } from './services/util.service';
import { ComponentReaderService } from './services/component-reader.service';
import { map, take, filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-capital-activity',
  templateUrl: './capital-activity.component.html',
  styleUrls: ['./capital-activity.component.scss']
})
export class CapitalActivityComponent implements OnInit, IPropertyReader {

  @ViewChild(MatAccordion) accordion: MatAccordion;
  investorData$: Observable<CapitalActivityModel[]>;
  investmentData$: Observable<CapitalInvestment[]>;
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  
  constructor(public dialog:MatDialog, 
    private capitalActivityService: CapitalActivityService,
    private compReaderSvc: ComponentReaderService,
    public utilSvc: UtilService) {
      this.utilSvc.registerComponent(this)
    }

  /**
   * Implementing the visitor pattern to read component properties in the service.
      https://stackoverflow.com/a/56975850
   */
  readProperty<T>(prop: string): T {
    if(!(prop in this)){
      throw Error(`Property ${prop} does not exist`);
    }
    return this[prop];
  }

  loadInvestorData(){
    // this.compReaderSvc.investorGridApi().showLoadingOverlay();
    this.investorData$ = this.capitalActivityService.getCapitalActivity().pipe(take(1),
      tap(() => { this.compReaderSvc.investorGridApi().hideOverlay() })
    );
    setTimeout(() => {
      this.compReaderSvc.investorGridApi().showLoadingOverlay();
    })
  }

  loadInvestmentData(){
    // this.compReaderSvc.investmentGridApi().showLoadingOverlay();
    this.investmentData$ = this.capitalActivityService.getCapitalInvestment().pipe(take(1),
      tap(() => { this.compReaderSvc.investmentGridApi().hideOverlay() })
    );
    setTimeout(() => {
      this.compReaderSvc.investmentGridApi().showLoadingOverlay();
    })
  }
  invstmntPanelOpenState = false;
  investorPanelOpenState = false;

  ngOnInit(): void {

    combineLatest([this.capitalActivityService.investorGridLoaded$, this.capitalActivityService.investmentGridLoaded$]).pipe(
      map(([investorGridLoaded, investmentGridLoaded]) => investorGridLoaded && investmentGridLoaded),
      filter(loaded => loaded),
      take(1)
    ).subscribe((loaded) => {
        this.loadInvestorData();
        this.loadInvestmentData();  
    })
  }
}