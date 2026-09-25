import { showError } from "../utils/message.js";
import { formatDateTime } from "../utils/dateUtils.js";

const allowedRoles = ["admin","manager", "assistant manager"];

// LOAD LOGGED-IN EMPLOYEE
async function loadLoggedEmployee() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch logged-in employee.");
  }

  return result.employee ?? result;
}

// CONFIGURE ROLE PERMISSIONS
function configureRolePermissions(role) {
  const createButton = document.getElementById("createEmployeeButton");
  const createPasswordGroup = document.getElementById("createPasswordGroup");
  const password = document.getElementById("password");
  const editPasswordGroup = document.getElementById("editPasswordGroup");
  const editPassword = document.getElementById("editPassword");
  const deleteButton = document.getElementById("deleteEmployeeButton");

  if (!createButton || !createPasswordGroup || !password || !editPasswordGroup || !editPassword || !deleteButton) {
    throw new Error("Employee permission elements were not found.");
  }

  const canManageEmployees = role === "admin" || role === "manager" || role === "assistant manager";
  const canChangePassword = role === "admin" || role === "manager";
  const canDeleteEmployees = role === "admin" || role === "manager";

  createButton.hidden = !canManageEmployees;
  createPasswordGroup.hidden = !canManageEmployees;
  password.required = canManageEmployees;

  editPasswordGroup.hidden = !canChangePassword;
  editPassword.disabled = !canChangePassword;

  deleteButton.hidden = !canDeleteEmployees;
}


