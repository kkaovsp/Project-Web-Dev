(() => {
    const state = {
      searchTerm: "",
      selectedRows: [],
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: "loginDate",
      sortDirection: "desc",
      users: [],
      totalUsers: 0,
      loading: true,
      error: null,
  
      // Toggle selection of a single row
      toggleRow(id) {
        if (state.selectedRows.includes(id)) {
          state.selectedRows = state.selectedRows.filter((rowId) => rowId !== id);
          update();
        } else {
          state.selectedRows = [...state.selectedRows, id];
          update();
        }
      },
  
      // Toggle selection of all rows
      toggleAllRows(ids) {
        if (state.selectedRows.length === ids.length) {
          state.selectedRows = [];
          update();
        } else {
          state.selectedRows = [...ids];
          update();
        }
      },
    };
  
    let nodesToDestroy = [];
    let pendingUpdate = false;
  
    // Fetch login log data from the server
    async function fetchLoginData() {
      state.loading = true;
      update();
  
      try {
        const response = await fetch(
          `/api/login-logs?page=${state.currentPage}&limit=${state.itemsPerPage}&search=${state.searchTerm}&sortBy=${state.sortBy}&sortDirection=${state.sortDirection}`,
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
        update();
      } catch (error) {
        console.error("Error fetching login data:", error);
        state.loading = false;
        state.error = "Failed to load login data. Please try again.";
        update();
      }
    }
  
    // Render the table with the fetched data
    function renderTable() {
      const tableContainer = document.querySelector(".user-table");
      const tableHeader = tableContainer.querySelector(".table-header");
  
      // Remove all existing rows except the header
      Array.from(tableContainer.children).forEach((child) => {
        if (!child.classList.contains("table-header")) {
          child.remove();
        }
      });
  
      // If we have data, render the rows
      if (state.users.length > 0) {
        state.users.forEach((user, index) => {
          const row = document.createElement("div");
          row.className = "table-row";
          row.setAttribute("role", "row");
          row.setAttribute("data-user-id", user.id || index);
  
          const checkboxDiv = document.createElement("div");
          checkboxDiv.className = "checkbox";
          checkboxDiv.setAttribute("role", "cell");
  
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `row${index + 1}`;
          checkbox.setAttribute("aria-label", "Select row");
  
          const label = document.createElement("label");
          label.className = "visually-hidden";
          label.htmlFor = `row${index + 1}`;
          label.textContent = "Select row";
  
          checkboxDiv.appendChild(checkbox);
          checkboxDiv.appendChild(label);
  
          const grid = document.createElement("div");
          grid.className = "table-grid";
  
          // Create cells for each property
          const properties = [
            { key: "name", label: "Name" },
            { key: "mobile", label: "Mobile No" },
            { key: "email", label: "Email Address" },
            { key: "accountId", label: "Account ID" },
            { key: "role", label: "Role" },
            { key: "loginDate", label: "Login Date" },
            { key: "status", label: "Status" },
            { key: "action", label: "See Profile" },
          ];
  
          properties.forEach((prop) => {
            const cell = document.createElement("div");
            cell.className = "table-cell";
            if (prop.key === "status") {
              cell.classList.add(
                user.status === "Active" ? "status-active" : "status-offline",
              );
            }
            cell.setAttribute("role", "cell");
  
            // For the action cell, we'll add "See Profile" text
            if (prop.key === "action") {
              cell.textContent = "See Profile";
            } else {
              cell.textContent = user[prop.key] || "";
            }
  
            grid.appendChild(cell);
          });
  
          const actionIcon = document.createElement("img");
          actionIcon.src = "https://cdn.builder.io/api/v1/image/assets/TEMP/3e2f19f9cc287a6ca25dbb3d0394a5d866cd0a0c?placeholderIfAbsent=true&apiKey=d0a187305ed94256a0b9cc329927d8f7";
          actionIcon.alt = "View details";
          actionIcon.className = "action-icon";
  
          row.appendChild(checkboxDiv);
          row.appendChild(grid);
          row.appendChild(actionIcon);
  
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
  
    // Update pagination information
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
  
    // Clean up any nodes that need to be removed
    function destroyAnyNodes() {
      nodesToDestroy.forEach((el) => el.remove());
      nodesToDestroy = [];
    }
  
    // Update the UI based on state changes
    function update() {
      if (pendingUpdate === true) {
        return;
      }
      pendingUpdate = true;
  
      // Update search input value
      document.querySelectorAll(".search-input").forEach((el) => {
        el.value = state.searchTerm;
        el.removeEventListener("input", onSearchInput);
        el.addEventListener("input", onSearchInput);
      });
  
      // Add click event listeners to table rows
      document
        .querySelectorAll(".table-row:not(.table-header)")
        .forEach((el, index) => {
          el.removeEventListener("click", onTableRowClick);
          el.addEventListener("click", () => onTableRowClick(`row${index + 1}`));
  
          // Update row selection visual state
          const checkbox = el.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = state.selectedRows.includes(`row${index + 1}`);
          }
        });
  
      // Add click event listener to "select all" checkbox
      const selectAllCheckbox = document.getElementById("select-all");
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", onSelectAllChange);
        selectAllCheckbox.addEventListener("change", onSelectAllChange);
  
        // Update "select all" checkbox state
        const allRowIds = Array.from(
          document.querySelectorAll(".table-row:not(.table-header)"),
        ).map((_, index) => `row${index + 1}`);
        selectAllCheckbox.checked =
          allRowIds.length > 0 &&
          allRowIds.every((id) => state.selectedRows.includes(id));
      }
  
      // Add click event listeners to pagination buttons
      document.querySelectorAll(".pagination-button").forEach((button, index) => {
        button.removeEventListener("click", onPaginationClick);
        button.addEventListener("click", () =>
          onPaginationClick(index === 0 ? "prev" : "next"),
        );
      });
  
      destroyAnyNodes();
      pendingUpdate = false;
    }
  
    // Event handler for search input
    function onSearchInput(event) {
      state.searchTerm = event.target.value;
      state.currentPage = 1; // Reset to first page when searching
      fetchLoginData(); // Fetch data with the new search term
    }
  
    // Event handler for table row click
    function onTableRowClick(rowId) {
      state.toggleRow(rowId);
    }
  
    // Event handler for "select all" checkbox change
    function onSelectAllChange(event) {
      const allRowIds = Array.from(
        document.querySelectorAll(".table-row:not(.table-header)"),
      ).map((_, index) => `row${index + 1}`);
  
      if (event.target.checked) {
        state.selectedRows = [...allRowIds];
      } else {
        state.selectedRows = [];
      }
  
      update();
    }
  
    // Event handler for pagination button click
    function onPaginationClick(direction) {
      if (direction === "prev" && state.currentPage > 1) {
        state.currentPage--;
        fetchLoginData();
      } else if (
        direction === "next" &&
        state.currentPage * state.itemsPerPage < state.totalUsers
      ) {
        state.currentPage++;
        fetchLoginData();
      }
    }
  
    // Initialize event listeners for filter selects
    document.querySelectorAll(".filter-select").forEach((select) => {
      select.addEventListener("change", () => {
        // When filter changes, reset to page 1 and fetch data
        state.currentPage = 1;
        fetchLoginData();
      });
    });
  
    // Initialize by fetching data and setting up the UI
    fetchLoginData();
    update();
  })();
  