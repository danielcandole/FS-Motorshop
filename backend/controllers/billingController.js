import { validateJobOrderId } from "../validators/validateJobOrder.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { readJobOrderBillingData, createBillingData, readBillingData, updateBillingData, deleteBillingData } from "../services/billingService.js"; 
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

export async function handleCreateBillingData(request, response) {
  console.log("requested body: ",request.body);
}

export async function handleReadBillingData(request, response) {
  
}
// passed inputs:
// partsTotal
// laborTotal
// otherCharges
// discount
// totalAmount

// paymentDate
// paymentAmount
// paymentBalance

// receiptNumber
// receiptDate
// receiptFile
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
export async function handleUpdateBillingData(request, response) {
  
}
export async function handleDeleteBillingData(request, response) {
  
}
