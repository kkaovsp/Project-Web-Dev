// Global variables for map functionality
var map;
var searchMarker;

// Loads cafe details from the backend API using the cafe ID from URL
// Fetches and displays all cafe information including images
async function loadCafeDetails() {
    const params = new URLSearchParams(window.location.search);
    const cafeId = params.get("id");
    console.log(cafeId);

    if (!cafeId) {
        alert("No cafe ID provided!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/cafes/${cafeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cafe details.");
        }

        const cafe = await response.json();
        renderCafeDetails(cafe);
        window.name = cafe.branch;
        window.branch = `${cafe.name} ${cafe.branch}`;
        window.address = `${cafe.name} ${cafe.address}`;

    } catch (error) {
        console.error(error);
        alert("Error loading cafe details.");
    }
}

// Updates the UI with cafe information and images
// Sets up the image gallery with thumbnails
function renderCafeDetails(cafe) {
    // Update details of cafe
    document.querySelector(".cafe-name").textContent = cafe.branch;
    document.querySelector(".address-text").textContent = cafe.address;
    document.querySelector(".phoneNum").textContent = cafe.contact;
    document.querySelector(".weekdays").textContent = `${cafe.open_hour} - ${cafe.close_hour}`;

    // Set CSS styles to preview gallery
    const thumbnails = document.querySelectorAll(".cafe-thumbnail");
    thumbnails.forEach((thumbnail) => {
        thumbnail.style.display = "block"; // Make each thumbnail visible
    });

    document.querySelector(".gallery-container").style.borderStyle = "none";

    // Update main image and thumbnails
    const mainImage = document.getElementById("main-image");
    mainImage.classList.remove("upload-placeholder");
    mainImage.classList.add("main-cafe-image");
    mainImage.src = `/Image/${cafe.imgName}1.jpg`;
    for (let i = 2; i <= 4; i++) {
        thumbnails[i - 2].src = `/Image/${cafe.imgName}${i}.jpg`; // Set each thumbnail's source 
    }
}

// Initializes the Leaflet map with default center at Bangkok
function initMap() {
    map = L.map('map').setView([13.7563, 100.5018], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Event handler for opening the map popup
// Initializes map if not already done and searches for cafe location
document.getElementById('open-map-btn').addEventListener('click', function () {
    document.getElementById('map-popup').style.display = 'flex';

    // Initialize map only once
    if (!map) {
        initMap();
    }

    // Now search for the address after map is ready
    doSearch(window.address);
});

// Event handler for closing the map popup
document.getElementById('close-map-btn').addEventListener('click', function () {
    document.getElementById('map-popup').style.display = 'none';
});

// Searches for cafe location using OpenStreetMap API
// Uses multiple fallback searches if exact location not found
async function doSearch() {
    try {
        console.log("Searching for: ", window.branch);
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(window.branch)}`;

        // Fetch the geocoding data from OpenStreetMap API
        const response = await fetch(geocodeUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;

            // Set the map view to the new location
            map.setView([lat, lon], 15);

            // Update or create marker
            if (searchMarker) {
                searchMarker.remove();
            }

            searchMarker = L.marker([lat, lon]).addTo(map)
                .bindPopup("Cafe Location")
                .openPopup();

        } else {
            // Fallback to branch name search
            console.log("Cafe not found, searching by Branch name: ", window.name);

            const addressFallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(window.name)}`;
            const fallbackResponse = await fetch(addressFallbackUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!fallbackResponse.ok) {
                throw new Error(`HTTP error! Status: ${fallbackResponse.status}`);
            }

            const fallbackData = await fallbackResponse.json();
            console.log(fallbackData);

            // If the address search returns results, use those coordinates
            if (fallbackData.length > 0) {
                const lat = fallbackData[0].lat;
                const lon = fallbackData[0].lon;

                // Set the map view to the new location (latitude, longitude)
                map.setView([lat, lon], 15);

                // Add a marker to the map at the searched location
                if (searchMarker) {
                    searchMarker.remove(); // Remove any previous marker
                }

                searchMarker = L.marker([lat, lon]).addTo(map)
                    .bindPopup("Cafe Location")
                    .openPopup();

            } else {
                // If no results found for the branch, fallback to using the full address
                console.log("Branch not found, searching by full address: ", window.address);

                const addressFallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(window.address)}`;
                const fallbackResponse = await fetch(addressFallbackUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP error! Status: ${fallbackResponse.status}`);
                }

                const fallbackData = await fallbackResponse.json();
                console.log(fallbackData);

                // If the address search returns results, use those coordinates
                if (fallbackData.length > 0) {
                    const lat = fallbackData[0].lat;
                    const lon = fallbackData[0].lon;

                    // Set the map view to the new location (latitude, longitude)
                    map.setView([lat, lon], 15);

                    // Add a marker to the map at the searched location
                    if (searchMarker) {
                        searchMarker.remove(); // Remove any previous marker
                    }

                    searchMarker = L.marker([lat, lon]).addTo(map)
                        .bindPopup("Cafe Location")
                        .openPopup();

                } else {
                    alert("Address not found.");
                }
            }
        }
    } catch (error) {
        console.error("Error searching location:", error);
        alert("Failed to find cafe location on map.");
    }
}

loadCafeDetails();