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
        <div class="card-main-content"
          <div class="card-image-column">
            <img src="/Image/${cafe.img_url}1" class ="cafe-image">
          </div>
          <div class="card-text-column">
          <h2 class="${cafe.img_url}">Caltex Borom Inbound</h2>
      </div>
    `;
    cafeListContainer.appendChild(card);
  });
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