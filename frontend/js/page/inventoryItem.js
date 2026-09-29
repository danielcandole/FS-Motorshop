import { showError } from "../utils/message.js";
import { isEmployeeAllowed } from "../utils/roles.js";
import { loadLoggedEmployee } from "../utils/employee.js";

// LOAD SUPPLIERS
async function loadSuppliers() {
  const supplierSelect = document.getElementById("supplierId");
  const editSupplierSelect = document.getElementById("editSupplierId");

  if (!supplierSelect || !editSupplierSelect) {
    throw new Error("Inventory item supplier fields were not found.");
  }

  supplierSelect.innerHTML = `
    <option value="" selected disabled>
      Loading suppliers...
    </option>
  `;

  editSupplierSelect.innerHTML = `
    <option value="" selected disabled>
      Loading suppliers...
    </option>
  `;

  const response = await fetch("/api/suppliers", {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
      "Failed to load suppliers."
    );
  }

  const suppliers = result.data;

  if (!Array.isArray(suppliers)) {
    throw new Error("Invalid supplier response.");
  }

  supplierSelect.replaceChildren();
  editSupplierSelect.replaceChildren();

  const createPlaceholder = document.createElement("option");
  createPlaceholder.value = "";
  createPlaceholder.textContent = "Select supplier";
  createPlaceholder.disabled = true;
  createPlaceholder.selected = true;
  createPlaceholder.hidden = true;

  const editPlaceholder = document.createElement("option");
  editPlaceholder.value = "";
  editPlaceholder.textContent = "Select supplier";
  editPlaceholder.disabled = true;
  editPlaceholder.selected = true;
  editPlaceholder.hidden = true;

  supplierSelect.appendChild(createPlaceholder);
  editSupplierSelect.appendChild(editPlaceholder);

  suppliers.forEach((supplier) => {
    const createOption = document.createElement("option");
    createOption.value = supplier.supplierId;
    createOption.textContent = supplier.supplierName;

    const editOption = document.createElement("option");
    editOption.value = supplier.supplierId;
    editOption.textContent = supplier.supplierName;

    supplierSelect.appendChild(createOption);
    editSupplierSelect.appendChild(editOption);
  });
}

// CONFIGURE SUPPLIER FIELDS
function configureSupplierFields(isEdit = false) {
  const supplierNotFound = document.getElementById(
    isEdit ? "editSupplierNotFound" : "supplierNotFound"
  );

  const supplierSelect = document.getElementById(
    isEdit ? "editSupplierId" : "supplierId"
  );

  const newSupplierFields = document.getElementById(
    isEdit ? "editNewSupplierFields" : "newSupplierFields"
  );

  const supplierName = document.getElementById(
    isEdit ? "editSupplierName" : "supplierName"
  );

  const supplierContactNo = document.getElementById(
    isEdit ? "editSupplierContactNo" : "supplierContactNo"
  );

  const requiredElements = [
    supplierNotFound,
    supplierSelect,
    newSupplierFields,
    supplierName,
    supplierContactNo
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Inventory Items: Supplier form elements were not found.");
    return;
  }

  const isNewSupplier = supplierNotFound.checked;

  supplierSelect.disabled = isNewSupplier;
  supplierSelect.required = !isNewSupplier;

  newSupplierFields.hidden = !isNewSupplier;

  supplierName.required = isNewSupplier;
  supplierContactNo.required = isNewSupplier;

  supplierName.disabled = !isNewSupplier;
  supplierContactNo.disabled = !isNewSupplier;
}

// GET SUPPLIER FORM DATA
function getSupplierFormData(formData, isEdit = false) {
  const supplierNotFound = document.getElementById(
    isEdit ? "editSupplierNotFound" : "supplierNotFound"
  );

  const supplierSelect = document.getElementById(
    isEdit ? "editSupplierId" : "supplierId"
  );

  const supplierName = document.getElementById(
    isEdit ? "editSupplierName" : "supplierName"
  );

  const supplierContactNo = document.getElementById(
    isEdit ? "editSupplierContactNo" : "supplierContactNo"
  );

  if (!supplierNotFound || !supplierSelect || !supplierName || !supplierContactNo) {
    throw new Error("Inventory item supplier fields were not found.");
  }

  if (supplierNotFound.checked) {
    formData.supplierId = null;
    formData.supplierName = supplierName.value.trim();
    formData.supplierContactNo = supplierContactNo.value.trim();
  }
  else {
    formData.supplierId = supplierSelect.value;
    formData.supplierName = null;
    formData.supplierContactNo = null;
  }

  return formData;
}

