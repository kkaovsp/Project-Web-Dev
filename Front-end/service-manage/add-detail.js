// Get elements
const openPopupBtn = document.getElementById("open-popup-btn");
const popupForm = document.getElementById("popup-form");
const popupConfirmBtn = document.getElementById("popup-confirm-btn");
const popupCancelBtn = document.getElementById("popup-cancel-btn");
const finalConfirmBtn = document.getElementById("final-confirm-btn");
const finalCancelBtn = document.getElementById("final-cancel-btn");

let cafeDetails = {}; // To store cafe details
let uploadedImages = []; // To store uploaded image paths

// Open popup
openPopupBtn.addEventListener("click", () => {
    popupForm.style.display = "flex";
});

// Close popup
popupCancelBtn.addEventListener("click", () => {
    popupForm.style.display = "none";
});

// Confirm popup details
popupConfirmBtn.addEventListener("click", async () => {
    const name = document.getElementById("popup-name").value;
    const branch = document.getElementById("popup-branch").value;
    const address = document.getElementById("popup-address").value;
    const province = document.getElementById("popup-province").value;
    const district = document.getElementById("popup-district").value;
    const pinCode = document.getElementById("popup-pin-code").value;
    const contactNumber = document.getElementById("popup-contact-number").value;
    const openHour = document.getElementById("popup-open-hour").value;
    const closeHour = document.getElementById("popup-close-hour").value;
    const accountId = document.getElementById("popup-account-id").value; // Get Account_ID
    const cafePictures = document.getElementById("popup-cafe-pictures").files;

    if (!name || !branch || !accountId) {
        alert("Please enter the cafe name, branch, and your account ID.");
        return;
    }

    cafeDetails = {
        name,
        branch,
        address,
        province,
        district,
        pin_code: pinCode,
        contact_number: contactNumber,
        open_hour: openHour,
        close_hour: closeHour,
        account_id: accountId,
    };

    uploadedImages = Array.from(cafePictures);
    document.querySelector(".cafe-name").textContent = `${name} (${branch})`;
    document.querySelector(".address-text").textContent = `${address}, ${district}, ${province}, ${pinCode}`;
    document.querySelector(".time-text").textContent = `${openHour} - ${closeHour}`;
    document.querySelector(".additional-time").textContent = `${openHour} - ${closeHour}`;
    popupForm.style.display = "none"; // Close the popup
});

// Final confirm
// Final confirm button
// This button will be used to send the data to the backend
finalConfirmBtn.addEventListener("click", async () => {
    const formData = new FormData();

    // Add text fields
    for (const [key, value] of Object.entries(cafeDetails)) {
        formData.append(key, value);
    }

    // Add uploaded images
    for (const file of uploadedImages) {
        formData.append("cafe_pictures", file); // same field name as your backend expects
    }

    try {
        const response = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to add cafe");
        }

        const data = await response.json();
        alert("Cafe added successfully!");
        location.reload(); // Reload the page
    } catch (error) {
        console.error("Error adding cafe:", error);
        alert("Failed to add cafe.");
    }
});

// Final cancel
finalCancelBtn.addEventListener("click", () => {
    cafeDetails = {};
    uploadedImages = [];
    alert("All details and images have been cleared.");
    location.reload(); // Reload the page
});


