import { setDefaultDate } from "../utils/dateUtils.js";

export function initJobOrdersPage() {
  const createButton = document.getElementById("createJobOrderButton");
  const modal = document.getElementById("jobOrderModal");
  const closeButton = document.getElementById("closeJobOrderModal");
  const cancelButton = document.getElementById("cancelJobOrderButton");
  const form = document.getElementById("jobOrderForm");

  if (!createButton || !modal || !closeButton || !cancelButton || !form) {
    console.error("Job Orders: Required elements was not found.");
    return;
  }

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
          reportedProblem: formData.get("reportedProblem") || null,
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

          //ToDo: reload job order to see the result
          //to do: pop up "added successfully" 
        }
        catch (error) {
          console.error("Create Job Order: ", error);
          alert(error.message);
        }
    });
}