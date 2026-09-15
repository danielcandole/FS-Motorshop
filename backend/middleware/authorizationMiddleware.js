export function authorized(request, response, ...allowedRoles) {
  if (!request.employee) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({message: "Authentication required."}));
    return false;
  } 
  if (!allowedRoles.includes(request.employee.role)) {
    response.writeHead(403, {"Content-Type": "application/json"});
    response.end(JSON.stringify({message: "Acess denied."}));
    return false;
  }
  return true;
}

