import { setDefaultDate, dateFormat } from "../utils/dateUtils.js";

async function loadJobOrders() {
  const tableBody = document.getElementById("jobOrdersTableBody");

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
    console.log("Job orders:", result.data);
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

      const values = [
        jobOrder.customerName,
        jobOrder.customerNo,
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



export async function initJobOrdersPage() {
  const createButton = document.getElementById("createJobOrderButton");
  const modal = document.getElementById("jobOrderModal");
  const closeButton = document.getElementById("closeJobOrderModal");
  const cancelButton = document.getElementById("cancelJobOrderButton");
  const form = document.getElementById("jobOrderForm");

  if (!createButton || !modal || !closeButton || !cancelButton || !form) {
    console.error("Job Orders: Required elements was not found.");
    return;
  }
  await loadJobOrders();
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
        }

        try {
          const response = await fetch("/api/job-orders", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "same-origin",
            body: JSON.stringify(jobOrderData)
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "Failed to create job order");
          }

          console.log("Job Order created: ", result);
          
          modal.close();
          form.reset();
          await loadJobOrders(); // fetch latest record
          //ToDo: reload job order to see the result
          //to do: pop up "added successfully" 
        }
        catch (error) {
          console.error("Create Job Order: ", error);
          alert(error.message);
        }
    });
}