export type TranslationOperationResult =
  | TranslationOperationClassResult
  | TranslationOperationAttributeResult;


export type TranslationOperationClassResult = {
    operation: "class";
    classes: string[];
};

export type TranslationOperationAttributeResult = {
    operation: "attribute"; name: string; value: string;
}