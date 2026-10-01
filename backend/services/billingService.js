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

// READ JOB ORDER BILLING DATA
export async function readJobOrderBillingData(request) {
  try {
    const jobOrder = await readBillingJobOrder(request.jobOrderId);

    if (!jobOrder) {
      return null;
    }

    const [services, items] = await Promise.all([
      readBillingServiceRecords(request.jobOrderId),
      readBillingJobOrderItems(request.jobOrderId)
    ]);

    return {
      ...jobOrder,
      ...services,
      ...items
    };
  }
  catch (error) {
    console.error("Read Job Order Billing Data:", error);
    throw error;
  }
}
// readJobOrderBillingData returns an object
const returnDataTesting = 
{
  jobOrderId: 16,
  customerName: "James",
  customerContactNo: "234234",
  motorcycleName: "Suzimi",
  motorcycleModel: "testing",
  serviceRecords: [
    {
      serviceRecordId: 1,
      serviceType: "Change oil",
      serviceDescription: "Oil replacement",
      laborCharge: "500.00"
    }
  ],
  laborTotal: 500,
  jobOrderItems: [
    {
      jobOrderItemId: 1,
      inventoryItemId: 8,
      itemName: "Engine Oil",
      quantityUsed: 2,
      unitPrice: "350.00",
      totalPrice: "700.00"
    }
  ],
  partsTotal: 700
}