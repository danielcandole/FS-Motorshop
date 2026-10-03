// STOCK TRANSACTION STATE
let stockTransactions = [];
let filteredStockTransactions = [];
let currentStockTransactionPage = 1;

const STOCK_TRANSACTION_PAGE_SIZE = 10;


// FETCH STOCK TRANSACTIONS
async function fetchStockTransactionData() {
  try {
    const response = await fetch("/api/stock-transaction", {
      method: "GET",
      credentials: "same-origin"
    });

    const result = await response.json();

    console.log("STOCK TRANSACTION DATA:", result);

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to fetch stock transactions."
      );
    }

    if (!Array.isArray(result.data)) {
      throw new Error("Invalid stock transaction data.");
    }

    stockTransactions = result.data;
    filteredStockTransactions = [...stockTransactions];

    return true;
  }
  catch (error) {
    console.error("Fetch Stock Transaction:", error);
    throw error;
  }
}


// RENDER TRANSACTION SUMMARY
function renderStockTransactionSummary(elements) {
  const totalStockIn = stockTransactions.filter(
    transaction => transaction.transactionType === "Stock In"
  ).length;

  const totalStockOut = stockTransactions.filter(
    transaction => transaction.transactionType === "Stock Out"
  ).length;

  elements.totalTransactions.textContent = stockTransactions.length;
  elements.totalStockIn.textContent = totalStockIn;
  elements.totalStockOut.textContent = totalStockOut;
}


// FILTER STOCK TRANSACTIONS
function filterStockTransactions(elements) {
  const searchValue = elements.search.value
    .trim()
    .toLowerCase();

  const transactionType = elements.filter.value;

  filteredStockTransactions = stockTransactions.filter(
    transaction => {
      const matchesSearch =
        String(transaction.stockTransactionId)
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.itemName || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesType =
        transactionType === "all" ||
        transaction.transactionType === transactionType;

      return matchesSearch && matchesType;
    }
  );

  currentStockTransactionPage = 1;

  renderStockTransactionTable(elements);
}


// FORMAT CURRENCY
function formatStockTransactionPrice(price) {
  if (price === null || price === undefined || price === "") {
    return "—";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "—";
  }

  return numericPrice.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP"
  });
}


// FORMAT DATE AND TIME
function formatStockTransactionDate(dateValue) {
  if (!dateValue) {
    return {
      date: "—",
      time: "—"
    };
  }

  // MySQL DATETIME values are returned as "YYYY-MM-DD HH:mm:ss".
  const date = new Date(
    String(dateValue).replace(" ", "T")
  );

  if (Number.isNaN(date.getTime())) {
    return {
      date: "—",
      time: "—"
    };
  }

  return {
    date: date.toLocaleDateString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }),
    time: date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  };
}


// CREATE TABLE CELL
function createStockTransactionCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "—";

  return cell;
}


// RENDER STOCK TRANSACTION ROW
function createStockTransactionRow(transaction) {
  const {
    stockTransactionId,
    itemName,
    quantity,
    quantityUsed,
    sellingPrice,
    unitPrice,
    transactionDate,
    transactionType,
    transactionQuantity
  } = transaction;

  const isStockIn = transactionType === "Stock In";
  const dateTime = formatStockTransactionDate(transactionDate);

  const price = isStockIn ? sellingPrice : unitPrice;
  const quantityChanged = Number(transactionQuantity);

  const formattedQuantity = Number.isFinite(quantityChanged)
    ? `${isStockIn ? "+" : "-"}${quantityChanged}`
    : "—";

  const row = document.createElement("tr");

  // ID
  row.appendChild(
    createStockTransactionCell(stockTransactionId)
  );

  // ITEM NAME
  row.appendChild(
    createStockTransactionCell(itemName)
  );

  // QUANTITY
  row.appendChild(
    createStockTransactionCell(quantity)
  );

  // QUANTITY USED
  row.appendChild(
    createStockTransactionCell(quantityUsed)
  );

  // UNIT PRICE
  row.appendChild(
    createStockTransactionCell(
      formatStockTransactionPrice(price)
    )
  );

  // DATE AND TIME
  const dateCell = document.createElement("td");
  const dateContainer = document.createElement("div");
  const dateElement = document.createElement("span");
  const timeElement = document.createElement("span");

  dateContainer.className = "transactionDate";
  dateElement.className = "date";
  timeElement.className = "time";

  dateElement.textContent = dateTime.date;
  timeElement.textContent = dateTime.time;

  dateContainer.append(dateElement, timeElement);
  dateCell.appendChild(dateContainer);
  row.appendChild(dateCell);

  // TRANSACTION TYPE
  const typeCell = document.createElement("td");
  const typeBadge = document.createElement("span");

  typeBadge.className = `transactionType ${
    isStockIn ? "stockIn" : "stockOut"
  }`;

  typeBadge.textContent = isStockIn ? "Stock In" : "Stock Out";

  typeCell.appendChild(typeBadge);
  row.appendChild(typeCell);

  // QUANTITY CHANGED
  const quantityCell = createStockTransactionCell(
    formattedQuantity
  );

  quantityCell.className = `quantityChanged ${
    isStockIn ? "stockIn" : "stockOut"
  }`;

  row.appendChild(quantityCell);

  return row;
}


