export function setDefaultDate(inputId) {
  const dateInput = document.getElementById(inputId);

  if (!dateInput) {
    console.error(`Date Utils: #${inputId} was not found.`);
    return;
  }

  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  dateInput.value = localDate;
}

export function dateFormat(value) {
  if (!value) {
    return "—";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return "Invalid date";
  }

  const [, year, month, day] = match;

  return `${month}/${day}/${year}`;
}