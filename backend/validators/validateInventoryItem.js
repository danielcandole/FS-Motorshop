import {
  isNonEmptyString,
  isStringWithinLength,
  isNumericString
} from "../utils/inputValidation.js";

// VALIDATE INVENTORY ITEM INPUT
export function validateInventoryItemInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

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
  } = body;

  // VALIDATE SUPPLIER
  const hasSupplierId = supplierId !== null &&
    supplierId !== undefined &&
    String(supplierId).trim() !== "";

  if (hasSupplierId) {
    const numericSupplierId = Number(supplierId);

    if (
      !Number.isSafeInteger(numericSupplierId) ||
      numericSupplierId <= 0
    ) {
      errors.push("Invalid supplier ID.");
    }

    if (supplierName !== null && supplierName !== undefined && supplierName !== "") {
      errors.push("Supplier name must be null when supplier ID is provided.");
    }

    if (supplierContactNo !== null && supplierContactNo !== undefined && supplierContactNo !== "") {
      errors.push("Supplier contact number must be null when supplier ID is provided.");
    }
  }
  else {
    if (!isNonEmptyString(supplierName)) {
      errors.push("Supplier name is required when supplier ID is not provided.");
    }
    else if (!isStringWithinLength(supplierName, 150)) {
      errors.push("Supplier name must not exceed 150 characters.");
    }

    if (!isNonEmptyString(supplierContactNo)) {
      errors.push("Supplier contact number is required when supplier ID is not provided.");
    }
    else if (!isNumericString(supplierContactNo)) {
      errors.push("Supplier contact number must contain only numbers.");
    }
    else if (!isStringWithinLength(supplierContactNo, 20)) {
      errors.push("Supplier contact number must not exceed 20 characters.");
    }
  }

  // VALIDATE ITEM NAME
  if (!isNonEmptyString(itemName)) {
    errors.push("Item name is required.");
  }
  else if (!isStringWithinLength(itemName, 150)) {
    errors.push("Item name must not exceed 150 characters.");
  }

  // VALIDATE ITEM CODE
  if (itemCode !== null && itemCode !== undefined && itemCode !== "") {
    if (typeof itemCode !== "string") {
      errors.push("Invalid item code.");
    }
    else if (!isStringWithinLength(itemCode, 100)) {
      errors.push("Item code must not exceed 100 characters.");
    }
  }

  // VALIDATE ITEM CATEGORY
  if (itemCategory !== null && itemCategory !== undefined && itemCategory !== "") {
    if (typeof itemCategory !== "string") {
      errors.push("Invalid item category.");
    }
    else if (!isStringWithinLength(itemCategory, 100)) {
      errors.push("Item category must not exceed 100 characters.");
    }
  }

  // VALIDATE BRAND
  if (brand !== null && brand !== undefined && brand !== "") {
    if (typeof brand !== "string") {
      errors.push("Invalid brand.");
    }
    else if (!isStringWithinLength(brand, 100)) {
      errors.push("Brand must not exceed 100 characters.");
    }
  }

  // VALIDATE MOTORCYCLE FITMENT
  if (motorcycleFitment !== null && motorcycleFitment !== undefined && motorcycleFitment !== "") {
    if (typeof motorcycleFitment !== "string") {
      errors.push("Invalid motorcycle fitment.");
    }
    else if (!isStringWithinLength(motorcycleFitment, 255)) {
      errors.push("Motorcycle fitment must not exceed 255 characters.");
    }
  }

  // VALIDATE COST PRICE
  if (costPrice === undefined || costPrice === null || costPrice === "") {
    errors.push("Cost price is required.");
  }
  else if (!isNumericString(String(costPrice))) {
    errors.push("Cost price must be numeric.");
  }
  else if (Number(costPrice) < 0) {
    errors.push("Cost price must not be negative.");
  }

  // VALIDATE SELLING PRICE
  if (sellingPrice === undefined || sellingPrice === null || sellingPrice === "") {
    errors.push("Selling price is required.");
  }
  else if (!isNumericString(String(sellingPrice))) {
    errors.push("Selling price must be numeric.");
  }
  else if (Number(sellingPrice) < 0) {
    errors.push("Selling price must not be negative.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    data: {
      supplierId: hasSupplierId ? Number(supplierId) : null,
      supplierName: hasSupplierId ? null : supplierName.trim(),
      supplierContactNo: hasSupplierId ? null : supplierContactNo.trim(),
      itemName: itemName.trim(),
      itemCode: itemCode?.trim() || null,
      itemCategory: itemCategory?.trim() || null,
      brand: brand?.trim() || null,
      motorcycleFitment: motorcycleFitment?.trim() || null,
      costPrice: Number(costPrice).toFixed(2),
      sellingPrice: Number(sellingPrice).toFixed(2)
    },
    errors: []
  };
}

