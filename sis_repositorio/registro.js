// Validación de interfaz. El registro real debe enviarse a un backend seguro.
const registerForm = document.querySelector("#register-form");
const registerFeedback = document.querySelector("#register-feedback");

registerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const password = formData.get("password");
  const confirmation = formData.get("confirmar");

  if (password !== confirmation) {
    registerFeedback.textContent = "Las contraseñas no coinciden. Revísalas e inténtalo de nuevo.";
    return;
  }

  registerFeedback.textContent = "Formulario validado visualmente. El registro todavía requiere conexión con el backend.";
});
