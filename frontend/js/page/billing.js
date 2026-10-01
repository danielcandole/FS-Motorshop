import { setDefaultDate, toDateTimeLocalValue } from "../utils/dateUtils.js";

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

  document.getElementById("totalAmount").textContent = `₱${formatCurrency(totalAmount)}`;
  document.getElementById("remainingBalance").textContent = `₱${formatCurrency(remainingBalance)}`;
}

// POPULATE BILLING DIALOG
function populateBillingDialog(jobOrder, serviceBill = null) {
  const setText = (id, value) => {
    document.getElementById(id).textContent = value ?? "—";
  };

  setText("billingJobOrderId", `JO-${String(jobOrder.jobOrderId).padStart(3, "0")}`);
  setText("billingCustomerName", jobOrder.customerName);
  setText("billingMotorcycleName", jobOrder.motorcycleName);

  document.getElementById("partsTotal").value = Number(jobOrder.partsTotal || 0);
  document.getElementById("laborTotal").value = Number(jobOrder.laborTotal || 0);

  document.getElementById("otherCharges").value = serviceBill?.otherCharges ?? 0;
  document.getElementById("discount").value = serviceBill?.discount ?? 0;
  document.getElementById("paymentAmount").value = serviceBill?.paymentAmount ?? "";

  document.getElementById("paymentDate").value = serviceBill?.paymentDate
    ? toDateTimeLocalValue(serviceBill.paymentDate)
    : "";

  document.getElementById("receiptDate").value = serviceBill?.receiptDate
    ? toDateTimeLocalValue(serviceBill.receiptDate)
    : "";

  document.getElementById("savePayment").textContent = serviceBill
    ? "Update Bill"
    : "Save Payment";

  updateBillingTotals(jobOrder);
}

// FETCH BILLING DATA
async function fetchBillingData(jobOrderId) {
  const response = await fetch(`/api/job-orders/${jobOrderId}/billing`, {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch billing data.");
  }

  return result.data;
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

  if (!billingDialog || !billingForm || !closeBillingButton || !cancelBillingButton ||
      !otherChargesInput || !discountInput || !paymentAmountInput) {
    console.error("Billing: One or more required HTML elements were not found.");
    return null;
  }

  let billingJobOrder = null;
  let billingMode = "create";

  const refreshBillingTotals = () => {
    if (billingJobOrder) {
      updateBillingTotals(billingJobOrder);
    }
  };

  otherChargesInput.addEventListener("input", refreshBillingTotals);
  discountInput.addEventListener("input", refreshBillingTotals);
  paymentAmountInput.addEventListener("input", refreshBillingTotals);

  closeBillingButton.addEventListener("click", () => billingDialog.close());
  cancelBillingButton.addEventListener("click", () => billingDialog.close());

  billingForm.addEventListener("submit", (event) => {
    if (billingMode === "edit") {
      updateBilling(event, billingJobOrder);
    } else {
      savePayment(event, billingJobOrder);
    }
  });

  return {
    dialog: billingDialog,
    openBill: async (jobOrderId) => {
      try {
        const jobOrder = await fetchBillingData(jobOrderId);
        billingJobOrder = jobOrder;

        if (jobOrder.serviceBill) {
          billingMode = "edit";
          populateBillingDialog(jobOrder, jobOrder.serviceBill);
        } else {
          billingMode = "create";
          setDefaultDate("paymentDate");
          setDefaultDate("receiptDate");
          populateBillingDialog(jobOrder);
        }

        billingDialog.showModal();
      } catch (error) {
        console.error("Open Billing Dialog:", error);
        alert(error.message);
      }
    }
  };
}

// CREATE BILL
async function savePayment(event, billingJobOrder) {
  event.preventDefault();

  const paymentData = {
    jobOrderId: billingJobOrder.jobOrderId,
    partsTotal: Number(document.getElementById("partsTotal").value),
    laborTotal: Number(document.getElementById("laborTotal").value),
    otherCharges: Number(document.getElementById("otherCharges").value) || null,
    discount: Number(document.getElementById("discount").value) || null,
    totalAmount: Number(document.getElementById("totalAmount").textContent.replace(/[₱,]/g, "")),
    paymentDate: document.getElementById("paymentDate").value,
    paymentAmount: Number(document.getElementById("paymentAmount").value),
    paymentBalance: Number(document.getElementById("remainingBalance").textContent.replace(/[₱,]/g, "")),
    receiptDate: new Date(document.getElementById("receiptDate").value).toISOString()
  };

  try {
    const response = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save payment.");
    }

    document.getElementById("billingDialog").close();
    alert("Payment saved successfully.");
  } catch (error) {
    console.error("Save Payment:", error);
    alert(error.message);
  }
}

// UPDATE BILL
async function updateBilling(event, billingJobOrder) {
  event.preventDefault();

  const serviceBillId = billingJobOrder.serviceBill.serviceBillId;

  const billingData = {
    otherCharges: Number(document.getElementById("otherCharges").value) || null,
    discount: Number(document.getElementById("discount").value) || null,
    totalAmount: Number(document.getElementById("totalAmount").textContent.replace(/[₱,]/g, "")),
    paymentDate: document.getElementById("paymentDate").value,
    paymentAmount: Number(document.getElementById("paymentAmount").value),
    paymentBalance: Number(document.getElementById("remainingBalance").textContent.replace(/[₱,]/g, "")),
    receiptDate: new Date(document.getElementById("receiptDate").value).toISOString()
  };

  try {
    const response = await fetch(`/api/billing/${serviceBillId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(billingData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update bill.");
    }

    document.getElementById("billingDialog").close();
    alert("Bill updated successfully.");
  } catch (error) {
    console.error("Update Bill:", error);
    alert(error.message);
  }
}