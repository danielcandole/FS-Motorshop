import { setDefaultDate, dateFormat, toDateTimeLocalValue } from "../utils/dateUtils.js";

// LOAD JOB ORDERS
async function loadJobOrders() {
  const jobOrdersList = document.getElementById("jobOrdersTableBody");

  if (!jobOrdersList) {
    console.error("Job Orders: List container was not found.");
    return;
  }

  jobOrdersList.textContent = "Loading job orders...";

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
      jobOrdersList.textContent = "No job orders available.";
      return;
    }

    // GROUP JOB ORDERS AND THEIR ITEMS
    const groupedJobOrders = new Map();

    jobOrders.forEach((row) => {
      let jobOrder = groupedJobOrders.get(row.jobOrderId);

      if (!jobOrder) {
        jobOrder = {
          jobOrderId: row.jobOrderId,
          customerRecordId: row.customerRecordId,
          customerName: row.customerName,
          contactNo: row.contactNo,
          motorcycleRecordId: row.motorcycleRecordId,
          motorcycleName: row.motorcycleName,
          motorcycleModel: row.motorcycleModel,
          repairDate: row.repairDate,
          description: row.description,
          repairStatus: row.repairStatus,
          serviceRecord: null,
          jobOrderItems: []
        };

        groupedJobOrders.set(row.jobOrderId, jobOrder);
      }

      // SERVICE RECORD
      if (row.serviceRecordId && !jobOrder.serviceRecord) {
        jobOrder.serviceRecord = {
          serviceRecordId: row.serviceRecordId,
          serviceType: row.serviceType,
          serviceDescription: row.serviceDescription,
          laborCharge: row.laborCharge
        };
      }

      // JOB ORDER ITEMS
      if (row.jobOrderItemId) {
        jobOrder.jobOrderItems.push({
          jobOrderItemId: row.jobOrderItemId,
          itemName: row.itemName,
          quantityUsed: row.quantityUsed,
          unitPrice: row.unitPrice
        });
      }
    });

    jobOrdersList.replaceChildren();

    groupedJobOrders.forEach((jobOrder) => {
      const card = document.createElement("article");
      card.classList.add("jobOrderCard");

      // HEADER
      const header = document.createElement("header");
      header.classList.add("jobOrderCardHeader");

      const title = document.createElement("h3");
      title.textContent = `JOB ORDER #${String(jobOrder.jobOrderId).padStart(3, "0")}`;

      const actions = document.createElement("div");
      actions.classList.add("jobOrderCardActions");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.classList.add("secondaryButton");
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        openEditJobOrder(jobOrder);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.classList.add("dangerButton");
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        deleteJobOrder(jobOrder.jobOrderId);
      });

      actions.append(editButton, deleteButton);
      header.append(title, actions);

      // JOB ORDER INFORMATION
      const information = document.createElement("section");
      information.classList.add("jobOrderInformation");

      const details = [
        ["Customer:", jobOrder.customerName],
        ["Motorcycle:", jobOrder.motorcycleName],
        ["Contact Number:", jobOrder.contactNo],
        ["Model:", jobOrder.motorcycleModel],
        ["Repair Date:", dateFormat(jobOrder.repairDate)],
        ["Status:", jobOrder.repairStatus],
        ["Reported Problem:", jobOrder.description]
      ];

      details.forEach(([label, value]) => {
        const detail = document.createElement("p");
        detail.classList.add("jobOrderDetail");

        const strong = document.createElement("strong");
        strong.textContent = label;

        const span = document.createElement("span");
        span.textContent = value ?? "—";

        detail.append(strong, document.createTextNode(" "), span);
        information.appendChild(detail);
      });

      // SERVICE RECORD
      const serviceSection = document.createElement("section");
      serviceSection.classList.add("jobOrderService");

      const serviceTitle = document.createElement("h4");
      serviceTitle.textContent = "SERVICE RECORD";

      const serviceTable = document.createElement("table");
      serviceTable.classList.add("jobOrderDetailsTable");

      const serviceHead = document.createElement("thead");
      const serviceHeadRow = document.createElement("tr");

      ["Service Type", "Description", "Labor Charge"].forEach((heading) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = heading;
        serviceHeadRow.appendChild(th);
      });

      serviceHead.appendChild(serviceHeadRow);

      const serviceBody = document.createElement("tbody");
      const serviceRow = document.createElement("tr");

      const service = jobOrder.serviceRecord;

      [
        service?.serviceType ?? "—",
        service?.serviceDescription ?? "—",
        service
          ? `₱${Number(service.laborCharge).toFixed(2)}`
          : "—"
      ].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        serviceRow.appendChild(td);
      });

      serviceBody.appendChild(serviceRow);
      serviceTable.append(serviceHead, serviceBody);
      serviceSection.append(serviceTitle, serviceTable);

      // JOB ORDER ITEMS
      const itemsSection = document.createElement("section");
      itemsSection.classList.add("jobOrderItems");

      const itemsTitle = document.createElement("h4");
      itemsTitle.textContent = "JOB ORDER ITEMS";

      const itemsTable = document.createElement("table");
      itemsTable.classList.add("jobOrderDetailsTable");

      const itemsHead = document.createElement("thead");
      const itemsHeadRow = document.createElement("tr");

      ["Item", "Quantity Used", "Unit Price"].forEach((heading) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = heading;
        itemsHeadRow.appendChild(th);
      });

      itemsHead.appendChild(itemsHeadRow);

      const itemsBody = document.createElement("tbody");

      if (jobOrder.jobOrderItems.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.textContent = "No parts used.";

        row.appendChild(cell);
        itemsBody.appendChild(row);
      } else {
        jobOrder.jobOrderItems.forEach((item) => {
          const row = document.createElement("tr");

          [
            item.itemName ?? "—",
            item.quantityUsed ?? "—",
            `₱${Number(item.unitPrice).toFixed(2)}`
          ].forEach((value) => {
            const td = document.createElement("td");
            td.textContent = value;
            row.appendChild(td);
          });

          itemsBody.appendChild(row);
        });
      }

      itemsTable.append(itemsHead, itemsBody);
      itemsSection.append(itemsTitle, itemsTable);

      // APPEND CARD
      card.append(
        header,
        information,
        serviceSection,
        itemsSection
      );

      jobOrdersList.appendChild(card);
    });
  }
  catch (error) {
    console.error("Load Job Orders:", error);
    jobOrdersList.textContent = "Failed to load job orders.";
  }
}

