import { isDefined, isEmptyString } from "../../../utils/helpers";
import "./Validation.scss";
import "../../../translations/i18n"
import { useTranslation } from "react-i18next";

export const required = (fieldName, value) => {
  if (!isDefined(value) || isEmptyString(value)) {

    let t = useTranslation();
    return t('components.form.validation.required', { fieldName })
  }
};

export const matchPattern = (pattern) => (fieldName, value) => {
  pattern = typeof pattern === "string" ? new RegExp(pattern) : pattern;

  if (!isEmptyString(value) && value.match(pattern) === null) {
    let t = useTranslation();

    return t('components.form.validation.match_pattern', { fieldName, pattern });
  }
};

export const json = (fieldName, value) => {
  let t = useTranslation();
  const err = t('components.form.validation.json_string_valid', { fieldName });

  if (!isDefined(value) || value.trim().length === 0) return;

  if (/^(\{|\[)/.test(value) === false || /(\}|\])$/.test(value) === false) {
    return err;
  }

  try {
    JSON.parse(value);
  } catch (e) {
    return err;
  }
};

export const regexp = (fieldName, value) => {

  let t = useTranslation();
  
  try {
    new RegExp(value);
  } catch (err) {
    return t('components.form.validation.json_string_valid', { fieldName });
  }
};
