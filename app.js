// Hamburger menu toggle
const hamburgerMenu = document.querySelector(".hamburger-menu");
const navMenu = document.querySelector(".nav-menu");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
    hamburgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
  }
});

// Close menu when clicking on a menu item
const menuItems = document.querySelectorAll(".nav-menu li");
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    hamburgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

function goToStore() {
  window.location.href = "store.html";
}
