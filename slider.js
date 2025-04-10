export function initSlider({ trackId = "sliderTrack", interval = 3000 }) {
  const state = {
    currentSlide: 0,
    slides: document.querySelectorAll(".slider-image"),
    sliderTrack: document.getElementById(trackId),
    indicators: document.querySelectorAll(".indicator-dot"),
    autoplayInterval: null,
  };

  const totalSlides = state.slides.length;

  function updateSlider() {
    state.sliderTrack.style.transform = `translateX(-${state.currentSlide * 100}%)`;
    state.indicators.forEach((dot, i) =>
      dot.classList.toggle("active", i === state.currentSlide)
    );
    state.slides.forEach((slide, i) =>
      slide.style.transform = `scale(${i === state.currentSlide ? 1 : 0.95})`
    );
  }

  function goToSlide(index) {
    state.currentSlide = index;
    updateSlider();
  }

  function prevSlide() {
    goToSlide((state.currentSlide - 1 + totalSlides) % totalSlides);
  }

  function nextSlide() {
    goToSlide((state.currentSlide + 1) % totalSlides);
  }

  function startAutoplay() {
    stopAutoplay();
    state.autoplayInterval = setInterval(nextSlide, interval);
  }

  function stopAutoplay() {
    clearInterval(state.autoplayInterval);
  }

  function handleKeyboard(e) {
    if (e.key === "ArrowLeft") prevSlide();
    else if (e.key === "ArrowRight") nextSlide();
  }

  document.querySelector(".prev-button")?.addEventListener("click", prevSlide);
  document.querySelector(".next-button")?.addEventListener("click", nextSlide);
  state.indicators.forEach((dot, i) => dot.addEventListener("click", () => goToSlide(i)));
  document.querySelector(".slider-container")?.addEventListener("mouseenter", stopAutoplay);
  document.querySelector(".slider-container")?.addEventListener("mouseleave", startAutoplay);
  document.addEventListener("keydown", handleKeyboard);

  updateSlider();
  startAutoplay();
}

import { initSlider } from './slider.js';
document.addEventListener('DOMContentLoaded', () => initSlider({}));
