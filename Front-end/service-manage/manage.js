// Query DOM elements
const searchInput = document.querySelector(".search-input");
const restaurantFilter = document.getElementById("res-filter");
const provinceFilter = document.getElementById("province-filter");
const districtFilter = document.getElementById("district-filter");
const cafeListContainer = document.querySelector(".service-manager-list");

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
    cafeListContainer.innerHTML = "<p>No cafes found.</p>";
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
    console.log(restaurant)
    console.log((restaurant.names, restaurant.provinces, restaurant.districts));
    populateFilterOptions(restaurant.names, restaurant.provinces, restaurant.districts);
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
}

 function populateFilterOptions(restaurant, province, district) {

  // restaurant.for

  // province.forEach((prov) => {
  //   const option = document.createElement("option");
  //   option.value = prov;
  //   option.textContent = prov;
  //   provinceFilter.appendChild(option);
  // });

  // district.forEach((dist) => {
  //   const option = document.createElement("option");
  //   option.value = dist;
  //   option.textContent = dist;
  //   districtFilter.appendChild(option);
  // });
}



// Event listeners
searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value.trim();
  fetchCafeData();
});

restaurantFilter.addEventListener("change", () => {
  state.restaurant = restaurantFilter.textContent;
  fetchCafeData();
});

provinceFilter.addEventListener("change", () => {
  state.province = provinceFilter.textContent;
  fetchCafeData();
});

districtFilter.addEventListener("change", () => {
  state.district = districtFilter.textContent;
  fetchCafeData();
});

// Initialize
fetchCafeData();
fetchFilterOptions();