/** Reads a FormData text field, always as a string (never null/undefined). */
export function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Reads an HTML checkbox field. Unchecked checkboxes are absent from FormData entirely. */
export function formCheckbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

/** Converts a blank string to null, for optional text fields headed to a nullable DB column. */
export function nullIfBlank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
