
import { formatDateTime } from "../utils/dateUtils.js";



// Returns the current local date and time
// in MySQL DATETIME format.
function getCurrentDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

// DISPLAY ERROR
function showError(message) {
  alert(message);
}

// DISPLAY SUCCESS
function showSuccess(message) {
  alert(message);
}

// GET EMPLOYEE ROLE
function getEmployeeRole(employee) {
  return employee?.role || employee?.roleName || "";
}

// GET EMPLOYEE ID
function getEmployeeId(employee) {
  return employee.employeeAccountId;
}

// GET FORM DATA
function getEmployeeFormData(form) {
  return Object.fromEntries(
    new FormData(form).entries()
  );
}

// CREATE TABLE CELL
function createTableCell(value) {
  const cell = document.createElement("td");

  cell.textContent = value ?? "—";

  return cell;
}

// CREATE EMPLOYEE ROW
function createEmployeeRow(employee) {
  const row = document.createElement("tr");

  // Store the ID behind the scenes.
  row.dataset.employeeId = getEmployeeId(employee);

  // Make the entire row clickable.
  row.classList.add("clickableRow");
  row.tabIndex = 0;
  row.setAttribute("role", "button");

  row.setAttribute(
    "aria-label",
    `Edit employee ${employee.firstName} ${employee.lastName}`
  );

  const values = [
    employee.firstName,
    employee.lastName,
    employee.email,
    getEmployeeRole(employee),
    employee.contactNumber,
    employee.address,
    employee.accountStatus,
    formatDateTime(employee.createdAt)
  ];

  values.forEach((value) => {
    row.appendChild(createTableCell(value));
  });

  // Clicking the row opens the edit dialog.
  row.addEventListener("click", () => {
    openEditEmployee(employee);
  });

  // Keyboard accessibility.
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEditEmployee(employee);
    }
  });

  return row;
}

