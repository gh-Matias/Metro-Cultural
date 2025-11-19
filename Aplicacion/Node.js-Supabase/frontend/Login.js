// login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Respuesta del backend:", data);

    if (!res.ok) {
      alert(`Error: ${data.error}`);
      return;
    }

    // Guarda token y usuario en localStorage
    // backend debe devolver data.token (access_token) y opcionalmente data.refresh_token
    localStorage.setItem("access_token", data.token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Inicio de sesión exitoso");
    window.location.href = "menu.html";
  } catch (error) {
    console.error("Error en login:", error);
    alert("Error al intentar iniciar sesión");
  }
});
