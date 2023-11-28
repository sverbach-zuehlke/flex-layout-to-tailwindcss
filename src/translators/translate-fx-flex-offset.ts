import { TranslateToClassesFunction, TranslatorFunction } from "./translate";

export const translateFxFlexOffset: TranslateToClassesFunction = (
  attributeValues,
) => {
  const values = attributeValues.split(" ");
  return {
    operation: "class",
    classes: [`ml-[${values[0].translateNumberToPercent()}]`],
  };
};
