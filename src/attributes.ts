import {
  SupportedBreakpointType,
  supportedDirectives,
  SupportedFxDirectiveType,
  SupportedResponsiveFxDirectiveType,
} from "./supported-directive-type";

const getAttributes = (element: Element): [string, string][] => {
  const raw = element.attributes;
  const attributes: [string, string][] = [];
  for (let i = 0; i < raw.length; i++) {
    attributes.push([raw[i].name, raw[i].value ?? ""]);
  }

  return attributes;
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
  element: Element,
): [SupportedFxDirectiveType, string][] => {
  return getAttributes(element).filter(
    (attribute): attribute is [SupportedFxDirectiveType, string] =>
      isSupportedFxDirectiveType(attribute[0]),
  );
};
export const getSupportedResponsiveFxAttributes = (
  element: Element,
  breakpoint: SupportedBreakpointType,
): [SupportedResponsiveFxDirectiveType, string][] => {
  return getAttributes(element).filter(
    (attribute): attribute is [SupportedResponsiveFxDirectiveType, string] =>
      isSupportedResponsiveFxDirectiveType(attribute[0], breakpoint),
  );
};
