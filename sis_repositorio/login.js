// Interacciones de demostración. La autenticación real requiere un backend.
const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");
const feedback = document.querySelector("#login-feedback");
const roleNote = document.querySelector("#role-note");
const roleButtons = document.querySelectorAll(".role-option");

togglePassword?.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.setAttribute("aria-pressed", String(isPassword));
  togglePassword.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
  togglePassword.textContent = isPassword ? "◎" : "◉";
});

roleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    roleButtons.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("selected");
    button.setAttribute("aria-pressed", "true");
    roleNote.textContent = `Perfil seleccionado: ${button.dataset.role}. La autorización debe validarse en el servidor.`;
  });
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "Interfaz de demostración: todavía falta conectar el inicio de sesión al backend.";
});

document.querySelector("#forgot-password")?.addEventListener("click", () => {
  feedback.textContent = "La recuperación de contraseña estará disponible cuando se configure el servicio de correo y el backend.";
});

const menuToggle = document.querySelector(".auth-header .menu-toggle");
const nav = document.querySelector(".auth-header .main-nav");
menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
