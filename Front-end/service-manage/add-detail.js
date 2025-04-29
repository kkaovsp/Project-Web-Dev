// Get elements
const openPopupBtn = document.getElementById("open-popup-btn");
const closePopupBtn = document.getElementById("close-popup-btn")
const popupForm = document.getElementById("popup-form");
const finalConfirmBtn = document.getElementById("final-confirm-btn");
const finalCancelBtn = document.getElementById("final-cancel-btn");

let cafeDetails = {}; // Object to store form data locally
let uploadedImages = []; // Array to store uploaded images

// Open popup
openPopupBtn.addEventListener("click", () => {
    popupForm.style.display = "flex";
});

// Close popup
closePopupBtn.addEventListener("click", () => {
    popupForm.style.display = "none";
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

// Render preview on the page
function renderPreview() {
    // Update text fields
    document.querySelector(".cafe-name").textContent = cafeDetails.branch || "Branch's name";
    document.querySelector(".address-text").textContent = cafeDetails.address || "-";
    document.querySelector(".weekdays").textContent = `${cafeDetails.open_hour || "-"} - ${cafeDetails.close_hour || "-"}`;

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

    console.log(uploadedImages);
    console.log(thumbnails.length);
    if (uploadedImages.length > 0) {
        mainImage.src = URL.createObjectURL(uploadedImages[0]); // Set the first image as the main image
        for (let i = 1; i < uploadedImages.length; i++) {
            if (i <= thumbnails.length) {
                thumbnails[i-1].src = URL.createObjectURL(uploadedImages[i]); // Set each thumbnail's source
            }
        }
    }        
}

// Handle final confirmation
finalConfirmBtn.addEventListener("click", async () => {
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
        const response = await fetch("http://localhost:5000/api/cafe", {
            method: "POST",
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

// Handle final cancel
finalCancelBtn.addEventListener("click", () => {
    cafeDetails = {};
    uploadedImages = [];
    alert("All details and images have been cleared.");
    location.reload(); // Reload the page
});