// LOAD EMPLOYEE ROLES
async function loadEmployeeRoles() {
  const roleSelect = document.getElementById("roleId");
  const editRoleSelect = document.getElementById("editRoleId");

  if (!roleSelect || !editRoleSelect) {
    throw new Error(
      "Employee role fields were not found."
    );
  }

  roleSelect.innerHTML = `
    <option value="" selected disabled>
      Loading roles...
    </option>
  `;

  editRoleSelect.innerHTML = `
    <option value="" selected disabled>
      Loading roles...
    </option>
  `;

  const response = await fetch("/api/employee-role", {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();
  console.log("loadEmployeeRoles()",result);
  if (!response.ok) {
    throw new Error(result.message || "Failed to load employee roles.");
  }

  const roles = result.data;

  if (!Array.isArray(roles)) {
    throw new Error("Invalid employee role response.");
  }

  roleSelect.replaceChildren();
  editRoleSelect.replaceChildren();

  const createPlaceholder = document.createElement("option");
  createPlaceholder.value = "";
  createPlaceholder.textContent = "Select role";
  createPlaceholder.disabled = true;
  createPlaceholder.selected = true;

  const editPlaceholder = document.createElement("option");
  editPlaceholder.value = "";
  editPlaceholder.textContent = "Select role";
  editPlaceholder.disabled = true;
  editPlaceholder.selected = true;

  roleSelect.appendChild(createPlaceholder);
  editRoleSelect.appendChild(editPlaceholder);

  roles.forEach((role) => {
    const createOption = document.createElement("option");
    createOption.value = role.roleId;
    createOption.textContent = role.roleName;

    const editOption = document.createElement("option");
    editOption.value = role.roleId;
    editOption.textContent = role.roleName;

    roleSelect.appendChild(createOption);
    editRoleSelect.appendChild(editOption);
  });
}

// OPEN EDIT EMPLOYEE
function openEditEmployee(employee) {
  const editEmployeeModal = document.getElementById("editEmployeeModal");
  const editEmployeeForm = document.getElementById("editEmployeeForm");
  const editEmployeeId = document.getElementById("editEmployeeId");
  const editFirstName = document.getElementById("editFirstName");
  const editLastName = document.getElementById("editLastName");
  const editEmail = document.getElementById("editEmail");
  const editPassword = document.getElementById("editPassword");
  const editRoleId = document.getElementById("editRoleId");
  const editContactNumber = document.getElementById("editContactNumber");
  const editAddress = document.getElementById("editAddress");
  const editAccountStatus = document.getElementById("editAccountStatus");
  const editCreatedAt = document.getElementById("editCreatedAt");

  const requiredElements = [
    editEmployeeModal,
    editEmployeeForm,
    editEmployeeId,
    editFirstName,
    editLastName,
    editEmail,
    editPassword,
    editRoleId,
    editContactNumber,
    editAddress,
    editAccountStatus,
    editCreatedAt
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Employees: One or more edit employee elements were not found.");
    return;
  }

  if (!employee) {
    console.error("Employees: Employee data was not provided.");
    return;
  }

  editEmployeeId.value = employee.employeeAccountId ?? "";
  editFirstName.value = employee.firstName ?? "";
  editLastName.value = employee.lastName ?? "";
  editEmail.value = employee.email ?? "";
  editPassword.value = "";
  editRoleId.value = employee.roleId ?? "";
  editContactNumber.value = employee.contactNumber ?? "";
  editAddress.value = employee.address ?? "";
  editAccountStatus.value = employee.accountStatus ?? "active";
  editCreatedAt.value = employee.createdAt ?? "";

  editEmployeeModal.showModal();
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

  row.dataset.employeeId = employee.employeeAccountId;

  row.appendChild(createTableCell(employee.firstName));
  row.appendChild(createTableCell(employee.lastName));
  row.appendChild(createTableCell(employee.email));
  row.appendChild(createTableCell(employee.roleName));
  row.appendChild(createTableCell(employee.contactNumber));
  row.appendChild(createTableCell(employee.address));
  row.appendChild(createTableCell(employee.accountStatus));
  row.appendChild(createTableCell(formatDateTime(employee.createdAt)));

  row.addEventListener("click", () => {openEditEmployee(employee);});

  return row;
}

// LOAD EMPLOYEES
async function loadEmployees() {
  const tableBody = document.getElementById("employeesTableBody");

  if (!tableBody) {
    console.error("Employees: Table body was not found.");
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="8">
        Loading employees...
      </td>
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
        result.message ||
        "Failed to load employees."
      );
    }

    const employees = result.data;

    if (!Array.isArray(employees)) {
      throw new Error(
        "Invalid employee response."
      );
    }

    if (employees.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            No employees available.
          </td>
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
        <td colspan="8">
          Failed to load employees.
        </td>
      </tr>
    `;

    showError(
      error.message ||
      "Failed to load employees."
    );
  }
}


// INITIALIZE EMPLOYEES PAGE
export async function initEmployeesPage() {
  const employeeModal = document.getElementById("employeeModal");
  const editEmployeeModal = document.getElementById("editEmployeeModal");
  const employeeForm = document.getElementById("employeeForm");
  const editEmployeeForm = document.getElementById("editEmployeeForm");
  const employeesTableBody = document.getElementById("employeesTableBody");
  const createButton = document.getElementById("createEmployeeButton");
  const closeButton = document.getElementById("closeEmployeeModal");
  const cancelButton = document.getElementById("cancelEmployeeButton");
  const closeEditButton = document.getElementById("closeEditEmployeeModal");
  const cancelEditButton = document.getElementById("cancelEditEmployeeButton");
  const deleteButton = document.getElementById("deleteEmployeeButton");

  const requiredElements = [
    employeeModal,
    editEmployeeModal,
    employeeForm,
    editEmployeeForm,
    employeesTableBody,
    createButton,
    closeButton,
    cancelButton,
    closeEditButton,
    cancelEditButton,
    deleteButton
  ];

  if (requiredElements.some((element) => !element)) {
    console.error("Employees: One or more required HTML elements were not found.");
    return;
  }

  try {
    const loggedEmployee = await loadLoggedEmployee();
    const employeeRole = loggedEmployee.roleName;
    console.log("role: ", employeeRole);


    if (!allowedRoles.includes(employeeRole)) {
      showError("You are not authorized to access employees.");
      return;
    }

    configureRolePermissions(employeeRole);

    await loadEmployeeRoles();
    await loadEmployees();

    createButton.addEventListener("click", openCreateEmployee);
    closeButton.addEventListener("click", () => closeDialog("employeeModal"));
    cancelButton.addEventListener("click", () => closeDialog("employeeModal"));
    closeEditButton.addEventListener("click", () => closeDialog("editEmployeeModal"));
    cancelEditButton.addEventListener("click", () => closeDialog("editEmployeeModal"));
    employeeForm.addEventListener("submit", createEmployee);
    editEmployeeForm.addEventListener("submit", updateEmployee);
    deleteButton.addEventListener("click", deleteEmployee);
  }
  catch (error) {
    console.error("Initialize Employees:",  error);
    showError(error.message || "Failed to initialize employee page.");
  }
}

// Event lister helper funcitons - - - - - - - - - - - - - - - - - - - -

// OPEN CREATE EMPLOYEE
function openCreateEmployee() {
  const employeeModal = document.getElementById("employeeModal");
  const employeeForm = document.getElementById("employeeForm");

  if (!employeeModal || !employeeForm) {
    console.error("Employees: Create employee elements were not found.");
    return;
  }

  employeeForm.reset();
  employeeModal.showModal();
}

// CLOSE DIALOG
function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);

  if (!dialog) {
    console.error(`Employees: #${dialogId} was not found.`);
    return;
  }

  dialog.close();
}

// CREATE EMPLOYEE
async function createEmployee(event) {
  event.preventDefault();

  const employeeForm = event.currentTarget;
  const employeeData = Object.fromEntries(
    new FormData(employeeForm).entries()
  );

  try {
    const response = await fetch("/api/employees", {
      method: "POST",
      credentials: "same-origin",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(employeeData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to create employee."
      );
    }

    closeDialog("employeeModal");
    employeeForm.reset();

    await loadEmployees();
  }
  catch (error) {
    console.error("Create Employee:", error);
    showError(error.message || "Failed to create employee.");
  }
}

// UPDATE EMPLOYEE
async function updateEmployee(event) {
  event.preventDefault();

  const employeeForm = event.currentTarget;
  const employeeData = Object.fromEntries(
    new FormData(employeeForm).entries()
  );
  console.log("employeeData: ", employeeData);

  if (!employeeData.password) {
    delete employeeData.password;
  }

  try {
    const response = await fetch( `/api/employees/${employeeData.employeeAccountId}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(employeeData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to update employee."
      );
    }

    closeDialog("editEmployeeModal");

    await loadEmployees();
  }
  catch (error) {
    console.error("Update Employee:", error);
    showError(error.message || "Failed to update employee.");
  }
}

// DELETE EMPLOYEE
async function deleteEmployee() {
  const employeeId = document.getElementById("editEmployeeId");

  if (!employeeId || !employeeId.value) {
    showError("Employee ID was not found.");
    return;
  }

  try {
    const response = await fetch(`/api/employees/${employeeId.value}`, {
        method: "DELETE",
        credentials: "same-origin"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to delete employee."
      );
    }

    closeDialog("editEmployeeModal");

    await loadEmployees();
  }
  catch (error) {
    console.error("Delete Employee:", error);
    showError(error.message || "Failed to delete employee.");
  }
}