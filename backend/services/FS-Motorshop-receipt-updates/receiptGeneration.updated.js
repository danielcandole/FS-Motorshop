import PDFDocument from "pdfkit";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const RECEIPT_DIRECTORY = path.resolve("storage/receipts");

const PAGE_WIDTH = 226.77; // 80 mm in PDF points
const MARGIN = 10;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// FORMAT CURRENCY
function formatCurrency(amount) {
  return Number(amount ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// FORMAT DATE
function formatDate(date) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// GENERATE RECEIPT
export async function generateReceipt(receiptData) {
  const {
    receiptNumber,
    receiptDate,
    jobOrderNumber,
    jobOrderId,
    customerName,
    customerContact,
    customerContactNo,
    motorcycleName,
    motorcycleModel,
    partsTotal,
    laborTotal,
    otherCharges,
    discount,
    totalAmount,
    paymentDate,
    paymentAmount,
    paymentBalance,
    remainingBalance
  } = receiptData;

  if (!receiptNumber) {
    throw new Error("Receipt number is required.");
  }

  await fs.mkdir(RECEIPT_DIRECTORY, { recursive: true });

  // Every generation gets a unique name; an existing receipt is never overwritten.
  const filename = `${receiptNumber}-${randomUUID()}.pdf`;
  const receiptFile = path.posix.join("storage", "receipts", filename);
  const filePath = path.join(RECEIPT_DIRECTORY, filename);
  const temporaryPath = `${filePath}.tmp`;

  const lines = [];
  const addText = (text, options = {}) => {
    lines.push({ type: "text", text: String(text ?? "N/A"), ...options });
  };
  const addSeparator = () => lines.push({ type: "separator" });
  const addAmount = (label, amount, options = {}) => {
    lines.push({ type: "amount", label, amount, ...options });
  };

  addText("FS-MOTORSHOP", { align: "center", bold: true, fontSize: 14, gap: 3 });
  addText("Motorcycle Parts • Service", { align: "center", fontSize: 8 });
  addText("• Maintenance", { align: "center", fontSize: 8 });
  addText("123 Main Street, Cebu City", { align: "center", fontSize: 8 });
  addText("Tel: (032) 123-4567", { align: "center", fontSize: 8, gap: 6 });
  addSeparator();
  addText("SERVICE RECEIPT", { align: "center", bold: true, fontSize: 11, gap: 6 });

  addSeparator();
  addText("RECEIPT DETAILS", { bold: true, fontSize: 10, gap: 6 });
  addText(`Receipt No: ${receiptNumber}`);
  addText(`Receipt Date: ${formatDate(receiptDate)}`);
  addText(`Job Order No: ${jobOrderNumber ?? jobOrderId ?? "N/A"}`);
  addText(`Customer: ${customerName ?? "N/A"}`);
  addText(`Contact: ${customerContact ?? customerContactNo ?? "N/A"}`);
  addText(`Motorcycle: ${[motorcycleName, motorcycleModel].filter(Boolean).join(" ") || "N/A"}`);

  addSeparator();
  addText("SERVICE BILL", { bold: true, fontSize: 10, gap: 6 });
  addAmount("Parts Total", partsTotal);
  addAmount("Labor Total", laborTotal);
  addAmount("Other Charges", otherCharges);
  addAmount("Discount", discount);
  addSeparator();
  addAmount("TOTAL", totalAmount, { bold: true });

  addSeparator();
  addText("PAYMENT", { bold: true, fontSize: 10, gap: 6 });
  addText(`Payment Date: ${formatDate(paymentDate)}`);
  addAmount("Payment Amount", paymentAmount);
  addAmount("Remaining Balance", remainingBalance ?? paymentBalance, { bold: true });

  addSeparator();
  addText("PAYMENT DETAILS", { bold: true, fontSize: 10, gap: 6 });
  addText(`Payment Date: ${formatDate(paymentDate)}`);
  addAmount("Payment Amount", paymentAmount);
  addAmount("Payment Balance", remainingBalance ?? paymentBalance);

  addSeparator();
  addText("Thank you for choosing", { align: "center", gap: 2 });
  addText("FS-Motorshop!", { align: "center", bold: true, gap: 6 });
  addText("Ride Safe!", { align: "center", bold: true, gap: 6 });
  addSeparator();

  // Measure the receipt before creating the page to avoid a fixed-height PDF.
  const measureDoc = new PDFDocument({ size: [PAGE_WIDTH, 2000], margins: 0 });
  let measuredHeight = MARGIN;

  for (const line of lines) {
    if (line.type === "separator") {
      measuredHeight += 8;
    }
    else if (line.type === "amount") {
      measuredHeight += 15;
    }
    else {
      measureDoc.font(line.bold ? "Courier-Bold" : "Courier");
      measureDoc.fontSize(line.fontSize ?? 9);
      measuredHeight += measureDoc.heightOfString(line.text, {
        width: CONTENT_WIDTH,
        align: line.align ?? "left",
        lineGap: 1
      }) + (line.gap ?? 3);
    }
  }

  measureDoc.end();

  const pageHeight = Math.max(100, Math.ceil(measuredHeight + MARGIN));
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, pageHeight],
    margins: 0,
    compress: true
  });

  const stream = createWriteStream(temporaryPath, { flags: "wx" });
  doc.pipe(stream);

  let y = MARGIN;

  function writeText(line) {
    doc.font(line.bold ? "Courier-Bold" : "Courier");
    doc.fontSize(line.fontSize ?? 9);

    const height = doc.heightOfString(line.text, {
      width: CONTENT_WIDTH,
      align: line.align ?? "left",
      lineGap: 1
    });

    doc.text(line.text, MARGIN, y, {
      width: CONTENT_WIDTH,
      align: line.align ?? "left",
      lineGap: 1
    });

    y += height + (line.gap ?? 3);
  }

  try {
    for (const line of lines) {
      if (line.type === "separator") {
        doc.moveTo(MARGIN, y)
          .lineTo(PAGE_WIDTH - MARGIN, y)
          .lineWidth(0.5)
          .stroke();
        y += 8;
      }
      else if (line.type === "amount") {
        doc.font(line.bold ? "Courier-Bold" : "Courier").fontSize(9);
        doc.text(line.label, MARGIN, y, {
          width: CONTENT_WIDTH * 0.62,
          align: "left"
        });
        doc.text(`PHP ${formatCurrency(line.amount)}`, MARGIN, y, {
          width: CONTENT_WIDTH,
          align: "right"
        });
        y += 15;
      }
      else {
        writeText(line);
      }
    }

    // Wait for the output stream to finish before returning the stored path.
    const finished = new Promise((resolve, reject) => {
      stream.once("finish", resolve);
      stream.once("error", reject);
      doc.once("error", reject);
    });

    doc.end();
    await finished;

    // Keep the final file name unique; rename only after PDF output is complete.
    await fs.rename(temporaryPath, filePath);

    return { receiptFile, filePath };
  }
  catch (error) {
    doc.destroy();
    stream.destroy();
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    await fs.rm(filePath, { force: true }).catch(() => {});
    throw error;
  }
}

// DELETE RECEIPT FILE
export async function deleteReceiptFile(receiptFile) {
  if (!receiptFile) return;

  const filename = path.basename(receiptFile);
  if (!filename.endsWith(".pdf")) {
    throw new Error("Invalid receipt file.");
  }

  const filePath = path.resolve(RECEIPT_DIRECTORY, filename);
  if (path.dirname(filePath) !== RECEIPT_DIRECTORY) {
    throw new Error("Invalid receipt file path.");
  }

  await fs.rm(filePath, { force: true });
}
