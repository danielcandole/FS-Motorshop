
function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(
    String(value).replace(" ", "T")
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// Returns a local datetime string suitable for a datetime-local input.
// Here, createdAt is stored as a local MySQL DATETIME value.
function getCurrentDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

function showError(message) {
  alert(message);
}

function showSuccess(message) {
  alert(message);
}

function getEmployeeRole(employee) {
  return employee?.role || employee?.roleName || "";
}

function getEmployeeId(employee) {
  return employee.employeeAccountId;
}

function getEmployeeFormData(form) {
  return Object.fromEntries(
    new FormData(form).entries()
  );
}

function createTableCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "";
  return cell;
}

function createEmployeeRow(employee) {
  const row = document.createElement("tr");

  row.classList.add("clickableRow");
  row.dataset.employeeId = getEmployeeId(employee);
  row.tabIndex = 0;
  row.setAttribute("role", "button");

  row.setAttribute(
    "aria-label",
    `Edit employee ${employee.firstName} ${employee.lastName}`
  );

  row.append(
    createTableCell(employee.firstName),
    createTableCell(employee.lastName),
    createTableCell(employee.email),
    createTableCell(employee.role),
    createTableCell(employee.contactNumber),
    createTableCell(employee.address),
    createTableCell(employee.accountStatus),
    createTableCell(formatDateTime(employee.createdAt))
  );

  row.addEventListener("click", () => {
    openEditEmployee(employee);
  });

  row.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEditEmployee(employee);
    }
  });

  return row;
}

async function loadEmployees() {
  try {
    const response = await fetch("/api/employees");

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to fetch employees."
      );
    }

    const employees = result.data;
    const tableBody = document.getElementById(
      "employeesTableBody"
    );

    tableBody.replaceChildren();

    if (!Array.isArray(employees)) {
      throw new Error("Invalid employee response.");
    }

    employees.forEach(employee => {
      tableBody.appendChild(
        createEmployeeRow(employee)
      );
    });
  }
  catch (error) {
    console.error("Load Employees:", error);
    showError(error.message || "Failed to load employees.");
  }
}

function openCreateEmployee() {
  const form = document.getElementById("employeeForm");

  form.reset();

  // Automatically set createdAt when opening the create dialog.
  document.getElementById("createdAt").value =
    getCurrentDateTime();

  document.getElementById("employeeModal").showModal();
}

function openEditEmployee(employee) {
  const modal = document.getElementById(
    "editEmployeeModal"
  );

  document.getElementById("editEmployeeId").value =
    getEmployeeId(employee);

  document.getElementById("editFirstName").value =
    employee.firstName ?? "";

  document.getElementById("editLastName").value =
    employee.lastName ?? "";

  document.getElementById("editEmail").value =
    employee.email ?? "";

  document.getElementById("editRole").value =
    employee.role ?? "";

  document.getElementById("editContactNumber").value =
    employee.contactNumber ?? "";

  document.getElementById("editAddress").value =
    employee.address ?? "";

  document.getElementById("editAccountStatus").value =
    employee.accountStatus ?? "";

  document.getElementById("editCreatedAt").value =
    employee.createdAt ?? "";

  // Clear password whenever a different employee is opened.
  document.getElementById("editPasswordHash").value = "";

  modal.showModal();
}

function closeDialog(dialogId) {
  document.getElementById(dialogId).close();
}

function configureRolePermissions(role) {
  const isManager = role === "manager";
  const canManageEmployees =
    role === "manager" || role === "assistant manager";

  // Create employee permissions
  document.getElementById(
    "createEmployeeButton"
  ).hidden = !canManageEmployees;

  document.getElementById(
    "createPasswordGroup"
  ).hidden = !canManageEmployees;

  document.getElementById(
    "passwordHash"
  ).required = canManageEmployees;

  // Edit employee permissions
  document.getElementById(
    "editPasswordGroup"
  ).hidden = !isManager;

  document.getElementById(
    "editPasswordHash"
  ).disabled = !isManager;

  // Only managers can delete employees.
  document.getElementById(
    "deleteEmployeeButton"
  ).hidden = !isManager;
}

async function loadLoggedEmployee() {
  const response = await fetch("/api/auth/me");

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch logged-in employee."
    );
  }

  return result.data ?? result.employee ?? result;
}

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
    showError(error.message || "Failed to create employee.");
  }
}

async function updateEmployee(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const employeeId = document.getElementById(
    "editEmployeeId"
  ).value;

  const data = getEmployeeFormData(form);

  // Do not submit an empty password.
  // An empty password means keep the existing password.
  if (!data.passwordHash) {
    delete data.passwordHash;
  }

  // Preserve original createdAt.
  data.createdAt = document.getElementById(
    "editCreatedAt"
  ).value;

  try {
    const response = await fetch(
      `/api/employees/${employeeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
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
    showError(error.message || "Failed to update employee.");
  }
}

async function deleteEmployee() {
  const employeeId = document.getElementById(
    "editEmployeeId"
  ).value;

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
        method: "DELETE"
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
    showError(error.message || "Failed to delete employee.");
  }
}

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

  const requiredElements = [
    employeeModal,
    editEmployeeModal,
    employeeForm,
    editEmployeeForm,
    document.getElementById("employeesTableBody"),
    document.getElementById("createEmployeeButton"),
    document.getElementById("deleteEmployeeButton")
  ];

  if (requiredElements.some(element => !element)) {
    console.error(
      "Employee page initialization failed: missing HTML elements."
    );

    return;
  }

  try {
    const loggedEmployee = await loadLoggedEmployee();

    const role = getEmployeeRole(loggedEmployee);

    configureRolePermissions(role);

    // Only managers and assistant managers may access this page.
    if (
      role !== "manager" &&
      role !== "assistant manager"
    ) {
      showError("You are not authorized to access employees.");

      return;
    }

    await loadEmployees();

    document.getElementById(
      "createEmployeeButton"
    ).addEventListener("click", openCreateEmployee);

    document.getElementById(
      "closeEmployeeModal"
    ).addEventListener("click", () => {
      closeDialog("employeeModal");
    });

    document.getElementById(
      "cancelEmployeeButton"
    ).addEventListener("click", () => {
      closeDialog("employeeModal");
    });

    document.getElementById(
      "closeEditEmployeeModal"
    ).addEventListener("click", () => {
      closeDialog("editEmployeeModal");
    });

    document.getElementById(
      "cancelEditEmployeeButton"
    ).addEventListener("click", () => {
      closeDialog("editEmployeeModal");
    });

    employeeForm.addEventListener(
      "submit",
      createEmployee
    );

    editEmployeeForm.addEventListener(
      "submit",
      updateEmployee
    );

    document.getElementById(
      "deleteEmployeeButton"
    ).addEventListener("click", deleteEmployee);
  }
  catch (error) {
    console.error("Initialize Employees:", error);

    showError(
      error.message || "Failed to initialize employee page."
    );
  }
}
