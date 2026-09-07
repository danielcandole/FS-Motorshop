function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLoginInput(body) {
  const errors = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {valid: false, errors: {body: "Request body must be an object."}};
  }

  const { email, password } = body;
  
  if (typeof email != "string" || email.trim() == "") {
    errors.email = "Email is required.";
  }
  else if (email.trim().length > 255) {
    errors.email = "Email must not exceed 255 characters.";
  }
  else if (!isValidEmail(email.trim())) {
    errors.email = "Email format is invalid.";
  }

  if (typeof password !== "string" || password.length === 0) {
    errors.password = "Password is required.";
  }
  else if (password.length > 255) {
    errors.password = "Password must not exceed 255 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return {valid: false, errors};
  }

  return {valid: true, data: {email: email.trim().toLowerCase(), password: password}};

}
