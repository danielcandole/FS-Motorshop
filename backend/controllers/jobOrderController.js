import { validateJobOrderInput } from "../validators/validateJobOrder.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { createJobOrder, readJobOrder } from "../services/jobOrderService.js";

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {"Content-Type": "application/json"});
  response.end(JSON.stringify(data));
}

export async function handleCreateJobOrder(request, response) {
  const validation = validateJobOrderInput(request.body);
  if (!validation.valid) {
    sendJson(response, 400, {
      message: validation.errors.join("\n"),
    });
    return;
  }

  request.validatedJobOrder = validation.data;

  try {
    if (!await authenticate(request, response)) {return;}
    if (!authorized(request, response, "manager")) {return;}
    const result = await createJobOrder(request);

    sendJson(response, 201, {
      message: "Job order created successfully.",
      data: result
    });
  }
  catch (error) {
    console.error("Create Job Order:", error);

    sendJson(response, 500, {
      message: "Failed to create job order."
    });
  }
}

export async function handleReadJobOrder(request, response) {
  try {
    if (!await authenticate(request, response)) {return;}
    if (!authorized(request, response, "manager")) {return;}

    const result = await readJobOrder(request);

    sendJson(response, 200, {
      message: "Job orders fetched successfully.",
      data: result
    });
  }
  catch (error) {
    console.error("Read Job Order:", error);

    sendJson(response, 500, {
      message: "Failed to fetch job orders."
    });
  }
}