// VALIDATE INVENTORY ITEM UPDATE INPUT
export function validateInventoryItemUpdateInput(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: ["Invalid request body."]
    };
  }

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
  } = body;

  // VALIDATE SUPPLIER
  const hasSupplierId = supplierId !== null &&
    supplierId !== undefined &&
    String(supplierId).trim() !== "";

  if (hasSupplierId) {
    const numericSupplierId = Number(supplierId);

    if (
      !Number.isSafeInteger(numericSupplierId) ||
      numericSupplierId <= 0
    ) {
      errors.push("Invalid supplier ID.");
    }

    if (supplierName !== null && supplierName !== undefined && supplierName !== "") {
      errors.push("Supplier name must be null when supplier ID is provided.");
    }

    if (supplierContactNo !== null && supplierContactNo !== undefined && supplierContactNo !== "") {
      errors.push("Supplier contact number must be null when supplier ID is provided.");
    }
  }
  else {
    if (!isNonEmptyString(supplierName)) {
      errors.push("Supplier name is required when supplier ID is not provided.");
    }
    else if (!isStringWithinLength(supplierName, 150)) {
      errors.push("Supplier name must not exceed 150 characters.");
    }

    if (!isNonEmptyString(supplierContactNo)) {
      errors.push("Supplier contact number is required when supplier ID is not provided.");
    }
    else if (!isNumericString(supplierContactNo)) {
      errors.push("Supplier contact number must contain only numbers.");
    }
    else if (!isStringWithinLength(supplierContactNo, 20)) {
      errors.push("Supplier contact number must not exceed 20 characters.");
    }
  }

  // VALIDATE ITEM NAME
  if (!isNonEmptyString(itemName)) {
    errors.push("Item name is required.");
  }
  else if (!isStringWithinLength(itemName, 150)) {
    errors.push("Item name must not exceed 150 characters.");
  }

  // VALIDATE ITEM CODE
  if (itemCode !== null && itemCode !== undefined && itemCode !== "") {
    if (typeof itemCode !== "string") {
      errors.push("Invalid item code.");
    }
    else if (!isStringWithinLength(itemCode, 100)) {
      errors.push("Item code must not exceed 100 characters.");
    }
  }

  // VALIDATE ITEM CATEGORY
  if (itemCategory !== null && itemCategory !== undefined && itemCategory !== "") {
    if (typeof itemCategory !== "string") {
      errors.push("Invalid item category.");
    }
    else if (!isStringWithinLength(itemCategory, 100)) {
      errors.push("Item category must not exceed 100 characters.");
    }
  }

  // VALIDATE BRAND
  if (brand !== null && brand !== undefined && brand !== "") {
    if (typeof brand !== "string") {
      errors.push("Invalid brand.");
    }
    else if (!isStringWithinLength(brand, 100)) {
      errors.push("Brand must not exceed 100 characters.");
    }
  }

  // VALIDATE MOTORCYCLE FITMENT
  if (motorcycleFitment !== null && motorcycleFitment !== undefined && motorcycleFitment !== "") {
    if (typeof motorcycleFitment !== "string") {
      errors.push("Invalid motorcycle fitment.");
    }
    else if (!isStringWithinLength(motorcycleFitment, 255)) {
      errors.push("Motorcycle fitment must not exceed 255 characters.");
    }
  }

  // VALIDATE COST PRICE
  if (costPrice === undefined || costPrice === null || costPrice === "") {
    errors.push("Cost price is required.");
  }
  else if (!isNumericString(String(costPrice))) {
    errors.push("Cost price must be numeric.");
  }
  else if (Number(costPrice) < 0) {
    errors.push("Cost price must not be negative.");
  }

  // VALIDATE SELLING PRICE
  if (sellingPrice === undefined || sellingPrice === null || sellingPrice === "") {
    errors.push("Selling price is required.");
  }
  else if (!isNumericString(String(sellingPrice))) {
    errors.push("Selling price must be numeric.");
  }
  else if (Number(sellingPrice) < 0) {
    errors.push("Selling price must not be negative.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    data: {
      supplierId: hasSupplierId ? Number(supplierId) : null,
      supplierName: hasSupplierId ? null : supplierName.trim(),
      supplierContactNo: hasSupplierId ? null : supplierContactNo.trim(),
      itemName: itemName.trim(),
      itemCode: itemCode?.trim() || null,
      itemCategory: itemCategory?.trim() || null,
      brand: brand?.trim() || null,
      motorcycleFitment: motorcycleFitment?.trim() || null,
      costPrice: Number(costPrice).toFixed(2),
      sellingPrice: Number(sellingPrice).toFixed(2)
    },
    errors: []
  };
}

// VALIDATE INVENTORY ITEM ID
export function validateInventoryItemId(inventoryItemId) {
  const numericInventoryItemId = Number(inventoryItemId);

  if (
    inventoryItemId === undefined ||
    inventoryItemId === null ||
    String(inventoryItemId).trim() === "" ||
    !Number.isSafeInteger(numericInventoryItemId) ||
    numericInventoryItemId <= 0
  ) {
    return {
      valid: false,
      error: "Invalid inventory item ID."
    };
  }

  return {
    valid: true,
    data: numericInventoryItemId
  };
}