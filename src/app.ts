import fs from "fs";
import { glob } from "glob";
import {
  supportedBreakpoints,
  supportedDirectives,
  supportedResponsiveDirectives,
} from "./supported-directive-type";
import { translate } from "./translators/translate";
import arg from "arg";
import { TranslationOperationResult } from "./translators/translation-operation-result";
import logger from "pino";
import {
  getSupportedFxAttributes,
  getSupportedResponsiveFxAttributes,
} from "./attributes";
import { JSDOM } from "jsdom";

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

    htmlFilePaths.forEach((htmlPath) => {
      log.debug(`Processing: [${htmlPath}]`);
      const data = fs.readFileSync(htmlPath, "utf8");
      const root = new JSDOM(data).window.document;
      const translationOperations: [TranslationOperationResult[], Element][] =
        [];

      // get translations for responsive fxFlex directives (i.e. fxFlex.sm, fxLayout.md) to tailwindcss classes
      const fxResponsiveDirectiveRegex = new RegExp(
        supportedResponsiveDirectives.join("|"),
      );
      const fxResponsiveElements = Array.from(
        root.getElementsByTagName("*"),
      ).filter((element) =>
        Array.from(element.attributes).find((attribute) =>
          fxResponsiveDirectiveRegex.test(attribute.name),
        ),
      );
      const breakpoints = supportedBreakpoints;
      fxResponsiveElements.forEach((element) => {
        breakpoints.forEach((breakpoint) => {
          let fxAttributes = getSupportedResponsiveFxAttributes(
            element,
            breakpoint,
          );
          let parentAttributeValues: string[];
          if (element.parentElement) {
            parentAttributeValues = getSupportedResponsiveFxAttributes(
              element.parentElement,
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
      fxResponsiveElements.forEach((element) => {
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
        });
      });

      // get translations for non-responsive fxFlex directives (i.e. fxFlex, fxLayout) to tailwindcss classes
      const fxDirectiveRegex = new RegExp(supportedDirectives.join("|"));
      const fxFlexElements = Array.from(root.getElementsByTagName("*")).filter(
        (element) =>
          Array.from(element.attributes).find((attribute) =>
            fxDirectiveRegex.test(attribute.name),
          ),
      );
      fxFlexElements.forEach((element: Element) => {
        const fxAttributes = getSupportedFxAttributes(element);
        let parentAttributeValues: string[];
        if (element.parentElement) {
          parentAttributeValues = getSupportedFxAttributes(
            element.parentElement,
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
      fxFlexElements.forEach((element) => {
        const supportedFxAttributes = [...getSupportedFxAttributes(element)];
        const fxAttributeKeys = supportedFxAttributes.map(
          (attribute) => attribute[0],
        );

        fxAttributeKeys.forEach((fxAttributeKey) => {
          element.removeAttribute(fxAttributeKey);
        });
      });

      // apply all the translations
      translationOperations.forEach(([translations, element]) => {
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
      });

      // restore camel-cases, attributes get parsed to lowercase :/
      let componentTemplate = root.body.innerHTML;
      const elements = Array.from(root.getElementsByTagName("*"));
      const attributeNames = elements
        .map((element) =>
          Array.from(element.attributes).map((attribute) => attribute.name),
        )
        .flat();
      const dataLower = data.toLowerCase();

      attributeNames.forEach((name) => {
        if (!dataLower.includes(name)) {
          return;
        }

        const originalNameIndex = dataLower.indexOf(name);
        if (originalNameIndex < 0) {
          return;
        }

        const originalName = data.substring(
          originalNameIndex,
          originalNameIndex + name.length,
        );
        componentTemplate = componentTemplate.replace(name, originalName);
      });

      fs.writeFileSync(htmlPath, componentTemplate, { encoding: "utf-8" });
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
