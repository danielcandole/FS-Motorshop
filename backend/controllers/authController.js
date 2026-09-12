import { validateLoginInput } from "../validators/authValidator.js";
import { authenticationCredentials } from "../services/authenticationService.js";

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

  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify({message: "Login successfull.", employee: employee}));
}





