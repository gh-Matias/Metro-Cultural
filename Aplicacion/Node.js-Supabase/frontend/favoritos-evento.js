document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("lista-eventos-favoritos");

  if (!contenedor) return console.error("No se encontró #lista-eventos-favoritos");

  // Verificar usuario
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    contenedor.innerHTML = "<p></p>";
    return;
  }

  // Consultar eventos favoritos
  const { data: eventosFavoritos, error } = await supabase
    .from("favorito")
    .select(`
      id,
      evento (
        id,
        nombre_evento,
        descripcion,
        horario_evento,
        imagen_url
      )
    `)
    .eq("user_id", user.id)
    .not("evento_id", "is", null); // Solo favoritos que sean eventos

  if (error) {
    console.error("Error al obtener eventos favoritos:", error);
    contenedor.innerHTML = "<p>Error al cargar tus eventos favoritos.</p>";
    return;
  }

  if (!eventosFavoritos || eventosFavoritos.length === 0) {
    contenedor.innerHTML = "<p>No tienes eventos guardados todavía.</p>";
    return;
  }

  // Mostrar favoritos
  contenedor.innerHTML = "";
  eventosFavoritos.forEach(fav => {
    const evento = fav.evento;
    if (!evento) return;

    const card = document.createElement("div");
    card.classList.add("favorito-card");

    card.innerHTML = `
      <img src="${evento.imagen_url || 'default.jpg'}" alt="${evento.nombre_evento}" class="favorito-img">
      <h3>${evento.nombre_evento}</h3>
      <p>${evento.descripcion}</p>
      <p><strong>${evento.horario_evento}</strong></p>
      <button class="btn-eliminar" data-id="${fav.id}">🗑️ Eliminar</button>
    `;

    contenedor.appendChild(card);
  });

  // Eliminar favorito
  contenedor.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("btn-eliminar")) return;

    const favoritoId = e.target.dataset.id;
    const cardElement = e.target.closest(".favorito-card");

    if (!confirm("¿Deseas eliminar este favorito?")) return;

    const { data, error } = await supabase
      .from("favorito")
      .delete()
      .eq("id", favoritoId)
      .select();

    if (error) {
      alert("❌ No se pudo eliminar el favorito.");
    } else {
      cardElement.remove();
      alert("✅ Favorito eliminado correctamente.");
    }
  });
});

