export class AssetGIRModel {

    public WSOAssetid : Number 
    public AsOfDate : Date
    public Ccy : Number 
    public Rate : Number
    public fxRateOverride: boolean 
    public isReviewed: boolean 

    public last_update : Date 
    public CcyName : string 
    public Text : string 
    public CreatedBy : string
    public ModifiedBy : string
    public ReviewedBy : string

    public CreatedOn : Date
    public ModifiedOn : Date
    public ReviewedOn : Date

    public id  : Number

    public TradeDate : Date; 
    public FundHedging: string;
}