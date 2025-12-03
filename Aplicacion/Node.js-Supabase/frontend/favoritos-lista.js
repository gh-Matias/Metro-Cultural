console.log("favoritos-lista cargado correctamente");

const supabase = window.supabase.createClient(
  "https://jgiwhiccqbzeffyndsbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdoaWNjcWJ6ZWZmeW5kc2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzM1MDIsImV4cCI6MjA3NTg0OTUwMn0.Q7qh7dODhSTFTKvOmwrkA9mYkbxAhDK28AyaVdJjCk4"
);

function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("lista-favoritos");
  const filtroContainer = document.getElementById("filtro-lineas");

  if (!contenedor) {
    console.error("No se encontró el contenedor #lista-favoritos");
    return;
  }

  // 1️⃣ Verificar sesión del usuario
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error obteniendo usuario:", userError);
  }

  if (!user) {
    contenedor.innerHTML = "<p>⚠️ Debes iniciar sesión para ver tus favoritos.</p>";
    return;
  }

  // 2️⃣ Consultar favoritos (incluye línea y estación)
  const { data: favoritos, error } = await supabase
    .from("favorito")
    .select(`
      id,
      lugar_cultural (
        id,
        nombre_lugar,
        direccion_cultural,
        imagen_url,
        horario_apertura,
        horario_cierre,
        descripcion_cultural,
        estacion:estacion_id (
          nombre_estacion,
          linea:linea_id (
            id,
            numero_linea,
            nombre_linea,
            color
          )
        )

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

  // 3️⃣ Obtener líneas únicas desde los favoritos
    const lineasMap = new Map();
    favoritos.forEach(fav => {
    const linea = fav.lugar_cultural?.estacion?.linea;
    if (linea) {
    lineasMap.set(linea.id, linea);
  }
});

// Convertir el map a arreglo
const lineas = Array.from(lineasMap.values());

// 4️⃣ Renderizar botones del filtro SOLO con líneas presentes en favoritos
if (filtroContainer) {
  filtroContainer.innerHTML = `
    <button class="filtro-btn" data-linea="all">Todas</button>
    ${lineas
      .map(
        l => `
        <button 
          class="filtro-btn" 
          data-linea="${l.id}" 
          style="
            background:${hexToRgba(l.color, 0.8)};
            color:white;
            border:none;">
          Línea ${l.numero_linea}
        </button>
      `
      )
      .join("")}
  `;
}


  // 5️⃣ Función reutilizable para mostrar favoritos
  function renderFavoritos(lista) {
    contenedor.innerHTML = "";

    lista.forEach(fav => {
      const lugar = fav.lugar_cultural;
      if (!lugar) return;

      const estacion = lugar.estacion;
      const linea = estacion?.linea;

      const card = document.createElement("div");
      card.classList.add("favorito-card");

      card.innerHTML = `
        <img src="${lugar.imagen_url || 'default.jpg'}" class="favorito-img">

        <h3>${lugar.nombre_lugar}</h3>
        <p>${lugar.direccion_cultural}</p>

        <small>
          <img src="img/subterraneo.png" class="icono-small" alt="estacion">
          ${estacion?.nombre_estacion || ""}
          · Línea ${linea?.numero_linea || ""}
        </small>
    
        <p>
        🕒${lugar.horario_apertura || ""} - ${lugar.horario_cierre || ""}</p>

        
        <p class="descripcion">${lugar.descripcion_cultural}</p>


        <br>

        <a 
  class="btn-como-llegar" 
  href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lugar.direccion_cultural)}" 
  target="_blank">
  📍 Cómo llegar
</a>


        <button class="btn-eliminar" data-id="${fav.id}">
        <img src="img/icons_remove.png" alt="icono eliminar"> 
        <span>Eliminar</span></button>
       <br>
      `;

      contenedor.appendChild(card);
    });
  }

  // Mostrar favoritos al cargar
  renderFavoritos(favoritos);

  // 6️⃣ Filtración dinámica por línea
  if (filtroContainer) {
    filtroContainer.addEventListener("click", (e) => {
      if (!e.target.classList.contains("filtro-btn")) return;

      const lineaId = e.target.dataset.linea;

      if (lineaId === "all") {
        renderFavoritos(favoritos);
        return;
      }

      const filtrados = favoritos.filter(fav =>
        fav.lugar_cultural?.estacion?.linea?.id == lineaId
      );

      renderFavoritos(filtrados);
    });
  }

  // 7️⃣ Eliminar favorito
  contenedor.addEventListener("click", async (e) => {
    const boton = e.target.closest(".btn-eliminar");
    if (!boton) return;

    const favoritoId = boton.dataset.id;
    const cardElement = boton.closest(".favorito-card");

    if (!confirm("¿Deseas eliminar este favorito?")) return;

    const { data, error } = await supabase
      .from("favorito")
      .delete()
      .eq("id", favoritoId)
      .select();

    if (error) {
      alert("No se pudo eliminar el favorito.");
    } else {
      cardElement.remove();
      alert("Favorito eliminado correctamente.");
    }
  });
});

