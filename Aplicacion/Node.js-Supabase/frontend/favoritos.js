// favoritos.js
const supabaseUrl = "https://jgiwhiccqbzeffyndsbf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdoaWNjcWJ6ZWZmeW5kc2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzM1MDIsImV4cCI6MjA3NTg0OTUwMn0.Q7qh7dODhSTFTKvOmwrkA9mYkbxAhDK28AyaVdJjCk4"; // tu anon key


document.addEventListener("DOMContentLoaded", async () => {
  const btnFavorito = document.getElementById("btn-favorito");

  if (!btnFavorito) {
    console.error("Botón de favorito no encontrado");
    return;
  }

  // Recuperar tokens del login
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token: access_token,
    });
    if (sessionError) console.error("Error al restaurar sesión:", sessionError);
  }

  btnFavorito.addEventListener("click", async () => {
    const lugarId = btnFavorito.dataset.lugarId;

    if (!lugarId) {
      alert("No se pudo obtener el ID del lugar.");
      return;
    }

    // Obtener usuario autenticado actual
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
      alert("Debes iniciar sesión para guardar favoritos.");
      console.error("Error usuario:", userError);
      return;
    }

    console.log("Usuario autenticado:", user.id);

    // Insertar en la tabla favrito
    const { error } = await supabase
      .from("favorito")
      .insert([{ user_id: user.id, lugar_id: lugarId }]);

    if (error) {
      console.error("Error al agregar favorito:", error);
      alert("No se pudo agregar a favoritos :(");
    } else {
      alert("¡Lugar agregado a tus favoritos!❤️");
    }
  });
});