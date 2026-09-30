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

export function isValidDateTime(value) {
  if (typeof value !== "string") {
    return false;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) {
    return false;
  }

  const [, year, month, day, hours, minutes] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes)
  );

  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date.getHours() === Number(hours) &&
    date.getMinutes() === Number(minutes)
  );
}

export function isStringWithinLength(value, maxLength) {
  return (typeof value === "string" && value.trim().length <= maxLength);
}

export function isOptionalString(value) {
  return (value === null || value === undefined || typeof value === "string");
}

export function isNumericString(value) {
  return (typeof value === "string" && /^\d+(\.\d+)?$/.test(value));
}

