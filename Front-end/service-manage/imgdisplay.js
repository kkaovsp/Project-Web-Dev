function swap(src, thumbnail) {
    const mainImage = document.getElementById("main-image");
    const tempSrc = mainImage.src; // Store the current main image source
    mainImage.src = src; // Set the main image to the clicked thumbnail's source
    thumbnail.src = tempSrc; // Set the clicked thumbnail to the previous main image source
  }

  document.querySelectorAll(".cafe-thumbnail").forEach(thumbnail => {
    thumbnail.addEventListener("click", () => {
        const src = thumbnail.src;
        console.log(src,thumbnail);
        swap(src, thumbnail);
    });
});