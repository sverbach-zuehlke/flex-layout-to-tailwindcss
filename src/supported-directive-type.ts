export const supportedBreakpoints = ["xs", "sm", "md", "lg", "xl"] as const;

export type SupportedBreakpointType = (typeof supportedBreakpoints)[number];

export const supportedTailwindcssBreakpoints = [
  ...supportedBreakpoints,
  "2xl",
] as const;

export type SupportedTailwindcssBreakpointType =
  (typeof supportedTailwindcssBreakpoints)[number];

export const supportedDirectives = [
  "fxflex",
  "fxlayout",
  "fxlayoutalign",
  "fxflexfill",
  "fxfill",
  "fxshow",
  "fxhide",
  "fxlayoutgap",
  "fxflexoffset",
  "fxflexorder",
] as const;

export const supportedResponsiveDirectives = supportedDirectives
  .map((directive) => supportedBreakpoints.map((breakpoint) => `${breakpoint}`))
  .flat();

export type SupportedFxDirectiveType = (typeof supportedDirectives)[number];
export type SupportedResponsiveFxDirectiveType =
  `${SupportedFxDirectiveType}.${SupportedBreakpointType}`;

export type SupportedDirectiveType =
  | SupportedFxDirectiveType
  | SupportedResponsiveFxDirectiveType;
