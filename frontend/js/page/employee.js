// LOAD EMPLOYEES
async function loadEmployees() {
  const tableBody = document.getElementById(
    "employeesTableBody"
  );

  if (!tableBody) {
    console.error(
      "Employees: Table body was not found."
    );

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
    const response = await fetch(
      "/api/employees",
      {
        method: "GET",
        credentials: "same-origin"
      }
    );

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
    console.error(
      "Load Employees:",
      error
    );

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

  const employeesTableBody = document.getElementById(
    "employeesTableBody"
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
    employeesTableBody,
    createButton,
    closeButton,
    cancelButton,
    closeEditButton,
    cancelEditButton,
    deleteButton
  ];

  if (
    requiredElements.some(
      (element) => !element
    )
  ) {
    console.error(
      "Employees: One or more required HTML elements were not found."
    );

    return;
  }

  try {
    const loggedEmployee =
      await loadLoggedEmployee();

    currentEmployeeRole =
      getEmployeeRole(loggedEmployee);

    const allowedRoles = [
      "admin",
      "manager",
      "assistant manager"
    ];

    if (
      !allowedRoles.includes(
        currentEmployeeRole
      )
    ) {
      showError(
        "You are not authorized to access employees."
      );

      return;
    }

    configureRolePermissions(
      currentEmployeeRole
    );

    await loadEmployeeRoles();

    await loadEmployees();

    createButton.addEventListener(
      "click",
      openCreateEmployee
    );

    closeButton.addEventListener(
      "click",
      () => {
        closeDialog("employeeModal");
      }
    );

    cancelButton.addEventListener(
      "click",
      () => {
        closeDialog("employeeModal");
      }
    );

    closeEditButton.addEventListener(
      "click",
      () => {
        closeDialog("editEmployeeModal");
      }
    );

    cancelEditButton.addEventListener(
      "click",
      () => {
        closeDialog("editEmployeeModal");
      }
    );

    employeeForm.addEventListener(
      "submit",
      createEmployee
    );

    editEmployeeForm.addEventListener(
      "submit",
      updateEmployee
    );

    deleteButton.addEventListener(
      "click",
      deleteEmployee
    );
  }
  catch (error) {
    console.error(
      "Initialize Employees:",
      error
    );

    showError(
      error.message ||
      "Failed to initialize employee page."
    );
  }
}