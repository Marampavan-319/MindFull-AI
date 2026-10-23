"use strict";

// MindFull Carrier — Part 1 interactions and top-level navigation
const careerCards = document.querySelectorAll(".career-card");
const continueButton = document.querySelector("#continue-button");
const selectionTitle = document.querySelector("#selection-title");
const selectionMessage = document.querySelector("#selection-message");
const toast = document.querySelector("#toast");
const currentYear = document.querySelector("#current-year");

let selectedCategory = null;
let toastTimer = null;

const categoryNames = {
  employment: "Employment",
  "higher-studies": "Higher Studies",
  "government-jobs": "Government Jobs",
  "college-career": "College Career",
  entrepreneurship: "Entrepreneurship"
};

currentYear.textContent = new Date().getFullYear();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function selectCategory(category) {
  selectedCategory = category;

  careerCards.forEach((card) => {
    const isSelected = card.dataset.category === category;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  selectionTitle.textContent = `${categoryNames[category]} — let's explore it together.`;
  selectionMessage.textContent = "Your next step will be a short assessment tailored to this path.";
  continueButton.disabled = false;
}

careerCards.forEach((card) => {
  card.addEventListener("click", () => selectCategory(card.dataset.category));
});

continueButton.addEventListener("click", () => {
  if (!selectedCategory) {
    showToast("Choose a career path first.");
    return;
  }

  showToast(`${categoryNames[selectedCategory]} selected! Your personalized assessment is coming in Part 2.`);
});

console.log("MindFull Carrier Part 1 loaded successfully.");


// Top-level navigation: Home -> Guidance categories or Partnership placeholder.
const homeScreen = document.querySelector("#home-screen");
const guidanceContent = document.querySelector("#guidance-content");
const partnershipScreen = document.querySelector("#partnership-screen");
const viewButtons = document.querySelectorAll("[data-view]");
const navButtons = document.querySelectorAll(".header-nav [data-view]");

function showView(view) {
  homeScreen.hidden = view !== "home";
  guidanceContent.hidden = view !== "guidance";
  partnershipScreen.hidden = view !== "partnership";

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (view === "guidance") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showView(button.dataset.view);
  });
});
