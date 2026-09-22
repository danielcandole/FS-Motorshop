import { setDefaultDate, dateFormat, toDateTimeLocalValue } from "../utils/dateUtils.js";

// LOAD JOB ORDERS
async function loadJobOrders() {
  const tableBody = document.getElementById("jobOrdersTableBody");

  if (!tableBody) {
    console.error("Job Orders: Table body was not found.");
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="7">Loading job orders...</td>
    </tr>
  `;

  try {
    const response = await fetch("/api/job-orders", {
      method: "GET",
      credentials: "same-origin"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load job orders.");
    }

    const jobOrders = result.data;

    if (!Array.isArray(jobOrders) || jobOrders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">No job orders available.</td>
        </tr>
      `;
      return;
    }

    tableBody.replaceChildren();

    jobOrders.forEach((jobOrder) => {
      const row = document.createElement("tr");

      // Store the ID behind the scenes
      // It identifies the exact database record to edit/delete
      row.dataset.jobOrderId = jobOrder.jobOrderId;

      // Make the entire row visually and interactively clickable
      row.classList.add("clickableRow");
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute(
        "aria-label",
        `Edit job order ${jobOrder.jobOrderId}`
      );

      const values = [
        jobOrder.customerName,
        jobOrder.contactNo,
        jobOrder.motorcycleName,
        jobOrder.motorcycleModel,
        dateFormat(jobOrder.repairDate),
        jobOrder.description || "—",
        jobOrder.repairStatus
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "—";
        row.appendChild(cell);
      });

      // Clicking any part of the row opens the edit dialog
      row.addEventListener("click", () => {
        openEditJobOrder(jobOrder);
      });

      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEditJobOrder(jobOrder);
        }
      });

      tableBody.appendChild(row);
    });
  }
  catch (error) {
    console.error("Load Job Orders:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="7">Failed to load job orders.</td>
      </tr>
    `;
  }
}

// OPEN EDIT DIALOG

function openEditJobOrder(jobOrder) {
  const modal = document.getElementById("editJobOrderModal");

  if (!modal) {
    console.error("Edit Job Order: Dialog was not found.");
    return;
  }

  const jobOrderId = document.getElementById("editJobOrderId");
  const customerName = document.getElementById("editCustomerName");
  const customerContactNumber = document.getElementById(
    "editCustomerContactNumber"
  );
  const motorcycleName = document.getElementById("editMotorcycleName");
  const motorcycleModel = document.getElementById("editMotorcycleModel");
  const repairDate = document.getElementById("editRepairDate");
  const description = document.getElementById("editDescription");
  const repairStatus = document.getElementById("editRepairStatus");


  if (
    !jobOrderId ||
    !customerName ||
    !customerContactNumber ||
    !motorcycleName ||
    !motorcycleModel ||
    !repairDate ||
    !description ||
    !repairStatus
  ) {
    console.error("Edit Job Order: One or more form elements were not found.");
    return;
  }

  jobOrderId.value = jobOrder.jobOrderId;
  customerName.value = jobOrder.customerName ?? "";
  customerContactNumber.value = jobOrder.contactNo ?? "";
  motorcycleName.value = jobOrder.motorcycleName ?? "";
  motorcycleModel.value = jobOrder.motorcycleModel ?? "";

  repairDate.value = toDateTimeLocalValue(jobOrder.repairDate);

  description.value = jobOrder.description ?? "";
  repairStatus.value = jobOrder.repairStatus ?? "pending";

  if (!modal.open) {
    modal.showModal();
  }
}

// INITIALIZE JOB ORDERS PAGE
export async function initJobOrdersPage() {
  const createButton = document.getElementById("createJobOrderButton");
  const modal = document.getElementById("jobOrderModal");
  const closeButton = document.getElementById("closeJobOrderModal");
  const cancelButton = document.getElementById("cancelJobOrderButton");
  const form = document.getElementById("jobOrderForm");

  const editModal = document.getElementById("editJobOrderModal");
  const editForm = document.getElementById("editJobOrderForm");
  const closeEditButton = document.getElementById(
    "closeEditJobOrderModal"
  );
  const cancelEditButton = document.getElementById(
    "cancelEditJobOrderButton"
  );
  const deleteButton = document.getElementById(
    "deleteJobOrderButton"
  );

  if (
    !createButton ||
    !modal ||
    !closeButton ||
    !cancelButton ||
    !form ||
    !editModal ||
    !editForm ||
    !closeEditButton ||
    !cancelEditButton ||
    !deleteButton
  ) {
    console.error(
      "Job Orders: One or more required HTML elements were not found."
    );
    return;
  }

  await loadJobOrders();


  // CREATE DIALOG
  closeButton.addEventListener("click", () => {
    modal.close();
  });

  cancelButton.addEventListener("click", () => {
    modal.close();
  });

  createButton.addEventListener("click", () => {
    setDefaultDate("repairDate");
    modal.showModal();
  });

  // EDIT DIALOG
  closeEditButton.addEventListener("click", () => {
    editModal.close();
  });

  cancelEditButton.addEventListener("click", () => {
    editModal.close();
  });

  // SAVE CHANGES
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(editForm);
    const jobOrderId = formData.get("jobOrderId");

    const jobOrderData = {
      customerName: formData.get("customerName"),
      customerContactNumber: formData.get("customerContactNumber"),
      motorcycleName: formData.get("motorcycleName"),
      motorcycleModel: formData.get("motorcycleModel") || null,
      repairDate: formData.get("repairDate"),
      description: formData.get("description") || null,
      repairStatus: formData.get("repairStatus")
    };

    try {
      const response = await fetch(
        `/api/job-orders/${jobOrderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify(jobOrderData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update job order."
        );
      }

      editModal.close();
      await loadJobOrders();

      alert("Job order updated successfully.");
    }
    catch (error) {
      console.error("Update Job Order:", error);
      alert(error.message);
    }
  });

  // DELETE JOB ORDER
  deleteButton.addEventListener("click", async () => {
    const jobOrderId = document.getElementById(
      "editJobOrderId"
    ).value;

    if (!jobOrderId) {
      alert("No job order was selected.");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete this job order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/job-orders/${jobOrderId}`,
        {
          method: "DELETE",
          credentials: "same-origin"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete job order."
        );
      }

      editModal.close();
      await loadJobOrders();

      alert("Job order deleted successfully.");
    }
    catch (error) {
      console.error("Delete Job Order:", error);
      alert(error.message);
    }
  });

  // CREATE JOB ORDER
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const jobOrderData = {
      customerName: formData.get("customerName"),
      customerContactNumber: formData.get("customerContactNumber"),
      motorcycleName: formData.get("motorcycleName"),
      motorcycleModel: formData.get("motorcycleModel") || null,
      repairDate: formData.get("repairDate"),
      description: formData.get("description") || null,
      repairStatus: formData.get("repairStatus")
    };

    try {
      const response = await fetch("/api/job-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(jobOrderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create job order."
        );
      }

      modal.close();
      form.reset();


      setDefaultDate("repairDate");
      await loadJobOrders();
      alert("Job order created successfully.");
    }
    catch (error) {
      console.error("Create Job Order:", error);
      alert(error.message);
    }
  });
}
