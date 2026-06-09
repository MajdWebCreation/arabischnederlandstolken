export const requestTypeValues = [
  "regular",
  "urgent",
  "sworn",
  "availability",
  "other",
] as const;

export const contextValues = [
  "healthcare",
  "municipality",
  "legal",
  "migration",
  "business",
  "other",
] as const;

export const languageDirectionValues = [
  "ar_to_nl",
  "nl_to_ar",
  "both_or_unknown",
] as const;

export const deliveryModeValues = [
  "phone",
  "video",
  "on_location",
  "unknown",
] as const;

export type RequestType = (typeof requestTypeValues)[number];
export type ContactContext = (typeof contextValues)[number];
export type LanguageDirection = (typeof languageDirectionValues)[number];
export type DeliveryMode = (typeof deliveryModeValues)[number];

export const contactFormFieldNames = [
  "name",
  "email",
  "phone",
  "organization",
  "requestType",
  "context",
  "languageDirection",
  "deliveryMode",
  "desiredDateTime",
  "message",
] as const;

export type ContactFormFieldName =
  (typeof contactFormFieldNames)[number];

export type ContactFormFieldErrors = Partial<
  Record<ContactFormFieldName, string[]>
>;

export type ContactFormValues = Record<ContactFormFieldName, string>;

export const emptyContactFormValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  requestType: "",
  context: "",
  languageDirection: "",
  deliveryMode: "",
  desiredDateTime: "",
  message: "",
};

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: ContactFormFieldErrors;
  values?: ContactFormValues;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
  message: "",
};

export type ContactValidationMessages = {
  nameRequired: string;
  nameTooLong: string;
  emailRequired: string;
  emailInvalid: string;
  emailTooLong: string;
  phoneTooLong: string;
  organizationTooLong: string;
  invalidOption: string;
  desiredDateTimeTooLong: string;
  messageRequired: string;
  messageTooShort: string;
  messageTooLong: string;
};

type TextFieldCopy = {
  label: string;
  placeholder: string;
};

type SelectOptionCopy<T extends string> = {
  value: T;
  label: string;
};

type SelectFieldCopy<T extends string> = {
  label: string;
  placeholder: string;
  options: readonly SelectOptionCopy<T>[];
};

export type ContactFormCopy = {
  eyebrow: string;
  title: string;
  description: string;
  requiredNote: string;
  optionalLabel: string;
  fields: {
    name: TextFieldCopy;
    email: TextFieldCopy;
    phone: TextFieldCopy;
    organization: TextFieldCopy;
    requestType: SelectFieldCopy<RequestType>;
    context: SelectFieldCopy<ContactContext>;
    languageDirection: SelectFieldCopy<LanguageDirection>;
    deliveryMode: SelectFieldCopy<DeliveryMode>;
    desiredDateTime: TextFieldCopy;
    message: TextFieldCopy;
  };
  submitLabel: string;
  submittingLabel: string;
  fallbackText: string;
  fallbackLabel: string;
  privacyText: string;
  messages: {
    success: string;
    invalidSubmission: string;
    generalError: string;
  };
  validation: ContactValidationMessages;
};