// LOAD INVENTORY ITEMS
async function loadInventoryItems() {
  const response = await fetch("/api/inventory-items", {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load inventory items."
    );
  }

  return result.data;
}

// ADD JOB ORDER ITEM
function addJobOrderItem(inventoryItems) {
  const template = document.getElementById("jobOrderItemTemplate");
  const container = document.getElementById("jobOrderItemsTableBody");

  if (!template || !container) {
    console.error("Job Order Items: Required elements were not found.");
    return;
  }

  const row = template.content.firstElementChild.cloneNode(true);
  const inventorySelect = row.querySelector(".jobOrderItemInventory");
  const quantityInput = row.querySelector(".jobOrderItemQuantity");
  const unitPriceInput = row.querySelector(".jobOrderItemUnitPrice");
  const removeButton = row.querySelector(".removeJobOrderItemButton");

  inventoryItems.forEach((item) => {
    const option = document.createElement("option");

    option.value = item.inventoryItemId;
    option.textContent = item.itemName;
    option.dataset.sellingPrice = item.sellingPrice;

    inventorySelect.appendChild(option);
  });

  inventorySelect.addEventListener("change", () => {
    const selectedOption = inventorySelect.selectedOptions[0];

    unitPriceInput.value = selectedOption.dataset.sellingPrice ?? "";
  });

  removeButton.addEventListener("click", () => {
    row.remove();
  });

  container.appendChild(row);
}

// GET JOB ORDER ITEMS
function getJobOrderItems() {
  const container = document.getElementById("jobOrderItemsTableBody");
  const rows = container.querySelectorAll(".jobOrderItemRow");

  return Array.from(rows).map((row) => ({
    inventoryItemId: Number(
      row.querySelector(".jobOrderItemInventory").value
    ),
    quantityUsed: Number(
      row.querySelector(".jobOrderItemQuantity").value
    ),
    unitPrice: Number(
      row.querySelector(".jobOrderItemUnitPrice").value
    )
  }));
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
  const closeEditButton = document.getElementById("closeEditJobOrderModal");
  const cancelEditButton = document.getElementById("cancelEditJobOrderButton");

  const addItemButton = document.getElementById("addJobOrderItemButton");
  const itemsContainer = document.getElementById("jobOrderItemsTableBody");
  // const deleteButton = document.getElementById(
  //   "deleteJobOrderButton"
  // );

  if (
    !createButton ||
    !modal ||
    !closeButton ||
    !cancelButton ||
    !form ||
    !editModal ||
    !editForm ||
    !closeEditButton ||
    !cancelEditButton  || 
    // || !deleteButton
    !addItemButton ||
    !itemsContainer
  ) {
    console.error(
      "Job Orders: One or more required HTML elements were not found."
    );
    return;
  }

  let inventoryItems = [];

  try {
    inventoryItems = await loadInventoryItems();
  } catch (error) {
    console.error("Load Inventory Items:", error);
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

    itemsContainer.replaceChildren();

    if (inventoryItems.length > 0) {
      addJobOrderItem(inventoryItems);
    }

    modal.showModal();
  });

  addItemButton.addEventListener("click", () => {
    if (inventoryItems.length === 0) {
      alert("No inventory items are available.");
      return;
    }

    addJobOrderItem(inventoryItems);
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

  // // DELETE JOB ORDER
  // deleteButton.addEventListener("click", async () => {
  //   const jobOrderId = document.getElementById(
  //     "editJobOrderId"
  //   ).value;

  //   if (!jobOrderId) {
  //     alert("No job order was selected.");
  //     return;
  //   }

  //   const confirmed = confirm(
  //     "Are you sure you want to delete this job order?"
  //   );

  //   if (!confirmed) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/job-orders/${jobOrderId}`,
  //       {
  //         method: "DELETE",
  //         credentials: "same-origin"
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(
  //         result.message || "Failed to delete job order."
  //       );
  //     }

  //     editModal.close();
  //     await loadJobOrders();

  //     alert("Job order deleted successfully.");
  //   }
  //   catch (error) {
  //     console.error("Delete Job Order:", error);
  //     alert(error.message);
  //   }
  // });

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
      repairStatus: formData.get("repairStatus"),
      serviceRecord: {
        serviceType: formData.get("serviceType"),
        serviceDescription: formData.get("serviceDescription"),
        laborCharge: Number(formData.get("laborCharge"))
      },
      jobOrderItems: getJobOrderItems()
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
      itemsContainer.replaceChildren();

      setDefaultDate("repairDate");

      await loadJobOrders();

      alert("Job order created successfully.");
    } catch (error) {
      console.error("Create Job Order:", error);
      alert(error.message);
    }
  });
}
