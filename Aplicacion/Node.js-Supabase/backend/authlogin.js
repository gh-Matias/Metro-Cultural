export default async function authLogin(req, res, supabase) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    console.log("Intentando login con:", email);

    // Intentar loguear al usuario
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Si no hay sesión, el token no existe
    if (!data.session) {
      return res.status(400).json({
        error: "No se pudo iniciar sesión correctamente (sin sesión activa)",
      });
    }

    // 🔹 Retornar token y datos del usuario
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: data.user,
      token: data.session.access_token,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