// OPEN EDIT INVENTORY ITEM
function openEditInventoryItem(inventoryItem) {
  const editInventoryItemModal = document.getElementById("editInventoryItemModal");
  const editInventoryItemForm = document.getElementById("editInventoryItemForm");
  const editInventoryItemId = document.getElementById("editInventoryItemId");
  const editSupplierId = document.getElementById("editSupplierId");
  const editSupplierNotFound = document.getElementById("editSupplierNotFound");
  const editSupplierName = document.getElementById("editSupplierName");
  const editSupplierContactNo = document.getElementById("editSupplierContactNo");
  const editItemName = document.getElementById("editItemName");
  const editItemCode = document.getElementById("editItemCode");
  const editItemCategory = document.getElementById("editItemCategory");
  const editBrand = document.getElementById("editBrand");
  const editMotorcycleFitment = document.getElementById("editMotorcycleFitment");
  const editQuantity = document.getElementById("editQuantity");
  const editCostPrice = document.getElementById("editCostPrice");
  const editSellingPrice = document.getElementById("editSellingPrice");

  const requiredElements = [
    editInventoryItemModal,
    editInventoryItemForm,
    editInventoryItemId,
    editSupplierId,
    editSupplierNotFound,
    editSupplierName,
    editSupplierContactNo,
    editItemName,
    editItemCode,
    editItemCategory,
    editBrand,
    editMotorcycleFitment,
    editQuantity,
    editCostPrice,
    editSellingPrice
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Inventory Items: One or more edit inventory item elements were not found.");
    return;
  }

  if (!inventoryItem) {
    console.error("Inventory Items: Inventory item data was not provided.");
    return;
  }

  editInventoryItemForm.reset();

  editInventoryItemId.value = inventoryItem.inventoryItemId ?? "";
  editSupplierId.value = inventoryItem.supplierId ?? "";
  editSupplierNotFound.checked = false;
  editSupplierName.value = "";
  editSupplierContactNo.value = "";
  editItemName.value = inventoryItem.itemName ?? "";
  editItemCode.value = inventoryItem.itemCode ?? "";
  editItemCategory.value = inventoryItem.itemCategory ?? "";
  editBrand.value = inventoryItem.brand ?? "";
  editMotorcycleFitment.value = inventoryItem.motorcycleFitment ?? "";
  editQuantity.value = inventoryItem.quantity ?? "";
  editCostPrice.value = inventoryItem.costPrice ?? "";
  editSellingPrice.value = inventoryItem.sellingPrice ?? "";

  configureSupplierFields(true);

  editInventoryItemModal.showModal();
}

// CREATE TABLE CELL
function createTableCell(value) {
  const cell = document.createElement("td");

  cell.textContent = value ?? "—";

  return cell;
}

// CREATE INVENTORY ITEM ROW
function createInventoryItemRow(inventoryItem) {
  const row = document.createElement("tr");

  row.dataset.inventoryItemId = inventoryItem.inventoryItemId;

  row.appendChild(createTableCell(inventoryItem.supplierName));
  row.appendChild(createTableCell(inventoryItem.itemName));
  row.appendChild(createTableCell(inventoryItem.itemCode));
  row.appendChild(createTableCell(inventoryItem.itemCategory));
  row.appendChild(createTableCell(inventoryItem.brand));
  row.appendChild(createTableCell(inventoryItem.motorcycleFitment));
  row.appendChild(createTableCell(inventoryItem.quantity));
  row.appendChild(createTableCell(inventoryItem.costPrice));
  row.appendChild(createTableCell(inventoryItem.sellingPrice));

  row.addEventListener("click", () => {
    openEditInventoryItem(inventoryItem);
  });

  return row;
}

// LOAD INVENTORY ITEMS
async function loadInventoryItems() {
  const tableBody = document.getElementById("inventoryItemsTableBody");

  if (!tableBody) {
    console.error("Inventory Items: Table body was not found.");
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="8">
        Loading inventory items...
      </td>
    </tr>
  `;

  try {
    const response = await fetch("/api/inventory-items", {
      method: "GET",
      credentials: "same-origin"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to load inventory items."
      );
    }

    const inventoryItems = result.data;

    if (!Array.isArray(inventoryItems)) {
      throw new Error("Invalid inventory item response.");
    }

    if (inventoryItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            No inventory items available.
          </td>
        </tr>
      `;

      return;
    }

    tableBody.replaceChildren();

    inventoryItems.forEach((inventoryItem) => {
      tableBody.appendChild(
        createInventoryItemRow(inventoryItem)
      );
    });
  }
  catch (error) {
    console.error("Load Inventory Items:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          Failed to load inventory items.
        </td>
      </tr>
    `;

    showError(
      error.message ||
      "Failed to load inventory items."
    );
  }
}

// OPEN CREATE INVENTORY ITEM
function openCreateInventoryItem() {
  const inventoryItemModal = document.getElementById("inventoryItemModal");
  const inventoryItemForm = document.getElementById("inventoryItemForm");
  const supplierSelect = document.getElementById("supplierId");

  if (!inventoryItemModal || !inventoryItemForm || !supplierSelect) {
    console.error("Inventory Items: Create inventory item elements were not found.");
    return;
  }

  inventoryItemForm.reset();
  supplierSelect.selectedIndex = 0;

  configureSupplierFields();

  inventoryItemModal.showModal();
}

// CLOSE DIALOG
function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);

  if (!dialog) {
    console.error(`Inventory Items: #${dialogId} was not found.`);
    return;
  }

  dialog.close();
}

