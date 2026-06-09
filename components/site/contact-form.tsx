"use client";

import {
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import { submitContactForm } from "@/app/[locale]/contact/actions";
import {
  contactFormFieldNames,
  contextValues,
  deliveryModeValues,
  emptyContactFormValues,
  initialContactFormState,
  languageDirectionValues,
  requestTypeValues,
  type ContactFormCopy,
  type ContactFormFieldName,
  type ContactFormValues,
} from "@/lib/contact/types";
import { localizedPath, type Locale } from "@/lib/site";

type ContactFormProps = {
  locale: Locale;
  content: ContactFormCopy;
  fallbackHref: string;
};

const inputClassName =
  "form-control mt-2";

const contactFormFieldNameSet = new Set<string>(contactFormFieldNames);

const draftValueLimits: Record<ContactFormFieldName, number> = {
  name: 121,
  email: 255,
  phone: 41,
  organization: 161,
  requestType: 64,
  context: 64,
  languageDirection: 64,
  deliveryMode: 64,
  desiredDateTime: 121,
  message: 3001,
};

function isAllowedValue(
  value: string,
  allowedValues: readonly string[],
) {
  return value === "" || allowedValues.includes(value);
}

function readContactFormDraft(storageKey: string) {
  try {
    const storedDraft = window.sessionStorage.getItem(storageKey);

    if (!storedDraft) {
      return null;
    }

    const parsedDraft: unknown = JSON.parse(storedDraft);

    if (
      typeof parsedDraft !== "object" ||
      parsedDraft === null ||
      Array.isArray(parsedDraft)
    ) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    const record = parsedDraft as Record<string, unknown>;
    const draft = { ...emptyContactFormValues };

    for (const fieldName of contactFormFieldNames) {
      const value = record[fieldName];

      if (typeof value === "string") {
        draft[fieldName] = value.slice(0, draftValueLimits[fieldName]);
      }
    }

    if (!isAllowedValue(draft.requestType, requestTypeValues)) {
      draft.requestType = "";
    }

    if (!isAllowedValue(draft.context, contextValues)) {
      draft.context = "";
    }

    if (
      !isAllowedValue(draft.languageDirection, languageDirectionValues)
    ) {
      draft.languageDirection = "";
    }

    if (!isAllowedValue(draft.deliveryMode, deliveryModeValues)) {
      draft.deliveryMode = "";
    }

    return draft;
  } catch {
    return null;
  }
}

function writeContactFormDraft(
  storageKey: string,
  values: ContactFormValues,
) {
  try {
    if (Object.values(values).some((value) => value !== "")) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(values));
    } else {
      window.sessionStorage.removeItem(storageKey);
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

function removeContactFormDraft(storageKey: string) {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // A successful submission must not be turned into an error by storage.
  }
}

function applyContactFormValues(
  form: HTMLFormElement | null,
  values: ContactFormValues,
) {
  if (!form) {
    return;
  }

  for (const fieldName of contactFormFieldNames) {
    const field = form.elements.namedItem(fieldName);

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
    ) {
      field.value = values[fieldName];
    }
  }
}

