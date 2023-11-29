import { TranslateToClassesFunction, TranslatorFunction } from "./translate";

export const translateFxFlex: TranslateToClassesFunction = (
  attributeValues,
  direction,
) => {
  let classes: string[];

  switch (attributeValues) {
    case "":
      classes = ["flex", "grow", "shrink", "basis-0"];
      break;
    case "grow":
      classes = ["flex", "grow", "shrink", "basis-full"];
      break;
    case "initial":
    case "nogrow":
      classes = ["flex", "grow-0", "shrink", "basis-auto"];
      break;
    case "auto":
      classes = ["flex", "grow", "shrink", "basis-full"];
      break;
    case "none":
      classes = ["flex", "grow-0", "shrink-0", "basis-auto"];
      break;
    case "noshrink":
      classes = ["flex", "grow", "shrink-0", "basis-auto"];
      break;
    default:
      const flexValues = attributeValues.split(" ");
      const basisValue =
        flexValues[flexValues.length - 1].translateNumberToPercent();
      if (flexValues.length === 3) {
        classes = [
          "flex",
          `grow-[${flexValues[0]}]`,
          `shrink-[${flexValues[1]}]`,
          `basis-[${basisValue}]`,
        ];
      } else {
        classes = [
          "flex",
          "grow",
          "shrink",
          `basis-[${basisValue}]`,
          direction === "row"
            ? `min-w-[${basisValue}]`
            : `min-h-[${basisValue}]`,
          direction === "row"
            ? `max-w-[${basisValue}]`
            : `max-h-[${basisValue}]`,
        ];
      }
  }

  return {
    operation: "class",
    classes: [...classes, "border-box"],
  };
};
