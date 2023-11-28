import { TranslateToClassesFunction, TranslatorFunction } from "./translate";
import { fxToTailwindCSSLexicon } from "./lexicons";

export const translateFxLayoutAlign: TranslateToClassesFunction = (
  attributeValues,
  direction,
) => {
  const [main, cross] = attributeValues.split(" ");
  const mainTranslated = fxToTailwindCSSLexicon.positions[main] ?? main;
  const crossTranslated = fxToTailwindCSSLexicon.positions[cross] ?? cross;
  let classes = [
    direction === "row"
      ? `justify-${mainTranslated}`
      : `items-${mainTranslated}`,
  ];

  if (cross) {
    classes = [
      `justify-${mainTranslated}`,
      `content-${crossTranslated}`,
      `items-${crossTranslated}`,
    ];
  }

  return {
    operation: "class",
    classes,
  };
};
