import { validateJobOrderInput, validateJobOrderId } from "../validators/validateJobOrder.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { createJobOrderData, readJobOrderData, updateJobOrderData, deleteJobOrderData } from "../services/jobOrderService.js";
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

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
    const result = await createJobOrderData(request);

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

    const result = await readJobOrderData(request);
    
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


export async function handleUpdateJobOrder(request, response) {
  // 1. Validate job order ID
  const idValidation = validateJobOrderId(request.jobOrderId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.jobOrderId = idValidation.data;

  // 2. Validate request body
  const validation = validateJobOrderInput(request.body);

  if (!validation.valid) {
    sendJson(response, 400, {
      message: validation.errors.join("\n")
    });
    return;
  }

  request.validatedJobOrder = validation.data;

  try {
    // 3. Authenticate user
    if (!await authenticate(request, response)) {
      return;
    }

    // 4. Authorize user
    if (!authorized(request, response, "manager")) {
      return;
    }

    // 5. Update database
    const result = await updateJobOrderData(request);

    sendJson(response, 200, {
      message: "Job order updated successfully.",
      data: result
    });
  }
  catch (error) {
    console.error("Update Job Order:", error);

    if (error.message === "Job order not found.") {
      sendJson(response, 404, {
        message: error.message
      });
      return;
    }

    sendJson(response, 500, {
      message: "Failed to update job order."
    });
  }
}



export async function handleDeleteJobOrder(request, response) {
  // 1. Validate job order ID
  const validation = validateJobOrderId(request.jobOrderId);

  if (!validation.valid) {
    sendJson(response, 400, {
      message: validation.error
    });
    return;
  }

  request.jobOrderId = validation.data;

  try {
    // 2. Authenticate user
    if (!await authenticate(request, response)) {
      return;
    }

    // 3. Authorize user
    if (!authorized(request, response, "manager")) {
      return;
    }

    // 4. Delete from database
    const result = await deleteJobOrderData(request);

    sendJson(response, 200, {
      message: "Job order deleted successfully.",
      data: result
    });
  }
  catch (error) {
    console.error("Delete Job Order:", error);

    if (error.message === "Job order not found.") {
      sendJson(response, 404, {
        message: error.message
      });
      return;
    }

    sendJson(response, 500, {
      message: "Failed to delete job order."
    });
  }
}
