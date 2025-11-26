// ===============================
// MOSTRAR USER ID DEL ADMIN ACTUAL
// ===============================

const storedUser = localStorage.getItem("user");

if (!storedUser) {
    console.warn("⚠️ No hay usuario logueado en localStorage. ¿Iniciaste sesión?");
} else {
    const user = JSON.parse(storedUser);
    console.log("UUID DEL ADMIN ACTUAL:", user.id || user.user_id);

    // mostrarlo en pantalla
    const cont = document.body;
    const displayId = document.createElement("div");
    displayId.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #eee;
        padding: 5px 10px;
        border-radius: 5px;
        z-index: 9999;
        font-family: sans-serif;
        font-size: 14px;
    `;
    displayId.textContent = `Admin UID: ${user.id || user.user_id}`;
    cont.appendChild(displayId);
}

//addUserBtn
function mostrarMensajeError(mensaje) {
    console.error("ERROR (Se necesita modal):", mensaje);
    
    const adminContainer = document.querySelector('.admin-content') || document.body;
    
    // Crear un elemento de mensaje temporal
    const msgElement = document.createElement('div');
    msgElement.textContent = `Error: ${mensaje}`;
    msgElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        font-family: sans-serif;
    `;
    
    adminContainer.appendChild(msgElement);
    
    setTimeout(() => {
        msgElement.remove();
    }, 4000);
}

const menuItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".admin-section");

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        sections.forEach(sec => sec.classList.remove("visible"));
        
        const targetSection = document.getElementById(item.dataset.section);
        if (targetSection) {
            targetSection.classList.add("visible");
            
            
            
        } else {
            console.error(`ERROR: No se encontró la sección con ID: ${item.dataset.section}`);
        }
    });
});

// ===============================
// DASHBOARD
// ===============================

document.addEventListener("DOMContentLoaded", cargarDashboard);

async function cargarDashboard() {
    const cont = document.getElementById("dashboardContainer");
    if (!cont) return;

    // Consultas a Supabase
    const [{ data: usuarios }, { data: eventos }, { data: lugares }, { data: admins }] = await Promise.all([
        supabase.from("cliente_perfil").select("*"),
        supabase.from("evento").select("*"),
        supabase.from("lugar_cultural").select("*"),
        supabase.from("admin").select("*").eq("activo", true)
    ]);

    // ==== TARJETAS SUPERIORES (Stats) ====
    cont.innerHTML = `
        <div class="dashboard-grid">
            <div class="card stat-card">
                <h3>Total Usuarios</h3>
                <p class="stat-number">${usuarios?.length || 0}</p>
            </div>

            <div class="card stat-card">
                <h3>Administradores activos</h3>
                <p class="stat-number">${admins?.length || 0}</p>
            </div>

            <div class="card stat-card">
                <h3>Total Eventos</h3>
                <p class="stat-number">${eventos?.length || 0}</p>
            </div>

            <div class="card stat-card">
                <h3>Lugares Culturales</h3>
                <p class="stat-number">${lugares?.length || 0}</p>
            </div>
        </div>

        <!-- LISTADOS RECIENTES -->
        <div class="dashboard-lists">
            <div class="card list-card">
                <h3>Últimos eventos agregados</h3>
                <ul>
                    ${
                       eventos?.slice(-5).reverse().map(ev => {
                        const usuario = admins.find(u => {
                            return u.user_id === ev.creado_por;
                        });

                        const nombreUsuario = usuario ? usuario.nombre_admin : "Desconocido";
                            return `<li>${ev.nombre_evento} <span class="added-by">    - ( Por: ${nombreUsuario})</span></li>`;
                        }).join("")

                    }
                </ul>
            </div>

            <div class="card list-card">
                <h3>Últimos lugares agregados</h3>
                <ul>

                  ${
                    lugares?.slice(-5).reverse().map(l => {
                        const usuario = admins.find(u => u.user_id === l.creado_por);
                        const nombreUsuario = usuario ? usuario.nombre_admin : "Desconocido";
                            return `<li>${l.nombre_lugar} <span class="added-by"> - (Por: ${nombreUsuario})</span></li>`;
                        }).join("")
                    }
                    
                </ul>
            </div>
        </div>

        <div id="eventoMasFavContainer"></div>
    `;

    await mostrarEventoMasFavoritoDashboard();
}


// ===============================
// USUARIOS (cliente_perfil)
// ===============================
document.addEventListener("DOMContentLoaded", cargarUsuarios);

