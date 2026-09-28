import { validateInventoryItemInput, validateInventoryItemUpdateInput, validateInventoryItemId } from "../validators/validateInventoryItem.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { createInventoryItemData, readInventoryItemData, updateInventoryItemData, deleteInventoryItemData } from "../services/inventoryItemService.js";
import { sendJson, sendNotFound, sendValidationError } from "../../frontend/js/utils/jsonUtils.js";

// CREATE INVENTORY ITEM
export async function handleCreateInventoryItem(request, response) {
  const validation = validateInventoryItemInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedInventoryItem = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "inventoryItem.create")) {return;}

    const data = await createInventoryItemData(request);

    sendJson(response, 201, {
      message: "Inventory item created successfully.",
      data
    });
  }
  catch (error) {
    console.error("Create Inventory Item Controller:", error);

    if (error.message === "Supplier not found.") {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// READ INVENTORY ITEMS
export async function handleReadInventoryItem(request, response) {
  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "inventoryItem.read")) {return;}

    const data = await readInventoryItemData();

    sendJson(response, 200, {
      message: "Inventory items retrieved successfully.",
      data
    });
  }
  catch (error) {
    console.error("Read Inventory Items Controller:", error);

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// UPDATE INVENTORY ITEM
export async function handleUpdateInventoryItem(request, response) {
  const idValidation = validateInventoryItemId(request.inventoryItemId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.inventoryItemId = idValidation.data;

  const validation = validateInventoryItemUpdateInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedInventoryItem = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "inventoryItem.update")) {return;}

    const data = await updateInventoryItemData(request);

    sendJson(response, 200, {
      message: "Inventory item updated successfully.",
      data
    });
  }
  catch (error) {
    console.error("Update Inventory Item Controller:", error);

    if (
      error.message === "Inventory item not found." ||
      error.message === "Supplier not found."
    ) {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// DELETE INVENTORY ITEM
export async function handleDeleteInventoryItem(request, response) {
  const idValidation = validateInventoryItemId(request.inventoryItemId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.inventoryItemId = idValidation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "inventoryItem.delete")) {return;}

    const data = await deleteInventoryItemData(request);

    sendJson(response, 200, {
      message: "Inventory item deleted successfully.",
      data
    });
  }
  catch (error) {
    console.error("Delete Inventory Item Controller:", error);

    if (error.message === "Inventory item not found.") {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}