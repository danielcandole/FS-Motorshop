import { setDefaultDate } from "../utils/dateUtils.js";

export function initJobOrdersPage() {
  const createButton = document.getElementById("createJobOrderButton");
  const modal = document.getElementById("jobOrderModal");
  const closeButton = document.getElementById("closeJobOrderButton");
  const cancelButton = document.getElementById("cancelJobOrderButton");
  const form = document.getElementById("jobOrderForm");

  if (!createButton || !modal || !closeButton || !cancelButton || !form) {
    console.error("Job Orders: Required elements was not found.");
    return;
  }

  createButton.addEventListener("click", () => {
    modal.showModal();
  });

  closeButton.addEventListener("click", () => {
    modal.closest();
  });

  cancelButton.addEventListener("click", () => {
    modal.closest();
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

        console.log("Job Order Data: ", jobOrderData);

        //TO Do: send data to your backend api

        modal.closest();
        form.reset();
        
        //to do: pop up - added successfully 
    });
}