export default async function authLogin(req, res, supabase) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }

        console.log("Intentando login con:", email);

        // 1. Loguear al usuario con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Error de Supabase Auth:", error.message);
            return res.status(401).json({ error: error.message });
        }

        if (!data.session) {
            return res.status(400).json({ error: "No se pudo iniciar sesión correctamente" });
        }
         
        console.log("Login de Supabase exitoso. User ID:", data.user.id);
        
        // 2. Verificar si el usuario es admin en la tabla 'admin' 🔹
        console.log("Consultando tabla 'admin' para verificar el rol...");
        
        const { data: adminData, error: adminError } = await supabase
            .from("admin")
            .select(`
                id,
                user_id,
                activo,
                rol:rol_id(nombre_rol)
            `)
            .eq("user_id", data.user.id)
            .eq("activo", true)
            .single();

        if (adminError) {
             console.error("Error al consultar el rol de admin:", adminError.message);
        }


        let isAdmin = false;
       
        if (!adminError && adminData?.rol?.nombre_rol?.toLowerCase() === "admin") {
            isAdmin = true;
        }

        console.log("Resultado de la verificación de Admin:", isAdmin);

        // 3. Retornar token, datos de usuario 'isAdmin'
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: data.user,
            token: data.session.access_token,
            isAdmin,
        });
    } catch (err) {
       
        console.error("Error FATAL en login. La aplicación puede haberse caído:", err);
        res.status(500).json({ error: "Error interno del servidor (Revisa la consola de Node.js)" });
    }
}

