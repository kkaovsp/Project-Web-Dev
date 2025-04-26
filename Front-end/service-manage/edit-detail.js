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
    // Update text fields
    document.querySelector(".cafe-name").textContent = cafe.branch
    document.querySelector(".address-text").textContent = cafe.address
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
            thumbnails[i-2].src = `/Image/${cafe.imgName}${i}.jpg`; // Set each thumbnail's source 
    }   
}

//Update Cafe Information Part
const openPopupBtn = document.getElementById("open-popup-btn");
const popupForm = document.getElementById("popup-form");
const finalConfirmBtn = document.getElementById("final-confirm-btn");
const finalCancelBtn = document.getElementById("final-cancel-btn");

let cafeDetails = {}; // Object to store form data locally
let uploadedImages = []; // Array to store uploaded images

// Open popup
openPopupBtn.addEventListener("click", () => {
    popupForm.style.display = "flex";
});

// Handle popup form submission
popupForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const name = document.getElementById("popup-name").value;
    const branch = document.getElementById("popup-branch").value;
    const address = document.getElementById("popup-address").value;
    const province = document.getElementById("popup-province").value;
    const district = document.getElementById("popup-district").value;
    const pin_code = document.getElementById("popup-pin-code").value;
    const contact_number = document.getElementById("popup-contact-number").value; 
    const open_hour = document.getElementById("popup-open-hour").value;
    const close_hour = document.getElementById("popup-close-hour").value; 
    const account_id = document.getElementById("popup-account-id").value;
    const cafePictures = document.getElementById("popup-cafe-pictures").files;

    // Save data locally
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
        account_id,     
    };

    // Save uploaded images locally
    uploadedImages = Array.from(cafePictures);

    // Render a preview
    renderPreview();

    // Close the popup form
    document.getElementById("popup-form").style.display = "none";
});

// Call the function to load cafe details
loadCafeDetails();