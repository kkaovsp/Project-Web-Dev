// Query DOM elements
const searchInput = document.querySelector(".search-input");
const restaurantFilter = document.getElementById("res-filter");
const provinceFilter = document.getElementById("province-filter");
const districtFilter = document.getElementById("district-filter");
const cafeListContainer = document.querySelector(".service-manager-list");
const resetButton = document.querySelector(".reset-button");
const deleteButton = document.querySelector(".delete-button");


// State object
const state = {
  searchTerm: "",
  restaurant: "%",
  province: "%",
  district: "%",
};

// Fetch cafe data from the server
async function fetchCafeData() {
  try {
    const response = await fetch(`http://localhost:5000/api/cafe-list?search=${state.searchTerm}&cafe=${state.restaurant}&province=${state.province}&district=${state.district}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log(`Search: ${state.searchTerm} and Restaurant: ${state.restaurant} Province: ${state.province} District: ${state.district}`);
    const cafes = await response.json();
    renderCafeList(cafes);
  } catch (error) {
    console.error("Error fetching cafe data:", error);
  }
}

// Render the cafe list dynamically
function renderCafeList(cafes) {
  cafeListContainer.innerHTML = ""; // Clear existing content

  if (cafes.length === 0) {
    cafeListContainer.innerHTML = "<p class='empty-list'>No cafes found.</p>";
    return;
  }

  cafes.forEach((cafe) => {
    const card = document.createElement("section");
    card.className = "card-list";
    card.innerHTML = `
                  <div class="card-content">
                      <div class="card-main-content">
                          <div class="card-image-column">
                              <img src="/Image/${cafe.imgName}1.jpg" class="cafe-image" />
                          </div>
                          <div class="card-text-column">
                              <h2 class="cafe-name">${cafe.branch}</h2>
                          </div>
                      </div>
                  </div>
                  <div class="card-actions">
                      <button onclick="window.location.href = '/admin/service-management/edit'" class="action-button"
                          aria-label="Edit Caltex Borom Inbound">
                          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/342c30213b2cf65bf1ea3dde2b6ceb494f053c76?placeholderIfAbsent=true&apiKey=d0a187305ed94256a0b9cc329927d8f7"
                              alt="Edit" class="action-icon" />
                      </button>
                      <button class="delete-button" aria-label="Delete Cafe">
                          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/a721eb1e785c688c6a7cda4b1fd2e1d138869616?placeholderIfAbsent=true&apiKey=d0a187305ed94256a0b9cc329927d8f7"
                              alt="Delete" class="action-icon" />
                      </button>
                  </div>`;
    cafeListContainer.appendChild(card);
  });
}

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

    const restaurant = await response.json();
    populateFilterOptions(restaurant.names, restaurant.provinces, restaurant.districts);
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
}

  function populateFilterOptions(restaurant, province, district) {

  restaurant.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    restaurantFilter.appendChild(option);
  });

  province.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provinceFilter.appendChild(option);
  });

  district.forEach((dist) => {
    const option = document.createElement("option");
    option.value = dist;
    option.textContent = dist;
    districtFilter.appendChild(option);
  });
}



// Event listeners
searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value.trim();
  fetchCafeData();
});

restaurantFilter.addEventListener("change", () => {
  state.restaurant = restaurantFilter.value;
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

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  restaurantFilter.value = "%";
  provinceFilter.value = "%";
  districtFilter.value = "%";
  state.searchTerm = "";
  state.restaurant = "%";
  state.province = "%";
  state.district = "%";
  fetchCafeData();
});

// Initialize
async function initialize() {
  await fetchCafeData(); 
  await fetchFilterOptions();
}

initialize();