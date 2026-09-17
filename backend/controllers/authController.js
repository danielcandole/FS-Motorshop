import { validateLoginInput } from "../validators/authValidator.js";
import { authenticationCredentials } from "../services/authenticationService.js";
import { createSession, deleteSession } from "../services/sessionService.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { getCookie } from "../utils/cookie.js";

export async function login(request, response, body) {

  const validation = validateLoginInput(body);

  if (!validation.valid) {
    response.writeHead(400, {"Content-Type": "application/json"});
    response.end(JSON.stringify({message: "Invalid login input.", errors: validation.errors}));
    return;
  }

  const {email, password} = validation.data;

  const employee = await authenticationCredentials(email, password);

  if (!employee) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({message: "Invalid email or password"}));
    return;
  }

  const {sessionToken, csrfToken} = await createSession(employee.employeeAccountId);

  response.setHeader("Set-Cookie", [
    `sessionToken=${sessionToken}; HttpOnly; SameSite=Strict; Path=/`,
    `csrfToken=${csrfToken}; SameSite=Strict; Path=/`
  ]);

  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify({message: "Login successfull.", employee: employee}));
}

export async function logout(request, response) {
  const sessionToken = getCookie(request, "sessionToken");

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  response.setHeader("Set-Cookie", "sessionToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");

  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify({message: "Logout successful."}));
}

export async function getLoggedEmployee(request, response) {
  const employee = await authenticate(request, response);
  if (!employee) { return; }
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify({authenticated: true, employee: employee}));
}



