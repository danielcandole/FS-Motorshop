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