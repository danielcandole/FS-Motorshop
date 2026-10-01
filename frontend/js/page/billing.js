import { setDefaultDate, dateFormat, toDateTimeLocalValue } from "../utils/dateUtils.js";

// FORMAT CURRENCY
function formatCurrency(amount) {
  return Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// UPDATE BILLING TOTALS
function updateBillingTotals(jobOrder) {
  const partsTotal = Number(jobOrder.partsTotal || 0);
  const laborTotal = Number(jobOrder.laborTotal || 0);
  const otherCharges = Number(document.getElementById("otherCharges").value || 0);
  const discount = Number(document.getElementById("discount").value || 0);
  const paymentAmount = Number(document.getElementById("paymentAmount").value || 0);

  const totalAmount = partsTotal + laborTotal + otherCharges - discount;
  const remainingBalance = totalAmount - paymentAmount;

  document.getElementById("totalAmount").textContent =
    `₱${formatCurrency(totalAmount)}`;

  document.getElementById("remainingBalance").textContent =
    `₱${formatCurrency(remainingBalance)}`;
}

// CREATE JOB ORDER BILL
async function createJobOrderBill(jobOrderId, dialog, setJobOrder) {
  const setBillingValue = (id, value) => {
    document.getElementById(id).textContent = value;
  };

  try {
    const response = await fetch(`/api/job-orders/${jobOrderId}/billing`, {
      method: "GET",
      credentials: "same-origin"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch billing data.");
    }

    const jobOrder = result.data;
    setJobOrder(jobOrder);

    setBillingValue(
      "billingJobOrderId",
      `JO-${String(jobOrder.jobOrderId).padStart(3, "0")}`
    );
    setBillingValue("billingCustomerName", jobOrder.customerName);
    setBillingValue("billingMotorcycleName", jobOrder.motorcycleName);

    document.getElementById("partsTotal").value =
      formatCurrency(jobOrder.partsTotal);

    document.getElementById("laborTotal").value =
      formatCurrency(jobOrder.laborTotal);

    document.getElementById("otherCharges").value = 0;
    document.getElementById("discount").value = 0;
    document.getElementById("paymentAmount").value = "";

    setDefaultDate("paymentDate");

    updateBillingTotals(jobOrder);
    dialog.showModal();
  }
  catch (error) {
    console.error("Create Job Order Bill:", error);
    alert(error.message);
  }
}

// INITIALIZE BILLING DIALOG
export function initBillingDialog() {
  const billingDialog = document.getElementById("billingDialog");
  const billingForm = document.getElementById("billingForm");
  const closeBillingButton = document.getElementById("closeBillingDialog");
  const cancelBillingButton = document.getElementById("cancelBilling");

  const otherChargesInput = document.getElementById("otherCharges");
  const discountInput = document.getElementById("discount");
  const paymentAmountInput = document.getElementById("paymentAmount");

  if (
    !billingDialog ||
    !billingForm ||
    !closeBillingButton ||
    !cancelBillingButton ||
    !otherChargesInput ||
    !discountInput ||
    !paymentAmountInput
  ) {
    console.error("Billing: One or more required HTML elements were not found.");
    return null;
  }

  let billingJobOrder = null;

  const refreshBillingTotals = () => {
    if (billingJobOrder) {
      updateBillingTotals(billingJobOrder);
    }
  };

  otherChargesInput.addEventListener("input", refreshBillingTotals);
  discountInput.addEventListener("input", refreshBillingTotals);
  paymentAmountInput.addEventListener("input", refreshBillingTotals);

  closeBillingButton.addEventListener("click", () => {
    billingDialog.close();
  });

  cancelBillingButton.addEventListener("click", () => {
    billingDialog.close();
  });

  return {
    dialog: billingDialog,
    createBill: (jobOrderId) => {
      createJobOrderBill(jobOrderId, billingDialog, (data) => {
        billingJobOrder = data;
      });
    }
  };
}