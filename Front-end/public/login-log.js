(() => {
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

  let pendingUpdate = false;

  // Fetch login log data from the server
  async function fetchLoginData() {
    state.loading = true;
    update();

    try {
      console.log("Fetching login data...");
      const response = await fetch(
        `/api/login-logs?page=${state.currentPage}&limit=${state.itemsPerPage}&search=${state.searchTerm}&sortBy=${state.sortBy}&sortDirection=${state.sortDirection}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received:", data);

      state.users = data.users || [];
      state.totalUsers = data.total || 0;
      state.loading = false;
      state.error = null;

      renderTable();
      update();
    } catch (error) {
      console.error("Error fetching login data:", error);
      state.loading = false;
      state.error = `Failed to load login data: ${error.message}`;
      update();
    }
  }

  // Render the table with the fetched data and remove all existing rows to render current the fetched data
  // After that refresh/update the pagination info(showing the number of entries shown and total entries)
  // This function creates a table row for each user and appends it to the table container
  function renderTable() {
    console.log("Rendering table with data:", state.users);
    const tableContainer = document.querySelector(".user-table");
    if (!tableContainer) {
      console.error("Table container not found!");
      return;
    }

    // Remove all existing rows except the header
    Array.from(tableContainer.children).forEach((child) => {
      if (!child.classList.contains("table-header")) {
        child.remove();
      }
    });

    // If we have data, render the rows
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

    // Update pagination info
    updatePaginationInfo();
  }

  //function for rendering each table row
  // This function creates a table row for each user and appends it to the table  container
  // It also creates cells for each user property and appends them to the row
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
    loginDateCell.className = "table-cell";
    loginDateCell.textContent = user.login_date;
    row.appendChild(loginDateCell);

    // Format the login date
    const loginDate = new Date(user.login_date);
    loginDateCell.textContent = loginDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    row.appendChild(loginDateCell);

    return row;
  }

  // Update pagination information aka. the number of entries shown and total entries
  // This function calculates the start and end item numbers based on the current page and items per page
  // locate right bottom of the login-log page
  function updatePaginationInfo() {
    const startItem = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endItem = Math.min(
      state.currentPage * state.itemsPerPage,
      state.totalUsers,
    );
    const paginationInfo = document.querySelector(".pagination-info");

    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${state.totalUsers} entries`;
    }
  }

  function addSelectAllFunctionality() {
    const tableContainer = document.querySelector(".user-table");
    const selectAllCheckbox = document.getElementById("select-all");

    if (!selectAllCheckbox) {
      console.error("Select-all checkbox not found!");
      return;
    }

    // Add event listener to the "select-all" checkbox
    selectAllCheckbox.addEventListener("change", function () {
      const rowCheckboxes = tableContainer.querySelectorAll(
        ".table-row .table-cell input[type='checkbox']"
      );

      // Toggle all row checkboxes based on the "select-all" checkbox state
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
      });
    });

    // Add event listener to row checkboxes to update "select-all" state
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

  // Add event listeners to the pagination buttons and search input
  // Update the UI based on state changes
  function update() {
    if (pendingUpdate) {
      return;
    }
    pendingUpdate = true;

    // Update search input value
    document.querySelectorAll(".search-input").forEach((el) => {
      el.value = state.searchTerm;
      el.removeEventListener("input", onSearchInput);
      el.addEventListener("input", onSearchInput);
    });

    // Add click event listeners to pagination buttons
    document.querySelectorAll(".pagination-button").forEach((button, index) => {
      button.removeEventListener("click", onPaginationClick);
      button.addEventListener("click", () =>
        onPaginationClick(index === 0 ? "prev" : "next"),
      );
    });

    pendingUpdate = false;
  }

  // Event handler for search input
  function onSearchInput(event) {
    state.searchTerm = event.target.value;
    state.currentPage = 1; // Reset to first page when searching
    fetchLoginData(); // Fetch data with the new search term
  }

  // Event handler for pagination button click
  function onPaginationClick(direction) {
    if (direction === "prev" && state.currentPage > 1) {
      state.currentPage--;
      fetchLoginData();
      
    } else if (
      direction === "next" && state.currentPage * state.itemsPerPage < state.totalUsers) {
      state.currentPage++;
      fetchLoginData();
    }
  }

  // Initialize by fetching data and setting up the UI
  async function initialize() {
    console.log("Initializing login log page...");
    await fetchLoginData(); // Fetch data first
    addSelectAllFunctionality(); // Add select-all functionality
    update(); // Update the UI
  }

  // Start initialization
  initialize();
})();
