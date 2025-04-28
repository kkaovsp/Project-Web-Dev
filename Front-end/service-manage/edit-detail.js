//Get Cafe Information Part 
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
    } catch (error) {
        console.error(error);
        alert("Error loading cafe details.");
    }
}


function renderCafeDetails(cafe) {
    // Update details of cafe
    document.querySelector(".cafe-name").textContent = cafe.branch
    document.querySelector(".address-text").textContent = cafe.address
    document.querySelector(".weekdays").textContent = `${cafe.open_hour} - ${cafe.close_hour}`;

    //Update placeholder with current details
    document.getElementById("popup-name").setAttribute("placeholder", cafe.name);
    document.getElementById("popup-branch").setAttribute("placeholder", cafe.branch);
    document.getElementById("popup-address").setAttribute("placeholder", cafe.address);
    document.getElementById("popup-province").setAttribute("placeholder", cafe.province);
    document.getElementById("popup-district").setAttribute("placeholder", cafe.district);
    document.getElementById("popup-pin-code").setAttribute("placeholder", cafe.pincode);
    document.getElementById("popup-contact-number").setAttribute("placeholder", cafe.contact);
    document.getElementById("popup-open-hour").setAttribute("placeholder", cafe.open_hour);
    document.getElementById("popup-close-hour").setAttribute("placeholder", cafe.close_hour);

    //Update value with the current details
    document.getElementById("popup-name").setAttribute("value", cafe.name);
    document.getElementById("popup-branch").setAttribute("value", cafe.branch);
    document.getElementById("popup-address").setAttribute("value", cafe.address);
    document.getElementById("popup-province").setAttribute("value", cafe.province);
    document.getElementById("popup-district").setAttribute("value", cafe.district);
    document.getElementById("popup-pin-code").setAttribute("value", cafe.pincode);
    document.getElementById("popup-contact-number").setAttribute("value", cafe.contact);
    document.getElementById("popup-open-hour").setAttribute("value", cafe.open_hour);
    document.getElementById("popup-close-hour").setAttribute("value", cafe.close_hour);

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

    //Public API MAP from LONGDO MAP
    initMap;
    doSearch(cafe.address);
}

var map;
function initMap() {
  map = new longdo.Map({
    placeholder: document.getElementById('map')
  });
}

function doSearch(search) {
    console.log(`Searching for: ${search}`)
    map.Search.search(search, {
        limit: 1
    });
}

// Show map popup
document.getElementById('open-map-btn').addEventListener('click', function() {
  document.getElementById('map-popup').style.display = 'flex';
  initMap(); // Load map when opening
});

// Close map popup
document.getElementById('close-map-btn').addEventListener('click', function() {
  document.getElementById('map-popup').style.display = 'none';
});



//Update Cafe Information Part
const openPopupBtn = document.getElementById("open-popup-btn");
const closePopupBtn = document.getElementById("close-popup-btn")
const popupForm = document.getElementById("popup-form");

// Open edit popup
openPopupBtn.addEventListener("click", () => {
    popupForm.style.display = "flex";
});

// Close edit popup 
closePopupBtn.addEventListener("click", () => {
    popupForm.style.display = "none";
});


// Handle popup form submission
popupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const params = new URLSearchParams(window.location.search);
    const cafeId = params.get("id");
    const name = document.getElementById("popup-name").value;
    const branch = document.getElementById("popup-branch").value;
    const address = document.getElementById("popup-address").value;
    const province = document.getElementById("popup-province").value;
    const district = document.getElementById("popup-district").value;
    const pin_code = document.getElementById("popup-pin-code").value;
    const contact_number = document.getElementById("popup-contact-number").value;
    const open_hour = document.getElementById("popup-open-hour").value;
    const close_hour = document.getElementById("popup-close-hour").value;
    const cafePictures = document.getElementById("popup-cafe-pictures").files;
    const oldBranch = document.getElementById("popup-branch").getAttribute("placeholder"); //Use for changing image name using old branch name to find image

    cafeDetails = {
        name,
        branch,
        province,
        district,
        pin_code,
        address,
        contact_number,
        open_hour,
        close_hour,
        oldBranch,
    };
    const uploadedImages = Array.from(cafePictures);

    // Close the popup form
    document.getElementById("popup-form").style.display = "none";

    const formData = new FormData();
    // Add text fields to FormData
    for (const [key, value] of Object.entries(cafeDetails)) {
        formData.append(key, value);
    }

    // Add uploaded images to FormData
    uploadedImages.forEach((file) => {
        formData.append("cafe_pictures", file);
    });

    try {
        const response = await fetch(`http://localhost:5000/api/cafes/${cafeId}`, {
            method: "PUT",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to add cafe");
        }

        alert("Cafe added successfully!");
        location.reload(); // Reload the page
    } catch (error) {
        console.error("Error adding cafe:", error);
        alert("Failed to add cafe.");
    }
});

loadCafeDetails();