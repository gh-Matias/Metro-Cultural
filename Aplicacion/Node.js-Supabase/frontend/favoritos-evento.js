document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("lista-eventos-favoritos");
  const filtrosContainer = document.getElementById("filtros-tipo");

  if (!contenedor) return console.error("No se encontró #lista-eventos-favoritos");

  // Usuario logueado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const sectionFavoritos = contenedor.closest("section");
    if (sectionFavoritos) {
    sectionFavoritos.style.display = "none";
  }

  // Crear aviso arriba del section
  let aviso = document.getElementById("aviso-no-login");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "aviso-no-login";
    aviso.style.textAlign = "center";
    aviso.style.padding = "20px";
    aviso.style.fontSize = "18px";
    aviso.style.fontWeight = "600";
    aviso.style.color = "#444";
    aviso.innerText = "";

    // Insertar justo antes del section (si existe)
    if (sectionFavoritos) {
      sectionFavoritos.parentNode.insertBefore(aviso, sectionFavoritos);
    } else {
      // fallback por si no existe
      document.body.prepend(aviso);
    }
  }

  return;
    
  }

  // Obtener eventos favoritos con tipo
  const { data: eventosFavoritos, error } = await supabase
    .from("favorito")
    .select(`
      id,
      evento (
        id,
        nombre_evento,
        descripcion,
        horario_evento,
        direccion,
        imagen_url,
        tipo_evento_id,
        tipo_evento:tipo_evento_id (
          nombre_tipo
        )
      )
    `)
    .eq("user_id", user.id)
    .not("evento_id", "is", null);

  if (error) {
    contenedor.innerHTML = "<p>Error al cargar favoritos.</p>";
    return;
  }

  if (!eventosFavoritos.length) {
    contenedor.innerHTML = "<p>No tienes eventos favoritos.</p>";
    return;
  }

  // -----------------------------
  // 1) CREAR LISTA DE TIPOS
  // -----------------------------
  const tiposSet = new Set();
  eventosFavoritos.forEach(f => {
    const tipo = f.evento?.tipo_evento?.nombre_tipo;
    if (tipo) tiposSet.add(tipo);
  });

  tiposSet.forEach(tipo => {
    const btn = document.createElement("button");
    btn.classList.add("filtro-btn");
    btn.dataset.tipo = tipo;
    btn.textContent = tipo;
    filtrosContainer.appendChild(btn);
  });

  // -----------------------------
  // 2) FUNCIÓN PARA MOSTRAR EVENTOS
  // -----------------------------
  function renderEventos(lista) {
    contenedor.innerHTML = "";

    lista.forEach(fav => {
      const evento = fav.evento;
      const tipo = evento.tipo_evento?.nombre_tipo || "Sin tipo";

      const card = document.createElement("div");
      card.classList.add("favorito-card");

      card.innerHTML = `
        <img src="${evento.imagen_url || 'default.jpg'}" class="favorito-img">
        <h3>${evento.nombre_evento}</h3>
        <p>${evento.descripcion}</p>
        <p>🗓️ ${evento.horario_evento}</p>

        <a 
  class="btn-como-llegar" 
  href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(evento.direccion)}" 
  target="_blank">
  📍 Cómo llegar
</a>
        
        <button class="btn-eliminar" data-id="${fav.id}">
        <img src="img/icons_remove.png" alt="icono eliminar">
        <span>Eliminar</span></button>
      `;

      contenedor.appendChild(card);
    });
  }

  // Mostrar todos inicialmente
  renderEventos(eventosFavoritos);


  let eventosFiltrados = [...eventosFavoritos]; // copia del array actual
  let ascendente = true;

// -----------------------------
// FILTRO POR TIPO
// -----------------------------
filtrosContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("filtro-btn")) return;

  document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
  e.target.classList.add("activo");

  const tipoSeleccionado = e.target.dataset.tipo;

  if (tipoSeleccionado === "todos") {
    eventosFiltrados = [...eventosFavoritos];
  } else {
    eventosFiltrados = eventosFavoritos.filter(
      f => f.evento?.tipo_evento?.nombre_tipo === tipoSeleccionado
    );
  }

  renderEventos(eventosFiltrados);
});

// -----------------------------
// ORDENAR POR FECHA
// -----------------------------
document.getElementById("ordenar-fecha").addEventListener("click", () => {
  eventosFiltrados.sort((a, b) => {
    const fechaA = new Date(a.evento.horario_evento);
    const fechaB = new Date(b.evento.horario_evento);

    return ascendente ? fechaA - fechaB : fechaB - fechaA;
  });

  renderEventos(eventosFiltrados);

  ascendente = !ascendente;
  document.getElementById("ordenar-fecha").textContent = ascendente
    ? "Ordenar por fecha ↑"
    : "Ordenar por fecha ↓";
});
  
  // -----------------------------
  // 4) ELIMINAR FAVORITO
  // -----------------------------
  contenedor.addEventListener("click", async (e) => {
    const boton = e.target.closest(".btn-eliminar");
    if (!boton) return;

    const favoritoId = boton.dataset.id;
    const cardElement = boton.closest(".favorito-card");

    if (!confirm("¿Deseas eliminar este favorito?")) return;

    await supabase.from("favorito").delete().eq("id", favoritoId);

    cardElement.remove();
  });

});

