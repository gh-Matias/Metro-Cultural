document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (!hamburger || !navLinks) {
    console.log("No se encontró el menú en el DOM aún.");
    return;
  }

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
});
