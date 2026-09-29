import pool from "../config/database.js";
import { createStockTransaction, getStockTransactionDetails } from "./stockTransactionService.js";
// GET INVENTORY ITEM BY ID
export async function getInventoryItemById(inventoryItemId) {
  try {
    const [inventoryItems] = await pool.execute(`
      SELECT
        ii.inventoryItemId,
        ii.supplierId,
        s.supplierName,
        ii.itemName,
        ii.itemCode,
        ii.itemCategory,
        ii.brand,
        ii.motorcycleFitment,
        ii.quantity,
        ii.costPrice,
        ii.sellingPrice
      FROM inventoryItem AS ii
      JOIN supplier AS s
        ON ii.supplierId = s.supplierId
      WHERE ii.inventoryItemId = ?
        AND ii.deletedAt IS NULL
      LIMIT 1
    `, [inventoryItemId]);

    if (inventoryItems.length === 0) {
      return null;
    }

    return inventoryItems[0];
  }
  catch (error) {
    console.error("Get Inventory Item By ID Service:", error);
    throw error;
  }
}

// CREATE INVENTORY ITEM
export async function createInventoryItemData(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      supplierId,
      supplierName,
      supplierContactNo,
      itemName,
      itemCode,
      itemCategory,
      brand,
      motorcycleFitment,
      quantity,
      costPrice,
      sellingPrice
    } = request.validatedInventoryItem;

    let foundSupplierId;

    // CHECK EXISTING SUPPLIER
    if (supplierId) {
      const [suppliers] = await connection.execute(`
        SELECT
          supplierId
        FROM supplier
        WHERE supplierId = ?
          AND deletedAt IS NULL
        LIMIT 1
      `, [supplierId]);

      if (suppliers.length === 0) {
        throw new Error("Supplier not found.");
      }

      foundSupplierId = suppliers[0].supplierId;
    }
    // CREATE NEW SUPPLIER
    else if (supplierName && supplierContactNo) {
      const [supplierResult] = await connection.execute(`
        INSERT INTO supplier (
          supplierName,
          supplierContactNo,
          deletedAt
        )
        VALUES (?, ?, NULL)
      `, [
        supplierName,
        supplierContactNo
      ]);

      foundSupplierId = supplierResult.insertId;
    }
    else {
      throw new Error("Supplier information is required.");
    }

    // CREATE INVENTORY ITEM
    const [result] = await connection.execute(`
      INSERT INTO inventoryItem (
        supplierId,
        itemName,
        itemCode,
        itemCategory,
        brand,
        motorcycleFitment,
        quantity,
        costPrice,
        sellingPrice,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `, [
      foundSupplierId,
      itemName,
      itemCode || null,
      itemCategory || null,
      brand || null,
      motorcycleFitment || null,
      quantity,
      costPrice,
      sellingPrice
    ]);

    // CREATE INITIAL STOCK TRANSACTION
    if (quantity > 0) {
      await createStockTransaction(connection, quantity, "Stock In", {inventoryItemId: result.insertId});
    }

    await connection.commit();

    return {
      inventoryItemId: result.insertId,
      supplierId: foundSupplierId
    };
  }
  catch (error) {
    await connection.rollback();
    console.error("Create Inventory Item Service:", error);
    throw error;
  }
  finally {
    connection.release();
  }
}

// READ INVENTORY ITEMS
export async function readInventoryItemData() {
  try {
    const [inventoryItems] = await pool.execute(`
      SELECT
        ii.inventoryItemId,
        ii.supplierId,
        s.supplierName,
        ii.itemName,
        ii.itemCode,
        ii.itemCategory,
        ii.brand,
        ii.motorcycleFitment,
        ii.quantity,
        ii.costPrice,
        ii.sellingPrice
      FROM inventoryItem AS ii
      JOIN supplier AS s
        ON ii.supplierId = s.supplierId
      WHERE ii.deletedAt IS NULL
      ORDER BY ii.inventoryItemId DESC
    `);

    return inventoryItems;
  }
  catch (error) {
    console.error("Read Inventory Item Service:", error);
    throw error;
  }
}

