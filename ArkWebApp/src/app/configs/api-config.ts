import { environment } from "src/environments/environment";


export class APIConfig {


    // public static BASEURL: string = (/^.*localhost.*/.test(window.location.host) && window.location.port == "4200") ? "https://localhost:44366" : environment.baseUrl;

    public static BASEURL: string = environment.baseUrl
    // public static IRRCALC_BASEURL: string = (/^.*localhost.*/.test(window.location.host) && window.location.port == "4200") ? "http://localhost:7071" : environment.irrCalcFunUrl;

    public static ARK_IRR_FUNCTION_BASEURL: string = environment.arkFunctionUrl;
    public static ARK_FEE_FUNCTION_BASEURL: string = environment.feeCalcFunctionUrl;

    public static ARKWEB_ACCESSIBLE_TABS_GET_API: string = APIConfig.BASEURL + "/api/Access/GetTabs";
    public static ARKWEB_TABROLE_ASSOCIATION_GET_API: string = APIConfig.BASEURL + "/api/Access/GetRoleTabAssociation";
    public static ARKWEB_PUTASSOCIATIONS_API: string = APIConfig.BASEURL + "/api/Access/PutAssociations";

    public static GET_DETAILED_VIEW: string = APIConfig.BASEURL + "/api/General/GetDetailedView";

    public static PORTFOLIO_HISTORY_GET_API: string = APIConfig.BASEURL + "/api/ParGIRHistory/getdata";
    public static PORTFOLIO_HISTORY_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/put";
    public static PORTFOLIO_HISTORY_BULK_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/putbulk";
    public static PORTFOLIO_HISTORY_DELETE_API: string = APIConfig.BASEURL + "/api/AssetGIR/delete";

    public static GRID_DYNAMIC_COLUMNS_GET_API: string = APIConfig.BASEURL + "/api/General/GetGridDynamicColumns";
    public static SAVE_ADAPTABLE_STATE_API: string = APIConfig.BASEURL + "/api/General/SaveAdaptableState";
    public static GET_ADAPTABLE_STATE_API: string = APIConfig.BASEURL + "/api/General/GetAdaptableState";

    public static CASH_BALANCE_GET_API: string = APIConfig.BASEURL + "/api/CashBalance/GetData";

    public static CAPITAL_ACTIVITY_PUT_API: string = APIConfig.BASEURL + "/api/CapitalActivity/put";
    public static CAPITAL_INVESTMENT_GET_API: string = APIConfig.BASEURL + "/api/CapitalActivity/getPositionCash";
    public static CAPITAL_ACTIVITY_GET_API: string = APIConfig.BASEURL + "/api/CapitalActivity/get";
    public static CAPITAL_ACTIVITY_GET_REF_API: string = APIConfig.BASEURL + "/api/CapitalActivity/getCapitalRef";
    public static CAPITAL_ACTIVITY_LOOKUP_API: string = APIConfig.BASEURL + "/api/CapitalActivity/lookUpCapitalActivity";
    public static CAPITAL_INVESTMENT_ASSOCIATE_API: string = APIConfig.BASEURL + "/api/CapitalActivity/associateInvestment";
    public static CAPITAL_ACTIVITY_BULK_PUT_API: string = APIConfig.BASEURL + "/api/CapitalActivity/bulkput";

    public static FACILITY_DETAILS_GET_API: string = APIConfig.BASEURL + "/api/FacilityDetails/Get";
    public static FACILITY_DETAILS_PUT_API: string = APIConfig.BASEURL + "/api/FacilityDetails/Put";
    public static FACILITY_DETAILS_GET_FUNDS_API: string = APIConfig.BASEURL + "/api/FacilityDetails/GetFunds";

    public static LIQUIDITY_SUMMARY_PIVOTED_GET_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/GetSummaryPivoted";
    public static LIQUIDITY_SUMMARY_PUT_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/Put";
    public static LIQUIDITY_SUMMARY_DELETE_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/Delete";
    public static LIQUIDITY_SUMMARY_REF_GET_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/GetRef";
    public static LIQUIDITY_SUMMARY_PUT_UPDATE_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/Update";
    public static LIQUIDITY_SUMMARY_COMMENTS_GET_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/GetLiquiditySummaryComments";
    public static LIQUIDITY_SUMMARY_COMMENTS_POST_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/PutLiquiditySummaryComments";

    public static REFDATA_GET_DATATABLE: string = APIConfig.BASEURL + "/api/GetRef/GetRefDatatable";
    public static REFDATA_GET_UNIQUE_VALUES_API: string = APIConfig.BASEURL + "/api/GetRef/GetUnqiueValuesForField";
    public static REFDATA_GET_FUNDHEDGINGS_API: string = APIConfig.BASEURL + "/api/GetRef/GetFundHedgings";
    public static REFDATA_GET_WSOPORTFOLIO_API: string = APIConfig.BASEURL + "/api/GetRef/GetWSOPortfolioRef";

