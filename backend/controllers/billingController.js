import { validateJobOrderId } from "../validators/validateJobOrder.js";
import { validateBillingInput } from "../validators/validateBilling.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { readJobOrderBillingData, createBillingData, readBillingData, updateBillingData, deleteBillingData } from "../services/billingService.js"; 
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

export async function handleReadJobOrderBillingData(request, response) {

  const validation = validateJobOrderId(request.jobOrderId);

  if (!validation.valid) {
    sendJson(response, 400, {message: validation.error});
    return;
  }

  request.jobOrderId = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}
    if (!await authorized(request, response, "billing.create")) {return;}

    const data = await readJobOrderBillingData(request);

    if (!data) {
      sendJson(response, 404, {message: "Job order not found."});
      return;
    }
    sendJson(response, 200, {message: "Job order billing data fetched successfully.", data});
  }
  catch (error) {
    console.error("Read Job Order Billing Data:", error);
    sendJson(response, 500, {message: "Failed to fetch job order billing data."});
  }
}

export async function handleCreateBillingData(request, response) {
  // 1. Validate billing input
  const validation = validateBillingInput(request.body);

  if (!validation.valid) {
    sendJson(response, 400, {
      message: validation.errors.join("\n")
    });
    return;
  }

  request.validatedBilling = validation.data;

  try {

    const employee = await authenticate(request, response);
    if (!employee) {return;}
    if (!await authorized(request, response, "billing.create")) {return;}

    const data = createBillingData(request);
    sendJson(response, 201, {message: "Billing created successfully.", data});
  }
  catch (error) {
    console.error("Create Billing:", error);

    sendJson(response, 500, {
      message: "Failed to create billing."
    });
  }
}

export async function handleReadBillingData(request, response) {
  
}

export async function handleUpdateBillingData(request, response) {
  
}
export async function handleDeleteBillingData(request, response) {
  
}
