import { environment } from "src/environments/environment";


export class APIConfig {


    // public static BASEURL: string = window.location.origin;
    public static BASEURL: string = (/^.*localhost.*/.test(window.location.host) && window.location.port == "4200") ? "https://localhost:44366" : environment.baseUrl;

    public static ARKWEB_ACCESSIBLE_TABS_GET_API: string = APIConfig.BASEURL + "/api/Access/GetTabs";
    public static ARKWEB_TABROLE_ASSOCIATION_GET_API: string = APIConfig.BASEURL + "/api/Access/GetRoleTabAssociation";
    public static ARKWEB_PUTASSOCIATIONS_API: string = APIConfig.BASEURL + "/api/Access/PutAssociations";

    public static GET_DETAILED_VIEW: string = APIConfig.BASEURL + "/api/General/GetDetailedView";

    public static PORTFOLIO_HISTORY_GET_API: string = APIConfig.BASEURL + "/api/ParGIRHistory/getdata";
    public static PORTFOLIO_HISTORY_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/put";
    public static PORTFOLIO_HISTORY_BULK_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/putbulk";
    public static PORTFOLIO_HISTORY_DELETE_API: string = APIConfig.BASEURL + "/api/AssetGIR/delete";

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
    public static LIQUIDITY_SUMMARY_REF_GET_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/GetRef";
    public static LIQUIDITY_SUMMARY_PUT_UPDATE_API: string = APIConfig.BASEURL + "/api/LiquiditySummary/Update";

    public static REFDATA_GET_FUNDHEDGINGS_API: string = APIConfig.BASEURL + "/api/GetRef/GetFundHedgings";
}