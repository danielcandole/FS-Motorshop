

export function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {"Content-Type": "application/json"});
  response.end(JSON.stringify(data));
}


