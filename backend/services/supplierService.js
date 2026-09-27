import pool from "../config/database.js";

// GET SUPPLIER BY ID
export async function getSupplierById(supplierId) {
  try {
    const [suppliers] = await pool.execute(`
      SELECT
        supplierId,
        supplierName,
        supplierContactNo
      FROM supplier
      WHERE supplierId = ?
      LIMIT 1
    `, [supplierId]);

    if (suppliers.length === 0) {
      return null;
    }

    return suppliers[0];
  }
  catch (error) {
    console.error("Get Supplier By ID Service:", error);
    throw error;
  }
}

// CREATE SUPPLIER
export async function createSupplierData(request) {
  try {
    const {
      supplierName,
      supplierContactNo
    } = request.validatedSupplier;

    const [result] = await pool.execute(`
      INSERT INTO supplier (
        supplierName,
        supplierContactNo
      )
      VALUES (?, ?)
    `, [
      supplierName,
      supplierContactNo
    ]);

    return {supplierId: result.insertId};
  }
  catch (error) {
    console.error("Create Supplier Service:", error);
    throw error;
  }
}

// READ SUPPLIERS
export async function readSupplierData() {
  try {
    const [suppliers] = await pool.execute(`
      SELECT
        supplierId,
        supplierName,
        supplierContactNo
      FROM supplier
      ORDER BY supplierId DESC
    `);

    return suppliers;
  }
  catch (error) {
    console.error("Read Supplier Service:", error);
    throw error;
  }
}

// UPDATE SUPPLIER
export async function updateSupplierData(request) {
  try {
    const supplierId = request.supplierId;

    const {
      supplierName,
      supplierContactNo
    } = request.validatedSupplier;

    const [suppliers] = await pool.execute(`
      SELECT
        supplierId
      FROM supplier
      WHERE supplierId = ?
      LIMIT 1
    `, [supplierId]);

    if (suppliers.length === 0) {
      throw new Error("Supplier not found.");
    }

    await pool.execute(`
      UPDATE supplier
      SET
        supplierName = ?,
        supplierContactNo = ?
      WHERE supplierId = ?
    `, [
      supplierName,
      supplierContactNo,
      supplierId
    ]);

    return {supplierId};
  }
  catch (error) {
    console.error("Update Supplier Service:", error);
    throw error;
  }
}

// DELETE SUPPLIER
export async function deleteSupplierData(request) {
  try {
    const [result] = await pool.execute(`
      UPDATE supplier
      SET deletedAt = CURRENT_TIMESTAMP
      WHERE supplierId = ?
        AND deletedAt IS NULL
    `, [request.supplierId]);

    if (result.affectedRows === 0) {
      throw new Error("Supplier not found.");
    }

    return {supplierId: request.supplierId};
  }
  catch (error) {
    console.error("Delete Supplier Service:", error);
    throw error;
  }
}