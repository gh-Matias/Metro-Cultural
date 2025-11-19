// logout.js
console.log("logout.js cargado correctamente");

const SUPABASE_URL = "https://jgiwhiccqbzeffyndsbf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdoaWNjcWJ6ZWZmeW5kc2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzM1MDIsImV4cCI6MjA3NTg0OTUwMn0.Q7qh7dODhSTFTKvOmwrkA9mYkbxAhDK28AyaVdJjCk4";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const btnLogout = document.getElementById("btn-logout");
  const loginLink = document.querySelector('.nav-links a[href="Login.html"]');

  // 1) Restaurar sesión en el cliente Supabase si tenemos token guardado
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token") || access_token; // si no hay refresh, usar access para restaurar
  if (access_token) {
    // setSession restablece la sesión en el cliente Supabase (cookies/local storage interno)
    const { error: setErr } = await supabaseClient.auth.setSession({
      access_token,
      refresh_token
    });
    if (setErr) console.warn("No se pudo restaurar la sesión en supabaseClient:", setErr);
  }

  // 2) Chequear sesión real con Supabase
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const session = sessionData?.session ?? null;
  const user = session?.user ?? null;

  // Si no hay sesión válida, limpiar localStorage (evita "falso" logueo)
  if (!user) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  // 3) Mostrar/ocultar enlaces segun el estado
  if (user) {
    if (loginLink) loginLink.style.display = "none";
    if (btnLogout) btnLogout.style.display = "block";
  } else {
    if (loginLink) loginLink.style.display = "block";
    if (btnLogout) btnLogout.style.display = "none";
  }

  // 4) Evento de logout
  if (btnLogout) {
    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!confirm("¿Seguro que deseas cerrar sesión?")) return;

      // Cierra sesión en Supabase
      const { error } = await supabaseClient.auth.signOut();

      // Limpia localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      if (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Hubo un problema al cerrar sesión");
      } else {
        alert("Sesión cerrada correctamente 👋");
        window.location.href = "menu.html";
      }
    });
  }
});


