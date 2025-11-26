function mostrarMensaje() {
  // Evita duplicarlo si ya está cargado
  if (document.getElementById('customAlert')) return;

  fetch('mensaje.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'mensaje.css';
      document.head.appendChild(link);

      const overlay = document.getElementById('customAlert');
      overlay.style.display = 'flex';

      const buttons = overlay.querySelectorAll('.btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.remove();
        });
      });
    });
}
