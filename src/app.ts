import fs from "fs";
import { glob } from "glob";
import { HTMLElement, parse } from "node-html-parser";
import {
  supportedBreakpoints,
  SupportedBreakpointType,
  supportedDirectives,
  SupportedFxDirectiveType,
  SupportedResponsiveFxDirectiveType,
} from "./supported-directive-type";
import { translate } from "./translators/translate";
import arg from "arg";
import { TranslationOperationResult } from "./translators/translation-operation-result";
import logger from "pino";
import {
  getSupportedFxAttributes,
  getSupportedResponsiveFxAttributes,
} from "./attributes";

const log = logger({ level: "trace" });

const findHTMLFiles = async (directoryPath: string): Promise<string[]> => {
  return await glob(`${directoryPath}/**/*.html`, {
    absolute: true,
  });
};

const printDivider = () => {
  log.info(
    "===========================================================================================================",
  );
};

const getRidOfFlexLayoutPlease = async () => {
  const args = arg({
    "--source": String,
    "--output": String,

    // Aliases
    "-s": "--source",
    "-o": "--output",
  });

  if (!args["--source"] || !args["--output"]) {
    log.fatal(`Provide a source and output path in order to run the script.`);
    log.fatal(`Provided source: ${args["--source"] ?? "[UNDEFINED]"}`);
    log.fatal(`Provided source: ${args["--output"] ?? "[UNDEFINED]"}`);
  }

  const sourcePath = args["--source"];
  const outputPath = args["--output"];

  try {
    printDivider();
    log.info(
      `Supported flexLayout directives: ${supportedDirectives
        .map((d) => `"${d}"`)
        .join(", ")}.`,
    );
    log.info(
      `Supported flexLayout responsive API directives: ${supportedBreakpoints
        .map((d) => `"${d}"`)
        .join(", ")}.`,
    );
    log.info(
      `Please note that only NON-conditional directives are supported, you're on your own on to convert those :/`,
    );
    printDivider();

    log.info(`Start looking for .html files in path: "${sourcePath}"`);
    log.info(`Outputting results into: "${outputPath}"`);

    log.debug(
      `Cleaning ${outputPath}, copying over source files from ${sourcePath}`,
    );
    fs.rmSync(outputPath, { recursive: true, force: true });
    fs.cpSync(sourcePath, outputPath, { recursive: true, force: true });

    let countFiles = 0;
    let countElements = 0;
    let countUsages = 0;
    const htmlFilePaths = await findHTMLFiles(outputPath);
    log.info(
      `Detected ${htmlFilePaths.length} .html file(s), starting processing now.`,
    );

    const fxQuery = supportedDirectives
      .map((directive) => `[${directive}]`)
      .join(", ");

    htmlFilePaths.forEach((htmlPath) => {
      log.debug(`Processing: [${htmlPath}]`);
      const data = fs.readFileSync(htmlPath, "utf8");
      const root = parse(data);
      const translationOperations: [
        TranslationOperationResult[],
        HTMLElement,
      ][] = [];

      // get translations for responsive fxFlex directives (i.e. fxFlex.sm, fxLayout.md) to tailwindcss classes
      let elementsWithFxFlex = root.querySelectorAll(fxQuery) ?? [];
      const breakpoints = supportedBreakpoints;
      elementsWithFxFlex.forEach((element) => {
        breakpoints.forEach((breakpoint) => {
          let fxAttributes = getSupportedResponsiveFxAttributes(
            element,
            breakpoint,
          );
          let parentAttributeValues: string[];
          if (element.parentNode) {
            parentAttributeValues = getSupportedResponsiveFxAttributes(
              element.parentNode,
              breakpoint,
            ).map((attribute) => attribute[1]);
          } else {
            parentAttributeValues = [];
          }
          const fxAttributeValues = fxAttributes.map(
            (attribute) => attribute[1],
          );
          const direction = [
            ...parentAttributeValues,
            ...fxAttributeValues,
          ].find(
            (attribute) =>
              attribute === "column" || attribute === "column-reverse",
          )
            ? "col"
            : "row";
          let translations = fxAttributes.map((attribute) =>
            translate[attribute[0]](attribute[1], direction),
          );
          translationOperations.push([translations, element]);

          countUsages += fxAttributes.length;
          countElements++;
        });
      });

      // remove responsive fxFlex directives
      elementsWithFxFlex.forEach((element) => {
        const supportedFxAttributes = breakpoints
          .map((breakpoint) =>
            getSupportedResponsiveFxAttributes(element, breakpoint),
          )
          .flat();
        const responsiveFxAttributeKeys = supportedFxAttributes.map(
          (attribute) => attribute[0],
        );

        responsiveFxAttributeKeys.forEach((fxAttributeKey) => {
          element.removeAttribute(fxAttributeKey);
          const breakpoint = fxAttributeKey.split(".")[1];
          element.removeAttribute(`.${breakpoint}`);
        });
      });

      // get translations for non-responsive fxFlex directives (i.e. fxFlex, fxLayout) to tailwindcss classes
      elementsWithFxFlex = root.querySelectorAll(fxQuery) ?? [];
      elementsWithFxFlex.forEach((element) => {
        const fxAttributes = getSupportedFxAttributes(element);
        let parentAttributeValues: string[];
        if (element.parentNode) {
          parentAttributeValues = getSupportedFxAttributes(
            element.parentNode,
          ).map((attribute) => attribute[1]);
        } else {
          parentAttributeValues = [];
        }

        const fxAttributeValues = fxAttributes.map((attribute) => attribute[1]);
        const direction = [...parentAttributeValues, ...fxAttributeValues].find(
          (attribute) =>
            attribute === "column" || attribute === "column-reverse",
        )
          ? "col"
          : "row";

        const translations = fxAttributes.map((attribute) =>
          translate[attribute[0]](attribute[1], direction),
        );
        translationOperations.push([translations, element]);

        countUsages += fxAttributes.length;
      });

      // finally, remove non-responsive fxFlex directives
      elementsWithFxFlex.forEach((element) => {
        const supportedFxAttributes = [...getSupportedFxAttributes(element)];
        const responsiveFxAttributeKeys = supportedFxAttributes.map(
          (attribute) => attribute[0],
        );

        responsiveFxAttributeKeys.forEach((fxAttributeKey) => {
          element.removeAttribute(fxAttributeKey);
        });
      });

      // apply all the translations
      translationOperations.forEach(([translations, element]) => {
        applyTranslations(translations, element);
      });

      fs.writeFileSync(htmlPath, root.toString(), { encoding: "utf-8" });
      countFiles++;
    });

    log.info("Processing done!");
    log.info(
      `Processed ${countFiles} files, ${countElements} elements and ${countUsages} usages in total.`,
    );
  } catch (err) {
    log.error("Something went wrong :(");
    log.error(err);
  }
};

getRidOfFlexLayoutPlease().then((r) =>
  log.info(`May you rest in peace now, FlexLayout.`),
);

declare global {
  interface String {
    translateNumberToPercent(): string;
  }
}

String.prototype.translateNumberToPercent = function () {
  let maybeNumber = Number(String(this));

  if (isNaN(+maybeNumber)) {
    return String(this);
  }

  return `${maybeNumber}%`;
};

export {};

const applyTranslations = (
  translations: TranslationOperationResult[],
  element: HTMLElement,
) => {
  translations.forEach((translation) => {
    switch (translation.operation) {
      case "attribute":
        element.setAttribute(translation.name, translation.value);
        break;
      case "class":
        translation.classes.map((c) => element.classList.add(c));
        break;
    }
  });
};
