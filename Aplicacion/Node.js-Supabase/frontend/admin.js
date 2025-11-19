// ===============================
// CAMBIO DE SECCIONES
// ===============================
console.log("ADMIN JS CARGADO");

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

// ===============================
// USUARIOS (cliente_perfil)
// ===============================
document.addEventListener("DOMContentLoaded", cargarUsuarios);

async function cargarUsuarios() {
  const cont = document.getElementById("usuariosContainer");

  const { data, error } = await supabase
    .from("cliente_perfil")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    cont.innerHTML = "<p>Error al cargar usuarios</p>";
    return;
  }

  cont.innerHTML = `
    <button id="addUserBtn" onclick="abrirFormularioUsuario()">+ Agregar Usuario</button>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Dirección</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(u => `
          <tr>
            <td>${u.id}</td>
            <td>${u.nombre_cliente}</td>
            <td>${u.correo}</td>
            <td>${u.direccion_cliente}</td>
            <td>${u.telefono}</td>
            <td>
  <button class="edit" onclick="editarUsuario('${u.id}')">Editar</button>
  <button class="delete" onclick="eliminarUsuario('${u.id}')">Eliminar</button>
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

  document.getElementById("usuarioFormModal").classList.remove("hidden");
}

function cerrarFormularioUsuario() {
  document.getElementById("usuarioFormModal").classList.add("hidden");
}

// ===============================
// EDITAR USUARIO
// ===============================
async function editarUsuario(id) {
  const { data, error } = await supabase
    .from("cliente_perfil")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return alert("Error cargando usuario");

  document.getElementById("formUserTitle").textContent = "Editar Usuario";
  document.getElementById("userId").value = data.id;
  document.getElementById("userNombre").value = data.nombre_cliente;
  document.getElementById("userCorreo").value = data.correo;
  document.getElementById("userDireccion").value = data.direccion_cliente;
  document.getElementById("userTelefono").value = data.telefono;

  document.getElementById("usuarioFormModal").classList.remove("hidden");
}

// ===============================
// GUARDAR (Agregar o Editar)
// ===============================
async function guardarUsuario() {
  const id = document.getElementById("userId").value;

  const nuevoUsuario = {
    nombre_cliente: document.getElementById("userNombre").value,
    correo: document.getElementById("userCorreo").value,
    direccion_cliente: document.getElementById("userDireccion").value,
    telefono: document.getElementById("userTelefono").value,
  };

  let res;

  if (id) {
    res = await supabase.from("cliente_perfil").update(nuevoUsuario).eq("id", id);
  } else {
    res = await supabase.from("cliente_perfil").insert([nuevoUsuario]);
  }

  if (res.error) {
    console.error(res.error);
    alert("Error al guardar");
    return;
  }

  cerrarFormularioUsuario();
  cargarUsuarios();
}

// ===============================
// ELIMINAR
// ===============================
async function eliminarUsuario(id) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  const { error } = await supabase
    .from("cliente_perfil")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error eliminando usuario");
    return;
  }

  cargarUsuarios();
}

// Hacer las funciones accesibles globalmente
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.abrirFormularioUsuario = abrirFormularioUsuario;
window.cerrarFormularioUsuario = cerrarFormularioUsuario;
window.guardarUsuario = guardarUsuario;
