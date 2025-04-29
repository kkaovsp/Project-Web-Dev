// Query DOM elements
const searchInput = document.getElementById("searchInput");
const cafeFilter = document.getElementById("Cafe");
const provinceFilter = document.getElementById("Province");
const districtFilter = document.getElementById("District");
const locationsContainer = document.querySelector(".locations-container");
const searchForm = document.querySelector(".filter-form");

// State object
const state = {
  searchTerm: "",
  cafe: "%",
  province: "%",
  district: "%"
};

// Fetch filter options from the server
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

// Populate filter dropdowns
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

// Fetch cafe data from the server
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

// Render the cafe list dynamically
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
          <img src="../Image/Pin.png" alt="Location pin" />
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

// Event listeners
searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value.trim();
  fetchCafeData();
});

cafeFilter.addEventListener("change", () => {
  state.cafe = cafeFilter.value;
  fetchCafeData();
});

provinceFilter.addEventListener("change", () => {
  state.province = provinceFilter.value;
  fetchCafeData();
});

districtFilter.addEventListener("change", () => {
  state.district = districtFilter.value;
  fetchCafeData();
});

// Handle form reset
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

// Initialize
async function initialize() {
  await fetchFilterOptions();
  await fetchCafeData();
}

initialize(); 