// LOAD EMPLOYEES
async function loadEmployees() {
  const tableBody = document.getElementById(
    "employeesTableBody"
  );

  if (!tableBody) {
    console.error("Employees: Table body was not found.");
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="8">Loading employees...</td>
    </tr>
  `;

  try {
    const response = await fetch("/api/employees", {
      method: "GET",
      credentials: "same-origin"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load employees."
      );
    }

    const employees = result.data;

    if (!Array.isArray(employees)) {
      throw new Error("Invalid employee response.");
    }

    if (employees.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">No employees available.</td>
        </tr>
      `;
      return;
    }

    tableBody.replaceChildren();

    employees.forEach((employee) => {
      tableBody.appendChild(
        createEmployeeRow(employee)
      );
    });
  }
  catch (error) {
    console.error("Load Employees:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="8">Failed to load employees.</td>
      </tr>
    `;

    showError(error.message || "Failed to load employees.");
  }
}

// OPEN CREATE DIALOG
function openCreateEmployee() {
  const form = document.getElementById("employeeForm");
  const modal = document.getElementById("employeeModal");
  const createdAt = document.getElementById("createdAt");

  if (!form || !modal || !createdAt) {
    console.error(
      "Create Employee: One or more form elements were not found."
    );
    return;
  }

  form.reset();

  // Automatically set createdAt.
  createdAt.value = getCurrentDateTime();

  if (!modal.open) {
    modal.showModal();
  }
}

// OPEN EDIT DIALOG
function openEditEmployee(employee) {
  const modal = document.getElementById(
    "editEmployeeModal"
  );

  const employeeId = document.getElementById(
    "editEmployeeId"
  );

  const firstName = document.getElementById(
    "editFirstName"
  );

  const lastName = document.getElementById(
    "editLastName"
  );

  const email = document.getElementById(
    "editEmail"
  );

  const role = document.getElementById(
    "editRole"
  );

  const contactNumber = document.getElementById(
    "editContactNumber"
  );

  const address = document.getElementById(
    "editAddress"
  );

  const accountStatus = document.getElementById(
    "editAccountStatus"
  );

  const createdAt = document.getElementById(
    "editCreatedAt"
  );

  const passwordHash = document.getElementById(
    "editPasswordHash"
  );

  if (
    !modal ||
    !employeeId ||
    !firstName ||
    !lastName ||
    !email ||
    !role ||
    !contactNumber ||
    !address ||
    !accountStatus ||
    !createdAt ||
    !passwordHash
  ) {
    console.error(
      "Edit Employee: One or more form elements were not found."
    );
    return;
  }

  employeeId.value = getEmployeeId(employee);
  firstName.value = employee.firstName ?? "";
  lastName.value = employee.lastName ?? "";
  email.value = employee.email ?? "";
  role.value = getEmployeeRole(employee);
  contactNumber.value = employee.contactNumber ?? "";
  address.value = employee.address ?? "";
  accountStatus.value = employee.accountStatus ?? "";
  createdAt.value = employee.createdAt ?? "";

  // Never prefill the password field.
  passwordHash.value = "";

  if (!modal.open) {
    modal.showModal();
  }
}

// CLOSE DIALOG
function closeDialog(dialogId) {
  const modal = document.getElementById(dialogId);

  if (!modal) {
    console.error(
      `Close Dialog: ${dialogId} was not found.`
    );
    return;
  }

  modal.close();
}

// CONFIGURE ROLE PERMISSIONS
function configureRolePermissions(role) {
  const isManager = role === "manager";

  const canManageEmployees =
    role === "manager" ||
    role === "assistant manager";

  const createButton = document.getElementById(
    "createEmployeeButton"
  );

  const createPasswordGroup = document.getElementById(
    "createPasswordGroup"
  );

  const passwordHash = document.getElementById(
    "passwordHash"
  );

  const editPasswordGroup = document.getElementById(
    "editPasswordGroup"
  );

  const editPasswordHash = document.getElementById(
    "editPasswordHash"
  );

  const deleteButton = document.getElementById(
    "deleteEmployeeButton"
  );

  if (
    !createButton ||
    !createPasswordGroup ||
    !passwordHash ||
    !editPasswordGroup ||
    !editPasswordHash ||
    !deleteButton
  ) {
    console.error(
      "Employee Permissions: One or more elements were not found."
    );
    return;
  }

  // Create employee permissions.
  createButton.hidden = !canManageEmployees;
  createPasswordGroup.hidden = !canManageEmployees;

  // Creating an employee requires a password.
  passwordHash.required = canManageEmployees;

  // Edit employee permissions.
  editPasswordGroup.hidden = !isManager;
  editPasswordHash.disabled = !isManager;

  // Only managers can delete employees.
  deleteButton.hidden = !isManager;
}

// LOAD LOGGED-IN EMPLOYEE
async function loadLoggedEmployee() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch logged-in employee."
    );
  }

  return result.data ?? result.employee ?? result;
}

// CREATE EMPLOYEE
async function createEmployee(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = getEmployeeFormData(form);

  // Automatically set createdAt at submission time.
  data.createdAt = getCurrentDateTime();

  try {
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to create employee."
      );
    }

    closeDialog("employeeModal");
    form.reset();

    showSuccess("Employee created successfully.");

    await loadEmployees();
  }
  catch (error) {
    console.error("Create Employee:", error);

    showError(
      error.message || "Failed to create employee."
    );
  }
}

// UPDATE EMPLOYEE
async function updateEmployee(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const employeeId = document.getElementById(
    "editEmployeeId"
  ).value;

  const data = getEmployeeFormData(form);

  // Preserve the original createdAt value.
  data.createdAt = document.getElementById(
    "editCreatedAt"
  ).value;

  // Do not submit an empty password.
  // An empty password means keep the existing password.
  if (!data.passwordHash) {
    delete data.passwordHash;
  }

  // Assistant managers must not change passwords.
  if (currentEmployeeRole !== "manager") {
    delete data.passwordHash;
  }

  try {
    const response = await fetch(
      `/api/employees/${employeeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to update employee."
      );
    }

    closeDialog("editEmployeeModal");

    showSuccess("Employee updated successfully.");

    await loadEmployees();
  }
  catch (error) {
    console.error("Update Employee:", error);

    showError(
      error.message || "Failed to update employee."
    );
  }
}

