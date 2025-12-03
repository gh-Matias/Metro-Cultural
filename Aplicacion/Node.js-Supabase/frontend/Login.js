const API_BASE_URL = "http://localhost:3000";

/**
 * Muestra un mensaje al usuario en el contenedor #message-status.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} isError - Si el mensaje es un error (para cambiar el estilo).
 */

function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message-status");
    if (!messageElement) {
        console.warn("Elemento #message-status no encontrado.");
        console.log(`[Mensaje ${isError ? 'Error' : 'Éxito'}]: ${message}`);
        return;
    }
    
    messageElement.textContent = message;
    // Clases de Tailwind para estilos de mensaje(mas rapido)
    messageElement.className = isError 
        ? "text-red-600 font-semibold mb-4 p-2 bg-red-100 rounded-lg" 
        : "text-green-600 font-semibold mb-4 p-2 bg-green-100 rounded-lg";
    
    messageElement.style.display = 'block';
    
    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
        messageElement.style.display = 'none';
        messageElement.textContent = '';
    }, 3000);
}


document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Confirmar que la función de envío se inicio
    console.log(`Inicio del proceso de login. Enviando request a ${API_BASE_URL}/auth/login`);
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Limpiar mensajes previos
    showMessage('', false); 

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("Respuesta del backend:", data);
        
        // Verificamos el valor de isAdmin que llega del servidor 
        console.log(">>> DEBUG REDIRECCIÓN - ¿Es Admin?:", data.isAdmin);

        if (!res.ok) {
            // Mostrar error del backend
            showMessage(`Error: ${data.error}`, true);
            return;
        }

        // 1. Guarda token y usuario en localStorage
        localStorage.setItem("access_token", data.token);
        if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 2.  Redirección
        if (data.isAdmin) {
            showMessage("Bienvenido, Administrador.", false);
            // Redirige al panel de administración
            window.location.href = "admin.html";
        } else {
            showMessage("Inicio de sesión exitoso.", false);
            // Redirige al menú principal
            window.location.href = "menu.html";
        }
    } catch (error) {
        // Esto se ejecuta si hay un problema de red (servidor caído, CORS, etc.)
        console.error("Error grave de red o conexión en login:", error);
        showMessage("Error al intentar iniciar sesión. Verifica la conexión con el servidor (Node.js).", true);
    }
    
});