// UPDATE INVENTORY ITEM
export async function updateInventoryItemData(request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const inventoryItemId = request.inventoryItemId;

    const {
      supplierId,
      supplierName,
      supplierContactNo,
      itemName,
      itemCode,
      itemCategory,
      brand,
      motorcycleFitment,
      quantity,
      costPrice,
      sellingPrice
    } = request.validatedInventoryItem;

    // CHECK INVENTORY ITEM
    const [inventoryItems] = await connection.execute(`
      SELECT
        inventoryItemId,
        quantity
      FROM inventoryItem
      WHERE inventoryItemId = ?
        AND deletedAt IS NULL
      LIMIT 1
      FOR UPDATE
    `, [inventoryItemId]);

    if (inventoryItems.length === 0) {
      throw new Error("Inventory item not found.");
    }

    const oldQuantity = inventoryItems[0].quantity;

    let foundSupplierId;

    // CHECK EXISTING SUPPLIER
    if (supplierId) {
      const [suppliers] = await connection.execute(`
        SELECT
          supplierId
        FROM supplier
        WHERE supplierId = ?
          AND deletedAt IS NULL
        LIMIT 1
      `, [supplierId]);

      if (suppliers.length === 0) {
        throw new Error("Supplier not found.");
      }

      foundSupplierId = suppliers[0].supplierId;
    }
    // CREATE NEW SUPPLIER
    else if (supplierName && supplierContactNo) {
      const [supplierResult] = await connection.execute(`
        INSERT INTO supplier (
          supplierName,
          supplierContactNo,
          deletedAt
        )
        VALUES (?, ?, NULL)
      `, [
        supplierName,
        supplierContactNo
      ]);

      foundSupplierId = supplierResult.insertId;
    }
    else {
      throw new Error("Supplier information is required.");
    }

    // UPDATE INVENTORY ITEM
    await connection.execute(`
      UPDATE inventoryItem
      SET
        supplierId = ?,
        itemName = ?,
        itemCode = ?,
        itemCategory = ?,
        brand = ?,
        motorcycleFitment = ?,
        quantity = ?,
        costPrice = ?,
        sellingPrice = ?
      WHERE inventoryItemId = ?
        AND deletedAt IS NULL
    `, [
      foundSupplierId,
      itemName,
      itemCode || null,
      itemCategory || null,
      brand || null,
      motorcycleFitment || null,
      quantity,
      costPrice,
      sellingPrice,
      inventoryItemId
    ]);

    // DETERMINE STOCK TRANSACTION
    const stockTransaction = getStockTransactionDetails(oldQuantity, quantity);

    // CREATE STOCK TRANSACTION
    if (stockTransaction) {
      await createStockTransaction(connection, stockTransaction.quantity, stockTransaction.type, {inventoryItemId});
    }

    await connection.commit();

    return {
      inventoryItemId,
      supplierId: foundSupplierId
    };
  }
  catch (error) {
    await connection.rollback();
    console.error("Update Inventory Item Service:", error);
    throw error;
  }
  finally {
    connection.release();
  }
}

// DELETE INVENTORY ITEM
export async function deleteInventoryItemData(request) {
  try {
    const [result] = await pool.execute(`
      UPDATE inventoryItem
      SET deletedAt = CURRENT_TIMESTAMP
      WHERE inventoryItemId = ?
        AND deletedAt IS NULL
    `, [request.inventoryItemId]);

    if (result.affectedRows === 0) {
      throw new Error("Inventory item not found.");
    }

    return {inventoryItemId: request.inventoryItemId};
  }
  catch (error) {
    console.error("Delete Inventory Item Service:", error);
    throw error;
  }
}