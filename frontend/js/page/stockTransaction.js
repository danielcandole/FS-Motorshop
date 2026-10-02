// STOCK TRANSACTION ELEMENTS
const stockTransactionTableBody = document.getElementById(
  "stockTransactionTableBody"
);

const totalTransactionsElement = document.getElementById(
  "totalTransactions"
);

const totalStockInElement = document.getElementById(
  "totalStockIn"
);

const totalStockOutElement = document.getElementById(
  "totalStockOut"
);

const stockTransactionSearch = document.getElementById(
  "stockTransactionSearch"
);

const stockTransactionFilter = document.getElementById(
  "stockTransactionFilter"
);

const previousStockTransactionPage = document.getElementById(
  "previousStockTransactionPage"
);

const nextStockTransactionPage = document.getElementById(
  "nextStockTransactionPage"
);

const stockTransactionPages = document.getElementById(
  "stockTransactionPages"
);


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

    if (!response.ok) {
      throw new Error("Failed to fetch stock transactions.");
    }

    stockTransactions = await response.json();

    filteredStockTransactions = [...stockTransactions];

    renderStockTransactionSummary();
    renderStockTransactionTable();
  }
  catch (error) {
    console.error("Fetch Stock Transaction:", error);

    stockTransactionTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="tableMessage">
          Failed to load stock transactions.
        </td>
      </tr>
    `;
  }
}


// RENDER TRANSACTION SUMMARY
function renderStockTransactionSummary() {
  const totalStockIn = stockTransactions.filter(
    transaction => transaction.transactionType === "Stock In"
  ).length;

  const totalStockOut = stockTransactions.filter(
    transaction => transaction.transactionType === "Stock Out"
  ).length;

  totalTransactionsElement.textContent = stockTransactions.length;
  totalStockInElement.textContent = totalStockIn;
  totalStockOutElement.textContent = totalStockOut;
}


// FILTER STOCK TRANSACTIONS
function filterStockTransactions() {
  const searchValue = stockTransactionSearch.value
    .trim()
    .toLowerCase();

  const transactionType = stockTransactionFilter.value;

  filteredStockTransactions = stockTransactions.filter(
    transaction => {
      const matchesSearch =
        String(transaction.stockTransactionId)
          .includes(searchValue) ||
        (transaction.itemName || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesType =
        transactionType === "all" ||
        transaction.transactionType === transactionType;

      return matchesSearch && matchesType;
    }
  );

  currentStockTransactionPage = 1;

  renderStockTransactionTable();
}


// FORMAT CURRENCY
function formatStockTransactionPrice(price) {
  if (price === null || price === undefined) {
    return "—";
  }

  return Number(price).toLocaleString("en-PH", {
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

  const quantityChanged = Number(transactionQuantity || 0);

  const formattedQuantity = isStockIn
    ? `+${quantityChanged}`
    : `-${quantityChanged}`;

  const row = document.createElement("tr");

  const values = [
    stockTransactionId,
    itemName || "—",
    quantity ?? "—",
    quantityUsed ?? "—",
    formatStockTransactionPrice(price)
  ];

  values.forEach(value => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
  });

  const dateCell = document.createElement("td");
  dateCell.innerHTML = `
    <div class="transactionDate">
      <span class="date"></span>
      <span class="time"></span>
    </div>
  `;

  dateCell.querySelector(".date").textContent = dateTime.date;
  dateCell.querySelector(".time").textContent = dateTime.time;

  row.appendChild(dateCell);

  const typeCell = document.createElement("td");
  const typeBadge = document.createElement("span");

  typeBadge.className = `transactionType ${
    isStockIn ? "stockIn" : "stockOut"
  }`;

  typeBadge.textContent = isStockIn ? "IN" : "OUT";

  typeCell.appendChild(typeBadge);
  row.appendChild(typeCell);

  const quantityCell = document.createElement("td");
  quantityCell.className = `quantityChanged ${
    isStockIn ? "stockIn" : "stockOut"
  }`;
  quantityCell.textContent = formattedQuantity;

  row.appendChild(quantityCell);

  return row;
}


// RENDER PAGINATION
function renderStockTransactionPagination(totalPages) {
  stockTransactionPages.innerHTML = "";

  previousStockTransactionPage.disabled =
    currentStockTransactionPage <= 1;

  nextStockTransactionPage.disabled =
    currentStockTransactionPage >= totalPages;

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = page;
    button.classList.toggle(
      "active",
      page === currentStockTransactionPage
    );

    button.setAttribute(
      "aria-current",
      page === currentStockTransactionPage ? "page" : "false"
    );

    button.addEventListener("click", () => {
      currentStockTransactionPage = page;
      renderStockTransactionTable();
    });

    stockTransactionPages.appendChild(button);
  }
}


// RENDER STOCK TRANSACTION TABLE
function renderStockTransactionTable() {
  stockTransactionTableBody.innerHTML = "";

  const totalPages = Math.ceil(
    filteredStockTransactions.length / STOCK_TRANSACTION_PAGE_SIZE
  );

  if (filteredStockTransactions.length === 0) {
    stockTransactionTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="tableMessage">
          No transactions found.
        </td>
      </tr>
    `;

    renderStockTransactionPagination(0);
    return;
  }

  const startIndex =
    (currentStockTransactionPage - 1) *
    STOCK_TRANSACTION_PAGE_SIZE;

  const transactions = filteredStockTransactions.slice(
    startIndex,
    startIndex + STOCK_TRANSACTION_PAGE_SIZE
  );

  transactions.forEach(transaction => {
    stockTransactionTableBody.appendChild(
      createStockTransactionRow(transaction)
    );
  });

  renderStockTransactionPagination(totalPages);
}


// SEARCH AND FILTER EVENTS
stockTransactionSearch.addEventListener(
  "input",
  filterStockTransactions
);

stockTransactionFilter.addEventListener(
  "change",
  filterStockTransactions
);


// PAGINATION EVENTS
previousStockTransactionPage.addEventListener("click", () => {
  if (currentStockTransactionPage > 1) {
    currentStockTransactionPage--;
    renderStockTransactionTable();
  }
});

nextStockTransactionPage.addEventListener("click", () => {
  const totalPages = Math.ceil(
    filteredStockTransactions.length / STOCK_TRANSACTION_PAGE_SIZE
  );

  if (currentStockTransactionPage < totalPages) {
    currentStockTransactionPage++;
    renderStockTransactionTable();
  }
});


// INITIALIZE
fetchStockTransactionData();