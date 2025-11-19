import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import authLogin from "./authlogin.js";
import authRegister from "./authregister.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Cliente Supabase normal (para auth)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Endpoint login
app.post("/auth/login", (req, res) => authLogin(req, res, supabase));

// Endpoint register
app.post("/auth/register", (req, res) => authRegister(req, res, supabase));

// Endpoint favorito protegido
app.get("/favoritos", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado, falta token" });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const { data, error } = await supabase
    .from("favorito")
    .select("*")
    .eq("user_id", userData.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(` Servidor corriendo en http://localhost:${PORT}`)
);





