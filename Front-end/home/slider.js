document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slider-image");
  const indicators = document.querySelectorAll(".indicator-dot");
  const sliderTrack = document.getElementById("sliderTrack");
  const totalSlides = slides.length;
  let currentSlide = 0;
  let autoplay;

  const updateSlider = () => {
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    slides.forEach((slide, i) =>
      slide.style.transform = i === currentSlide ? "scale(1)" : "scale(0.95)"
    );
    indicators.forEach((dot, i) =>
      dot.classList.toggle("active", i === currentSlide)
    );
  };

  const goToSlide = (index) => {
    currentSlide = (index + totalSlides) % totalSlides;
    updateSlider();
  };

  const startAutoplay = () => {
    clearInterval(autoplay);
    autoplay = setInterval(() => goToSlide(currentSlide + 1), 3000);
  };

  const stopAutoplay = () => clearInterval(autoplay);

  document.querySelector(".next-button").addEventListener("click", () => goToSlide(currentSlide + 1));
  document.querySelector(".prev-button").addEventListener("click", () => goToSlide(currentSlide - 1));
  indicators.forEach((dot, i) => dot.addEventListener("click", () => goToSlide(i)));
  document.querySelector(".slider-container").addEventListener("mouseleave", startAutoplay);
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
    if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
  });

  updateSlider();
  startAutoplay();
});
