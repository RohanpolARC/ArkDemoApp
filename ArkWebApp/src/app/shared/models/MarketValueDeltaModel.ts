export interface MarketValueDeltaModel{
    PositionId                  :   number,
    MarketValueLatest           :   number,
    MarketValueLast             :   number,
    MVDeltaExisting             :   number,
    MVDeltaNew                  :   number,
    MarketValueIssueLatest      :   number,
    MarketValueIssueLast        :   number,
    MVIssueDeltaExisting        :   number,
    MVIssueDeltaNew             :   number,
    MarkLatest                  :   number,
    MarkLast                    :   number,
    MarkDeltaExisting           :   number,
    MarkDeltaNew                :   number,
    IssuerShortName             :   string,
    Asset                       :   string,
    AssetId                     :   number,
    Fund                        :   string,
    FundHedging                 :   string,
    PortfolioName               :   string,
    PortfolioType               :   string,
    ValuationMethod             :   string,
    CcyName                     :   string,
    FundCcy                     :   string,
    FundAdmin                   :   string,
    AssetTypeName               :   string,
    BenchmarkIndex              :   string,
    MaturityDate                :   Date,
    FaceValue                   :   number,
    FaceValueFunded             :   number,
    FaceValueFundedSD           :   number,
    CostValue                   :   number,
    CostValueFunded             :   number,
    CostValueFundedSD           :   number,
    MarketValueFunded           :   number,
    MarketValueFundedSD         :   number,
    FaceValueIssue              :   number,
    FaceValueIssueFunded        :   number,
    FaceValueIssueFundedSD      :   number,
    CostValueIssue              :   number,
    CostValueIssueFunded        :   number,
    CostValueIssueFundedSD      :   number,
    MarketValueIssue            :   number,
    MarketValueIssueFunded      :   number,
    MarketValueIssueFundedSD    :   number
}

export type NewIssuerOrAsset = "Issuer" | "Asset"