async function cargarUsuarios() {
    const cont = document.getElementById("usuariosContainer");
    if (!cont) return;

    const { data, error } = await supabase
        .from("cliente_perfil")
        .select("*")
        .order("nombre_cliente", { ascending: true });

    if (error) {
        console.error(error);
        cont.innerHTML = "<p>Error al cargar usuarios</p>";
        return;
    }
    const roles = [
    { id: 1, nombre: "admin" },
    { id: 2, nombre: "cliente" }
];
    cont.innerHTML = `
        <button id="addUserBtn" onclick="abrirFormularioUsuario()">+ Agregar Usuario</button>

        <table>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(u => `
                    <tr>
                        <td>${u.user_id}</td>
                        <td>${u.nombre_cliente}</td>
                        <td>${u.correo}</td>
                        <td>${u.direccion_cliente}</td>
                        <td>${u.telefono}</td>
                        <td>${roles.find(r => r.id === u.rol_id)?.nombre || "Sin rol"}</td>
                        <td>
                            <button class="edit" onclick="editarUsuario('${u.user_id}')">Editar</button>
                            <button class="delete" onclick="eliminarUsuario('${u.user_id}')">Eliminar</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <div id="usuarioFormModal" class="modal hidden">
            <div class="modal-content">
                <h3 id="formUserTitle">Agregar Usuario</h3>

                <input type="hidden" id="userId">

                <label>Nombre</label>
                <input type="text" id="userNombre">

                <label>Correo</label>
                <input type="email" id="userCorreo">

                <label>Dirección</label>
                <input type="text" id="userDireccion">

                <label>Teléfono</label>
                <input type="text" id="userTelefono">

                <label>Rol</label>
                <select id="userRolId">
                ${roles.map(r => `
                    <option value="${r.id}">${r.nombre}</option>
                    `).join('')}
                    </select>


                <div class="modal-actions">
                    <button onclick="guardarUsuario()" class="save">Guardar</button>
                    <button onclick="cerrarFormularioUsuario()" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

// ===============================
// ABRIR / CERRAR FORMULARIO
// ===============================
function abrirFormularioUsuario() {
    document.getElementById("formUserTitle").textContent = "Agregar Usuario";
    document.getElementById("userId").value = "";
    document.getElementById("userNombre").value = "";
    document.getElementById("userCorreo").value = "";
    document.getElementById("userDireccion").value = "";
    document.getElementById("userTelefono").value = "";
    document.getElementById("userRolId").value = "";

    document.getElementById("usuarioFormModal").classList.remove("hidden");
}

function cerrarFormularioUsuario() {
    document.getElementById("usuarioFormModal").classList.add("hidden");
}

// ===============================
// EDITAR USUARIO (BUSCA POR user_id)
// ===============================
async function editarUsuario(userId) {

    const { data, error } = await supabase
        .from("cliente_perfil")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        mostrarMensajeError("Error cargando usuario: " + error.message);
        return;
    }

    document.getElementById("formUserTitle").textContent = "Editar Usuario";
    document.getElementById("userId").value = data.user_id;
    document.getElementById("userNombre").value = data.nombre_cliente;
    document.getElementById("userCorreo").value = data.correo;
    document.getElementById("userDireccion").value = data.direccion_cliente;
    document.getElementById("userTelefono").value = data.telefono;
    document.getElementById("userRolId").value = data.rol_id;

    document.getElementById("usuarioFormModal").classList.remove("hidden");
}

// ===============================
// GUARDAR (UPDATE usando user_id)
// ===============================
async function guardarUsuario() {
    const userId = document.getElementById("userId").value;

    const nuevoUsuario = {
        nombre_cliente: document.getElementById("userNombre").value,
        correo: document.getElementById("userCorreo").value,
        direccion_cliente: document.getElementById("userDireccion").value,
        telefono: document.getElementById("userTelefono").value,
        rol_id: parseInt(document.getElementById("userRolId").value) || null,
    };

    let res;

    if (userId) {
        console.log("🔄 MODO EDICIÓN → update() por user_id");
        res = await supabase
            .from("cliente_perfil")
            .update(nuevoUsuario)
            .eq("user_id", userId);

    } else {
        console.log("➕ MODO CREACIÓN → insert()");
        res = await supabase.from("cliente_perfil").insert([nuevoUsuario]);
    }

    if (res.error) {
        console.error("❌ ERROR:", res.error);
        mostrarMensajeError("Error al guardar usuario: " + res.error.message);
        return;
    }


    const esAdmin = nuevoUsuario.rol_id === 1;

if (userId) { // editar usuario
    if (esAdmin) {
        const { data: adminExistente, error: errorAdmin } = await supabase
            .from("admin")
            .select("*")
            .eq("user_id", userId)

        if (!adminExistente || adminExistente.length === 0) {
    // No existe → insert
    await supabase.from("admin").insert([{
        user_id: userId,
        nombre_admin: nuevoUsuario.nombre_cliente,
        rol_id: 1,
        activo: true
    }]);
} else {
    // Existe → update
    await supabase.from("admin").update({
        nombre_admin: nuevoUsuario.nombre_cliente,
        rol_id: 1,
        activo: true
    }).eq("user_id", userId);

        }
    } else {
        // Si el usuario deja de ser admin, marcar inactivo
        await supabase.from("admin").update({ activo: false }).eq("user_id", userId);
    }
} else { // nuevo usuario
    if (esAdmin) {
        await supabase.from("admin").insert([{
            user_id: res.data[0].user_id,
            nombre_admin: nuevoUsuario.nombre_cliente,
            rol_id: 1,
            activo: true
        }]);
    }
}




    cerrarFormularioUsuario();
    cargarUsuarios();
}

