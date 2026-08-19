const GAS_URL_DATAGURU = "https://script.google.com/macros/s/AKfycbz9_3YbxX5D-baoBMHoz1MykxZKxIMq1tZReLuek_gi97jVVwkbJ1WqEvnBTvAt89OV/exec";

let guruData = [];
let isDetailGuruOpen = false;
let isGuruLoaded = false;

function initGuruView() {
  if (!isGuruLoaded) {
    fetchDataGuru();
  }
}

// 1. Mengambil Data Guru dari GAS
async function fetchDataGuru() {
  const tbody = document.getElementById('guruTableBody');
  const btnRefresh = document.getElementById('btnRefreshGuru');
  
  tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500 font-medium animate-pulse">Sedang mengambil data Guru dari Google Sheets...</td></tr>`;
  if (btnRefresh) btnRefresh.innerText = "⏳ Memuat...";

  try {
    const res = await fetch(GAS_URL_DATAGURU);
    const result = await res.json();

    if (result.status === 'success' && Array.isArray(result.data)) {
      guruData = result.data;
      isGuruLoaded = true;
      populateFilterMapelGuru();
      renderTableGuru();
    } else {
      throw new Error("Format data tidak sesuai");
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-6 text-center text-red-600 font-bold">
          Gagal mengambil data dari Google Sheet DB_dataguru.<br>
          <span class="text-sm font-normal text-gray-500">Pastikan URL GAS aktif dan hak akses diatur ke 'Anyone'.</span>
        </td>
      </tr>`;
  } finally {
    if (btnRefresh) btnRefresh.innerText = "🔄 Muat Ulang Data";
  }
}

// 2. Isi Dropdown Filter Mata Pelajaran
function populateFilterMapelGuru() {
  const select = document.getElementById('filterMapelGuru');
  if (!select) return;
  
  const mapelSet = new Set();
  guruData.forEach(g => {
    (g.listMapel || []).forEach(m => {
      if (m.namaMapel) mapelSet.add(m.namaMapel);
    });
  });

  select.innerHTML = '<option value="ALL">Semua Mata Pelajaran</option>';
  mapelSet.forEach(mapel => {
    select.innerHTML += `<option value="${mapel}">${mapel}</option>`;
  });
}

// 3. Filter Data Guru
function getFilteredDataGuru() {
  const filter = document.getElementById('filterMapelGuru').value;
  if (filter === 'ALL') return guruData;
  
  return guruData.filter(g => 
    (g.listMapel || []).some(m => m.namaMapel.toUpperCase() === filter.toUpperCase())
  );
}

// 4. Render Tabel Data Guru
function renderTableGuru() {
  const tbody = document.getElementById('guruTableBody');
  const data = getFilteredDataGuru();
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-500 font-medium">Tidak ada data guru untuk filter ini</td></tr>`;
    return;
  }

  data.forEach((guru, index) => {
    const listMapelText = (guru.listMapel || []).map(m => m.namaMapel).join(', ') || '-';
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-white active:bg-yellow-50' : 'bg-gray-50 active:bg-yellow-50';
    row.innerHTML = `
      <td class="p-3.5 text-center font-bold text-gray-500">${index + 1}</td>
      <td class="p-3.5 font-mono text-gray-700 text-sm sm:text-base">${guru.idGuru}</td>
      <td class="p-3.5 font-bold text-[#ca8a04] underline cursor-pointer hover:text-yellow-700" onclick="openDetailGuru('${guru.idGuru}')">
        ${guru.nama}
      </td>
      <td class="p-3.5 text-sm sm:text-base font-semibold text-gray-700">
        ${listMapelText}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// 5. Modal Detail Guru (Grid Compact 2 Kolom No-Scroll)
function openDetailGuru(idGuru) {
  const g = guruData.find(item => item.idGuru === idGuru);
  if (!g) return;

  const displayJK = (g.jk.toLowerCase() === 'laki-laki' || g.jk.toLowerCase() === 'l') ? 'Laki-laki' : 'Perempuan';

  let mapelHTML = '';
  if (g.listMapel && g.listMapel.length > 0) {
    mapelHTML = g.listMapel.map((m, idx) => `
      <div class="p-2 bg-yellow-50/70 border border-yellow-200 rounded-lg">
        <div class="flex items-center justify-between font-bold text-xs text-[#ca8a04]">
          <span>MAPEL ${idx + 1}: ${m.namaMapel}</span>
          <span class="font-mono text-gray-500">(${m.idMapel})</span>
        </div>
        <div class="text-xs text-gray-700 mt-1 leading-relaxed">
          <b>Capaian:</b> ${m.capaian || '-'}
        </div>
      </div>
    `).join('');
  } else {
    mapelHTML = `<div class="text-xs text-gray-400 italic">Belum ada mata pelajaran terdaftar.</div>`;
  }

  const html = `
    <!-- Baris 1: Nama Lengkap -->
    <div class="bg-yellow-50 p-2.5 rounded-xl border border-yellow-200">
      <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">NAMA LENGKAP PENDIDIK</span>
      <span class="text-base sm:text-lg font-extrabold text-[#ca8a04] block leading-tight mt-0.5">${g.nama}</span>
    </div>

    <!-- Baris 2: ID Guru & Jenis Kelamin -->
    <div class="grid grid-cols-2 gap-2">
      <div class="bg-gray-50 p-2 rounded-xl border border-gray-200">
        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">ID GURU</span>
        <span class="text-sm sm:text-base font-bold text-[#374151] block mt-0.5 font-mono">${g.idGuru}</span>
      </div>
      <div class="bg-gray-50 p-2 rounded-xl border border-gray-200">
        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">JENIS KELAMIN</span>
        <span class="text-sm sm:text-base font-bold text-[#374151] block mt-0.5">${displayJK}</span>
      </div>
    </div>

    <!-- Baris 3: TTL & Nomor HP -->
    <div class="grid grid-cols-2 gap-2">
      <div class="bg-gray-50 p-2 rounded-xl border border-gray-200">
        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">TEMPAT, TGL LAHIR</span>
        <span class="text-xs sm:text-sm font-semibold text-[#374151] block mt-0.5 leading-snug">${g.ttl}</span>
      </div>
      <div class="bg-gray-50 p-2 rounded-xl border border-gray-200">
        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">NOMOR HP / WA</span>
        <span class="text-xs sm:text-sm font-semibold text-[#374151] block mt-0.5 leading-snug font-mono">${g.noHp}</span>
      </div>
    </div>

    <!-- Baris 4: Alamat -->
    <div class="bg-gray-50 p-2 rounded-xl border border-gray-200">
      <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">ALAMAT TINGGAL</span>
      <span class="text-xs sm:text-sm font-medium text-[#374151] block mt-0.5 leading-snug">${g.alamat}</span>
    </div>

    <!-- Baris 5: Mapel & Capaian Pembelajaran -->
    <div class="space-y-1.5 pt-1">
      <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block px-1">MATA PELAJARAN & CAPAIAN PEMBELAJARAN:</span>
      ${mapelHTML}
    </div>
  `;

  document.getElementById('detailGuruBody').innerHTML = html;
  document.getElementById('detailGuruBackdrop').classList.remove('hidden');
  document.getElementById('detailGuruDrawer').classList.remove('translate-y-full');
  isDetailGuruOpen = true;

  history.pushState({ view: 'guru', modal: true }, '');
}

function closeDetailGuru() {
  if (isDetailGuruOpen) history.back();
}

function hideDetailGuruDOM() {
  document.getElementById('detailGuruBackdrop').classList.add('hidden');
  document.getElementById('detailGuruDrawer').classList.add('translate-y-full');
  isDetailGuruOpen = false;
}

// 6. Unduh Excel Data Guru
function exportExcelGuru() {
  const filter = document.getElementById('filterMapelGuru').value;
  const data = getFilteredDataGuru();

  const jmlLaki = data.filter(g => g.jk.toLowerCase() === 'laki-laki' || g.jk.toLowerCase() === 'l').length;
  const jmlPerempuan = data.filter(g => g.jk.toLowerCase() === 'perempuan' || g.jk.toLowerCase() === 'p').length;
  const totalGuru = data.length;

  const worksheetData = [
    ["Data Guru & Tenaga Pendidik"],
    ["SMK Muhammadiyah 5 Karanganyar"],
    ["Tahun Pelajaran 2026/2027"]
  ];

  if (filter !== 'ALL') {
    worksheetData.push([`Mata Pelajaran : ${filter}`]);
  }

  worksheetData.push([`Laki-laki: ${jmlLaki} orang | Perempuan: ${jmlPerempuan} orang | Total: ${totalGuru} guru`]);
  worksheetData.push([]);
  worksheetData.push(["NO", "ID GURU", "NAMA GURU", "JK", "TEMPAT, TGL LAHIR", "ALAMAT", "NOMOR HP", "MAPEL DIAMPU"]);

  data.forEach((g, idx) => {
    const displayJK = (g.jk.toLowerCase() === 'laki-laki' || g.jk.toLowerCase() === 'l') ? 'Laki-laki' : 'Perempuan';
    const listMapelText = (g.listMapel || []).map(m => m.namaMapel).join(', ') || '-';
    worksheetData.push([
      idx + 1,
      g.idGuru,
      g.nama,
      displayJK,
      g.ttl,
      g.alamat,
      g.noHp,
      listMapelText
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  ws['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 28 }, { wch: 14 },
    { wch: 26 }, { wch: 35 }, { wch: 18 }, { wch: 35 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Guru");
  XLSX.writeFile(wb, `Data_Guru_${filter}_2026_2027.xlsx`);
}

// 7. Cetak PDF Data Guru
function cetakPDFGuru() {
  const filter = document.getElementById('filterMapelGuru').value;
  const data = getFilteredDataGuru();

  const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
  const tanggalSekarang = new Date().toLocaleDateString('id-ID', optionsDate);
  const barisMapelHTML = filter !== 'ALL' ? `<br>MATA PELAJARAN : ${filter}` : '';

  const jmlLaki = data.filter(g => g.jk.toLowerCase() === 'laki-laki' || g.jk.toLowerCase() === 'l').length;
  const jmlPerempuan = data.filter(g => g.jk.toLowerCase() === 'perempuan' || g.jk.toLowerCase() === 'p').length;
  const totalGuru = data.length;

  let tableRows = '';
  data.forEach((g, idx) => {
    const displayJK = (g.jk.toLowerCase() === 'laki-laki' || g.jk.toLowerCase() === 'l') ? 'L' : 'P';
    const listMapelText = (g.listMapel || []).map(m => m.namaMapel).join(', ') || '-';
    tableRows += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="text-align: center; font-family: monospace;">${g.idGuru}</td>
        <td style="font-weight: bold;">${g.nama}</td>
        <td style="text-align: center;">${displayJK}</td>
        <td>${g.ttl}</td>
        <td>${g.alamat}</td>
        <td style="text-align: center; font-family: monospace;">${g.noHp}</td>
        <td>${listMapelText}</td>
      </tr>
    `;
  });

  const printContainer = document.getElementById('printableArea');
  printContainer.innerHTML = `
    <div class="print-header">
      DATA GURU & TENAGA PENDIDIK<br>
      SMK MUHAMMADIYAH 5 KARANGANYAR<br>
      TAHUN PELAJARAN 2026/2027${barisMapelHTML}
    </div>

    <div class="print-rekap">
      <span><b>Laki-laki:</b> ${jmlLaki} orang</span> &nbsp;|&nbsp;
      <span><b>Perempuan:</b> ${jmlPerempuan} orang</span> &nbsp;|&nbsp;
      <span><b>Total:</b> ${totalGuru} guru</span>
    </div>

    <table class="print-table">
      <thead>
        <tr>
          <th style="width: 4%;">NO</th>
          <th style="width: 9%;">ID GURU</th>
          <th style="width: 20%;">NAMA GURU</th>
          <th style="width: 4%;">JK</th>
          <th style="width: 17%;">TEMPAT, TGL LAHIR</th>
          <th style="width: 20%;">ALAMAT</th>
          <th style="width: 11%;">NO HP</th>
          <th style="width: 15%;">MAPEL DIAMPU</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <div class="print-ttd-wrap">
      <div class="print-ttd">
        <div>Karanganyar, ${tanggalSekarang}</div>
        <div style="margin-top: 4px;">Kepala Sekolah,</div>
        <div style="height: 60px;"></div>
        <div style="font-weight: bold; text-decoration: underline;">Ninik Setya Utami, S.T.</div>
        <div>NBM. -</div>
      </div>
      <div style="clear: both;"></div>
    </div>
  `;

  window.print();
}
