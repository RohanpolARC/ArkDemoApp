import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LiquiditySummaryComponent } from '../liquidity-summary.component';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';
import { LiquiditySummaryAttributeModel } from 'src/app/shared/models/LiquiditySummaryModel';
import { formatDate } from 'src/app/shared/functions/formatter';

@Component({
  selector: 'app-attribute-group-renderer',
  templateUrl: './attribute-group-renderer.component.html',
  styleUrls: ['./attribute-group-renderer.component.scss']
})
export class AttributeGroupRendererComponent implements ICellRendererAngularComp, OnInit {

  subscriptions: Subscription[] = []
  params: ICellRendererParams
  componentParent: LiquiditySummaryComponent;
  originalRowNodeData;
  originalRowNodeID;
  isManual: boolean = false;
  attribute: string;
  rowRef: LiquiditySummaryAttributeModel;     // Holds reference data for the row.

  constructor(    
    public dialog: MatDialog
  ) { }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.componentParent = params.context.componentParent;
    this.rowRef = this.setRowRef(params, this.componentParent.refData);
  }
  refresh(params: ICellRendererParams): boolean {
    return true;  
  }

  setRowRef(params: ICellRendererParams, refData: any): LiquiditySummaryAttributeModel{
    let rowRef = <LiquiditySummaryAttributeModel>{};
    rowRef.attribute = params.value;
    rowRef.level = params.node.childrenAfterFilter[0]?.data?.['attrType']

    for(let i: number = 0; i < refData.length; i+= 1){
      if(refData[i].attribute === rowRef.attribute && refData[i].level === rowRef.level){
        rowRef.id = refData[i].id;
        rowRef.isRelative = refData[i].isRelative;
        rowRef.entryDate = (rowRef.isRelative) ? null : refData[i].entryDate;
        rowRef.relativeDays = (rowRef.isRelative) ? refData[i].relativeDays : null;

        this.isManual = refData[i].isManual;
        break;
      }
    }
    return rowRef;
  }

  openDialog(actionType: string = 'EDIT'): void {

    if(this.isManual){

      if(this.componentParent.isWriteAccess){

        const dialogRef = this.dialog.open(AttributeEditorComponent,{
          data: {
            action: actionType,
            fundHedgings: this.componentParent.fundHedgings,
            asOfDate: formatDate(this.rowRef.entryDate, true),   // Convert to 'YYYY-MM-DD' string
            refData: this.componentParent.refData,
                // Passing only when editing
            rowRef: this.rowRef     
          }
        })  
  
        this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
          if(result.event === 'Close with success'){
    
            // Re-fetch attributes & IDs for newly added attributes
            this.componentParent.fetchLiquiditySummaryRef();
    
              // Refresh the grid
            this.componentParent.fetchLiquiditySummary();
          }
        }))
  
      }
      else {
        this.componentParent.setWarningMsg('Unauthorized', 'Dismiss', 'ark-theme-snackbar-error')   
      }
    }
  }

  ngOnInit(): void {
  }

}
