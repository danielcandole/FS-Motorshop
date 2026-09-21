export function isNonEmptyString(value) {
  return (typeof value === "string" && value.trim().length > 0);
}

export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (date.getUTCFullYear() === year &&date.getUTCMonth() === month - 1 &&date.getUTCDate() === day);
}

export function isStringWithinLength(value, maxLength) {
  return (typeof value === "string" && value.trim().length <= maxLength);
}

export function isOptionalString(value) {
  return (value === null || value === undefined || typeof value === "string");
}

export function isNumericString(value) {
  return (typeof value === "string" && /^\d+$/.test(value));
}