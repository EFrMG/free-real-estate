/**
 * Turns whatever a backend route put in its `error` field into a single string.
 *
 * Hono routes answer with either a plain message or zod's flattened error object (`{ formErrors, fieldErrors }`): collapse it before handing it to a component.
 */
export default function apiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (typeof error === "string" && error !== "") return error;

  if (error && typeof error === "object") {
    const { fieldErrors, formErrors } = error as {
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };

    const firstField = Object.entries(fieldErrors ?? {}).find(
      ([, messages]) => messages?.length,
    );

    if (firstField) {
      const [field, messages] = firstField;

      return `${humanizeFieldName(field)}: ${messages![0]}`;
    }

    if (formErrors?.length) return formErrors[0]!;
  }

  return fallback;
}

/** `longDescription` -> `Long description`. */
function humanizeFieldName(field: string): string {
  const spaced = field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