// RENDER PAGINATION
function renderStockTransactionPagination(elements, totalPages) {
  elements.pages.replaceChildren();

  elements.previous.disabled =
    currentStockTransactionPage <= 1;

  elements.next.disabled =
    currentStockTransactionPage >= totalPages;

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = page;

    button.classList.toggle(
      "active",
      page === currentStockTransactionPage
    );

    if (page === currentStockTransactionPage) {
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      currentStockTransactionPage = page;
      renderStockTransactionTable(elements);
    });

    elements.pages.appendChild(button);
  }
}


// RENDER TABLE MESSAGE
function renderStockTransactionMessage(elements, message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 8;
  cell.className = "tableMessage";
  cell.textContent = message;

  row.appendChild(cell);
  elements.tableBody.replaceChildren(row);
}


// RENDER STOCK TRANSACTION TABLE
function renderStockTransactionTable(elements) {
  const totalPages = Math.ceil(
    filteredStockTransactions.length /
    STOCK_TRANSACTION_PAGE_SIZE
  );

  if (filteredStockTransactions.length === 0) {
    renderStockTransactionMessage(
      elements,
      "No transactions found."
    );

    renderStockTransactionPagination(elements, 0);
    return;
  }

  // Keep the current page within the available range.
  currentStockTransactionPage = Math.min(
    currentStockTransactionPage,
    totalPages
  );

  const startIndex =
    (currentStockTransactionPage - 1) *
    STOCK_TRANSACTION_PAGE_SIZE;

  const transactions = filteredStockTransactions.slice(
    startIndex,
    startIndex + STOCK_TRANSACTION_PAGE_SIZE
  );

  const rows = transactions.map(
    transaction => createStockTransactionRow(transaction)
  );

  elements.tableBody.replaceChildren(...rows);

  renderStockTransactionPagination(elements, totalPages);
}


// INITIALIZE STOCK TRANSACTION PAGE
export async function initStockTransactionPage() {
  const elements = {
    tableBody: document.getElementById("stockTransactionTableBody"),
    totalTransactions: document.getElementById("totalTransactions"),
    totalStockIn: document.getElementById("totalStockIn"),
    totalStockOut: document.getElementById("totalStockOut"),
    search: document.getElementById("stockTransactionSearch"),
    filter: document.getElementById("stockTransactionFilter"),
    previous: document.getElementById("previousStockTransactionPage"),
    next: document.getElementById("nextStockTransactionPage"),
    pages: document.getElementById("stockTransactionPages")
  };

  // CHECK REQUIRED ELEMENTS
  if (Object.values(elements).some(element => !element)) {
    console.error(
      "Stock Transaction Page: Required elements are missing."
    );
    return;
  }

  // REGISTER SEARCH AND FILTER EVENTS
  elements.search.addEventListener("input", () => {
    filterStockTransactions(elements);
  });

  elements.filter.addEventListener("change", () => {
    filterStockTransactions(elements);
  });

  // REGISTER PAGINATION EVENTS
  elements.previous.addEventListener("click", () => {
    if (currentStockTransactionPage > 1) {
      currentStockTransactionPage--;
      renderStockTransactionTable(elements);
    }
  });

  elements.next.addEventListener("click", () => {
    const totalPages = Math.ceil(
      filteredStockTransactions.length /
      STOCK_TRANSACTION_PAGE_SIZE
    );

    if (currentStockTransactionPage < totalPages) {
      currentStockTransactionPage++;
      renderStockTransactionTable(elements);
    }
  });

  // FETCH AND DISPLAY TRANSACTIONS
  try {
    await fetchStockTransactionData();

    renderStockTransactionSummary(elements);
    renderStockTransactionTable(elements);
  }
  catch (error) {
    renderStockTransactionMessage(
      elements,
      "Failed to load stock transactions."
    );
  }
}