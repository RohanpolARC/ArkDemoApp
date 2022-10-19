export interface AttributeFixingModel {
    fixingID:number,
    asOfDate:Date,
    attributeId:number,
    attributeName:string,
    attributeType:string,
    attributeValue:any,
    attributeLevel:string,
    attributeLevelValue:string,
    modifiedBy:string
}

export interface AttributeFixingTypeModel {
    filterValue:string,
    attributeName:string,
    attributeType:string,
    attributeLevel:string,
    modifiedBy:string
}