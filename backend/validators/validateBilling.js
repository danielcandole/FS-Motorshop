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

  const {
    jobOrderId,
    partsTotal,
    laborTotal,
    otherCharges,
    discount,
    totalAmount,
    paymentDate,
    paymentAmount,
    paymentBalance,
    receiptDate
  } = body;

  // Job Order ID
  if (!Number.isInteger(jobOrderId) || jobOrderId <= 0) {
    errors.push("Invalid job order ID.");
  }

  // Parts Total
  if (typeof partsTotal !== "number" || !Number.isFinite(partsTotal) || partsTotal < 0) {
    errors.push("Invalid parts total.");
  }

  // Labor Total
  if (typeof laborTotal !== "number" || !Number.isFinite(laborTotal) || laborTotal < 0) {
    errors.push("Invalid labor total.");
  }

  // Other Charges
  if (typeof otherCharges !== "number" || !Number.isFinite(otherCharges) || otherCharges < 0) {
    errors.push("Invalid other charges.");
  }

  // Discount
  if (typeof discount !== "number" || !Number.isFinite(discount) || discount < 0) {
    errors.push("Invalid discount.");
  }

  // Total Amount
  if (typeof totalAmount !== "number" || !Number.isFinite(totalAmount) || totalAmount < 0) {
    errors.push("Invalid total amount.");
  }

  // Payment Date
  if (!isNonEmptyString(paymentDate) || !isValidDateTime(paymentDate)) {
    errors.push("Invalid payment date.");
  }

  // Payment Amount
  if (typeof paymentAmount !== "number" || !Number.isFinite(paymentAmount) || paymentAmount < 0) {
    errors.push("Invalid payment amount.");
  }

  // Payment Balance
  if (typeof paymentBalance !== "number" || !Number.isFinite(paymentBalance) || paymentBalance < 0) {
    errors.push("Invalid payment balance.");
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
      jobOrderId,
      partsTotal,
      laborTotal,
      otherCharges,
      discount,
      totalAmount,
      paymentDate,
      paymentAmount,
      paymentBalance,
      receiptDate
    }
  };
}