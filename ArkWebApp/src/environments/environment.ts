// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl:'https://arcapiuat.azurewebsites.net',  
  //baseUrl: 'https://localhost:44366',
  scopeUri: ['api://9b736f43-2e69-4120-b923-7632886f29cc/arc-api'],  
  tenantId: '1aca2fbe-6078-4dfb-8c1f-9d98d6245214',  
  uiClienId: '9a06035c-d10f-4b52-817d-8cc7583721a1',  
  redirectUrl: 'http://localhost:4200',
  
  arkFunctionScopeUri: ['api://1ade3513-1077-49b7-838d-681c7ea8f3a3/arc-irr-func'],
   arkFunctionUrl: 'https://irrcalcfunuatnew.azurewebsites.net',
  // // arkFunctionUrl: 'http://localhost:7071',
  // // arkFunctionUrl: 'https://feecalcfuncuat.azurewebsites.net',
  // arkFunctionScopeUri: ['api://57d373b0-5305-4b6b-a3f7-ccdc0a4560ca/ark-fee-func'],

  //arkFunctionUrl: 'http://localhost:7031',

  // feeCalcFunctionUrl: 'http://localhost:7049',
  feeCalcFunctionUrl: 'https://feecalcfuncuat.azurewebsites.net',
  feeCalcFunctionScopeUri: ['api://57d373b0-5305-4b6b-a3f7-ccdc0a4560ca/ark-fee-func']
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
