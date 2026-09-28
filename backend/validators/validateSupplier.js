import {
  isNonEmptyString,
  isStringWithinLength,
  isNumericString
} from "../utils/inputValidation.js";

// VALIDATE SUPPLIER INPUT
export function validateSupplierInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

  const {
    supplierName,
    supplierContactNo
  } = body;

  if (!isNonEmptyString(supplierName)) {
    errors.push("Supplier name is required.");
  }
  else if (!isStringWithinLength(supplierName, 150)) {
    errors.push("Supplier name must not exceed 150 characters.");
  }

  if (!isNonEmptyString(supplierContactNo)) {
    errors.push("Supplier contact number is required.");
  }
  else if (!isNumericString(supplierContactNo)) {
    errors.push("Supplier contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(supplierContactNo, 20)) {
    errors.push("Supplier contact number must not exceed 20 characters.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    data: {
      supplierName: supplierName.trim(),
      supplierContactNo: supplierContactNo.trim()
    },
    errors: []
  };
}

// VALIDATE SUPPLIER UPDATE INPUT
export function validateSupplierUpdateInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

  const {
    supplierName,
    supplierContactNo
  } = body;

  if (!isNonEmptyString(supplierName)) {
    errors.push("Supplier name is required.");
  }
  else if (!isStringWithinLength(supplierName, 150)) {
    errors.push("Supplier name must not exceed 150 characters.");
  }

  if (!isNonEmptyString(supplierContactNo)) {
    errors.push("Supplier contact number is required.");
  }
  else if (!isNumericString(supplierContactNo)) {
    errors.push("Supplier contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(supplierContactNo, 20)) {
    errors.push("Supplier contact number must not exceed 20 characters.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    data: {
      supplierName: supplierName.trim(),
      supplierContactNo: supplierContactNo.trim()
    },
    errors: []
  };
}

// VALIDATE SUPPLIER ID
export function validateSupplierId(supplierId) {
  const numericSupplierId = Number(supplierId);

  if (
    supplierId === undefined ||
    supplierId === null ||
    String(supplierId).trim() === "" ||
    !Number.isSafeInteger(numericSupplierId) ||
    numericSupplierId <= 0
  ) {
    return {
      valid: false,
      error: "Invalid supplier ID."
    };
  }

  return {
    valid: true,
    data: numericSupplierId
  };
}