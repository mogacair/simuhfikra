/**
 * MUHFIKRA APPS - JAVASCRIPT UTAMA
 * 
 * Modul ini mencakup:
 * 1. Data Dummy Siswa (Siap diintegrasikan dengan Google Apps Script / GAS)
 * 2. Hash Router SPA (Single Page Application - Mencegah aplikasi tertutup saat Back di HP)
 * 3. Render Menu & Tabel Siswa
 * 4. Modal Read-Only Detail Siswa
 * 5. Fitur Cetak PDF Rapi (Termasuk seluruh rincian NIK, Ibu, Alamat)
 */

/* ==========================================
   1. DATA DUMMY SISWA
   (Nanti akan di-fetch dari Google Sheets via GAS API)
   ========================================== */
const dummySiswa = [
    { id: 1, nisn: "0051234567", nis: "212201", nama: "Ahmad Fikri", kelas: "X-A", nik: "3201234567890001", ibu: "Siti Rahma", alamat: "Jl. Merdeka No. 12, Jakarta" },
    { id: 2, nisn: "0057654321", nis: "212202", nama: "Budi Santoso", kelas: "XI-B", nik: "3201234567890002", ibu: "Dewi Lestari", alamat: "Jl. Mawar No. 45, Bandung" },
    { id: 3, nisn: "0059876543", nis: "212203", nama: "Citra Amelia", kelas: "X-A", nik: "3201234567890003", ibu: "Aisyah", alamat: "Jl. Melati No. 8, Surabaya" },
    { id: 4, nisn: "0053344556", nis: "212204", nama: "Dian Pratama", kelas: "XI-B", nik: "3201234567890004", ibu: "Rina Wijaya", alamat: "Jl. Anggrek No. 22, Semarang" },
    { id: 5, nisn: "0058899001", nis: "212205", nama: "Eka Putri", kelas: "X-A", nik: "3201234567890005", ibu: "Nurlaila", alamat: "Jl. Dahlia No. 15, Yogyakarta" }
];

/* Variable global menyimpan data siswa yang sedang difilter */
let currentFilteredData = [...dummySiswa];

/* ==========================================
   2. HASH ROUTER SPA & GESTURE BACK PROTECTION
   ========================================== */
const routes = {
    '': { title: 'Muhfikra Apps' },
    '#data-siswa': { title: 'Data Siswa' },
    '#data-guru': { title: 'Data Guru' },
    '#data-alumni': { title: 'Data Alumni' },
    '#rapot': { title: 'Rapot Siswa' }
};

/**
 * Memproses perubahan URL Hash (#) untuk perpindahan halaman tanpa reload.
 */
function handleRouting() {
    const hash = window.location.hash || '';
    const route = routes[hash] || routes[''];

    // Update Judul Navbar
    document.getElementById('header-title').innerText = route.title;
    
    // Tampilkan/Sembunyikan Tombol Back
    const btnBack = document.getElementById('btn-back');
    btnBack.style.display = (hash === '' ? 'none' : 'flex');

    const appContent = document.getElementById('app-content');

    if (hash === '') {
        renderDashboard();
    } else if (hash === '#data-siswa' || hash === '#detail') {
        if (hash === '#data-siswa') {
            renderSiswaPage();
        }
    } else {
        appContent.innerHTML = `
            <div class="welcome-card" style="background:#475569;">
                <h3><i class="fa-solid fa-person-digging"></i> ${route.title}</h3>
                <p>Menu ini akan tersedia pada pembaruan versi berikutnya.</p>
            </div>
        `;
    }

    // Menutup Modal secara otomatis jika pengguna menekan tombol Back HP saat modal terbuka
    if (hash !== '#detail') {
        const modal = document.getElementById('student-modal');
        if (modal) modal.classList.add('hidden');
    }
}

// Pasang Event Listener Router
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

/* ==========================================
   3. RENDER HALAMAN
   ========================================== */

/**
 * Render Halaman Utama / Dashboard Menu
 */
function renderDashboard() {
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = `
        <div class="welcome-card">
            <h3>Selamat Datang!</h3>
            <p>Sistem Informasi Academic Management <b>Muhfikra Apps</b> versi 1.0</p>
        </div>

        <div class="section-title">Menu Utama</div>

        <div class="menu-grid">
            <a href="#data-siswa" class="menu-card">
                <i class="fa-solid fa-user-graduate"></i>
                <span>Data Siswa <span class="badge-v1">v1</span></span>
            </a>
            <a href="#data-guru" class="menu-card disabled">
                <i class="fa-solid fa-chalkboard-user"></i>
                <span>Data Guru <span class="badge-soon">Soon</span></span>
            </a>
            <a href="#data-alumni" class="menu-card disabled">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>Data Alumni <span class="badge-soon">Soon</span></span>
            </a>
            <a href="#rapot" class="menu-card disabled">
                <i class="fa-solid fa-file-invoice"></i>
                <span>Rapot <span class="badge-soon">Soon</span></span>
            </a>
        </div>
    `;
}

/**
 * Render Halaman Data Siswa
 */