// ===============================
// ELIMINAR (por user_id)
// ===============================
async function eliminarUsuario(userId) {

    const { error } = await supabase
        .from("cliente_perfil")
        .delete()
        .eq("user_id", userId);

    if (error) {
        mostrarMensajeError("Error eliminando usuario: " + error.message);
        return;
    }

    cargarUsuarios();
}

window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.abrirFormularioUsuario = abrirFormularioUsuario;
window.cerrarFormularioUsuario = cerrarFormularioUsuario;
window.guardarUsuario = guardarUsuario;



// ===============================
// EVENTOS
// ===============================

// Cargar eventos al abrir sección
document.addEventListener("DOMContentLoaded", cargarEventos);

async function cargarEventos() {
    const cont = document.getElementById("eventosContainer");
    if (!cont) return; // evita error si la sección no existe aún

    const { data, error } = await supabase
        .from("evento")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        cont.innerHTML = "<p>Error al cargar eventos</p>";
        return;
    }

    cont.innerHTML = `
        <button id="addEventoBtn" onclick="abrirFormularioEvento()">+ Agregar Evento</button>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Horario</th>
                    <th>Estación</th>
                    <th>Dirección</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(ev => `
                    <tr>
                        <td>${ev.id}</td>
                        <td>${ev.nombre_evento}</td>
                        <td>${ev.tipo_evento_id}</td>
                        <td>${ev.descripcion?.substring(0,40) ?? ""}...</td>
                        <td>${ev.horario_evento}</td>
                        <td>${ev.estacion_id}</td>
                        <td>${ev.direccion}</td>
                        <td><img src="${ev.imagen_url}" style="width:50px; height:50px; object-fit:cover;"></td>

                        <td>
                            <button class="edit" onclick="editarEvento('${ev.id}')">Editar</button>
                            <button class="delete" onclick="eliminarEvento('${ev.id}')">Eliminar</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <!-- MODAL FORMULARIO EVENTOS -->
        <div id="eventoFormModal" class="modal hidden">
            <div class="modal-content">
                <h3 id="formEventoTitle">Agregar Evento</h3>

                <input type="hidden" id="eventoId">

                <label>Nombre del Evento</label>
                <input type="text" id="eventoNombre">

                <label>Tipo Evento (ID)</label>
                <input type="number" id="eventoTipo">

                <label>Descripción</label>
                <textarea id="eventoDescripcion"></textarea>

                <label>Horario</label>
                <input type="text" id="eventoHorario">

                <label>Estación (ID)</label>
                <input type="number" id="eventoEstacion">

                <label>Dirección</label>
                <input type="text" id="eventoDireccion">

                <label>Imagen URL</label>
                <input type="text" id="eventoImagenUrl">

                <div class="modal-actions">
                    <button onclick="guardarEvento()" class="save">Guardar</button>
                    <button onclick="cerrarFormularioEvento()" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

// ===============================
// ABRIR / CERRAR FORMULARIO EVENTO
// ===============================

function abrirFormularioEvento() {
    document.getElementById("formEventoTitle").textContent = "Agregar Evento";

    document.getElementById("eventoId").value = "";
    document.getElementById("eventoNombre").value = "";
    document.getElementById("eventoTipo").value = "";
    document.getElementById("eventoDescripcion").value = "";
    document.getElementById("eventoHorario").value = "";
    document.getElementById("eventoEstacion").value = "";
    document.getElementById("eventoDireccion").value = "";
    document.getElementById("eventoImagenUrl").value = "";

    document.getElementById("eventoFormModal").classList.remove("hidden");
}

function cerrarFormularioEvento() {
    document.getElementById("eventoFormModal").classList.add("hidden");
}

// ===============================
// EDITAR EVENTO
// ===============================

