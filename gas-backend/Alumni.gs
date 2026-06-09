/**
 * EXORA-EDU - Alumni.gs
 * Modul Manajemen Data Alumni (Production-Ready)
 */

// Pastikan SPREADSHEET_ID merujuk ke ID Spreadsheet database Anda (bisa disamakan dengan modul lain)
const SHEET_NAME_ALUMNI = "Alumni";

/**
 * Handler untuk mengambil data Alumni (HTTP GET)
 * Diarsitekturkan untuk dipanggil oleh Code.gs
 */
function getAlumniHandler(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_ALUMNI);
    
    if (!sheet) {
      return jsonError(`Database sheet '${SHEET_NAME_ALUMNI}' tidak ditemukan.`, 404);
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Jika sheet hanya berisi header atau kosong
    if (values.length <= 1) {
      return jsonSuccess([], "Belum ada data alumni.");
    }
    
    // Mengubah data sheet menjadi array of objects JSON yang rapi
    const formattedData = parseSheetRowsToObjects(values);
    
    // Fitur Tambahan: Pencarian berdasarkan tahun lulus (e.g., ?action=getAlumni&graduationYear=2024)
    if (e && e.parameter && e.parameter.graduationYear) {
      const targetYear = e.parameter.graduationYear.toString().trim();
      const filteredData = formattedData.filter(item => item.tahun_lulus.toString().trim() === targetYear);
      return jsonSuccess(filteredData, `Data alumni lulusan tahun ${targetYear} berhasil diambil.`);
    }
    
    return jsonSuccess(formattedData, "Semua data alumni berhasil diambil.");
    
  } catch (error) {
    console.error("Error di getAlumniHandler: ", error.toString());
    return jsonError(`Gagal mengambil data alumni: ${error.toString()}`, 500);
  }
}

/**
 * Handler untuk menambahkan data Alumni baru (HTTP POST)
 * Diarsitekturkan untuk dipanggil oleh Code.gs
 */
function addAlumniHandler(requestData) {
  try {
    const { nama_lengkap, tahun_lulus, nomor_telepon, email, status_saat_ini, tempat_aktivitas } = requestData;
    
    // Validasi input wajib untuk integritas data
    if (!nama_lengkap || !tahun_lulus) {
      return jsonError("Bad Request: Parameter 'nama_lengkap' dan 'tahun_lulus' wajib diisi.", 400);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_ALUMNI);
    
    if (!sheet) {
      return jsonError(`Database sheet '${SHEET_NAME_ALUMNI}' tidak ditemukan.`, 404);
    }
    
    // Auto-generate ID unik untuk data alumni (Contoh: AL-123456)
    const newId = "AL-" + new Date().getTime().toString().slice(-6);
    
    // Susun baris baru sesuai dengan struktur kolom database
    const newRow = [
      newId,
      nama_lengkap.toString().trim(),
      tahun_lulus.toString().trim(),
      nomor_telepon ? nomor_telepon.toString().trim() : "",
      email ? email.toString().trim() : "",
      status_saat_ini ? status_saat_ini.toString().trim() : "Lainnya",
      tempat_aktivitas ? tempat_aktivitas.toString().trim() : ""
    ];
    
    // Tambahkan baris data ke bagian paling bawah sheet
    sheet.appendRow(newRow);
    
    return jsonSuccess({ id: newId, nama_lengkap: nama_lengkap }, "Data alumni baru berhasil disimpan.");
    
  } catch (error) {
    console.error("Error di addAlumniHandler: ", error.toString());
    return jsonError(`Gagal menyimpan data alumni: ${error.toString()}`, 500);
  }
}
