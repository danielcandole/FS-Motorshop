import {isNonEmptyString, isStringWithinLength, isOptionalString, isNumericString} from "../utils/inputValidation.js";

const allowedEmployeeRoles = ["admin", "manager", "assistant manager", "staff"];

const allowedAccountStatuses = ["active", "inactive"];

export function validateEmployeeInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {valid: false, errors: ["Invalid request body."]};
  }

  const {firstName, lastName, email, password, role, contactNumber, address, accountStatus} = body;

  // First name
  if (!isNonEmptyString(firstName)) {
    errors.push("First name is required.");
  }
  else if (!isStringWithinLength(firstName, 100)) {
    errors.push("First name must not exceed 100 characters.");
  }

  // Last name
  if (!isNonEmptyString(lastName)) {
    errors.push("Last name is required.");
  }
  else if (!isStringWithinLength(lastName, 100)) {
    errors.push("Last name must not exceed 100 characters.");
  }

  // Email
  if (!isNonEmptyString(email)) {
    errors.push("Email is required.");
  }
  else if (!isStringWithinLength(email, 255)) {
    errors.push("Email must not exceed 255 characters.");
  }

  // Password
  if (!isNonEmptyString(password)) {
    errors.push("Password is required.");
  }
  else if (!isStringWithinLength(password, 72)) {
    errors.push("Password must not exceed 72 characters.");
  }

  // Role
  if (!allowedEmployeeRoles.includes(role)) {
    errors.push("Invalid employee role.");
  }

  // Contact number
  if (!isNonEmptyString(contactNumber)) {
    errors.push("Contact number is required.");
  }
  else if (!isNumericString(contactNumber)) {
    errors.push("Contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(contactNumber, 20)) {
    errors.push("Contact number must not exceed 20 characters.");
  }

  // Address
  if (!isOptionalString(address)) {
    errors.push("Address must be a string or null.");
  }
  else if (
    typeof address === "string" &&
    !isStringWithinLength(address, 255)
  ) {
    errors.push("Address must not exceed 255 characters.");
  }

  // Account status
  if (!allowedAccountStatuses.includes(accountStatus)) {
    errors.push("Invalid account status.");
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
      password: password,
      role,
      contactNumber: contactNumber.trim(),
      address: address?.trim() || null,
      accountStatus
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

  const {firstName, lastName, email, password, role, contactNumber, address, accountStatus} = body;

  // Role changes are not supported by employee management.
  if (role !== undefined) {
    errors.push("Employee role cannot be changed.");
  }

  // First name
  if (!isNonEmptyString(firstName)) {
    errors.push("First name is required.");
  }
  else if (!isStringWithinLength(firstName, 100)) {
    errors.push("First name must not exceed 100 characters.");
  }

  // Last name
  if (!isNonEmptyString(lastName)) {
    errors.push("Last name is required.");
  }
  else if (!isStringWithinLength(lastName, 100)) {
    errors.push("Last name must not exceed 100 characters.");
  }

  // Email
  if (!isNonEmptyString(email)) {
    errors.push("Email is required.");
  }
  else if (!isStringWithinLength(email, 255)) {
    errors.push("Email must not exceed 255 characters.");
  }

  // Password
  if (password !== undefined &&(typeof password !== "string" || password.trim().length === 0)) {
    errors.push("Password must not be empty.");
  }
  else if (typeof password === "string" && !isStringWithinLength(password, 72)) {
    errors.push("Password must not exceed 72 characters.");
  }

  // Contact number
  if (!isNonEmptyString(contactNumber)) {
    errors.push("Contact number is required.");
  }
  else if (!isNumericString(contactNumber)) {
    errors.push("Contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(contactNumber, 20)) {
    errors.push("Contact number must not exceed 20 characters.");
  }

  // Address
  if (!isOptionalString(address)) {
    errors.push("Address must be a string or null.");
  }
  else if (typeof address === "string" && !isStringWithinLength(address, 255)) {
    errors.push("Address must not exceed 255 characters.");
  }

  // Account status
  if (!allowedAccountStatuses.includes(accountStatus)) {
    errors.push("Invalid account status.");
  }

  if (errors.length > 0) {
    return {valid: false, errors};
  }

  const data = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    contactNumber: contactNumber.trim(),
    address: address?.trim() || null,
    accountStatus
  };

  if (password !== undefined) {
    data.password = password.trim();
  }

  return {valid: true, data, errors: []};
}


export function validateEmployeeId(employeeId) {
  const id = Number(employeeId);

  if (employeeId === undefined || employeeId === null || String(employeeId).trim() === "" || !Number.isSafeInteger(id) || id <= 0) {
    return {valid: false, error: "Invalid employee ID."};
  }

  return {valid: true, data: id};
}