import { HTMLElement } from "node-html-parser";
import {
  supportedBreakpoints,
  SupportedBreakpointType,
  supportedDirectives,
  SupportedFxDirectiveType,
  SupportedResponsiveFxDirectiveType,
} from "./supported-directive-type";

const getAttributes = (element: HTMLElement): [string, string][] => {
  const raw = element.rawAttrs;
  const pattern = /(\w+(?:\.\w+)*)\s*(?:=\s*["']([^"']*)["'])?/g;
  const matches = [...raw.matchAll(pattern)];
  return matches.map((attribute) => [attribute[1], attribute[2] ?? ""]);
};

const isSupportedFxDirectiveType = (
  attribute: string,
): attribute is SupportedFxDirectiveType => {
  return supportedDirectives.includes(attribute as SupportedFxDirectiveType);
};

const isSupportedResponsiveFxDirectiveType = (
  attribute: string,
  supportedBreakpoint: SupportedBreakpointType,
): attribute is SupportedResponsiveFxDirectiveType => {
  const attributes = attribute.split(".");
  const directive = attributes[0];
  const breakpoint = attributes[1];
  return (
    supportedDirectives.includes(directive as SupportedFxDirectiveType) &&
    breakpoint === supportedBreakpoint
  );
};

export const getSupportedFxAttributes = (
  element: HTMLElement,
): [SupportedFxDirectiveType, string][] => {
  return getAttributes(element).filter(
    (attribute): attribute is [SupportedFxDirectiveType, string] =>
      isSupportedFxDirectiveType(attribute[0]),
  );
};
export const getSupportedResponsiveFxAttributes = (
  element: HTMLElement,
  breakpoint: SupportedBreakpointType,
): [SupportedResponsiveFxDirectiveType, string][] => {
  return getAttributes(element).filter(
    (attribute): attribute is [SupportedResponsiveFxDirectiveType, string] =>
      isSupportedResponsiveFxDirectiveType(attribute[0], breakpoint),
  );
};
