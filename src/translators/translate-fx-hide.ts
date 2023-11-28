import { TranslateToClassesFunction, TranslatorFunction } from "./translate";

export const translateFxHide: TranslateToClassesFunction = (_) => {
  return {
    operation: "class",
    classes: ["invisible"],
  };
};
