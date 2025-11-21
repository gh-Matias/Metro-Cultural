console.log("favoritos-lista cargado correctamente");

const supabase = window.supabase.createClient(
  "https://jgiwhiccqbzeffyndsbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdoaWNjcWJ6ZWZmeW5kc2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzM1MDIsImV4cCI6MjA3NTg0OTUwMn0.Q7qh7dODhSTFTKvOmwrkA9mYkbxAhDK28AyaVdJjCk4"
);

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("lista-favoritos");

  if (!contenedor) {
    console.error("No se encontró el contenedor #lista-favoritos");
    return;
  }

  //Verificar sesión del usuario
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error obteniendo usuario:", userError);
  }

  if (!user) {
    contenedor.innerHTML = "<p>⚠️ Debes iniciar sesión para ver tus lugares y eventos favoritos.</p>";
    return;
  }

  //Consultar favoritos
  const { data: favoritos, error } = await supabase
    .from("favorito")
    .select(`
      id,
      lugar_cultural (
        id,
        nombre_lugar,
        direccion_cultural,
        imagen_url
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error al obtener favoritos:", error);
    contenedor.innerHTML = "<p>Error al cargar tus favoritos.</p>";
    return;
  }













  
  if (!favoritos || favoritos.length === 0) {
    contenedor.innerHTML = "<p>No tienes lugares guardados todavía.</p>";
    return;
  }

  // Mostrar favoritos
  contenedor.innerHTML = "";
  favoritos.forEach(fav => {
    const lugar = fav.lugar_cultural;
    if (!lugar) return;

    const card = document.createElement("div");
    card.classList.add("favorito-card");

    card.innerHTML = `
      <img src="${lugar.imagen_url || 'default.jpg'}" alt="${lugar.nombre_lugar}" class="favorito-img">
      <h3>${lugar.nombre_lugar}</h3>
      <p>${lugar.direccion_cultural}</p>
      <button class="btn-eliminar" data-id="${fav.id}">🗑️ Eliminar</button>
    `;

    contenedor.appendChild(card);
  });

  // Función para eliminar
  contenedor.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("btn-eliminar")) return;

    const favoritoId = e.target.dataset.id;
    const cardElement = e.target.closest(".favorito-card");

    if (!confirm("¿Deseas eliminar este favorito?")) return;

    console.log("Intentando eliminar favorito con ID:", favoritoId);

    const { data, error } = await supabase
      .from("favorito")
      .delete()
      .eq("id", favoritoId)
      .select();

    console.log("Resultado DELETE:", { data, error });

    if (error) {
      alert("❌ No se pudo eliminar el favorito.");
    } else if (!data || data.length === 0) {
      alert("⚠️ No se encontró el registro a eliminar.");
    } else {
      cardElement.remove();
      alert("✅ Favorito eliminado correctamente.");
    }
  });

   // 5️⃣ Mostrar favoritos de eventos
  favEventos?.forEach(fav => {
    const ev = fav.evento;
    if (!ev) return;
    const card = document.createElement("div");
    card.classList.add("favorito-card");
    card.innerHTML = `
      <img src="${ev.imagen_url || 'default.jpg'}" alt="${ev.nombre_evento}" class="favorito-img">
      <h3>${ev.nombre_evento}</h3>
      <small>${ev.tipo_evento?.nombre_tipo} • ${ev.estacion?.nombre_estacion} • ${ev.estacion?.linea?.nombre_linea}</small>
      <p>${ev.descripcion}</p>
      <p><strong>${ev.horario_evento}</strong></p>
      <button class="btn-eliminar" data-id="${fav.id}">🗑️ Eliminar</button>
    `;
    contenedor.appendChild(card);
  });
});

