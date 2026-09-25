import {
  isNonEmptyString,
  isStringWithinLength,
  isOptionalString,
  isNumericString
} from "../utils/inputValidation.js";

const allowedAccountStatuses = ["active", "inactive"];

export function validateEmployeeInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

  const {
    firstName,
    lastName,
    email,
    password,
    roleId,
    contactNumber,
    address
  } = body;

  if (!isNonEmptyString(firstName)) {
    errors.push("First name is required.");
  }
  else if (!isStringWithinLength(firstName, 100)) {
    errors.push("First name must not exceed 100 characters.");
  }

  if (!isNonEmptyString(lastName)) {
    errors.push("Last name is required.");
  }
  else if (!isStringWithinLength(lastName, 100)) {
    errors.push("Last name must not exceed 100 characters.");
  }

  if (!isNonEmptyString(email)) {
    errors.push("Email is required.");
  }
  else if (!isStringWithinLength(email, 255)) {
    errors.push("Email must not exceed 255 characters.");
  }

  if (!isNonEmptyString(password)) {
    errors.push("Password is required.");
  }
  else if (!isStringWithinLength(password, 72)) {
    errors.push("Password must not exceed 72 characters.");
  }

  const numericRoleId = Number(roleId);

  if (
    roleId === undefined ||
    roleId === null ||
    String(roleId).trim() === "" ||
    !Number.isSafeInteger(numericRoleId) ||
    numericRoleId <= 0
  ) {
    errors.push("Invalid employee role.");
  }

  if (!isNonEmptyString(contactNumber)) {
    errors.push("Contact number is required.");
  }
  else if (!isNumericString(contactNumber)) {
    errors.push("Contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(contactNumber, 20)) {
    errors.push("Contact number must not exceed 20 characters.");
  }

  if (!isOptionalString(address)) {
    errors.push("Address must be a string or null.");
  }
  else if (
    typeof address === "string" &&
    !isStringWithinLength(address, 255)
  ) {
    errors.push("Address must not exceed 255 characters.");
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      roleId: numericRoleId,
      contactNumber: contactNumber.trim(),
      address: typeof address === "string"
        ? address.trim() || null
        : null
    },
    errors: []
  };
}


export function validateEmployeeUpdateInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

  const {
    firstName,
    lastName,
    email,
    password,
    contactNumber,
    address
  } = body;

  if (!isNonEmptyString(firstName)) {
    errors.push("First name is required.");
  }
  else if (!isStringWithinLength(firstName, 100)) {
    errors.push("First name must not exceed 100 characters.");
  }

  if (!isNonEmptyString(lastName)) {
    errors.push("Last name is required.");
  }
  else if (!isStringWithinLength(lastName, 100)) {
    errors.push("Last name must not exceed 100 characters.");
  }

  if (!isNonEmptyString(email)) {
    errors.push("Email is required.");
  }
  else if (!isStringWithinLength(email, 255)) {
    errors.push("Email must not exceed 255 characters.");
  }

  if (password !== undefined && password !== "") {
    if (!isStringWithinLength(password, 255)) {
      errors.push("Password must not exceed 255 characters.");
    }
  }

  if (!isNonEmptyString(contactNumber)) {
    errors.push("Contact number is required.");
  }
  else if (!isNumericString(contactNumber)) {
    errors.push("Contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(contactNumber, 20)) {
    errors.push("Contact number must not exceed 20 characters.");
  }

  if (!isOptionalString(address)) {
    errors.push("Address must be a string or null.");
  }
  else if (
    typeof address === "string" &&
    !isStringWithinLength(address, 255)
  ) {
    errors.push("Address must not exceed 255 characters.");
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      address: typeof address === "string"
        ? address.trim() || null
        : null
    },
    errors: []
  };
}


export function validateEmployeeId(employeeId) {
  const id = Number(employeeId);

  if (
    employeeId === undefined ||
    employeeId === null ||
    String(employeeId).trim() === "" ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return {
      valid: false,
      error: "Invalid employee ID."
    };
  }

  return {
    valid: true,
    data: id
  };
}