import "./styles.css";

const yearNode = document.getElementById("year");
const menuToggle = document.querySelector(".hero__menu-toggle");
const topBar = document.querySelector(".hero__top");
const navLinks = document.querySelectorAll(".hero__nav a");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (menuToggle && topBar) {
  const setMenuState = (isOpen) => {
    topBar.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = topBar.classList.contains("is-open");
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 620) {
      setMenuState(false);
    }
  });
}
