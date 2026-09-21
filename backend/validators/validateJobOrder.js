import { isNonEmptyString, isValidDateTime ,isStringWithinLength, isOptionalString, isNumericString } from "../utils/inputValidation.js";

const allowedRepairStatuses = ["pending","in-progress","done"];

export function validateJobOrderInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {valid: false, errors: ["Invalid request body."]}
  }
  const {customerName, customerContactNumber, motorcycleName, motorcycleModel, repairDate, description, repairStatus} = body;

  // Customer name
  if (!isNonEmptyString(customerName)) {
    errors.push("Customer name is required.");
  }
  else if (!isStringWithinLength(customerName, 100)) {
    errors.push("Customer name must not exceed 100 characters.");
  }

  // Customer contact number
  if (!isNonEmptyString(customerContactNumber)) {
    errors.push("Customer contact number is required.");
  }
  else if (!isNumericString(customerContactNumber)) {
    errors.push("Customer contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(customerContactNumber, 20)) {
    errors.push("Customer contact number must not exceed 20 characters.");
  }

  // Motorcycle name
  if (!isNonEmptyString(motorcycleName)) {
    errors.push("Motorcycle name is required.");
  }
  else if (!isStringWithinLength(motorcycleName, 100)) {
    errors.push("Motorcycle name must not exceed 100 characters.");
  }

  // Motorcycle model
  if (!isOptionalString(motorcycleModel)) {
    errors.push("Motorcycle model must be a string or null.");
  }
  else if (typeof motorcycleModel === "string" && !isStringWithinLength(motorcycleModel, 100)) {
    errors.push("Motorcycle model must not exceed 100 characters.");
  }

  // Repair date
  if (!isValidDateTime(repairDate)) {
    errors.push("Repair date must be a valid date in YYYY-MM-DD format.");
  }

  // Reported problem
  if (!isOptionalString(description)) {
    errors.push("Reported problem must be a string or null.");
  }

  // Repair status
  if (!allowedRepairStatuses.includes(repairStatus)) {
    errors.push("Invalid repair status.");
  }

  if (errors.length > 0) { return {valid: false, errors}; }

  return {
    valid: true,
    data: {
      customerName: customerName.trim(),
      customerContactNumber:customerContactNumber.trim(),
      motorcycleName: motorcycleName.trim(),
      motorcycleModel:motorcycleModel?.trim() || null,repairDate,
      description:description?.trim() || null,
      repairStatus: repairStatus
    },
    errors: []
  };
}