// DELETE EMPLOYEE
async function deleteEmployee() {
  const employeeId = document.getElementById(
    "editEmployeeId"
  ).value;

  if (!employeeId) {
    showError("No employee was selected.");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete this employee?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `/api/employees/${employeeId}`,
      {
        method: "DELETE",
        credentials: "same-origin"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to delete employee."
      );
    }

    closeDialog("editEmployeeModal");

    showSuccess("Employee deleted successfully.");

    await loadEmployees();
  }
  catch (error) {
    console.error("Delete Employee:", error);

    showError(
      error.message || "Failed to delete employee."
    );
  }
}

// CURRENT LOGGED-IN EMPLOYEE ROLE
let currentEmployeeRole = "";

// INITIALIZE EMPLOYEES PAGE
export async function initEmployeesPage() {
  const employeeModal = document.getElementById(
    "employeeModal"
  );

  const editEmployeeModal = document.getElementById(
    "editEmployeeModal"
  );

  const employeeForm = document.getElementById(
    "employeeForm"
  );

  const editEmployeeForm = document.getElementById(
    "editEmployeeForm"
  );

  const createButton = document.getElementById(
    "createEmployeeButton"
  );

  const closeButton = document.getElementById(
    "closeEmployeeModal"
  );

  const cancelButton = document.getElementById(
    "cancelEmployeeButton"
  );

  const closeEditButton = document.getElementById(
    "closeEditEmployeeModal"
  );

  const cancelEditButton = document.getElementById(
    "cancelEditEmployeeButton"
  );

  const deleteButton = document.getElementById(
    "deleteEmployeeButton"
  );

  const requiredElements = [
    employeeModal,
    editEmployeeModal,
    employeeForm,
    editEmployeeForm,
    document.getElementById("employeesTableBody"),
    createButton,
    closeButton,
    cancelButton,
    closeEditButton,
    cancelEditButton,
    deleteButton
  ];

  if (requiredElements.some((element) => !element)) {
    console.error(
      "Employees: One or more required HTML elements were not found."
    );
    return;
  }

  try {
    const loggedEmployee = await loadLoggedEmployee();

    currentEmployeeRole = getEmployeeRole(loggedEmployee);

    // Configure the interface based on the logged-in role.
    configureRolePermissions(currentEmployeeRole);

    // Only managers and assistant managers may access this page.
    if (
      currentEmployeeRole !== "manager" &&
      currentEmployeeRole !== "assistant manager"
    ) {
      showError(
        "You are not authorized to access employees."
      );
      return;
    }

    await loadEmployees();

    // CREATE DIALOG
    createButton.addEventListener("click", () => {
      openCreateEmployee();
    });

    closeButton.addEventListener("click", () => {
      closeDialog("employeeModal");
    });

    cancelButton.addEventListener("click", () => {
      closeDialog("employeeModal");
    });

    // EDIT DIALOG
    closeEditButton.addEventListener("click", () => {
      closeDialog("editEmployeeModal");
    });

    cancelEditButton.addEventListener("click", () => {
      closeDialog("editEmployeeModal");
    });

    // CREATE EMPLOYEE
    employeeForm.addEventListener(
      "submit",
      createEmployee
    );

    // UPDATE EMPLOYEE
    editEmployeeForm.addEventListener(
      "submit",
      updateEmployee
    );

    // DELETE EMPLOYEE
    deleteButton.addEventListener(
      "click",
      deleteEmployee
    );
  }
  catch (error) {
    console.error("Initialize Employees:", error);

    showError(
      error.message || "Failed to initialize employee page."
    );
  }
}
