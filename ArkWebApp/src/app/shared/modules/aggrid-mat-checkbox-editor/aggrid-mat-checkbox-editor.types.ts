import { ICellRendererParams } from "@ag-grid-community/core";

export type IShowCheckbox = ((params: ICellRendererParams) => boolean)
export type IDisableCheckbox = ((params: ICellRendererParams) => boolean)
export type ICheckboxChanged = (params: ICellRendererParams, boolVal: boolean) => void
export type IDefaultValue = (params: ICellRendererParams) => boolean

export type ICheckboxControl = {
    showCheckbox: IShowCheckbox
    disableCheckbox: IDisableCheckbox
    onCheckboxChanged: ICheckboxChanged
    defaultVal: IDefaultValue
}
export interface ICheckboxCellParams extends ICellRendererParams, ICheckboxControl { }