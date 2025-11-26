const supabase = window.supabase.createClient(
  "https://jgiwhiccqbzeffyndsbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdoaWNjcWJ6ZWZmeW5kc2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzM1MDIsImV4cCI6MjA3NTg0OTUwMn0.Q7qh7dODhSTFTKvOmwrkA9mYkbxAhDK28AyaVdJjCk4"
);

// ================================
// Ejecutar al cargar la página
// ================================
document.addEventListener("DOMContentLoaded", () => {
  cargarFiltros();
  cargarEventos();
  configurarCarrusel();
  
});

// ================================
// Cargar filtros de tipo y línea
// ================================
async function cargarFiltros() {
  const tipoSelect = document.getElementById("filtroTipo");
  const lineaSelect = document.getElementById("filtroLinea");

  // Tipos de evento
  const { data: tipos, error: errorTipos } = await supabase.from("tipo_evento").select("*");
  if (errorTipos) return console.error(errorTipos);
  tipos?.forEach(t => {
    const op = document.createElement("option");
    op.value = t.id;
    op.textContent = t.nombre_tipo;
    tipoSelect.appendChild(op);
  });

  // Líneas
  const { data: lineas, error: errorLineas } = await supabase.from("tipos_linea").select("*");
  if (errorLineas) return console.error(errorLineas);
  lineas?.forEach(l => {
    const op = document.createElement("option");
    op.value = l.id;
    op.textContent = l.nombre_linea;
    lineaSelect.appendChild(op);
  });

  tipoSelect.addEventListener("change", cargarEventos);
  lineaSelect.addEventListener("change", cargarEventos);
}

// ================================
// Cargar eventos con filtros
// ================================
async function cargarEventos() {
  const tipo = document.getElementById("filtroTipo").value;
  const linea = document.getElementById("filtroLinea").value;

  let query = supabase.from("evento").select(`
    id,
    nombre_evento,
    descripcion,
    horario_evento,
    direccion,
    imagen_url,
    tipo_evento:tipo_evento_id(nombre_tipo),
    estacion:estacion_id(
      nombre_estacion,
      linea:linea_id(nombre_linea)
    )
  `);

  if (tipo) query = query.eq("tipo_evento_id", tipo);

  if (linea) {
    const { data: estaciones, error: errEst } = await supabase
      .from("estaciones")
      .select("id")
      .eq("linea_id", linea);

    if (errEst) return console.error(errEst);

    const estacionesIds = estaciones.map(e => e.id);
    query = query.in("estacion_id", estacionesIds);
  }

  const { data, error } = await query;
  if (error) return console.error(error);

  mostrarEventos(data);
}

// ================================
// Mostrar eventos en el carrusel
// ================================
function mostrarEventos(eventos) {
  const carousel = document.getElementById("listaEventos");
  carousel.innerHTML = "";

  if (!eventos || eventos.length === 0) {
    carousel.innerHTML = "<p class=no-disponible>No hay eventos disponibles.</p>";
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-img-container">
        <img src="${ev.imagen_url}" alt="${ev.nombre_evento}">
        <button class="btn-favorito" data-evento-id="${ev.id}">♡</button>
      </div>
      <div class="card-content">
        <h3>${ev.nombre_evento}</h3>
        <small>${ev.tipo_evento?.nombre_tipo} • ${ev.estacion?.nombre_estacion} • ${ev.estacion?.linea?.nombre_linea}</small>
        <h4>${ev.horario_evento}</h4>
        <p>${ev.descripcion}</p>

         <button class="btn-info" data-id="${ev.id}">Más información</button>

          <!-- NUEVO: Panel oculto -->
    <div class="info-extra" id="info-${ev.id}">
      <h4>Ubicación</h4>
      <p>${ev.direccion}</p>

      <iframe
        width="100%"
        height="200"
        style="border:0; border-radius:10px; margin-top:10px;"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=${encodeURIComponent(ev.direccion)}&output=embed">
      </iframe>
    </div>

      </div>
    `;
    carousel.appendChild(card);
  });

  // Actualizar botones de favoritos al cargar los eventos
  actualizarBotonesFavoritos();
}

// ================================
// Configurar botones del carrusel
// ================================
function configurarCarrusel() {
  const carousel = document.getElementById("listaEventos");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (!prevBtn || !nextBtn || !carousel) return;

  prevBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: -carousel.clientWidth * 0.7, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: carousel.clientWidth * 0.7, behavior: "smooth" });
  });
}

// ================================
// Favoritos de eventos (delegación)
// ================================
async function actualizarBotonesFavoritos() {
  const botones = document.querySelectorAll(".btn-favorito");
  if (!botones || botones.length === 0) return;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) return;

  // Obtener favoritos del usuario
  const { data: favoritos } = await supabase
    .from("favorito")
    .select("evento_id")
    .eq("user_id", user.id);

  const favIds = favoritos?.map(f => f.evento_id) || [];

  botones.forEach(btn => {
    const id = parseInt(btn.dataset.eventoId);
    if (favIds.includes(id)) {
      btn.textContent = "❤️";
    } else {
      btn.textContent = "♡";
    }
  });
}

// FAVORITOS — Guardar o eliminar al hacer clic (delegación)
// ==============================================================
document.getElementById("listaEventos")?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-favorito");
  if (!btn) return;

  const eventoId = btn.dataset.eventoId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Debes iniciar sesión para guardar favoritos.");

  const { data: favs } = await supabase
    .from("favorito")
    .select("*")
    .eq("user_id", user.id)
    .eq("evento_id", eventoId);

  if (favs && favs.length > 0) {
    await supabase.from("favorito").delete().eq("id", favs[0].id);
    btn.textContent = "♡";
  } else {
    await supabase.from("favorito").insert([{ user_id: user.id, evento_id: eventoId }]);
    btn.textContent = "❤️";
  }
});

// Delegación sobre el contenedor del carrusel (más seguro que document)
const lista = document.getElementById("listaEventos");
if (lista) {
  lista.addEventListener("click", (e) => {
    // Buscar el botón (por si haces clic en un icono dentro del botón)
    const btn = e.target.closest && e.target.closest(".btn-info");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    if (!id) {
      console.warn("btn-info sin data-id");
      return;
    }

    const panel = document.getElementById(`info-${id}`);
    if (!panel) {
      console.warn(`No se encontró panel info-${id}`);
      return;
    }

    // Toggle usando clase 'open'
    const isOpen = panel.classList.toggle("open");

    // Cambiar texto del botón
    btn.textContent = isOpen ? "Ocultar" : "Más información";

    // Debug (elimina cuando funcione)
    console.log(`info-${id} -> ${isOpen ? "abierto" : "cerrado"}`);
  });
} else {
  console.warn("No se encontró #listaEventos para delegar eventos.");

};
