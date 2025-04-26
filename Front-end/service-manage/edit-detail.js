// Wrap the code in an async function
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

// Call the function to load cafe details
loadCafeDetails();