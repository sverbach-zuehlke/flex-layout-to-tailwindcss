import { TranslateToClassesFunction, TranslatorFunction } from "./translate";

/**
 * Reference
 * https://github.com/angular/flex-layout/wiki/fxFlexFill-API
 *
 * @param _
 */
export const translateFxFill: TranslateToClassesFunction = (_) => {
  return {
    operation: "class",
    classes: ["min-w-full", "min-h-full", "w-full", "h-full", "m-0"],
  };
};
