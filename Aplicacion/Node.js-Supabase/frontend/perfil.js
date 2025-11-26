import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔧 CONFIGURA TU SUPABASE AQUÍ
const supabaseUrl = "https://jgiwhiccqbzeffyndsbf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXdoaWNjcWJ6ZWZmeW5kc2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzM1MDIsImV4cCI6MjA3NTg0OTUwMn0.Q7qh7dODhSTFTKvOmwrkA9mYkbxAhDK28AyaVdJjCk4";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ELEMENTOS HTML ---
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const direccionInput = document.getElementById("direccion");
const telefonoInput = document.getElementById("telefono");
const statusMsg = document.getElementById("statusMsg");


let currentUserId = null;

// -----------------------------------------------------------
// 1️⃣ CARGAR PERFIL DEL USUARIO
// -----------------------------------------------------------
async function cargarPerfil() {
  console.log(" Cargando usuario...");

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(" Error obteniendo usuario:", userError);
    window.location.href = "login.html";
    return;
  }

  currentUserId = user.id;

  // --- TRAER LA INFORMACIÓN DE cliente_perfil ---
  const { data, error } = await supabase
    .from("cliente_perfil")
    .select("*")
    .eq("user_id", currentUserId)
    .single();

  console.log(" Datos recibidos del perfil:", data, "Error:", error);

  if (error) {
    statusMsg.textContent = "Error cargando perfil.";
    console.error(" Error al cargar perfil:", error);
    return;
  }

  // --- CARGAR LOS CAMPOS ---
  nombreInput.value = data.nombre_cliente || "";
  correoInput.value = data.correo || "";
  direccionInput.value = data.direccion_cliente || "";
  telefonoInput.value = data.telefono || "";

}

cargarPerfil();

// -----------------------------------------------------------
// 2️⃣ GUARDAR CAMBIOS EN SUPABASE
// -----------------------------------------------------------
document.getElementById("saveBtn").addEventListener("click", async () => {
  statusMsg.textContent = "Guardando...";
 
  const updatePayload = {
    nombre_cliente: nombreInput.value,
    direccion_cliente: direccionInput.value,
    telefono: telefonoInput.value
  };

  console.log(" Payload enviado:", updatePayload);

  const { data, error } = await supabase
    .from("cliente_perfil")
    .update(updatePayload)
    .eq("user_id", currentUserId)
    .select(); // Devuelve la fila actualizada, muy importante

  console.log(" Resultado del UPDATE:", data, "Error:", error);

  if (error) {
    statusMsg.textContent = " Error al guardar.";
    console.error(" Error en UPDATE:", error);
    return;
  }

  if (!data || data.length === 0) {
    statusMsg.textContent = " No se actualizó ninguna fila. El id no coincide.";
    console.warn("⚠ Ninguna fila actualizada. Revisa user_id y columnas.");
    return;
  }

  statusMsg.textContent = "✔ Cambios guardados correctamente";
  console.log(" Perfil actualizado con éxito.");
  
});
