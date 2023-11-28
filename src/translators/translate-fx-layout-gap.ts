import { TranslateToClassesFunction } from "./translate";

export const translateFxLayoutGap: TranslateToClassesFunction = (
  attributeValues,
) => {
  const values = attributeValues.split(" ");
  const classes = [`gap-[${values[0].translateNumberToPercent()}]`];

  return {
    operation: "class",
    classes,
  };
};
