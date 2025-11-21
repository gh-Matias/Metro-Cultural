import { createClient } from "@supabase/supabase-js";

export default async function authRegister(req, res, supabase) {
  try {
    const { email, password, nombre_cliente, direccion_cliente, telefono } = req.body;

    if (!email || !password || !nombre_cliente) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 1️Registrar usuario
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre_cliente,
          telefono: telefono,
        },
      },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 2️ Crear cliente admin para insertar perfil (opcional, si usas tabla cliente_perfil)
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: clienteError } = await supabaseAdmin
      .from("cliente_perfil")
      .insert([
        {
          user_id: authData.user.id,
          nombre_cliente,
          direccion_cliente,
          correo: email,
          telefono,
        },
      ]);

    if (clienteError) return res.status(400).json({ error: clienteError.message });

    // Respuesta exitosa
    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: authData.user,
    });

  } catch (err) {
    console.error("Error en authRegister:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
