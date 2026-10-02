import pool from "../config/database.js";

// READ BILLING JOB ORDER
async function readBillingJobOrder(jobOrderId) {
  const [rows] = await pool.execute(`
    SELECT
      j.jobOrderId,
      c.customerName,
      c.contactNo AS customerContactNo,
      m.motorcycleName,
      m.motorcycleModel
    FROM jobOrder AS j
    INNER JOIN motorcycleRecord AS m
      ON j.motorcycleRecordId = m.motorcycleRecordId
    INNER JOIN customerRecord AS c
      ON m.customerRecordId = c.customerRecordId
    WHERE j.jobOrderId = ?
      AND j.deletedAt IS NULL
    LIMIT 1
  `, [jobOrderId]);

  return rows[0] || null;
}

// READ BILLING SERVICE RECORDS
async function readBillingServiceRecords(jobOrderId) {
  const [serviceRecords] = await pool.execute(`
    SELECT
      serviceRecordId,
      serviceType,
      serviceDescription,
      laborCharge
    FROM serviceRecord
    WHERE jobOrderId = ?
  `, [jobOrderId]);

  const laborTotal = serviceRecords.reduce(
    (total, service) => total + Number(service.laborCharge),
    0
  );

  return { serviceRecords, laborTotal };
}

// READ BILLING JOB ORDER ITEMS
async function readBillingJobOrderItems(jobOrderId) {
  const [jobOrderItems] = await pool.execute(`
    SELECT
      ji.jobOrderItemId,
      ji.inventoryItemId,
      i.itemName,
      ji.quantityUsed,
      ji.unitPrice,
      (ji.quantityUsed * ji.unitPrice) AS totalPrice
    FROM jobOrderItem AS ji
    LEFT JOIN inventoryItem AS i
      ON ji.inventoryItemId = i.inventoryItemId
    WHERE ji.jobOrderId = ?
  `, [jobOrderId]);

  const partsTotal = jobOrderItems.reduce(
    (total, item) => total + Number(item.totalPrice),
    0
  );

  return { jobOrderItems, partsTotal };
}

// READ EXISTING BILLING RECORDS
async function readExistingServiceBill(jobOrderId) {
  const [rows] = await pool.execute(`
    SELECT
      sb.serviceBillId,
      sb.jobOrderId,
      sb.partsTotal,
      sb.laborTotal,
      sb.otherCharges,
      sb.discount,
      sb.totalAmount,
      pr.paymentRecordId,
      pr.paymentDate,
      pr.paymentAmount,
      pr.paymentBalance,
      r.paymentReceiptId,
      r.receiptNumber,
      r.receiptDate,
      r.receiptFile
    FROM serviceBill AS sb
    LEFT JOIN paymentRecord AS pr
      ON pr.serviceBillId = sb.serviceBillId
    LEFT JOIN receipt AS r
      ON r.paymentRecordId = pr.paymentRecordId
    WHERE sb.jobOrderId = ?
    LIMIT 1
  `, [jobOrderId]);

  const row = rows[0];
  if (!row) return null;

  return {
    serviceBillId: row.serviceBillId,
    jobOrderId: row.jobOrderId,
    partsTotal: Number(row.partsTotal),
    laborTotal: Number(row.laborTotal),
    otherCharges: row.otherCharges === null ? null : Number(row.otherCharges),
    discount: row.discount === null ? null : Number(row.discount),
    totalAmount: Number(row.totalAmount),
    paymentRecord: row.paymentRecordId ? {
      paymentRecordId: row.paymentRecordId,
      paymentDate: row.paymentDate,
      paymentAmount: Number(row.paymentAmount),
      paymentBalance: Number(row.paymentBalance),
      receipt: row.paymentReceiptId ? {
        paymentReceiptId: row.paymentReceiptId,
        receiptNumber: row.receiptNumber,
        receiptDate: row.receiptDate,
        receiptFile: row.receiptFile
      } : null
    } : null,
    paymentAmount: row.paymentRecordId ? Number(row.paymentAmount) : null,
    paymentDate: row.paymentDate,
    receiptDate: row.receiptDate
  };
}

