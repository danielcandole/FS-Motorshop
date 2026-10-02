import {isNonEmptyString, isValidDateTime, isStringWithinLength, isNumericString} from "../utils/inputValidation.js";
// passed inputs:
// partsTotal
// laborTotal
// otherCharges
// discount
// totalAmount

// paymentDate
// paymentAmount
// paymentBalance

// receiptNumber
// receiptDate
// receiptFile
export function validateBillingInput(body) {
  const errors = [];
  // destructuring
  const {
    jobOrder: {jobOrderId},
    charges: {otherCharges, discount},
    payment: {paymentDate, paymentAmount},
    receipt: {receiptDate}
  } = body;

  // Job Order ID
  if (!Number.isInteger(jobOrderId) || jobOrderId <= 0) {
    errors.push("Invalid job order ID.");
  }

  // Other Charges
  if (otherCharges !== null && (typeof otherCharges !== "number" || !Number.isFinite(otherCharges) || otherCharges < 0)) {
    errors.push("Invalid other charges.");
  }

  // Discount
  if (discount !== null && (typeof discount !== "number" || !Number.isFinite(discount) || discount < 0)) {
    errors.push("Invalid discount.");
  }

  // Payment Date
  if (!isNonEmptyString(paymentDate) || !isValidDateTime(paymentDate)) {
    errors.push("Invalid payment date.");
  }

  // Payment Amount
  if (typeof paymentAmount !== "number" || !Number.isFinite(paymentAmount) || paymentAmount < 0) {
    errors.push("Invalid payment amount.");
  }

  // Receipt Date
  if (!isNonEmptyString(receiptDate) || Number.isNaN(Date.parse(receiptDate))) {
    errors.push("Invalid receipt date.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      jobOrder: {jobOrderId},
      charges: {otherCharges, discount},
      payment: {paymentDate, paymentAmount},
      receipt: {receiptDate}
    }
  };
}

// VALIDATE BILLING UPDATE INPUT
export function validateBillingUpdateInput(body) {
  const errors = [];
  const { otherCharges, discount, paymentDate, paymentAmount, receiptDate } = body;

  if (otherCharges !== null && (typeof otherCharges !== "number" || !Number.isFinite(otherCharges) || otherCharges < 0)) {
    errors.push("Invalid other charges.");
  }
  if (discount !== null && (typeof discount !== "number" || !Number.isFinite(discount) || discount < 0)) {
    errors.push("Invalid discount.");
  }
  if (!isNonEmptyString(paymentDate) || !isValidDateTime(paymentDate)) {
    errors.push("Invalid payment date.");
  }
  if (typeof paymentAmount !== "number" || !Number.isFinite(paymentAmount) || paymentAmount < 0) {
    errors.push("Invalid payment amount.");
  }
  if (!isNonEmptyString(receiptDate) || Number.isNaN(Date.parse(receiptDate))) {
    errors.push("Invalid receipt date.");
  }

  if (errors.length) return { valid: false, errors };
  return { valid: true, data: { otherCharges, discount, paymentDate, paymentAmount, receiptDate } };
}
