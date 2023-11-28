import { TranslateToClassesFunction, TranslatorFunction } from "./translate";
import { fxToTailwindCSSLexicon } from "./lexicons";

export const translateFxLayout: TranslateToClassesFunction = (
  attributeValues,
) => {
  const [direction, wrap] = attributeValues.split(" ");
  const tailwindDirection =
    fxToTailwindCSSLexicon.directions[direction] ?? direction;
  const classes = ["flex", `flex-${tailwindDirection}`];

  if (wrap) {
    classes.push(`flex-${wrap}`);
  }

  return {
    operation: "class",
    classes,
  };
};
