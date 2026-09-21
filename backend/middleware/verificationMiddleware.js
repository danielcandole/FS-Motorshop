import pool from "../config/database.js";

export async function verifyJobOrder(request, response) {
  const {
    customerName,
    customerContactNumber,
    motorcycleName,
    motorcycleModel
  } = request.validatedJobOrder;

  try {
    const [customers] = await pool.execute(`
      SELECT customerRecordId, customerName, contactNo
      FROM customerRecord
      WHERE contactNo = ?
      LIMIT 1
    `, [customerContactNumber]);

    if (customers.length > 0) {
      const customer = customers[0];

      if (customer.customerName !== customerName) {
        response.writeHead(409, {"Content-Type": "application/json"});
        response.end(JSON.stringify({
          message: "The contact number is already registered to another customer."
        }));
        return false;
      }

      request.verifiedCustomer = customer;
    }
    else {
      request.verifiedCustomer = null;
    }

    request.verifiedMotorcycle = {
      motorcycleName,
      motorcycleModel: motorcycleModel || null
    };

    return true;
  }
  catch (error) {
    console.error("Verify Job Order:", error);

    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Failed to verify job order."
    }));

    return false;
  }
}