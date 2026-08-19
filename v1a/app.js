// Konfigurasi PWA Manifest Otomatis
(function initPWA() {
  const manifestData = {
    "name": "Dapodik SMK Muhammadiyah 5 Karanganyar",
    "short_name": "Dapodik",
    "start_url": "./",
    "display": "standalone",
    "background_color": "#f3f4f6",
    "theme_color": "#15803d"
  };
  const blob = new Blob([JSON.stringify(manifestData)], {type: 'application/json'});
  const linkTag = document.createElement('link');
  linkTag.rel = 'manifest';
  linkTag.href = URL.createObjectURL(blob);
  document.head.appendChild(linkTag);
})();

// Pengaturan State & History Back Button
window.addEventListener('DOMContentLoaded', () => {
  history.replaceState({ view: 'dashboard', modal: false }, '');
});

window.addEventListener('popstate', (e) => {
  const state = e.state;
  
  // Jika modal detail sedang terbuka, tutup modal saja
  if (typeof isDetailOpen !== 'undefined' && isDetailOpen) {
    if (typeof hideDetailDOM === 'function') hideDetailDOM();
    return;
  }

  if (state && state.view) {
    showView(state.view);
  } else {
    showView('dashboard');
  }
});

function navigateTo(viewName) {
  history.pushState({ view: viewName, modal: false }, '');
  showView(viewName);
}

function goBack() {
  history.back();
}

function showView(viewName) {
  const views = ['dashboard', 'siswa', 'guru', 'alumni', 'rapot'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.toggle('hidden', v !== viewName);
  });

  if (typeof hideDetailDOM === 'function') {
    hideDetailDOM();
  }

  // Auto trigger fetching saat membuka menu siswa pertama kali
  if (viewName === 'siswa' && typeof initSiswaView === 'function') {
    initSiswaView();
  }
}