async function editarEvento(id) {
    const { data, error } = await supabase
        .from("evento")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        mostrarMensajeError("Error cargando evento: " + error.message);
        return;
    }

    document.getElementById("formEventoTitle").textContent = "Editar Evento";

    document.getElementById("eventoId").value = data.id;
    document.getElementById("eventoNombre").value = data.nombre_evento;
    document.getElementById("eventoTipo").value = data.tipo_evento_id;
    document.getElementById("eventoDescripcion").value = data.descripcion;
    document.getElementById("eventoHorario").value = data.horario_evento;
    document.getElementById("eventoEstacion").value = data.estacion_id;
    document.getElementById("eventoDireccion").value = data.direccion;
    document.getElementById("eventoImagenUrl").value = data.imagen_url;

    document.getElementById("eventoFormModal").classList.remove("hidden");
}

// ===============================
// GUARDAR (Agregar o Editar Evento)
// ===============================

async function guardarEvento() {
    const id = document.getElementById("eventoId").value;

    const storedUser = localStorage.getItem("user");
    let userId = null;
    if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id || user.user_id; // Dependiendo de cómo guardes el id
    }

    const nuevoEvento = {
        nombre_evento: document.getElementById("eventoNombre").value,
        tipo_evento_id: parseInt(document.getElementById("eventoTipo").value) || null,
        descripcion: document.getElementById("eventoDescripcion").value,
        horario_evento: document.getElementById("eventoHorario").value,
        estacion_id: parseInt(document.getElementById("eventoEstacion").value) || null,
        direccion: document.getElementById("eventoDireccion").value,
        imagen_url: document.getElementById("eventoImagenUrl").value,
        creado_por: userId,
    };

    let res;

    if (id) {
        res = await supabase.from("evento").update(nuevoEvento).eq("id", id);
    } else {
        res = await supabase.from("evento").insert([nuevoEvento]);
    }

    if (res.error) {
        console.error(res.error);
        mostrarMensajeError("Error al guardar evento: " + res.error.message);
        return;
    }

    cerrarFormularioEvento();
    cargarEventos();
}

// ===============================
// ELIMINAR EVENTO
// ===============================

async function eliminarEvento(id) {
    // Reemplazamos confirm()
    console.warn(`[CONFIRMACIÓN MANUAL REQUERIDA] Eliminando evento con ID: ${id}`);

    const { error } = await supabase
        .from("evento")
        .delete()
        .eq("id", id);

    if (error) {
        mostrarMensajeError("Error eliminando evento: " + error.message);
        return;
    }

    cargarEventos();
}

// Hacer accesibles las funciones
window.editarEvento = editarEvento;
window.eliminarEvento = eliminarEvento;
window.abrirFormularioEvento = abrirFormularioEvento;
window.cerrarFormularioEvento = cerrarFormularioEvento;
window.guardarEvento = guardarEvento;

// ===============================
// LUGARES CULTURALES
// ===============================

// Cargar lugares al abrir sección
document.addEventListener("DOMContentLoaded", cargarLugares);

async function cargarLugares() {
    const cont = document.getElementById("lugaresContainer");
    if (!cont) return; // evita error si la sección no existe

    const { data, error } = await supabase
        .from("lugar_cultural")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        cont.innerHTML = "<p>Error al cargar lugares culturales</p>";
        return;
    }

    cont.innerHTML = `
        <button id="addLugarBtn" onclick="abrirFormularioLugar()">+ Agregar Lugar</button>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Lugar</th>
                    <th>Dirección</th>
                    <th>Estación</th>
                    <th>Apertura</th>
                    <th>Cierre</th>
                    <th>Imagen</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                ${data.map(l => `
                    <tr>
                        <td>${l.id}</td>
                        <td>${l.nombre_lugar}</td>
                        <td>${l.direccion_cultural}</td>
                        <td>${l.estacion_id}</td>
                        <td>${l.horario_apertura}</td>
                        <td>${l.horario_cierre}</td>
                        <td><img src="${l.imagen_url}" style="width:50px; height:50px; object-fit:cover;"></td>
                        <td>${l.descripcion_cultural?.substring(0,40) ?? ""}...</td>

                        <td>
                            <button class="edit" onclick="editarLugar('${l.id}')">Editar</button>
                            <button class="delete" onclick="eliminarLugar('${l.id}')">Eliminar</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <!-- MODAL FORMULARIO LUGARES CULTURALES -->
        <div id="lugarFormModal" class="modal hidden">
            <div class="modal-content">
                <h3 id="formLugarTitle">Agregar Lugar Cultural</h3>

                <input type="hidden" id="lugarId">

                <label>Nombre del Lugar</label>
                <input type="text" id="lugarNombre">

                <label>Dirección Cultural</label>
                <input type="text" id="lugarDireccion">

                <label>Horario Apertura</label>
                <input type="time" id="lugarApertura">

                <label>Horario Cierre</label>
                <input type="time" id="lugarCierre">

                <label>ID Estación</label>
                <input type="number" id="lugarEstacion">

                <label>Imagen URL</label>
                <input type="text" id="lugarImagen">

                <label>Descripción Cultural</label>
                <textarea id="lugarDescripcion"></textarea>

                <div class="modal-actions">
                    <button onclick="guardarLugar()" class="save">Guardar</button>
                    <button onclick="cerrarFormularioLugar()" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