export function ContactForm({
  locale,
  content,
  fallbackHref,
}: ContactFormProps) {
  const submitForLocale = submitContactForm.bind(null, locale);
  const [state, formAction, pending] = useActionState(
    submitForLocale,
    initialContactFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const storageKey = `contact-form-draft:${locale}`;
  const storageKeyRef = useRef(storageKey);
  const valuesRef = useRef<ContactFormValues>({
    ...emptyContactFormValues,
  });

  useEffect(() => {
    storageKeyRef.current = storageKey;
    const storedDraft = readContactFormDraft(storageKey);
    const nextValues = storedDraft ?? { ...emptyContactFormValues };

    valuesRef.current = nextValues;
    applyContactFormValues(formRef.current, nextValues);
  }, [storageKey]);

  useEffect(() => {
    if (state.status === "idle") {
      return;
    }

    if (state.status === "success") {
      removeContactFormDraft(storageKeyRef.current);
      const emptyValues = { ...emptyContactFormValues };

      valuesRef.current = emptyValues;
      formRef.current?.reset();
    } else if (state.values) {
      valuesRef.current = state.values;
      applyContactFormValues(formRef.current, state.values);
      writeContactFormDraft(storageKeyRef.current, state.values);
    }

    statusRef.current?.focus();
  }, [state]);

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target;

    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) ||
      !contactFormFieldNameSet.has(target.name)
    ) {
      return;
    }

    const fieldName = target.name as ContactFormFieldName;
    const nextValues = {
      ...valuesRef.current,
      [fieldName]: target.value,
    };

    valuesRef.current = nextValues;
    writeContactFormDraft(storageKeyRef.current, nextValues);
  }

  function fieldError(name: ContactFormFieldName) {
    return state.fieldErrors?.[name]?.[0];
  }

  function describedBy(name: ContactFormFieldName) {
    return fieldError(name) ? `${name}-error` : undefined;
  }

  return (
    <div className="panel form-panel px-6 py-7 sm:px-8 sm:py-9">
      <form
        ref={formRef}
        action={formAction}
        onChange={handleFormChange}
        noValidate
      >
        <p className="text-sm leading-7 text-muted">{content.requiredNote}</p>

        <div
          ref={statusRef}
          tabIndex={-1}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 outline-none ${
            state.status === "success"
              ? "border-brand/20 bg-brand-soft/60 text-brand-strong"
              : state.status === "error"
                ? "border-red-300 bg-red-50 text-red-900"
                : "sr-only"
          }`}
        >
          {state.message}
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              {content.fields.name.label}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              placeholder={content.fields.name.placeholder}
              aria-invalid={Boolean(fieldError("name"))}
              aria-describedby={describedBy("name")}
              disabled={pending}
              className={inputClassName}
            />
            {fieldError("name") ? (
              <p id="name-error" className="mt-2 text-sm text-red-800">
                {fieldError("name")}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              {content.fields.email.label}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              dir="ltr"
              placeholder={content.fields.email.placeholder}
              aria-invalid={Boolean(fieldError("email"))}
              aria-describedby={describedBy("email")}
              disabled={pending}
              className={inputClassName}
            />
            {fieldError("email") ? (
              <p id="email-error" className="mt-2 text-sm text-red-800">
                {fieldError("email")}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-foreground">
              {content.fields.phone.label}{" "}
              <span className="font-normal text-muted">
                {content.optionalLabel}
              </span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              dir="ltr"
              placeholder={content.fields.phone.placeholder}
              aria-invalid={Boolean(fieldError("phone"))}
              aria-describedby={describedBy("phone")}
              disabled={pending}
              className={inputClassName}
            />
            {fieldError("phone") ? (
              <p id="phone-error" className="mt-2 text-sm text-red-800">
                {fieldError("phone")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="organization"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.organization.label}{" "}
              <span className="font-normal text-muted">
                {content.optionalLabel}
              </span>
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              maxLength={160}
              autoComplete="organization"
              placeholder={content.fields.organization.placeholder}
              aria-invalid={Boolean(fieldError("organization"))}
              aria-describedby={describedBy("organization")}
              disabled={pending}
              className={inputClassName}
            />
            {fieldError("organization") ? (
              <p id="organization-error" className="mt-2 text-sm text-red-800">
                {fieldError("organization")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="requestType"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.requestType.label}
            </label>
            <select
              id="requestType"
              name="requestType"
              required
              defaultValue=""
              aria-invalid={Boolean(fieldError("requestType"))}
              aria-describedby={describedBy("requestType")}
              disabled={pending}
              className={inputClassName}
            >
              <option value="" disabled>
                {content.fields.requestType.placeholder}
              </option>
              {content.fields.requestType.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError("requestType") ? (
              <p id="requestType-error" className="mt-2 text-sm text-red-800">
                {fieldError("requestType")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="context"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.context.label}
            </label>
            <select
              id="context"
              name="context"
              required
              defaultValue=""
              aria-invalid={Boolean(fieldError("context"))}
              aria-describedby={describedBy("context")}
              disabled={pending}
              className={inputClassName}
            >
              <option value="" disabled>
                {content.fields.context.placeholder}
              </option>
              {content.fields.context.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError("context") ? (
              <p id="context-error" className="mt-2 text-sm text-red-800">
                {fieldError("context")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="languageDirection"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.languageDirection.label}
            </label>
            <select
              id="languageDirection"
              name="languageDirection"
              required
              defaultValue=""
              aria-invalid={Boolean(fieldError("languageDirection"))}
              aria-describedby={describedBy("languageDirection")}
              disabled={pending}
              className={inputClassName}
            >
              <option value="" disabled>
                {content.fields.languageDirection.placeholder}
              </option>
              {content.fields.languageDirection.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError("languageDirection") ? (
              <p
                id="languageDirection-error"
                className="mt-2 text-sm text-red-800"
              >
                {fieldError("languageDirection")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="deliveryMode"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.deliveryMode.label}{" "}
              <span className="font-normal text-muted">
                {content.optionalLabel}
              </span>
            </label>
            <select
              id="deliveryMode"
              name="deliveryMode"
              defaultValue=""
              aria-invalid={Boolean(fieldError("deliveryMode"))}
              aria-describedby={describedBy("deliveryMode")}
              disabled={pending}
              className={inputClassName}
            >
              <option value="">
                {content.fields.deliveryMode.placeholder}
              </option>
              {content.fields.deliveryMode.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError("deliveryMode") ? (
              <p id="deliveryMode-error" className="mt-2 text-sm text-red-800">
                {fieldError("deliveryMode")}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="desiredDateTime"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.desiredDateTime.label}{" "}
              <span className="font-normal text-muted">
                {content.optionalLabel}
              </span>
            </label>
            <input
              id="desiredDateTime"
              name="desiredDateTime"
              type="text"
              maxLength={120}
              dir="ltr"
              placeholder={content.fields.desiredDateTime.placeholder}
              aria-invalid={Boolean(fieldError("desiredDateTime"))}
              aria-describedby={describedBy("desiredDateTime")}
              disabled={pending}
              className={inputClassName}
            />
            {fieldError("desiredDateTime") ? (
              <p
                id="desiredDateTime-error"
                className="mt-2 text-sm text-red-800"
              >
                {fieldError("desiredDateTime")}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="message"
              className="text-sm font-semibold text-foreground"
            >
              {content.fields.message.label}
            </label>
            <textarea
              id="message"
              name="message"
              required
              minLength={10}
              maxLength={3000}
              rows={7}
              dir="auto"
              placeholder={content.fields.message.placeholder}
              aria-invalid={Boolean(fieldError("message"))}
              aria-describedby={describedBy("message")}
              disabled={pending}
              className={`${inputClassName} resize-y`}
            />
            {fieldError("message") ? (
              <p id="message-error" className="mt-2 text-sm text-red-800">
                {fieldError("message")}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="absolute -start-[10000px] top-auto h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <p className="form-note mt-6 px-4 py-3 text-sm leading-7 text-muted">
          {content.privacyText}{" "}
          <a
            href={localizedPath(locale, "privacy")}
            className="font-semibold text-brand-strong underline decoration-brand/30 underline-offset-4 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {content.privacyLinkLabel}
          </a>
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="button-primary px-6 py-3 disabled:cursor-wait disabled:opacity-65"
          >
            {pending ? content.submittingLabel : content.submitLabel}
          </button>
          <p className="text-sm leading-6 text-muted">
            {content.fallbackText}{" "}
            <a
              href={fallbackHref}
              className="font-semibold text-brand-strong underline decoration-brand/30 underline-offset-4 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {content.fallbackLabel}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
