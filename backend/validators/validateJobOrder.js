import { isNonEmptyString, isValidDateTime ,isStringWithinLength, isOptionalString, isNumericString } from "../utils/inputValidation.js";

const allowedRepairStatuses = ["pending","in-progress","done"];

export function validateJobOrderInput(body) {
  const errors = [];

  // Validate request body
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

  const {customerName, customerContactNumber, motorcycleName, motorcycleModel, repairDate, description, repairStatus, serviceRecords, jobOrderItems } = body;

  // CUSTOMER NAME
  if (!isNonEmptyString(customerName)) {
    errors.push("Customer name is required.");
  }
  else if (!isStringWithinLength(customerName, 100)) {
    errors.push("Customer name must not exceed 100 characters.");
  }

  // CUSTOMER CONTACT NUMBER
  if (!isNonEmptyString(customerContactNumber)) {
    errors.push("Customer contact number is required.");
  }
  else if (!isNumericString(customerContactNumber)) {
    errors.push("Customer contact number must contain only numbers.");
  }
  else if (!isStringWithinLength(customerContactNumber, 20)) {
    errors.push("Customer contact number must not exceed 20 characters.");
  }

  // MOTORCYCLE NAME
  if (!isNonEmptyString(motorcycleName)) {
    errors.push("Motorcycle name is required.");
  }
  else if (!isStringWithinLength(motorcycleName, 100)) {
    errors.push("Motorcycle name must not exceed 100 characters.");
  }

  // MOTORCYCLE MODEL
  if (!isOptionalString(motorcycleModel)) {
    errors.push("Motorcycle model must be a string or null.");
  }
  else if (typeof motorcycleModel === "string" && !isStringWithinLength(motorcycleModel, 100)) {
    errors.push("Motorcycle model must not exceed 100 characters.");
  }

  // REPAIR DATE
  if (!isValidDateTime(repairDate)) {
    errors.push("Repair date must be a valid date and time.");
  }

  // REPORTED PROBLEM
  if (!isOptionalString(description)) {
    errors.push("Reported problem must be a string or null.");
  }

  // REPAIR STATUS
  if (!allowedRepairStatuses.includes(repairStatus)) {
    errors.push("Invalid repair status.");
  }

  // SERVICE RECORDS
  const validatedServiceRecords = [];

  if (!Array.isArray(serviceRecords) || serviceRecords.length === 0) {
    errors.push("At least one service record is required.");
  }
  else {
    serviceRecords.forEach((service, index) => {
      const serviceNumber = index + 1;

      if (!service || typeof service !== "object" || Array.isArray(service)) {
        errors.push(`Service ${serviceNumber} must be an object.`);
        return;
      }

      const {serviceType, serviceDescription, laborCharge} = service;

      let isValidService = true;

      // SERVICE TYPE
      if (!isNonEmptyString(serviceType)) {
        errors.push(`Service ${serviceNumber}: Service type is required.`);
        isValidService = false;
      }
      else if (!isStringWithinLength(serviceType, 100)) {
        errors.push(`Service ${serviceNumber}: Service type must not exceed 100 characters.`);
        isValidService = false;
      }

      // SERVICE DESCRIPTION
      if (!isOptionalString(serviceDescription)) {
        errors.push(`Service ${serviceNumber}: Service description must be a string or null.`);
        isValidService = false;
      }
      else if (typeof serviceDescription === "string" && !isStringWithinLength(serviceDescription, 1000)) {
        errors.push(`Service ${serviceNumber}: Service description must not exceed 1000 characters.`);
        isValidService = false;
      }

      // LABOR CHARGE
      if (typeof laborCharge !== "number" || !Number.isFinite(laborCharge) || laborCharge < 0) {
        errors.push(`Service ${serviceNumber}: Labor charge must be a non-negative number.`);
        isValidService = false;
      }

      if (isValidService) {
        validatedServiceRecords.push({
          serviceType: serviceType.trim(),
          serviceDescription: typeof serviceDescription === "string" ? serviceDescription.trim() || null : serviceDescription,
          laborCharge
        });
      }
    });
  }

  // JOB ORDER ITEMS
  const validatedJobOrderItems = [];

  if (!Array.isArray(jobOrderItems)) {
    errors.push("Job order items must be an array.");
  }
  else {
    jobOrderItems.forEach((item, index) => {
      const itemNumber = index + 1;

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        errors.push(`Job order item ${itemNumber} must be an object.`);
        return;
      }

      const {inventoryItemId, quantityUsed, unitPrice} = item;

      let isValidItem = true;
      
      // INVENTORY ID
      if (!Number.isInteger(inventoryItemId) || inventoryItemId <= 0) {
        errors.push(`Job order item ${itemNumber}: Inventory ID must be a positive integer.`);
        isValidItem = false;
      }

      // QUANTITY USED
      if (!Number.isInteger(quantityUsed) || quantityUsed <= 0) {
        errors.push(`Job order item ${itemNumber}: Quantity used must be a positive integer.`);
        isValidItem = false;
      }

      // UNIT PRICE
      if (typeof unitPrice !== "number" || !Number.isFinite(unitPrice) || unitPrice < 0) {
        errors.push(`Job order item ${itemNumber}: Unit price must be a non-negative number.`);
        isValidItem = false;
      }

      if (isValidItem) {
        validatedJobOrderItems.push({inventoryItemId, quantityUsed, unitPrice});
      }
    });
  }

  // RETURN VALIDATION ERRORS
  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  // RETURN VALIDATED DATA
  return {
    valid: true,
    data: {
      customerName: customerName.trim(),
      customerContactNumber: customerContactNumber.trim(),
      motorcycleName: motorcycleName.trim(),
      motorcycleModel: motorcycleModel?.trim() || null,
      repairDate,
      description: description?.trim() || null,
      repairStatus,
      serviceRecords: validatedServiceRecords,
      jobOrderItems: validatedJobOrderItems
    },
    errors: []
  };
}

export function validateJobOrderId(jobOrderId) {
  const id = Number(jobOrderId);

  if (
    jobOrderId === undefined ||
    jobOrderId === null ||
    String(jobOrderId).trim() === "" ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return {
      valid: false,
      error: "Invalid job order ID."
    };
  }

  return {
    valid: true,
    data: id
  };
}