    public static IRR_POSITIONS_GET_API: string = APIConfig.BASEURL + "/api/IRRCalculation/GetPositions";
    public static IRR_PORTFOLIO_MODEL_PUT_API: string = APIConfig.BASEURL + "/api/IRRCalculation/PutModel";
    public static IRR_PORTFOLIO_MODEL_GET_API: string = APIConfig.BASEURL + "/api/IRRCalculation/GetModel";
    public static IRR_LOCAL_OVERRIDES_GET_API: string = APIConfig.BASEURL + "/api/IRRCalculation/GetLocalOverrides";
    public static IRR_RUN_CALCS_API: string = APIConfig.ARK_IRR_FUNCTION_BASEURL + "/api/IRRCalculatorFunction_HttpTrigger";

    public static PORTFOLIO_MAPPING_GET_API: string = APIConfig.BASEURL + "/api/PortfolioManager/GetPortfolioMapping";
    public static PORTFOLIO_MAPPING_PUT_API: string = APIConfig.BASEURL + "/api/PortfolioManager/PutPortfolioMapping";
    public static PORTFOLIO_MAPPING_STAGING_GET_API: string = APIConfig.BASEURL + "/api/PortfolioManager/GetPortfolioMappingStaging";
    public static PORTFOLIO_MAPPING_APPROVAL_PUT_API: string = APIConfig.BASEURL + "/api/PortfolioManager/PutPortfolioMappingApproval";

    public static ASSET_FUNDING_DETAILS_GET_API: string = APIConfig.BASEURL + "/api/UnfundedAssets/GetAssetFundingDetails";
    public static UNFUNDED_ASSET_PUT_API: string = APIConfig.BASEURL + "/api/UnfundedAssets/PutUnfundedAsset";
    public static UNFUNDED_ASSET_GET_API: string = APIConfig.BASEURL + "/api/UnfundedAssets/GetUnfundedAssets";

    public static CONTRACT_HISTORY_GET_API: string = APIConfig.BASEURL + "/api/ContractHistory/GetContractHistory";

    public static POSITION_CASHFLOWS_RUN_CALCS_API: string = APIConfig.ARK_IRR_FUNCTION_BASEURL + "/api/SavePositionCashflows_HttpTrigger";
    public static FEE_RUN_CALCS_API: string = APIConfig.ARK_FEE_FUNCTION_BASEURL + "/api/FeeCalculatorFunction_HttpTrigger";
    public static MONTHLY_RETURNS_CALC_API: string = APIConfig.BASEURL + "/api/MonthlyReturns/GetMonthlyReturn";

    public static RUN_MODEL_VALUATION_API: string = APIConfig.ARK_IRR_FUNCTION_BASEURL + "/api/ValuationMethodFunction_HttpTrigger";

    public static FUNDHEDGING_NET_IRR_POST_API: string = APIConfig.ARK_IRR_FUNCTION_BASEURL + "/api/NetIRRCalculatorFunction_HttpTrigger";

    public static FEE_PRESET_INVESTMENT_GET_API: string = APIConfig.BASEURL + "/api/FeePresets/GetFundInvestmentData";
    public static FEE_PRESET_DATA_GET_API: string = APIConfig.BASEURL + "/api/FeePresets/GetFundFeeData";
    public static FEE_PRESET_INVESTMENT_PUT_API: string = APIConfig.BASEURL + "/api/FeePresets/PutFundInvestmentData";
    public static FEE_PRESET_DATA_PUT_API: string = APIConfig.BASEURL + "/api/FeePresets/PutFundFeeData";
    public static FEE_PRESETS_PUT_API: string = APIConfig.BASEURL + "/api/FeePresets/PutFeePresets";

    public static FIXING_DETAILS_GET_API: string = APIConfig.BASEURL + "/api/FixingAttributes/GetFixingDetails";
    public static FIXING_TYPES_GET_API: string = APIConfig.BASEURL + "/api/GetRef/GetFixingTypes";
    public static FIXING_TYPES_PUT_API: string = APIConfig.BASEURL + "/api/FixingAttributes/PutFixingDetails";
    public static FIXING_TYPES_DELETE_API: string = APIConfig.BASEURL + "/api/FixingAttributes/DeleteFixingDetails";

    public static REF_DATA_FIXING_TYPES_PUT_API: string = APIConfig.BASEURL + "/api/GetRef/PutFixingTypes";
    public static REF_DATA_DELETE_API: string = APIConfig.BASEURL + "/api/GetRef/DeleteRefData";

    public static PORTFOLIO_CASHFLOWS_GET_API: string = APIConfig.BASEURL + "/api/Cashflows/Get";
    public static MANAGEMENT_FEE_GET_API: string = APIConfig.BASEURL + "/api/ManagementFee/GetManagementFee";

    public static POSITIONS_GET_API: string = APIConfig.BASEURL + "/api/PositionsScreen/GetPositionsData";
    public static HEDGING_MARK_PUT_API: string = APIConfig.BASEURL + "/api/PositionsScreen/PutHedgingMark";

    public static AUM_DELTA_GET_API: string = APIConfig.BASEURL + "/api/AUMDelta/GetAUMDelta";

    public static MARK_CHANGES_GET_API: string = APIConfig.BASEURL + "/api/MarkChanges/GetMarkChanges";

    public static VALUATION_DATA_GET_API: string = APIConfig.BASEURL + "/api/Valuation/Data";
    public static VALUATION_DATA_PUT_API: string = APIConfig.BASEURL + "/api/Valuation/PutData";
}