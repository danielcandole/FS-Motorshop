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
      Number(jobOrder.partsTotal);

    document.getElementById("laborTotal").value =
      Number(jobOrder.laborTotal);

    document.getElementById("otherCharges").value = 0;
    document.getElementById("discount").value = 0;
    document.getElementById("paymentAmount").value = "";

    setDefaultDate("paymentDate");
    setDefaultDate("receiptDate");

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

  billingForm.addEventListener("submit", (event) => {
    savePayment(event, billingJobOrder);
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



// SAVE PAYMENT
async function savePayment(event, billingJobOrder) {
  event.preventDefault();

  const paymentData = {
    jobOrderId: billingJobOrder.jobOrderId,
    partsTotal: Number(document.getElementById("partsTotal").value),
    laborTotal: Number(document.getElementById("laborTotal").value),
    otherCharges: Number(document.getElementById("otherCharges").value) || null,
    discount: Number(document.getElementById("discount").value) || null,
    totalAmount: Number(
      document.getElementById("totalAmount").textContent.replace(/[₱,]/g, "")
    ),
    paymentDate: document.getElementById("paymentDate").value,
    paymentAmount: Number(document.getElementById("paymentAmount").value),
    paymentBalance: Number(
      document.getElementById("remainingBalance").textContent.replace(/[₱,]/g, "")
    ),
    receiptDate: new Date().toISOString()
  };

  try {
    const response = await fetch("/api/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save payment.");
    }

    billingJobOrder = null;
    document.getElementById("billingDialog").close();
    alert("Payment saved successfully.");
  } catch (error) {
    console.error("Save Payment:", error);
    alert(error.message);
  }
}