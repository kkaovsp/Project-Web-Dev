// Get references to all required DOM elements for the search interface
const searchInput = document.getElementById("searchInput");
const cafeFilter = document.getElementById("Cafe");
const provinceFilter = document.getElementById("Province");
const districtFilter = document.getElementById("District");
const locationsContainer = document.querySelector(".locations-container");
const searchForm = document.querySelector(".filter-form");

// Maintain the current state of search filters
// Uses '%' as wildcard for unselected filters
const state = {
  searchTerm: "",
  cafe: "%",
  province: "%",
  district: "%"
};

// Retrieves available filter options from the backend
// Gets lists of cafe names, provinces, and districts
async function fetchFilterOptions() {
  try {
    const response = await fetch("http://localhost:5000/api/filter-options", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    populateFilterOptions(data.names, data.provinces, data.districts);
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
}

// Fills the dropdown menus with filter options
// Maintains "All" as the default selection for each filter
function populateFilterOptions(cafeNames, provinces, districts) {
  // Clear existing options except the default "All" option
  cafeFilter.innerHTML = '<option value="%" selected>All Cafes</option>';
  provinceFilter.innerHTML = '<option value="%" selected>All Province</option>';
  districtFilter.innerHTML = '<option value="%" selected>All District</option>';

  // Add cafe options
  cafeNames.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    cafeFilter.appendChild(option);
  });

  // Add province options
  provinces.forEach(province => {
    const option = document.createElement("option");
    option.value = province;
    option.textContent = province;
    provinceFilter.appendChild(option);
  });

  // Add district options
  districts.forEach(district => {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    districtFilter.appendChild(option);
  });
}

// Fetches cafe data based on current search filters
// Uses state object to track current filter values
async function fetchCafeData() {
  try {
    const response = await fetch(`http://localhost:5000/api/cafes?search=${state.searchTerm}&cafe=${state.cafe}&province=${state.province}&district=${state.district}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const cafes = await response.json();
    renderCafeList(cafes);
  } catch (error) {
    console.error("Error fetching cafe data:", error);
  }
}

// Creates and displays cafe cards based on search results
// Shows "No cafes found" message if results are empty
function renderCafeList(cafes) {
  locationsContainer.innerHTML = ""; // Clear existing content

  if (cafes.length === 0) {
    locationsContainer.innerHTML = "<p class='empty-list-text'>No cafes found.</p>";
    return;
  }

  const cardList = document.createElement("div");
  cardList.className = "card-list";

  cafes.forEach((cafe) => {
    const card = document.createElement("div");
    card.className = "location-card";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <img src="../Image/${cafe.imgName}1.jpg" alt="${cafe.branch}" class="location-image" />
      <div class="location-content">
        <h2 class="location-title">${cafe.branch}</h2>
        <div class="location-row">
          <img src="Image/Pin.png" alt="Location pin" />
          <p class="location-address">${cafe.address}</p>
        </div>
      </div>
    `;

    // Add click handler to redirect to detail page
    card.addEventListener('click', () => {
      window.location.href = `/cafes/detail?id=${cafe.id}`;
    });

    cardList.appendChild(card);
  });

  locationsContainer.appendChild(cardList);
}

// Event Listeners for Search and Filters
// Updates state and refreshes results when search input changes
searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value.trim();
  fetchCafeData();
});

// Updates state and refreshes results when cafe filter changes
cafeFilter.addEventListener("change", () => {
  state.cafe = cafeFilter.value;
  fetchCafeData();
});

// Updates state and refreshes results when province filter changes
provinceFilter.addEventListener("change", () => {
  state.province = provinceFilter.value;
  fetchCafeData();
});

// Updates state and refreshes results when district filter changes
districtFilter.addEventListener("change", () => {
  state.district = districtFilter.value;
  fetchCafeData();
});

// Resets all filters to default values
// Clears search and refreshes results
searchForm.addEventListener("reset", () => {
  state.searchTerm = "";
  state.cafe = "%";
  state.province = "%";
  state.district = "%";
  
  // Reset select elements to their default options
  cafeFilter.value = "%";
  provinceFilter.value = "%";
  districtFilter.value = "%";
  
  fetchCafeData();
});

// Initializes the page by loading filter options and initial cafe data
async function initialize() {
  await fetchFilterOptions();
  await fetchCafeData();
}

// Start the application
initialize(); 