// READ JOB ORDER BILLING DATA
export async function readJobOrderBillingData(request) {
  try {
    const jobOrder = await readBillingJobOrder(request.jobOrderId);
    if (!jobOrder) return null;

    const [services, items, serviceBill] = await Promise.all([
      readBillingServiceRecords(request.jobOrderId),
      readBillingJobOrderItems(request.jobOrderId),
      readExistingServiceBill(request.jobOrderId)
    ]);

    return { ...jobOrder, ...services, ...items, serviceBill };
  }
  catch (error) {
    console.error("Read Job Order Billing Data:", error);
    throw error;
  }
}

// CREATE BILLING DATA
export async function createBillingData(request) {
  const {
    jobOrder: {jobOrderId},
    charges: {otherCharges, discount},
    payment: {paymentDate, paymentAmount},
    receipt: {receiptDate}
  } = request.validatedBilling;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [jobOrders] = await connection.execute(`
      SELECT jobOrderId
      FROM jobOrder
      WHERE jobOrderId = ?
        AND deletedAt IS NULL
      FOR UPDATE
    `, [jobOrderId]);

    if (!jobOrders.length) {
      throw new Error("Job order not found.");
    }

    const [existingBills] = await connection.execute(`
      SELECT serviceBillId
      FROM serviceBill
      WHERE jobOrderId = ?
      FOR UPDATE
    `, [jobOrderId]);

    if (existingBills.length) {
      throw new Error("A bill already exists for this job order.");
    }

    const [services, items] = await Promise.all([
      readBillingServiceRecords(jobOrderId),
      readBillingJobOrderItems(jobOrderId)
    ]);

    const partsTotal = Number(items.partsTotal.toFixed(2));
    const laborTotal = Number(services.laborTotal.toFixed(2));

    const totalAmount = Number((
      partsTotal +
      laborTotal +
      Number(otherCharges || 0) -
      Number(discount || 0)
    ).toFixed(2));

    if (totalAmount < 0 || paymentAmount > totalAmount) {
      throw new Error("Invalid bill or payment amount.");
    }

    const paymentBalance = Number(
      (totalAmount - paymentAmount).toFixed(2)
    );

    const [billResult] = await connection.execute(`
      INSERT INTO serviceBill (
        jobOrderId,
        partsTotal,
        laborTotal,
        otherCharges,
        discount,
        totalAmount
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      jobOrderId,
      partsTotal,
      laborTotal,
      otherCharges,
      discount,
      totalAmount
    ]);

    const serviceBillId = billResult.insertId;

    const [paymentResult] = await connection.execute(`
      INSERT INTO paymentRecord (
        serviceBillId,
        paymentDate,
        paymentAmount,
        paymentBalance
      )
      VALUES (?, ?, ?, ?)
    `, [
      serviceBillId,
      `${paymentDate.replace("T", " ")}:00`,
      paymentAmount,
      paymentBalance
    ]);

    const paymentRecordId = paymentResult.insertId;

    const formattedReceiptDate = new Date(receiptDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const [receiptResult] = await connection.execute(`
      INSERT INTO receipt (
        paymentRecordId,
        receiptNumber,
        receiptDate,
        receiptFile
      )
      VALUES (?, ?, ?, ?)
    `, [paymentRecordId, "", formattedReceiptDate, null]);

    const paymentReceiptId = receiptResult.insertId;

    const receiptDateTime = new Date(receiptDate)
      .toISOString()
      .slice(0, 16)
      .replace(/[-:T]/g, "");

    const receiptNumber =
      `${receiptDateTime.slice(0, 8)}-${receiptDateTime.slice(8)}-${paymentReceiptId}`;

    await connection.execute(`
      UPDATE receipt
      SET receiptNumber = ?
      WHERE paymentReceiptId = ?
    `, [receiptNumber, paymentReceiptId]);

    await connection.commit();

    return {
      serviceBillId,
      paymentRecordId,
      paymentReceiptId,
      receiptNumber
    };
  }
  catch (error) {
    await connection.rollback();
    throw error;
  }
  finally {
    connection.release();
  }
}

// READ BILLING DATA
export async function readBillingData(request) {
  const [rows] = await pool.execute(`
    SELECT
      sb.serviceBillId,
      sb.jobOrderId,
      sb.partsTotal,
      sb.laborTotal,
      sb.otherCharges,
      sb.discount,
      sb.totalAmount,
      pr.paymentRecordId,
      pr.paymentDate,
      pr.paymentAmount,
      pr.paymentBalance,
      r.paymentReceiptId,
      r.receiptNumber,
      r.receiptDate,
      r.receiptFile
    FROM serviceBill AS sb
    LEFT JOIN paymentRecord AS pr
      ON pr.serviceBillId = sb.serviceBillId
    LEFT JOIN receipt AS r
      ON r.paymentRecordId = pr.paymentRecordId
    WHERE sb.serviceBillId = ?
    LIMIT 1
  `, [request.serviceBillId]);

  return rows[0] || null;
}

// UPDATE BILLING DATA
export async function updateBillingData(request) {
  const {
    otherCharges,
    discount,
    paymentDate,
    paymentAmount,
    receiptDate
  } = request.validatedBilling;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(`
      SELECT
        sb.serviceBillId,
        sb.jobOrderId,
        pr.paymentRecordId,
        r.paymentReceiptId
      FROM serviceBill AS sb
      INNER JOIN paymentRecord AS pr
        ON pr.serviceBillId = sb.serviceBillId
      INNER JOIN receipt AS r
        ON r.paymentRecordId = pr.paymentRecordId
      WHERE sb.serviceBillId = ?
      FOR UPDATE
    `, [request.serviceBillId]);

    if (!rows.length) {
      throw new Error("Billing record not found.");
    }

    const bill = rows[0];

    const [services, items] = await Promise.all([
      readBillingServiceRecords(bill.jobOrderId),
      readBillingJobOrderItems(bill.jobOrderId)
    ]);

    const partsTotal = Number(items.partsTotal.toFixed(2));
    const laborTotal = Number(services.laborTotal.toFixed(2));

    const totalAmount = Number((
      partsTotal +
      laborTotal +
      Number(otherCharges || 0) -
      Number(discount || 0)
    ).toFixed(2));

    if (totalAmount < 0 || paymentAmount > totalAmount) {
      throw new Error("Invalid bill or payment amount.");
    }

    const paymentBalance = Number(
      (totalAmount - paymentAmount).toFixed(2)
    );

    const formattedPaymentDate =
      `${paymentDate.replace("T", " ")}:00`;

    const formattedReceiptDate = new Date(receiptDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await connection.execute(`
      UPDATE serviceBill
      SET
        partsTotal = ?,
        laborTotal = ?,
        otherCharges = ?,
        discount = ?,
        totalAmount = ?
      WHERE serviceBillId = ?
    `, [
      partsTotal,
      laborTotal,
      otherCharges,
      discount,
      totalAmount,
      request.serviceBillId
    ]);

    await connection.execute(`
      UPDATE paymentRecord
      SET
        paymentDate = ?,
        paymentAmount = ?,
        paymentBalance = ?
      WHERE paymentRecordId = ?
    `, [
      formattedPaymentDate,
      paymentAmount,
      paymentBalance,
      bill.paymentRecordId
    ]);

    await connection.execute(`
      UPDATE receipt
      SET receiptDate = ?
      WHERE paymentReceiptId = ?
    `, [formattedReceiptDate, bill.paymentReceiptId]);

    await connection.commit();

    return {
      serviceBillId: request.serviceBillId,
      paymentRecordId: bill.paymentRecordId,
      paymentReceiptId: bill.paymentReceiptId
    };
  }
  catch (error) {
    await connection.rollback();
    throw error;
  }
  finally {
    connection.release();
  }
}

export async function deleteBillingData() {
  throw new Error("Deleting billing records is not implemented.");
}