function renderSiswaPage() {
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = `
        <div class="filter-container">
            <label style="font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase;">Filter Kelas</label>
            <select id="filter-kelas" onchange="filterSiswa()">
                <option value="semua">-- Semua Kelas --</option>
                <option value="X-A">Kelas X-A</option>
                <option value="XI-B">Kelas XI-B</option>
            </select>

            <div class="action-buttons">
                <!-- Revisi: Tombol Cetak PDF Berdasarkan Filter -->
                <button class="btn btn-danger full-width" onclick="cetakPDF()">
                    <i class="fa-solid fa-file-pdf"></i> Cetak PDF
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>NISN</th>
                        <th>NIS</th>
                        <th>Nama Lengkap</th>
                        <th>Kelas</th>
                    </tr>
                </thead>
                <tbody id="siswa-table-body">
                </tbody>
            </table>
        </div>
    `;
    renderTableSiswa(dummySiswa);
}

/**
 * Populate Data ke Tabel Siswa
 */
function renderTableSiswa(data) {
    const tbody = document.getElementById('siswa-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">Data tidak ditemukan</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.nisn}</td>
            <td>${item.nis}</td>
            <td><span class="link-student" onclick="openStudentModal(${item.id})">${item.nama}</span></td>
            <td><span style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">${item.kelas}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Fungsi Filter Siswa per Kelas
 */
function filterSiswa() {
    const selectedKelas = document.getElementById('filter-kelas').value;
    if (selectedKelas === 'semua') {
        currentFilteredData = [...dummySiswa];
    } else {
        currentFilteredData = dummySiswa.filter(s => s.kelas === selectedKelas);
    }
    renderTableSiswa(currentFilteredData);
}

/* ==========================================
   4. MODAL DETAIL SISWA (READ-ONLY)
   ========================================== */

/**
 * Membuka Modal Rincian Siswa
 */
function openStudentModal(id) {
    const siswa = dummySiswa.find(s => s.id === id);
    if (!siswa) return;

    const modalBody = document.getElementById('modal-detail-body');
    modalBody.innerHTML = `
        <div class="detail-card">
            <div class="detail-row"><label>Nama Lengkap</label><div>${siswa.nama}</div></div>
            <div class="detail-row"><label>NISN / NIS</label><div>${siswa.nisn} / ${siswa.nis}</div></div>
            <div class="detail-row"><label>Kelas</label><div>${siswa.kelas}</div></div>
        </div>
        <div class="detail-card">
            <div class="detail-row"><label>NIK (Nomor Induk Kependudukan)</label><div>${siswa.nik}</div></div>
            <div class="detail-row"><label>Nama Ibu Kandung</label><div>${siswa.ibu}</div></div>
            <div class="detail-row"><label>Alamat Lengkap</label><div>${siswa.alamat}</div></div>
        </div>
    `;

    // Push URL hash agar gesture back HP berfungsi untuk menutup modal
    window.location.hash = 'detail';
    document.getElementById('student-modal').classList.remove('hidden');
}

/**
 * Menutup Modal
 */
function closeStudentModal() {
    document.getElementById('student-modal').classList.add('hidden');
    if (window.location.hash === '#detail') {
        window.history.back();
    }
}

/* ==========================================
   5. REVISI FITUR: CETAK PDF RAPI LENGKAP
   ========================================== */

/**
 * Mencetak Laporan PDF Rapi berdasarkan Filter aktif,
 * lengkap dengan Rincian Data (NIK, Nama Ibu, Alamat).
 */
function cetakPDF() {
    const filterSelect = document.getElementById('filter-kelas');
    const filterValue = filterSelect ? filterSelect.value : 'semua';
    const judulFilter = filterValue === 'semua' ? 'SELURUH KELAS' : `KELAS ${filterValue}`;

    // Buat jendela cetak baru (Print Window)
    const printWindow = window.open('', '_blank');

    // Susun isi HTML dokumen PDF yang rapi
    let tableRows = '';
    currentFilteredData.forEach((s, idx) => {
        tableRows += `
            <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td><b>${s.nama}</b></td>
                <td>${s.nisn} / ${s.nis}</td>
                <td style="text-align:center;">${s.kelas}</td>
                <td>${s.nik}</td>
                <td>${s.ibu}</td>
                <td>${s.alamat}</td>
            </tr>
        `;
    });

    const printContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Laporan Data Siswa - ${judulFilter}</title>
            <style>
                @page { size: A4 landscape; margin: 15mm; }
                body { font-family: Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 0; padding: 10px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                .header h1 { margin: 0; font-size: 18pt; color: #2563eb; }
                .header p { margin: 4px 0 0 0; font-size: 10pt; color: #64748b; }
                .meta { margin-bottom: 15px; font-size: 10pt; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; padding: 7px 8px; font-size: 9.5pt; text-align: left; }
                th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; text-transform: uppercase; font-size: 8.5pt; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .footer { margin-top: 20px; text-align: right; font-size: 9pt; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MUHFIKRA APPS</h1>
                <p>Laporan Resmi Data Rincian Siswa</p>
            </div>
            
            <div class="meta">
                Kategori Laporan : ${judulFilter} <br>
                Total Data       : ${currentFilteredData.length} Siswa
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:30px;">No</th>
                        <th>Nama Lengkap</th>
                        <th>NISN / NIS</th>
                        <th style="width:60px;">Kelas</th>
                        <th>NIK</th>
                        <th>Nama Ibu</th>
                        <th>Alamat Siswa</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer">
                Dicetak otomatis via Muhfikra Apps pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() { window.close(); }
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
}
