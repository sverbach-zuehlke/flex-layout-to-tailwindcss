import {
  supportedBreakpoints,
  SupportedBreakpointType,
  SupportedFxDirectiveType,
  SupportedDirectiveType,
} from "../supported-directive-type";
import {
  TranslationOperationAttributeResult,
  TranslationOperationClassResult,
  TranslationOperationResult,
} from "./translation-operation-result";
import { translateFxFlex } from "./translate-fx-flex";
import { translateFxLayout } from "./translate-fx-layout";
import { translateFxLayoutGap } from "./translate-fx-layout-gap";
import { translateFxLayoutAlign } from "./translate-fx-layout-align";
import { translateFxFill } from "./translate-fx-fill";
import { translateFxFlexOffset } from "./translate-fx-flex-offset";
import { translateFxFlexOrder } from "./translate-fx-flex-order";
import { translateFxShow } from "./translate-fx-show";
import { translateFxHide } from "./translate-fx-hide";

export type TranslatorFunction<T> = (
  fxAttributeValues: string,
  direction: "col" | "row",
) => T;

export type TranslateToClassesFunction =
  TranslatorFunction<TranslationOperationClassResult>;

export type TranslateToAttributesFunction =
  TranslatorFunction<TranslationOperationAttributeResult>;

export type AnyTranslateFunction =
  | TranslateToClassesFunction
  | TranslateToAttributesFunction;

export type ApplyBreakpoint<T> = (
  breakpoint: SupportedBreakpointType,
  result: TranslationOperationClassResult,
) => T;

export type ApplyBreakpointOnClass =
  ApplyBreakpoint<TranslationOperationClassResult>;
export type ApplyBreakpointOnAttribute =
  ApplyBreakpoint<TranslationOperationClassResult>;

export type ApplyBreakpointOnClassOrAttribute =
  | ApplyBreakpointOnClass
  | ApplyBreakpointOnAttribute;

export const applyTailwindCSSBreakpoint: ApplyBreakpointOnClass = (
  breakpoint,
  result,
) => {
  return {
    ...result,
    classes: result.classes.map((c) => `${breakpoint}:${c}`),
  };
};

const createResponsiveTranslatorsForDirective = <
  T extends SupportedFxDirectiveType,
>(
  directiveType: T,
  translationFunction: TranslateToClassesFunction,
): [`${T}.${SupportedBreakpointType}`, TranslateToClassesFunction][] => {
  return supportedBreakpoints.map((breakpoint) => [
    `${directiveType}.${breakpoint}`,
    (a, b) => applyTailwindCSSBreakpoint(breakpoint, translationFunction(a, b)),
  ]);
};

const fxFlexTranslators = createResponsiveTranslatorsForDirective(
  "fxFlex",
  translateFxFlex,
);
const fxLayoutTranslators = createResponsiveTranslatorsForDirective(
  "fxLayout",
  translateFxLayout,
);
const fxLayoutAlignTranslators = createResponsiveTranslatorsForDirective(
  "fxLayoutAlign",
  translateFxLayoutAlign,
);
const fxLayoutGapTranslators = createResponsiveTranslatorsForDirective(
  "fxLayoutGap",
  translateFxLayoutGap,
);
const fxFxFillTranslators = createResponsiveTranslatorsForDirective(
  "fxFill",
  translateFxFill,
);
const fxFlexFillTranslators = createResponsiveTranslatorsForDirective(
  "fxFlexFill",
  translateFxFill,
);
const fxFlexOffsetTranslators = createResponsiveTranslatorsForDirective(
  "fxFlexOffset",
  translateFxFlexOffset,
);
const fxFlexOrderTranslators = createResponsiveTranslatorsForDirective(
  "fxFlexOrder",
  translateFxFlexOrder,
);
const fxFlexShowTranslators = createResponsiveTranslatorsForDirective(
  "fxShow",
  translateFxShow,
);
const fxFlexHideTranslators = createResponsiveTranslatorsForDirective(
  "fxHide",
  translateFxHide,
);

const tupleToObject = <TK extends string, TV>(
  tuple: [TK, TV],
): { [p in TK]: TV } => {
  return {
    [tuple[0]]: tuple[1],
  } as any;
};

const responsiveTranslators = [
  ...fxFlexTranslators,
  ...fxLayoutTranslators,
  ...fxLayoutAlignTranslators,
  ...fxLayoutGapTranslators,
  ...fxFxFillTranslators,
  ...fxFlexFillTranslators,
  ...fxFlexOffsetTranslators,
  ...fxFlexOrderTranslators,
  ...fxFlexShowTranslators,
  ...fxFlexHideTranslators,
]
  .map(tupleToObject)
  .reduce((prev, cur) => ({ ...prev, ...cur }));

export const translate: {
  [K in SupportedDirectiveType]: AnyTranslateFunction;
} = {
  fxFlex: translateFxFlex,
  fxFlexFill: translateFxFill,
  fxFlexOrder: translateFxFlexOrder,
  fxFlexOffset: translateFxFlexOffset,
  fxFill: translateFxFill,
  fxLayout: translateFxLayout,
  fxLayoutAlign: translateFxLayoutAlign,
  fxLayoutGap: translateFxLayoutGap,
  fxShow: translateFxShow,
  fxHide: translateFxHide,
  ...responsiveTranslators,
};
