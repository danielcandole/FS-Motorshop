import { validateJobOrderId } from "../validators/validateJobOrder.js";
import { validateBillingInput, validateBillingUpdateInput } from "../validators/validateBilling.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { readJobOrderBillingData, createBillingData, readBillingData, updateBillingData } from "../services/billingService.js";
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

// READ JOB ORDER BILLING DATA
export async function handleReadJobOrderBillingData(request, response) {
  const validation = validateJobOrderId(request.jobOrderId);
  if (!validation.valid) {
    sendJson(response, 400, { message: validation.error });
    return;
  }
  request.jobOrderId = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) return;
    if (!await authorized(request, response, "billing.create")) return;

    const data = await readJobOrderBillingData(request);
    if (!data) {
      sendJson(response, 404, { message: "Job order not found." });
      return;
    }
    sendJson(response, 200, { message: "Job order billing data fetched successfully.", data });
  }
  catch (error) {
    console.error("Read Job Order Billing Data:", error);
    sendJson(response, 500, { message: "Failed to fetch job order billing data." });
  }
}

// CREATE BILLING DATA
export async function handleCreateBillingData(request, response) {
  const validation = validateBillingInput(request.body);
  if (!validation.valid) {
    sendJson(response, 400, { message: validation.errors.join("\n") });
    return;
  }
  request.validatedBilling = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) return;
    if (!await authorized(request, response, "billing.create")) return;

    const data = await createBillingData(request);
    sendJson(response, 201, { message: "Billing created successfully.", data });
  }
  catch (error) {
    console.error("Create Billing:", error);
    if (error.message === "Job order not found.") {
      sendJson(response, 404, { message: error.message });
      return;
    }
    if (error.message === "A bill already exists for this job order." || error.message === "Invalid bill or payment amount.") {
      sendJson(response, 400, { message: error.message });
      return;
    }
    sendJson(response, 500, { message: "Failed to create billing." });
  }
}

// READ BILLING DATA
export async function handleReadBillingData(request, response) {
  const serviceBillId = Number(request.serviceBillId);
  if (!Number.isSafeInteger(serviceBillId) || serviceBillId <= 0) {
    sendJson(response, 400, { message: "Invalid service bill ID." });
    return;
  }
  request.serviceBillId = serviceBillId;

  try {
    const employee = await authenticate(request, response);
    if (!employee) return;
    if (!await authorized(request, response, "billing.create")) return;

    const data = await readBillingData(request);
    if (!data) {
      sendJson(response, 404, { message: "Billing record not found." });
      return;
    }
    sendJson(response, 200, { message: "Billing data fetched successfully.", data });
  }
  catch (error) {
    console.error("Read Billing:", error);
    sendJson(response, 500, { message: "Failed to fetch billing data." });
  }
}

// UPDATE BILLING DATA
export async function handleUpdateBillingData(request, response) {
  const serviceBillId = Number(request.serviceBillId);
  if (!Number.isSafeInteger(serviceBillId) || serviceBillId <= 0) {
    sendJson(response, 400, { message: "Invalid service bill ID." });
    return;
  }
  request.serviceBillId = serviceBillId;

  const validation = validateBillingUpdateInput(request.body);
  if (!validation.valid) {
    sendJson(response, 400, { message: validation.errors.join("\n") });
    return;
  }
  request.validatedBilling = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) return;
    if (!await authorized(request, response, "billing.create")) return;
    console.log("UPDATE BILL: ", request.validatedBilling);
    // const data = await updateBillingData(request);
    // sendJson(response, 200, { message: "Billing updated successfully.", data });
  }
  catch (error) {
    console.error("Update Billing:", error);
    if (error.message === "Billing record not found.") {
      sendJson(response, 404, { message: error.message });
      return;
    }
    if (error.message === "Invalid bill or payment amount.") {
      sendJson(response, 400, { message: error.message });
      return;
    }
    sendJson(response, 500, { message: "Failed to update billing." });
  }
}

export async function handleDeleteBillingData(request, response) {
  sendJson(response, 501, { message: "Deleting billing records is not implemented." });
}
