
export function sendForbidden(response) {
  sendJson(response, 403, {message: "You do not have permission to perform this operation."});
}

export function sendNotFound(response) {
  sendJson(response, 404, {message: "Employee not found."});
}

export function sendValidationError(response, errors) {
  sendJson(response, 400, {message: errors.join("\n")});
}

export function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {"Content-Type": "application/json"});
  response.end(JSON.stringify(data));
}


