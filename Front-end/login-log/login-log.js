// Query DOM elements
const searchInput = document.querySelector(".search-input");
const filterSelect = document.querySelector(".filter-select");
const tableContainer = document.querySelector(".user-table");
const paginationInfo = document.querySelector(".pagination-info");
const selectAllCheckbox = document.getElementById("select-all");
const prevButton = document.querySelector(".pagination-button-prev");
const nextButton = document.querySelector(".pagination-button-next");

// State object
const state = {
  searchTerm: "",
  selectedRows: [],
  currentPage: 1,
  itemsPerPage: 10,
  sortBy: "login_date",
  sortDirection: "desc",
  users: [],
  totalUsers: 0,
  loading: true,
  error: null,
};

// ==========================
// 1. Fetch Data
// ==========================

/**
 * Fetch login log data from the server.
 */
async function fetchLoginData() {
  state.loading = true;

  try {
    const response = await fetch(
      `http://localhost:5000/api/login-logs?page=${state.currentPage}&limit=${state.itemsPerPage}&search=${state.searchTerm}&sortBy=${state.sortBy}&sortDirection=${state.sortDirection}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    state.users = data.users || [];
    state.totalUsers = data.total || 0;
    state.loading = false;
    state.error = null;

    renderTable();
  } catch (error) {
    console.error("Error fetching login data:", error);
    state.loading = false;
    state.error = `Failed to load login data: ${error.message}`;
  }
}

// ==========================
// Render Table
// ==========================

/**
 * Render the table with the fetched data.
 */
function renderTable() {
  // Remove all existing rows except the header
  Array.from(tableContainer.children).forEach((child) => {
    if (!child.classList.contains("table-header")) {
      child.remove();
    }
  });

  // Render rows or display appropriate messages
  if (state.users.length > 0) {
    state.users.forEach((user) => {
      const row = renderTableRow(user);
      tableContainer.appendChild(row);
    });
  } else if (state.loading) {
    const loadingRow = document.createElement("div");
    loadingRow.className = "table-row loading-row";
    loadingRow.textContent = "Loading data...";
    tableContainer.appendChild(loadingRow);
  } else if (state.error) {
    const errorRow = document.createElement("div");
    errorRow.className = "table-row error-row";
    errorRow.textContent = state.error;
    tableContainer.appendChild(errorRow);
  } else {
    const emptyRow = document.createElement("div");
    emptyRow.className = "table-row empty-row";
    emptyRow.textContent = "No login data found.";
    tableContainer.appendChild(emptyRow);
  }

  updatePaginationInfo();
}

/**
 * Render a single table row.
 */
function renderTableRow(user) {
  const row = document.createElement("div");
  row.className = "table-row";
  row.setAttribute("role", "row");

  const checkboxCell = document.createElement("div");
  checkboxCell.className = "table-cell";
  checkboxCell.innerHTML = `<input type="checkbox" aria-label="Select row">`;
  row.appendChild(checkboxCell);

  const nameCell = document.createElement("div");
  nameCell.className = "table-cell";
  nameCell.textContent = user.name;
  row.appendChild(nameCell);

  const mobileCell = document.createElement("div");
  mobileCell.className = "table-cell";
  mobileCell.textContent = user.mobile;
  row.appendChild(mobileCell);

  const emailCell = document.createElement("div");
  emailCell.className = "table-cell";
  emailCell.textContent = user.email;
  row.appendChild(emailCell);

  const accountIdCell = document.createElement("div");
  accountIdCell.className = "table-cell";
  accountIdCell.textContent = user.accountId;
  row.appendChild(accountIdCell);

  const roleCell = document.createElement("div");
  roleCell.className = "table-cell";
  roleCell.textContent = user.role;
  row.appendChild(roleCell);

  const loginDateCell = document.createElement("div");
  const loginDate = new Date(user.login_date);
  loginDateCell.className = "table-cell";
  loginDateCell.textContent = loginDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  row.appendChild(loginDateCell);

  return row;
}

// ==========================
// 3. Pagination
// ==========================

/**
 * Update pagination information.
 */
function updatePaginationInfo() {
  const startItem = (state.currentPage - 1) * state.itemsPerPage + 1;
  const endItem = Math.min(
    state.currentPage * state.itemsPerPage,
    state.totalUsers
  );

  if (paginationInfo) {
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${state.totalUsers} entries`;
  }
}

// ==========================
// 4. Event Listeners
// ==========================

/**
 * Add select-all functionality.
 */
function addSelectAllFunctionality() {
  if (!selectAllCheckbox) {
    console.error("Select-all checkbox not found!");
    return;
  }

  // Toggle all row checkboxes based on the "select-all" checkbox state
  selectAllCheckbox.addEventListener("change", function () {
    const rowCheckboxes = tableContainer.querySelectorAll(
      ".table-row .table-cell input[type='checkbox']"
    );
    rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  // Update "select-all" state based on individual row checkboxes
  tableContainer.addEventListener("change", function (event) {
    if (event.target.type === "checkbox" && event.target.id !== "select-all") {
      const rowCheckboxes = tableContainer.querySelectorAll(
        ".table-row .table-cell input[type='checkbox']"
      );
      const allChecked = Array.from(rowCheckboxes).every(
        (checkbox) => checkbox.checked
      );
      selectAllCheckbox.checked = allChecked;
    }
  });
}

/**
 * Add sorting functionality to table headers.
 */
function addSortingListeners() {
  document.querySelectorAll(".table-header .table-cell").forEach((header) => {
    header.addEventListener("click", function () {
      const sortBy = header.textContent.trim();

      if (sortBy === "Login Date") {
        state.sortBy = "login_date";
      } else if (sortBy === "Name") {
        state.sortBy = "name";
      } else if (sortBy === "Mobile No") {
        state.sortBy = "mobile";
      } else if (sortBy === "Email Address") {
        state.sortBy = "email";
      } else if (sortBy === "Account ID") {
        state.sortBy = "accountId";
      } else if (sortBy === "Role") {
        state.sortBy = "role";
      }

      state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      fetchLoginData();
    });
  });
}

// Add event listeners for search input
searchInput.addEventListener("input", function (event) {
  state.searchTerm = event.target.value.trim();
  state.currentPage = 1; // Reset to first page when searching
  fetchLoginData();
});

// Add event listeners for pagination buttons
prevButton.addEventListener("click", () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    fetchLoginData();
  }
});

nextButton.addEventListener("click", () => {
  if (state.currentPage * state.itemsPerPage < state.totalUsers) {
    state.currentPage++;
    fetchLoginData();
  }
});

// Add event listener for filter dropdown
filterSelect.addEventListener("change", function (event) {
  const selectedValue = event.target.value;
  state.searchTerm = selectedValue === "All Roles" ? "" : selectedValue;
  fetchLoginData();
});

// ==========================
// 5. Initialization
// ==========================

/**
 * Initialize the page by fetching data and setting up the UI.
 */
async function initialize() {
  console.log("Initializing login log page...");
  await fetchLoginData(); // Fetch data first
  addSelectAllFunctionality(); // Add select-all functionality
  addSortingListeners(); // Add sorting functionality
}

// Start initialization
initialize();
