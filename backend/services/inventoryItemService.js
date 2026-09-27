import pool from "../config/database.js";

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
        costPrice,
        sellingPrice,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `, [
      foundSupplierId,
      itemName,
      itemCode || null,
      itemCategory || null,
      brand || null,
      motorcycleFitment || null,
      costPrice,
      sellingPrice
    ]);

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
      costPrice,
      sellingPrice
    } = request.validatedInventoryItem;

    // CHECK INVENTORY ITEM
    const [inventoryItems] = await connection.execute(`
      SELECT
        inventoryItemId
      FROM inventoryItem
      WHERE inventoryItemId = ?
        AND deletedAt IS NULL
      LIMIT 1
    `, [inventoryItemId]);

    if (inventoryItems.length === 0) {
      throw new Error("Inventory item not found.");
    }

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
      costPrice,
      sellingPrice,
      inventoryItemId
    ]);

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