// CREATE INVENTORY ITEM
async function createInventoryItem(event) {
  event.preventDefault();

  const inventoryItemForm = event.currentTarget;
  const inventoryItemData = Object.fromEntries(
    new FormData(inventoryItemForm).entries()
  );

  try {
    getSupplierFormData(inventoryItemData);

    const response = await fetch("/api/inventory-items", {
      method: "POST",
      credentials: "same-origin",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(inventoryItemData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to create inventory item."
      );
    }

    closeDialog("inventoryItemModal");
    inventoryItemForm.reset();

    configureSupplierFields();

    await loadInventoryItems();
  }
  catch (error) {
    console.error("Create Inventory Item:", error);

    showError(
      error.message ||
      "Failed to create inventory item."
    );
  }
}

// UPDATE INVENTORY ITEM
async function updateInventoryItem(event) {
  event.preventDefault();

  const inventoryItemForm = event.currentTarget;
  const inventoryItemData = Object.fromEntries(
    new FormData(inventoryItemForm).entries()
  );

  if (!inventoryItemData.inventoryItemId) {
    showError("Inventory item ID was not found.");
    return;
  }

  try {
    getSupplierFormData(inventoryItemData, true);

    const response = await fetch(
      `/api/inventory-items/${inventoryItemData.inventoryItemId}`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(inventoryItemData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to update inventory item."
      );
    }

    closeDialog("editInventoryItemModal");

    await loadInventoryItems();
  }
  catch (error) {
    console.error("Update Inventory Item:", error);

    showError(
      error.message ||
      "Failed to update inventory item."
    );
  }
}

// DELETE INVENTORY ITEM
async function deleteInventoryItem() {
  const inventoryItemId = document.getElementById("editInventoryItemId");

  if (!inventoryItemId || !inventoryItemId.value) {
    showError("Inventory item ID was not found.");
    return;
  }

  try {
    const response = await fetch(
      `/api/inventory-items/${inventoryItemId.value}`,
      {
        method: "DELETE",
        credentials: "same-origin"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to delete inventory item."
      );
    }

    closeDialog("editInventoryItemModal");

    await loadInventoryItems();
  }
  catch (error) {
    console.error("Delete Inventory Item:", error);

    showError(
      error.message ||
      "Failed to delete inventory item."
    );
  }
}

// INITIALIZE INVENTORY ITEMS PAGE
export async function initInventoryItemsPage() {
  const inventoryItemModal = document.getElementById("inventoryItemModal");
  const editInventoryItemModal = document.getElementById("editInventoryItemModal");
  const inventoryItemForm = document.getElementById("inventoryItemForm");
  const editInventoryItemForm = document.getElementById("editInventoryItemForm");
  const inventoryItemsTableBody = document.getElementById("inventoryItemsTableBody");
  const createButton = document.getElementById("createInventoryItemButton");
  const closeButton = document.getElementById("closeInventoryItemModal");
  const cancelButton = document.getElementById("cancelInventoryItemButton");
  const closeEditButton = document.getElementById("closeEditInventoryItemModal");
  const cancelEditButton = document.getElementById("cancelEditInventoryItemButton");
  const deleteButton = document.getElementById("deleteInventoryItemButton");
  const supplierNotFound = document.getElementById("supplierNotFound");
  const editSupplierNotFound = document.getElementById("editSupplierNotFound");

  const requiredElements = [
    inventoryItemModal,
    editInventoryItemModal,
    inventoryItemForm,
    editInventoryItemForm,
    inventoryItemsTableBody,
    createButton,
    closeButton,
    cancelButton,
    closeEditButton,
    cancelEditButton,
    deleteButton,
    supplierNotFound,
    editSupplierNotFound
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Inventory Items: One or more required HTML elements were not found.");
    return;
  }

  try {
    const loggedEmployee = await loadLoggedEmployee();
    const employeeRole = loggedEmployee.roleName;

    if (!isEmployeeAllowed(employeeRole)) {
      showError("You are not authorized to access inventory items.");
      return;
    }

    await loadSuppliers();
    configureSupplierFields();
    configureSupplierFields(true);

    await loadInventoryItems();

    createButton.addEventListener("click", openCreateInventoryItem);
    closeButton.addEventListener("click", () => closeDialog("inventoryItemModal"));
    cancelButton.addEventListener("click", () => closeDialog("inventoryItemModal"));
    closeEditButton.addEventListener("click", () => closeDialog("editInventoryItemModal"));
    cancelEditButton.addEventListener("click", () => closeDialog("editInventoryItemModal"));

    supplierNotFound.addEventListener("change", () => {
      configureSupplierFields();
    });

    editSupplierNotFound.addEventListener("change", () => {
      configureSupplierFields(true);
    });

    inventoryItemForm.addEventListener("submit", createInventoryItem);
    editInventoryItemForm.addEventListener("submit", updateInventoryItem);
    deleteButton.addEventListener("click", deleteInventoryItem);
  }
  catch (error) {
    console.error("Initialize Inventory Items:", error);

    showError(
      error.message ||
      "Failed to initialize inventory items page."
    );
  }
}