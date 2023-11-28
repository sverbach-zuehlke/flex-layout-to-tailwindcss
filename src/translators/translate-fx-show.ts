import { TranslateToClassesFunction, TranslatorFunction } from "./translate";

export const translateFxShow: TranslateToClassesFunction = (_) => {
  return {
    operation: "class",
    classes: ["visible"],
  };
};
