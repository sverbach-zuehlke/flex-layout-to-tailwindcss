import {
  supportedBreakpoints,
  SupportedBreakpointType,
  SupportedDirectiveType,
  SupportedFxDirectiveType,
  supportedTailwindcssBreakpoints,
  SupportedTailwindcssBreakpointType,
} from "../supported-directive-type";
import {
  TranslationOperationAttributeResult,
  TranslationOperationClassResult,
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

export const getBiggerScreen = (
  screenBreakpoint: SupportedBreakpointType,
): SupportedTailwindcssBreakpointType => {
  return supportedTailwindcssBreakpoints[
    supportedBreakpoints.indexOf(screenBreakpoint) + 1
  ];
};

export const applyTailwindCSSBreakpoint: ApplyBreakpointOnClass = (
  breakpoint,
  result,
) => {
  return {
    ...result,
    classes: result.classes.map(
      (c) => `${breakpoint}:max-${getBiggerScreen(breakpoint)}:${c}`,
    ),
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
  "fxflex",
  translateFxFlex,
);
const fxLayoutTranslators = createResponsiveTranslatorsForDirective(
  "fxlayout",
  translateFxLayout,
);
const fxLayoutAlignTranslators = createResponsiveTranslatorsForDirective(
  "fxlayoutalign",
  translateFxLayoutAlign,
);
const fxLayoutGapTranslators = createResponsiveTranslatorsForDirective(
  "fxlayoutgap",
  translateFxLayoutGap,
);
const fxFxFillTranslators = createResponsiveTranslatorsForDirective(
  "fxfill",
  translateFxFill,
);
const fxFlexFillTranslators = createResponsiveTranslatorsForDirective(
  "fxflexfill",
  translateFxFill,
);
const fxFlexOffsetTranslators = createResponsiveTranslatorsForDirective(
  "fxflexoffset",
  translateFxFlexOffset,
);
const fxFlexOrderTranslators = createResponsiveTranslatorsForDirective(
  "fxflexorder",
  translateFxFlexOrder,
);
const fxFlexShowTranslators = createResponsiveTranslatorsForDirective(
  "fxshow",
  translateFxShow,
);
const fxFlexHideTranslators = createResponsiveTranslatorsForDirective(
  "fxhide",
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
  fxflex: translateFxFlex,
  fxflexfill: translateFxFill,
  fxflexorder: translateFxFlexOrder,
  fxflexoffset: translateFxFlexOffset,
  fxfill: translateFxFill,
  fxlayout: translateFxLayout,
  fxlayoutalign: translateFxLayoutAlign,
  fxlayoutgap: translateFxLayoutGap,
  fxshow: translateFxShow,
  fxhide: translateFxHide,
  ...responsiveTranslators,
};
