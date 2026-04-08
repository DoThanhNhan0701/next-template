/**
 * Removes keys with empty values (""), null, undefined, or empty arrays from an object.
 * Useful for cleaning up form data before sending it to the backend.
 */
export const cleanFormData = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return acc;
    }
    return { ...acc, [key]: value };
  }, {} as Partial<T>);
};
