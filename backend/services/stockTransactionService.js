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

// READ STOCK IN TRANSACTIONS
async function readStockInTransactions(connection) {
  const [transactions] = await connection.execute(`
    SELECT
      st.stockTransactionId,
      ii.itemName,
      ii.sellingPrice,
      st.transactionDate,
      st.transactionType,
      st.transactionQuantity
    FROM stockTransaction AS st
    INNER JOIN inventoryItem AS ii
      ON st.inventoryItemId = ii.inventoryItemId
    WHERE
      st.transactionType = 'Stock In'
      AND ii.deletedAt IS NULL
  `);
  console.log("STOCK IN: ", transactions);
  return transactions;
}

async function readStockOutTransactions(connection) {
  const [transactions] = await connection.execute(`
    SELECT
      st.stockTransactionId,
      ii.itemName,
      joi.unitPrice,
      st.transactionDate,
      st.transactionType,
      st.transactionQuantity
    FROM stockTransaction AS st
    INNER JOIN jobOrderItem AS joi
      ON st.jobOrderItemId = joi.jobOrderItemId
    INNER JOIN inventoryItem AS ii
      ON joi.inventoryItemId = ii.inventoryItemId
    INNER JOIN jobOrder AS jo
      ON joi.jobOrderId = jo.jobOrderId
    WHERE
      st.transactionType = 'Stock Out'
      AND jo.deletedAt IS NULL
      AND ii.deletedAt IS NULL
  `);
  console.log("STOCK OUT: ", transactions);
  return transactions;
}

// READ STOCK TRANSACTION
export async function readStockTransactionData() {
  try {
    const [stockIn, stockOut] = await Promise.all([
      readStockInTransactions(pool),
      readStockOutTransactions(pool)
    ]);
    
    return [...stockIn, ...stockOut].sort(
      (a, b) =>
        new Date(b.transactionDate) - new Date(a.transactionDate) ||
        b.stockTransactionId - a.stockTransactionId
    );
  }
  catch (error) {
    console.error("Read Stock Transaction Service:", error);
    throw error;
  }
}



