import pool from "../config/database.js";

// GET STOCK TRANSACTION DETAILS
export function getStockTransactionDetails(oldQuantity, newQuantity) {
  const quantityDifference = newQuantity - oldQuantity;

  if (quantityDifference === 0) {
    return null;
  }

  return {
    quantity: Math.abs(quantityDifference), // absolute value
    type: quantityDifference > 0 ? "Stock In" : "Stock Out"
  };
}


// CREATE STOCK TRANSACTION HELPER
export async function createStockTransaction(connection, quantity, type, id) {
  const inventoryItemId = id.inventoryItemId ?? null;
  const jobOrderItemId = id.jobOrderItemId ?? null;
  quantity = Number(quantity);

  if ((inventoryItemId === null && jobOrderItemId === null) || (inventoryItemId !== null && jobOrderItemId !== null)) {
    throw new Error("Exactly one stock transaction ID is required.");
  }
  
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Transaction quantity must be a positive integer.");
  }

  if (type !== "Stock In" && type !== "Stock Out") {
    throw new Error("Invalid stock transaction type.");
  }

  await connection.execute(`
    INSERT INTO stockTransaction (
      inventoryItemId,
      jobOrderItemId,
      transactionDate,
      transactionType,
      transactionQuantity
    )
    VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)
  `, [
    inventoryItemId,
    jobOrderItemId,
    type,
    quantity
  ]);
}




