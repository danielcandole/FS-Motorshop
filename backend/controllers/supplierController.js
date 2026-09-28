import { validateSupplierInput, validateSupplierUpdateInput, validateSupplierId } from "../validators/validateSupplier.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import { createSupplierData, readSupplierData, updateSupplierData, deleteSupplierData } from "../services/supplierService.js";
import { sendJson, sendForbidden, sendNotFound, sendValidationError } from "../../frontend/js/utils/jsonUtils.js";

// CREATE SUPPLIER
export async function handleCreateSupplier(request, response) {
  const validation = validateSupplierInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedSupplier = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "supplier.create")) {return;}

    const data = await createSupplierData(request);

    sendJson(response, 201, {
      message: "Supplier created successfully.",
      data
    });
  }
  catch (error) {
    console.error("Create Supplier Controller:", error);

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// READ SUPPLIERS
export async function handleReadSupplier(request, response) {
  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "supplier.read")) {return;}

    const data = await readSupplierData();

    sendJson(response, 200, {
      message: "Suppliers retrieved successfully.",
      data
    });
  }
  catch (error) {
    console.error("Read Supplier Controller:", error);

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// UPDATE SUPPLIER
export async function handleUpdateSupplier(request, response) {
  const idValidation = validateSupplierId(request.supplierId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.supplierId = idValidation.data;

  const validation = validateSupplierUpdateInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedSupplier = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "supplier.update")) {return;}

    const data = await updateSupplierData(request);

    sendJson(response, 200, {
      message: "Supplier updated successfully.",
      data
    });
  }
  catch (error) {
    console.error("Update Supplier Controller:", error);

    if (error.message === "Supplier not found.") {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// DELETE SUPPLIER
export async function handleDeleteSupplier(request, response) {
  const idValidation = validateSupplierId(request.supplierId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.supplierId = idValidation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}

    if (!await authorized(request, response, "supplier.delete")) {return;}

    const data = await deleteSupplierData(request);

    sendJson(response, 200, {
      message: "Supplier deleted successfully.",
      data
    });
  }
  catch (error) {
    console.error("Delete Supplier Controller:", error);

    if (error.message === "Supplier not found.") {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}