// ===============================
// ABRIR Y CERRAR MODAL
// ===============================

function abrirFormularioLugar() {
    document.getElementById("formLugarTitle").textContent = "Agregar Lugar Cultural";

    document.getElementById("lugarId").value = "";
    document.getElementById("lugarNombre").value = "";
    document.getElementById("lugarDireccion").value = "";
    document.getElementById("lugarApertura").value = "";
    document.getElementById("lugarCierre").value = "";
    document.getElementById("lugarEstacion").value = "";
    document.getElementById("lugarImagen").value = "";
    document.getElementById("lugarDescripcion").value = "";

    document.getElementById("lugarFormModal").classList.remove("hidden");
}

function cerrarFormularioLugar() {
    document.getElementById("lugarFormModal").classList.add("hidden");
}

// ===============================
// EDITAR LUGAR
// ===============================

async function editarLugar(id) {
    const { data, error } = await supabase
        .from("lugar_cultural")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        mostrarMensajeError("Error cargando lugar: " + error.message);
        return;
    }

    document.getElementById("formLugarTitle").textContent = "Editar Lugar Cultural";

    document.getElementById("lugarId").value = data.id;
    document.getElementById("lugarNombre").value = data.nombre_lugar;
    document.getElementById("lugarDireccion").value = data.direccion_cultural;
    document.getElementById("lugarApertura").value = data.horario_apertura;
    document.getElementById("lugarCierre").value = data.horario_cierre;
    document.getElementById("lugarEstacion").value = data.estacion_id;
    document.getElementById("lugarImagen").value = data.imagen_url;
    document.getElementById("lugarDescripcion").value = data.descripcion_cultural;

    document.getElementById("lugarFormModal").classList.remove("hidden");
}

// ===============================
// GUARDAR (Agregar o Editar)
// ===============================

async function guardarLugar() {
    const id = document.getElementById("lugarId").value;

     // Obtener el user_id del admin logueado
    const storedUser = localStorage.getItem("user");
    let userId = null;
    if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id || user.user_id;
    }

    const nuevoLugar = {
        nombre_lugar: document.getElementById("lugarNombre").value,
        direccion_cultural: document.getElementById("lugarDireccion").value,
        horario_apertura: document.getElementById("lugarApertura").value,
        horario_cierre: document.getElementById("lugarCierre").value,
        estacion_id: parseInt(document.getElementById("lugarEstacion").value) || null,
        imagen_url: document.getElementById("lugarImagen").value,
        descripcion_cultural: document.getElementById("lugarDescripcion").value,
        creado_por: userId,

    };

    let res;

    if (id) {
        res = await supabase.from("lugar_cultural").update(nuevoLugar).eq("id", id);
    } else {
        res = await supabase.from("lugar_cultural").insert([nuevoLugar]);
    }

    if (res.error) {
        console.error(res.error);
        mostrarMensajeError("Error al guardar lugar: " + res.error.message);
        return;
    }

    cerrarFormularioLugar();
    cargarLugares();
}

// ===============================
// ELIMINAR
// ===============================

async function eliminarLugar(id) {
    // Reemplazamos confirm()
    console.warn(`[CONFIRMACIÓN MANUAL REQUERIDA] Eliminando lugar cultural con ID: ${id}`);
    
    const { error } = await supabase
        .from("lugar_cultural")
        .delete()
        .eq("id", id);

    if (error) {
        mostrarMensajeError("Error eliminando lugar: " + error.message);
        return;
    }

    cargarLugares();
}

// ===============================
// HACER FUNCIONES GLOBALES
// ===============================

window.editarLugar = editarLugar;
window.eliminarLugar = eliminarLugar;
window.abrirFormularioLugar = abrirFormularioLugar;
window.cerrarFormularioLugar = cerrarFormularioLugar;
window.guardarLugar = guardarLugar;

// ===============================
// ESTACIONES
// ===============================

