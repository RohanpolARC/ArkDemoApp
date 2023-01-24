import {  INoRowsOverlayAngularComp } from '@ag-grid-community/angular';
import {  INoRowsOverlayParams } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-rows-overlay',
  templateUrl: './no-rows-overlay.component.html',
  styleUrls: ['./no-rows-overlay.component.scss']
})
export class NoRowsOverlayComponent implements INoRowsOverlayAngularComp {
  public params: INoRowsOverlayParams & { noRowsMessageFunc: () => string};

  agInit(params: INoRowsOverlayParams & { noRowsMessageFunc: () => string}): void {
      this.params = params;
  }
}
