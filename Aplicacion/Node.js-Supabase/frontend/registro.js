const form = document.getElementById("registroForm"); 
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarErrores();

  const nombre_cliente = document.getElementById("nombre").value.trim();
  const direccion_cliente = document.getElementById("direccion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  let valido = true;

  // Validaciones
  if (!nombre_cliente) mostrarError("nombre", "El nombre es obligatorio"), (valido = false);
  if (!email || !validarEmail(email)) mostrarError("email", "Correo electrónico no válido"), (valido = false);
  if (!password || password.length < 6)
    mostrarError("password", "La contraseña debe tener al menos 6 caracteres"), (valido = false);
  if (telefono && !/^\d{7,15}$/.test(telefono))
    mostrarError("telefono", "Teléfono no válido"), (valido = false);

  if (!valido) return;

  // Si pasa validaciones, enviar
  mensaje.textContent = "Registrando usuario...";
  mensaje.style.color = "#333";

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre_cliente, direccion_cliente, telefono })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al registrar el usuario");

    mensaje.textContent = "Usuario registrado correctamente";
    mensaje.style.color = "green";

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 1500);

  } catch (err) {
    mensaje.textContent = err.message;
    mensaje.style.color = "red";
  }
});

// Funciones auxiliares
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarError(campoId, mensajeError) {
  const grupo = document.getElementById(campoId).parentElement;
  grupo.classList.add("error");
  grupo.querySelector(".error-msg").textContent = mensajeError;
}

function limpiarErrores() {
  document.querySelectorAll(".form-group").forEach((g) => {
    g.classList.remove("error");
    g.querySelector(".error-msg").textContent = "";
  });
}