// Cargar estaciones al abrir
document.addEventListener("DOMContentLoaded", cargarEstaciones);

async function cargarEstaciones() {
    const cont = document.getElementById("estacionesContainer");
    if (!cont) return;

    const { data, error } = await supabase
        .from("estaciones")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        cont.innerHTML = "<p>Error al cargar estaciones</p>";
        return;
    }

    cont.innerHTML = `
        <button id="addEstacionBtn" onclick="abrirFormularioEstacion()">+ Agregar Estación</button>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>ID Línea</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                ${data.map(e => `
                    <tr>
                        <td>${e.id}</td>
                        <td>${e.nombre_estacion}</td>
                        <td>${e.direccion_estacion}</td>
                        <td>${e.linea_id}</td>
                        <td>
                            <button class="edit" onclick="editarEstacion('${e.id}')">Editar</button>
                            <button class="delete" onclick="eliminarEstacion('${e.id}')">Eliminar</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <!-- MODAL ESTACIONES -->
        <div id="estacionFormModal" class="modal hidden">
            <div class="modal-content">
                <h3 id="formEstacionTitle">Agregar Estación</h3>

                <input type="hidden" id="estacionId">

                <label>Nombre de la Estación</label>
                <input type="text" id="estacionNombre">

                <label>Dirección de la Estación</label>
                <input type="text" id="estacionDireccion">

                <label>ID Línea</label>
                <input type="number" id="estacionLinea">

                <div class="modal-actions">
                    <button onclick="guardarEstacion()" class="save">Guardar</button>
                    <button onclick="cerrarFormularioEstacion()" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

// ===============================
// ABRIR/CERRAR MODAL
// ===============================

function abrirFormularioEstacion() {
    document.getElementById("formEstacionTitle").textContent = "Agregar Estación";

    document.getElementById("estacionId").value = "";
    document.getElementById("estacionNombre").value = "";
    document.getElementById("estacionDireccion").value = "";
    document.getElementById("estacionLinea").value = "";

    document.getElementById("estacionFormModal").classList.remove("hidden");
}

function cerrarFormularioEstacion() {
    document.getElementById("estacionFormModal").classList.add("hidden");
}

// ===============================
// EDITAR ESTACIÓN
// ===============================

async function editarEstacion(id) {
    const { data, error } = await supabase
        .from("estaciones")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        mostrarMensajeError("Error cargando estación: " + error.message);
        return;
    }

    document.getElementById("formEstacionTitle").textContent = "Editar Estación";

    document.getElementById("estacionId").value = data.id;
    document.getElementById("estacionNombre").value = data.nombre_estacion;
    document.getElementById("estacionDireccion").value = data.direccion_estacion;
    document.getElementById("estacionLinea").value = data.linea_id;

    document.getElementById("estacionFormModal").classList.remove("hidden");
}

// ===============================
// GUARDAR (Agregar/Editar)
// ===============================

async function guardarEstacion() {
    const id = document.getElementById("estacionId").value;

    const nuevaEstacion = {
        nombre_estacion: document.getElementById("estacionNombre").value,
        direccion_estacion: document.getElementById("estacionDireccion").value,
        // Aseguramos que sea número antes de guardar
        linea_id: parseInt(document.getElementById("estacionLinea").value) || null,
    };

    let res;

    if (id) {
        res = await supabase.from("estaciones").update(nuevaEstacion).eq("id", id);
    } else {
        res = await supabase.from("estaciones").insert([nuevaEstacion]);
    }

    if (res.error) {
        console.error(res.error);
        mostrarMensajeError("Error al guardar estación: " + res.error.message);
        return;
    }

    cerrarFormularioEstacion();
    cargarEstaciones();
}

// ===============================
// ELIMINAR
// ===============================

async function eliminarEstacion(id) {
    // Reemplazamos confirm()
    console.warn(`[CONFIRMACIÓN MANUAL REQUERIDA] Eliminando estación con ID: ${id}`);

    const { error } = await supabase
        .from("estaciones")
        .delete()
        .eq("id", id);

    if (error) {
        mostrarMensajeError("Error eliminando estación: " + error.message);
        return;
    }

    cargarEstaciones();
}

// ===============================
// FUNCIONES GLOBALES
// ===============================

window.cargarEstaciones = cargarEstaciones;
window.abrirFormularioEstacion = abrirFormularioEstacion;
window.cerrarFormularioEstacion = cerrarFormularioEstacion;
window.editarEstacion = editarEstacion;
window.eliminarEstacion = eliminarEstacion;
window.guardarEstacion = guardarEstacion;

// ===============================
// LÍNEAS
// ===============================

document.addEventListener("DOMContentLoaded", cargarLineas);

