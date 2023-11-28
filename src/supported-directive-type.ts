export const supportedBreakpoints = ["xs", "sm", "md", "lg", "xl"] as const;

export type SupportedBreakpointType = (typeof supportedBreakpoints)[number];

export const supportedDirectives = [
  "fxFlex",
  "fxLayout",
  "fxLayoutAlign",
  "fxFlexFill",
  "fxFill",
  "fxShow",
  "fxHide",
  "fxLayoutGap",
  "fxFlexOffset",
  "fxFlexOrder",
] as const;

export type SupportedFxDirectiveType = (typeof supportedDirectives)[number];
export type SupportedResponsiveFxDirectiveType =
  `${SupportedFxDirectiveType}.${SupportedBreakpointType}`;

export type SupportedDirectiveType =
  | SupportedFxDirectiveType
  | SupportedResponsiveFxDirectiveType;
