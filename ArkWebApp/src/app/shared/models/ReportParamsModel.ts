export type NetReturnReportParams  = {
    asOfDate:           string,
    fundHedging:        string,
    cashflowType:       string
    calculationType:    string,
    showExtraColumns:   boolean
  }

export type UnfundedAssetsReportParams = {
    asOfDate:           string,
    fundHedgings:       string,
    assetId:            number
}

export type ReportServerParams = {
  reportHeader:               string
  reportServer:               string 
  reportUrl:                  string 
  reportFilterConfigKey?:     string
  parameters:                 any
}