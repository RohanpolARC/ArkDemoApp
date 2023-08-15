import { Pipe, PipeTransform } from '@angular/core';

// https://stackoverflow.com/a/66154034

/**
 *  Under `strictTemplates: true` in tsconfig. It is not possible to typecast a component property in template. 
 * i.e. `
 *          [calcParams] = "parentCalcParams as IRRCalcParams"
 * OR       [calcParams] = "<IRRCalcParams> parentCalcParams"
 *      ` 
 *The above is not possible in template since conversion using `as` in templates is not possible in angular. Hence, we have a pipe defined which can perform the necessary type converison in templates.
 
          We need to define the interface/class/primitive type variables in the component.

  eg: 
      class Component {
          parentCalcParams: IRRCalcParams | MonthlyReturnCalcParams | ....
          IRRCalcParamsInterface: IRRCalcParams
      }

      component.html {
         <app-input-component [calcParams]="parentCalcParams | as : IRRCalcParamsInterface">          
         </app-input-component>
      }

  NOTE: 
    1.) This will work for typecasting to primitive types (string/boolean/number etc), classes, interfaces.
    2.) It doesn't work for types
 *

 */
@Pipe({
  name: 'as',
  pure: true
})
export class AsPipe implements PipeTransform {

  transform<T>(value: any, _type: (new (...args: any[]) => T) | T): T {
    return value as T;
  }

}