import { showError } from "../utils/message.js";
import { isEmployeeAllowed } from "../utils/roles.js";
import { loadLoggedEmployee } from "../utils/employee.js";

// OPEN EDIT SUPPLIER
function openEditSupplier(supplier) {
  const editSupplierModal = document.getElementById("editSupplierModal");
  const editSupplierForm = document.getElementById("editSupplierForm");
  const editSupplierId = document.getElementById("editSupplierId");
  const editSupplierName = document.getElementById("editSupplierName");
  const editSupplierContactNo = document.getElementById("editSupplierContactNo");

  const requiredElements = [
    editSupplierModal,
    editSupplierForm,
    editSupplierId,
    editSupplierName,
    editSupplierContactNo
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Suppliers: One or more edit supplier elements were not found.");
    return;
  }

  if (!supplier) {
    console.error("Suppliers: Supplier data was not provided.");
    return;
  }

  editSupplierId.value = supplier.supplierId ?? "";
  editSupplierName.value = supplier.supplierName ?? "";
  editSupplierContactNo.value = supplier.supplierContactNo ?? "";

  editSupplierModal.showModal();
}

// CREATE TABLE CELL
function createTableCell(value) {
  const cell = document.createElement("td");

  cell.textContent = value ?? "N/A";

  return cell;
}

// CREATE SUPPLIER ROW
function createSupplierRow(supplier) {
  const row = document.createElement("tr");

  row.dataset.supplierId = supplier.supplierId;

  row.appendChild(createTableCell(supplier.supplierName));
  row.appendChild(createTableCell(supplier.supplierContactNo));

  row.addEventListener("click", () => {
    openEditSupplier(supplier);
  });

  return row;
}

// LOAD SUPPLIERS
async function loadSuppliers() {
  const tableBody = document.getElementById("suppliersTableBody");

  if (!tableBody) {
    console.error("Suppliers: Table body was not found.");
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="2">
        Loading suppliers...
      </td>
    </tr>
  `;

  try {
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

    if (suppliers.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="2">
            No suppliers available.
          </td>
        </tr>
      `;

      return;
    }

    tableBody.replaceChildren();

    suppliers.forEach((supplier) => {
      tableBody.appendChild(
        createSupplierRow(supplier)
      );
    });
  }
  catch (error) {
    console.error("Load Suppliers:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="2">
          Failed to load suppliers.
        </td>
      </tr>
    `;

    showError(
      error.message ||
      "Failed to load suppliers."
    );
  }
}

// OPEN CREATE SUPPLIER
function openCreateSupplier() {
  const supplierModal = document.getElementById("supplierModal");
  const supplierForm = document.getElementById("supplierForm");

  if (!supplierModal || !supplierForm) {
    console.error("Suppliers: Create supplier elements were not found.");
    return;
  }

  supplierForm.reset();
  supplierModal.showModal();
}

// CLOSE DIALOG
function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);

  if (!dialog) {
    console.error(`Suppliers: #${dialogId} was not found.`);
    return;
  }

  dialog.close();
}

// CREATE SUPPLIER
async function createSupplier(event) {
  event.preventDefault();

  const supplierForm = event.currentTarget;
  const supplierData = Object.fromEntries(
    new FormData(supplierForm).entries()
  );

  try {
    const response = await fetch("/api/suppliers", {
      method: "POST",
      credentials: "same-origin",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(supplierData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to create supplier."
      );
    }

    closeDialog("supplierModal");
    supplierForm.reset();

    await loadSuppliers();
  }
  catch (error) {
    console.error("Create Supplier:", error);

    showError(
      error.message ||
      "Failed to create supplier."
    );
  }
}

// UPDATE SUPPLIER
async function updateSupplier(event) {
  event.preventDefault();

  const supplierForm = event.currentTarget;
  const supplierData = Object.fromEntries(
    new FormData(supplierForm).entries()
  );

  if (!supplierData.supplierId) {
    showError("Supplier ID was not found.");
    return;
  }

  try {
    const response = await fetch(
      `/api/suppliers/${supplierData.supplierId}`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(supplierData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to update supplier."
      );
    }

    closeDialog("editSupplierModal");

    await loadSuppliers();
  }
  catch (error) {
    console.error("Update Supplier:", error);

    showError(
      error.message ||
      "Failed to update supplier."
    );
  }
}

// DELETE SUPPLIER
async function deleteSupplier() {
  const supplierId = document.getElementById("editSupplierId");

  if (!supplierId || !supplierId.value) {
    showError("Supplier ID was not found.");
    return;
  }

  try {
    const response = await fetch(
      `/api/suppliers/${supplierId.value}`,
      {
        method: "DELETE",
        credentials: "same-origin"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to delete supplier."
      );
    }

    closeDialog("editSupplierModal");

    await loadSuppliers();
  }
  catch (error) {
    console.error("Delete Supplier:", error);

    showError(
      error.message ||
      "Failed to delete supplier."
    );
  }
}

// INITIALIZE SUPPLIERS PAGE
export async function initSuppliersPage() {
  const supplierModal = document.getElementById("supplierModal");
  const editSupplierModal = document.getElementById("editSupplierModal");
  const supplierForm = document.getElementById("supplierForm");
  const editSupplierForm = document.getElementById("editSupplierForm");
  const suppliersTableBody = document.getElementById("suppliersTableBody");
  const createButton = document.getElementById("createSupplierButton");
  const closeButton = document.getElementById("closeSupplierModal");
  const cancelButton = document.getElementById("cancelSupplierButton");
  const closeEditButton = document.getElementById("closeEditSupplierModal");
  const cancelEditButton = document.getElementById("cancelEditSupplierButton");
  const deleteButton = document.getElementById("deleteSupplierButton");

  const requiredElements = [
    supplierModal,
    editSupplierModal,
    supplierForm,
    editSupplierForm,
    suppliersTableBody,
    createButton,
    closeButton,
    cancelButton,
    closeEditButton,
    cancelEditButton,
    deleteButton
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Suppliers: One or more required HTML elements were not found.");
    return;
  }

  try {
    const loggedEmployee = await loadLoggedEmployee();
    const employeeRole = loggedEmployee.roleName;

    if (!isEmployeeAllowed(employeeRole)) {
      showError("You are not authorized to access suppliers.");
      return;
    }

    await loadSuppliers();

    createButton.addEventListener("click", openCreateSupplier);
    closeButton.addEventListener("click", () => closeDialog("supplierModal"));
    cancelButton.addEventListener("click", () => closeDialog("supplierModal"));
    closeEditButton.addEventListener("click", () => closeDialog("editSupplierModal"));
    cancelEditButton.addEventListener("click", () => closeDialog("editSupplierModal"));
    supplierForm.addEventListener("submit", createSupplier);
    editSupplierForm.addEventListener("submit", updateSupplier);
    deleteButton.addEventListener("click", deleteSupplier);
  }
  catch (error) {
    console.error("Initialize Suppliers:", error);

    showError(
      error.message ||
      "Failed to initialize supplier page."
    );
  }
}