
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
  iniciarRotacionAutomatica();
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

  // Query con relación correcta
  let query = supabase.from("evento").select(`
    id,
    nombre_evento,
    descripcion,
    horario_evento,
    imagen_url,
    tipo_evento:tipo_evento_id(nombre_tipo),
    estacion:estacion_id(
      nombre_estacion,
      linea:linea_id(nombre_linea)
    )
  `);

  if (tipo) query = query.eq("tipo_evento_id", tipo);
  // Filtrar por línea
  if (linea) {
    // 1️⃣ Traer todas las estaciones que pertenecen a la línea seleccionada
    const { data: estaciones, error: errEst } = await supabase
      .from("estaciones")
      .select("id")
      .eq("linea_id", linea);

    if (errEst) return console.error(errEst);

    const estacionesIds = estaciones.map(e => e.id);

    // 2️⃣ Filtrar eventos por estación_id que esté dentro del conjunto
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
    carousel.innerHTML = "<p>No hay eventos disponibles.</p>";
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement("div");
    card.classList.add("card");
    
    card.innerHTML = `
      <div class="card-img-container">
        <img src="${ev.imagen_url}" alt="${ev.nombre_evento}">
        <button class="btn-favorito" data-evento-id="${ev.id}">❤️</button>
      </div>
      <div class="card-content">
        <h3>${ev.nombre_evento}</h3>
        <small>${ev.tipo_evento?.nombre_tipo} • ${ev.estacion?.nombre_estacion} • ${ev.estacion?.linea?.nombre_linea}</small>
        <p>${ev.descripcion}</p>
        <p><strong>${ev.horario_evento}</strong></p>
      </div>
    `;
    carousel.appendChild(card);
  });
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
// Rotación automática del carrusel
// ================================
let rotacionInterval;

function iniciarRotacionAutomatica() {
  const carousel = document.getElementById("listaEventos");
  if (!carousel) return;

  rotacionInterval = setInterval(() => {
    carousel.scrollBy({ left: carousel.clientWidth * 0.7, behavior: "smooth" });
    if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth) {
      carousel.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, 5000);
}
