import { Component, ContentChild, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfirmComponentConfigure } from 'src/app/shared/models/GeneralModel';



@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {

  @Input() configData:ConfirmComponentConfigure

  @Output() actionEvent:EventEmitter<any>= new EventEmitter()
  
  @ContentChild('form') form: TemplateRef<any> | undefined;
  @ContentChild('action') action: TemplateRef<any> | undefined;

  textField = new FormControl('');
  headerText:string = 'Confirmation';
  textFieldLabelValue:string;
  displayConfirmButton:boolean;
  

  data:any

  constructor() { }

  ngOnInit(): void {
    this.data = this.configData.data
    this.displayConfirmButton = this.configData.displayConfirmButton??true
    if(this.configData.headerText){
      this.headerText = this.configData.headerText
    }
    if(this.configData.showTextField){
      this.textField.setValue(this.configData.textFieldValue) 
      this.textFieldLabelValue = this.configData.textFieldLabelValue ?? 'Comment'
    }

  }

  close(action:string){
    this.actionEvent.emit({
      action:action,
      textFieldValue:this.textField.value
    })

  }

}
