export function setDefaultDate(inputId) {
  const dateInput = document.getElementById(inputId);

  if (!dateInput) {
    console.error(`Date Utils: #${inputId} was not found.`);
    return;
  }

  const today = new Date();
  const localDateTime = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16);

  dateInput.value = localDateTime;
}

export function dateFormat(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }
  return String(value).replace(" ", "T").slice(0, 16);
}