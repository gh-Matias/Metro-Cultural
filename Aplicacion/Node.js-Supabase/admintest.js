// Cambiar secciones
const menuItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".admin-section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    sections.forEach(sec => sec.classList.remove("visible"));
    document.getElementById(item.dataset.section).classList.add("visible");
  });
});

/* ==============================
    CRUD
============================== */
let eventos = [
  { id: 1, nombre: "Festival de Luces", ubicacion: "Parque O'Higgins", fecha: "2025-12-01", categoria: "Festival" },
  { id: 2, nombre: "Concierto Los Jaivas", ubicacion: "Teatro Cariola", fecha: "2025-12-15", categoria: "Concierto" }
];

function renderEventos() {
  const cont = document.getElementById("eventosContainer");
  cont.innerHTML = `
    <button id="addEventBtn">+ Agregar Evento</button>
    <table>
      <thead><tr><th>Nombre</th><th>Ubicación</th><th>Fecha</th><th>Categoría</th><th>Acciones</th></tr></thead>
      <tbody>
        ${eventos.map(e => `
          <tr>
            <td>${e.nombre}</td>
            <td>${e.ubicacion}</td>
            <td>${e.fecha}</td>
            <td>${e.categoria}</td>
            <td class="actions">
              <button class="edit" onclick="editEvento(${e.id})">Editar</button>
              <button class="delete" onclick="deleteEvento(${e.id})">Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
renderEventos();

function editEvento(id) {
  const ev = eventos.find(e => e.id === id);
  alert(`Editar: ${ev.nombre} (demo sin conexión)`);
}
function deleteEvento(id) {
  if (confirm("¿Eliminar este evento?")) {
    eventos = eventos.filter(e => e.id !== id);
    renderEventos();
  }
}

/* ==============================
  USUARIOS
============================== */
let usuarios = [
  { id: 1, nombre: "Felipe Gallardo", correo: "felipe@correo.cl", rol: "admin" },
  { id: 2, nombre: "Andrea López", correo: "andrea@gmail.com", rol: "usuario" }
];

function renderUsuarios() {
  const cont = document.getElementById("usuariosContainer");
  cont.innerHTML = `
    <button id="addUserBtn">+ Agregar Usuario</button>
    <table>
      <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
      <tbody>
        ${usuarios.map(u => `
          <tr>
            <td>${u.nombre}</td>
            <td>${u.correo}</td>
            <td>${u.rol}</td>
            <td class="actions">
              <button class="edit" onclick="editUsuario(${u.id})">Editar</button>
              <button class="delete" onclick="deleteUsuario(${u.id})">Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
renderUsuarios();

function editUsuario(id) {
  const u = usuarios.find(e => e.id === id);
  alert(`Modificar usuario: ${u.nombre}`);
}
function deleteUsuario(id) {
  if (confirm("¿Eliminar este usuario?")) {
    usuarios = usuarios.filter(e => e.id !== id);
    renderUsuarios();
  }
}

/* ==============================
   LÍNEAS DE METRO
============================== */
const lineas = [
  { id: 1, nombre: "Línea 1", color: "Rojo", estaciones: ["San Pablo", "Los Héroes", "Baquedano", "Tobalaba", "Los Dominicos"] },
  { id: 2, nombre: "Línea 2", color: "Amarillo", estaciones: ["Vespucio Norte", "Santa Ana", "Los Héroes", "San Miguel", "La Cisterna"] },
  { id: 3, nombre: "Línea 3", color: "Café", estaciones: ["Los Libertadores", "Puente Cal y Canto", "Universidad de Chile", "Ñuñoa", "Plaza Egaña"] },
  { id: 4, nombre: "Línea 4", color: "Azul", estaciones: ["Tobalaba", "Plaza Egaña", "Macul", "Vicuña Mackenna", "Puente Alto"] },
  { id: 5, nombre: "Línea 4A", color: "Verde Claro", estaciones: ["La Cisterna", "Santa Rosa", "La Granja", "Santa Julia", "Vicuña Mackenna"] },
  { id: 6, nombre: "Línea 5", color: "Verde", estaciones: ["Plaza de Maipú", "Quinta Normal", "Baquedano", "Santa Ana"] },
  { id: 7, nombre: "Línea 6", color: "Morado", estaciones: ["Cerrillos", "Lo Valledor", "Franklin", "Ñuble", "Los Leones"] }
];

function renderLineas() {
  const cont = document.getElementById("lineasContainer");
  cont.innerHTML = lineas.map(l => `
    <div class="linea-card">
      <h3>${l.nombre} - ${l.color}</h3>
      <p><strong>Estaciones:</strong> ${l.estaciones.join(", ")}</p>
      <div class="actions">
        <button class="edit" onclick="editLinea(${l.id})">Editar</button>
        <button class="delete" onclick="deleteLinea(${l.id})">Eliminar</button>
      </div>
    </div>
  `).join("");
}
renderLineas();

function editLinea(id) {
  const l = lineas.find(e => e.id === id);
  alert(`Editar ${l.nombre} (demo)`);
}
function deleteLinea(id) {
  if (confirm("¿Eliminar esta línea?")) {
    const index = lineas.findIndex(l => l.id === id);
    lineas.splice(index, 1);
    renderLineas();
  }
}
