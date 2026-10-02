import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { readStockTransactionData } from "../services/stockTransactionService.js";
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

export async function handleReadStockTransaction(request, response) {

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}
    if (!await authorized(request, response, "stockTransaction.read")) {return;}

    const data = await readStockTransactionData();

    sendJson(response, 200, {message: "Stock Transaction History fetched successfully.", data});
  }
  catch (error) {
    console.error("Stock Transaction History: ", error);
    sendJson(response, 500, {message: "Failed to fetch Stock Transaction History."});
  }


}