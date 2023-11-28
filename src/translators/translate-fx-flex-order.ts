import { TranslateToClassesFunction, TranslatorFunction } from "./translate";

export const translateFxFlexOrder: TranslateToClassesFunction = (
  attributeValues,
) => {
  const values = attributeValues.split(" ");
  return {
    operation: "class",
    classes: [`order-[${values[0]}]`],
  };
};