async function cargarLineas() {
    const cont = document.getElementById("lineasContainer");
    if (!cont) return; // Evita error si la sección no existe

    const { data, error } = await supabase
        .from("tipos_linea")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        cont.innerHTML = "<p>Error al cargar líneas</p>";
        return;
    }

    cont.innerHTML = `
        <button id="addLineaBtn" onclick="abrirFormularioLinea()">+ Agregar Línea</button>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Número Línea</th>
                    <th>Nombre Línea</th>
                    <th>Color</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${data
                    .map(
                        (l) => `
                    <tr>
                        <td>${l.id}</td>
                        <td>${l.numero_linea}</td>
                        <td>${l.nombre_linea}</td>
                        <td>
                            <div style="width:20px; height:20px; background:${l.color}; border-radius:4px; border:1px solid #333"></div>
                        </td>
                        <td>
                            <button class="edit" onclick="editarLinea('${l.id}')">Editar</button>
                            <button class="delete" onclick="eliminarLinea('${l.id}')">Eliminar</button>
                        </td>
                    </tr>
                `
                    )
                    .join("")}
            </tbody>
        </table>

        <!-- MODAL -->
        <div id="lineaFormModal" class="modal hidden">
            <div class="modal-content">
                <h3 id="formLineaTitle">Agregar Línea</h3>

                <input type="hidden" id="lineaId">

                <label>Número Línea</label>
                <input type="text" id="lineaNumero">

                <label>Nombre Línea</label>
                <input type="text" id="lineaNombre">

                <label>Color (hex)</label>
                <input type="color" id="lineaColor">

                <div class="modal-actions">
                    <button onclick="guardarLinea()" class="save">Guardar</button>
                    <button onclick="cerrarFormularioLinea()" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}
function abrirFormularioLinea() {
    document.getElementById("formLineaTitle").textContent = "Agregar Línea";
    document.getElementById("lineaId").value = "";
    document.getElementById("lineaNumero").value = "";
    document.getElementById("lineaNombre").value = "";
    document.getElementById("lineaColor").value = "#000000";

    document.getElementById("lineaFormModal").classList.remove("hidden");
}

function cerrarFormularioLinea() {
    document.getElementById("lineaFormModal").classList.add("hidden");
}

async function editarLinea(id) {
    const { data, error } = await supabase
        .from("tipos_linea")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        mostrarMensajeError("Error cargando la línea: " + error.message);
        return;
    }

    document.getElementById("formLineaTitle").textContent = "Editar Línea";
    document.getElementById("lineaId").value = data.id;
    document.getElementById("lineaNumero").value = data.numero_linea;
    document.getElementById("lineaNombre").value = data.nombre_linea;
    document.getElementById("lineaColor").value = data.color || "#000000";

    document.getElementById("lineaFormModal").classList.remove("hidden");
}
async function guardarLinea() {
    const id = document.getElementById("lineaId").value;

    const nuevaLinea = {
        numero_linea: document.getElementById("lineaNumero").value,
        nombre_linea: document.getElementById("lineaNombre").value,
        color: document.getElementById("lineaColor").value,
    };

    let res;

    if (id) {
        res = await supabase.from("tipos_linea").update(nuevaLinea).eq("id", id);
    } else {
        res = await supabase.from("tipos_linea").insert([nuevaLinea]);
    }

    if (res.error) {
        console.error(res.error);
        mostrarMensajeError("Error al guardar línea: " + res.error.message);
        return;
    }

    cerrarFormularioLinea();
    cargarLineas();
}

async function eliminarLinea(id) {
    // Reemplazamos confirm()
    console.warn(`[CONFIRMACIÓN MANUAL REQUERIDA] Eliminando línea con ID: ${id}`);

    const { error } = await supabase
        .from("tipos_linea")
        .delete()
        .eq("id", id);

    if (error) {
        mostrarMensajeError("Error eliminando la línea: " + error.message);
        return;
    }

    cargarLineas();
}
window.cargarLineas = cargarLineas;
window.abrirFormularioLinea = abrirFormularioLinea;
window.cerrarFormularioLinea = cerrarFormularioLinea;
window.editarLinea = editarLinea;
window.eliminarLinea = eliminarLinea;
window.guardarLinea = guardarLinea;




// ===============================
// DASHBOARD / EVENTO MÁS FAVORITO
// ===============================
async function mostrarEventoMasFavoritoDashboard() {
    const container = document.getElementById("dashboardContainer");
    if (!container) {
        console.error("No se encontró #dashboardContainer");
        return;
    }

    // Contenedor GENERAL del módulo (3 cards)
    const bloque = document.createElement("div");
    bloque.className = "favoritos-grid"; 
    container.appendChild(bloque);

    try {
        // 1️⃣ Obtener favoritos
        const { data: favoritos, error: favError } = await supabase
            .from('favorito')
            .select('evento_id');

        if (favError) throw favError;
        if (!favoritos || favoritos.length === 0) {
            bloque.innerHTML = "<p>No hay favoritos registrados.</p>";
            return;
        }

        // 2️⃣ Conteo por evento
        const conteo = {};
        favoritos.forEach(f => {
            if (!f.evento_id) return;
            conteo[f.evento_id] = (conteo[f.evento_id] || 0) + 1;
        });

        const sorted = Object.entries(conteo)
            .map(([id, count]) => ({ id: Number(id), count }))
            .sort((a, b) => b.count - a.count);

        const idsEventos = sorted.map(e => e.id);

        // 3️⃣ Eventos
        const { data: eventosDatos, error: evError } = await supabase
            .from("evento")
            .select("id, nombre_evento, descripcion, horario_evento, imagen_url, tipo_evento_id")
            .in("id", idsEventos);

        if (evError) throw evError;

        // 4️⃣ Categorías
        const idsCategorias = [...new Set(eventosDatos.map(e => e.tipo_evento_id))];
        const { data: categorias, error: catError } = await supabase
            .from("tipo_evento")
            .select("id, nombre_tipo")
            .in("id", idsCategorias);

        if (catError) throw catError;

        // 5️⃣ Conteo categorías
        const conteoCategorias = {};
        eventosDatos.forEach(ev => {
            const categoria = categorias.find(c => c.id === ev.tipo_evento_id);
            if (!categoria) return;
            const veces = conteo[ev.id];
            conteoCategorias[categoria.nombre_tipo] =
                (conteoCategorias[categoria.nombre_tipo] || 0) + veces;
        });

        // 6️⃣ Evento más guardado
        const topEventoId = sorted[0].id;
        const cantidadTop = sorted[0].count;
        const eventoTop = eventosDatos.find(e => e.id === topEventoId);

        // =======================================================
        // BLOQUE DE TARJETAS CON GRID
        // =======================================================
        bloque.innerHTML = `
            <div class="dashboard-grid">
                <!-- CARD 1: EVENTO MÁS GUARDADO -->
                <div class="card favorito-card">
                    <h3>Evento más guardado</h3>
                    ${eventoTop.imagen_url ? `<img src="${eventoTop.imagen_url}" class="favorito-img">` : ""}
                    <h4>${eventoTop.nombre_evento}</h4>
                    <p>${eventoTop.descripcion || "Sin descripción"}</p>
                    <p><strong>Horario:</strong> ${eventoTop.horario_evento || "No disponible"}</p>
                    <p><strong>Guardado:</strong> ${cantidadTop} veces</p>
                </div>

                <!-- CARD 2: TOP EVENTOS -->
                <div class="card favorito-card">
                    <h3>Top eventos más guardados</h3>
                    <canvas id="graficoTopEventos"></canvas>
                </div>

                <!-- CARD 3: CATEGORÍAS -->
                <div class="card favorito-card">
                    <h3>Categorías más guardadas</h3>
                    <canvas id="graficoCategorias"></canvas>
                </div>
            </div>
        `;

         const canvasTop = document.getElementById("graficoTopEventos"); // <-- AQUI
        const canvasCat = document.getElementById("graficoCategorias");  // <-- AQUI
        canvasTop.height = 250;  // <-- AQUI puedes cambiar el valor
        canvasCat.height = 250;  // <-- AQUI puedes cambiar el valor

        // =======================================================
        // GRÁFICO TOP 5 EVENTOS
        // =======================================================
        const top5 = sorted.slice(0, 5);
        new Chart(
            
            document.getElementById("graficoTopEventos"),
            {
                type: "bar",
                data: {
                    labels: top5.map(x => eventosDatos.find(e => e.id === x.id)?.nombre_evento),
                    datasets: [{
                        label: "Guardados",
                        data: top5.map(x => x.count),
                        backgroundColor: '#ff042ec9',
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            }
        );

        // =======================================================
        // GRÁFICO CATEGORÍAS
        // =======================================================
        new Chart(
            document.getElementById("graficoCategorias"),
            {
                type: "bar",
                data: {
                    labels: Object.keys(conteoCategorias),
                    datasets: [{
                        label: "Guardados por categoría",
                        data: Object.values(conteoCategorias),
                        backgroundColor: '#0b56f8ff',
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            }
        );

    } catch (err) {
        console.error(err);
        bloque.innerHTML = "<p>Error al cargar datos.</p>";
    }
}

