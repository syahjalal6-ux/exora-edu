/**
 * EXORA-EDU - Achievements.gs
 * Modul Manajemen Prestasi Siswa (Production-Ready)
 */

// Pastikan SPREADSHEET_ID merujuk ke ID Spreadsheet database Anda
const SHEET_NAME_ACHIEVEMENTS = "Achievements";

/**
 * Handler untuk mengambil data Prestasi (HTTP GET)
 * Diarsitekturkan untuk dipanggil oleh Code.gs
 */
function getAchievementsHandler(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_ACHIEVEMENTS);
    
    if (!sheet) {
      return jsonError(`Database sheet '${SHEET_NAME_ACHIEVEMENTS}' tidak ditemukan.`, 404);
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Jika sheet hanya berisi header atau kosong
    if (values.length <= 1) {
      return jsonSuccess([], "Belum ada data prestasi.");
    }
    
    // Mengubah data sheet menjadi array of objects JSON rapi
    const formattedData = parseSheetRowsToObjects(values);
    
    // Clean & format tipe data tanggal sebelum dikirim ke frontend
    const cleanedData = formattedData.map(item => {
      return {
        id: item.id,
        academic_year_id: item.academic_year_id,
        nama_siswa: item.nama_siswa,
        kelas: item.kelas,
        nama_prestasi: item.nama_prestasi,
        jenis_prestasi: item.jenis_prestasi,
        tingkat: item.tingkat,
        peringkat: item.peringkat,
        tanggal_penghargaan: formatDate(item.tanggal_penghargaan) || item.tanggal_penghargaan
      };
    });
    
    // Fitur Filter: Berdasarkan Academic Year ID (e.g., ?action=getAchievements&academicYearId=AY-839102)
    if (e && e.parameter && e.parameter.academicYearId) {
      const targetAy = e.parameter.academicYearId.toString().trim();
      const filteredData = cleanedData.filter(item => item.academic_year_id === targetAy);
      return jsonSuccess(filteredData, `Data prestasi untuk tahun ajaran ${targetAy} berhasil diambil.`);
    }
    
    return jsonSuccess(cleanedData, "Semua data prestasi berhasil diambil.");
    
  } catch (error) {
    console.error("Error di getAchievementsHandler: ", error.toString());
    return jsonError(`Gagal mengambil data prestasi: ${error.toString()}`, 500);
  }
}

/**
 * Handler untuk menambahkan data Prestasi baru (HTTP POST)
 * Otomatis melacak & mengaitkan ID Tahun Ajaran yang aktif jika tidak dikirim dari frontend.
 */
function addAchievementHandler(requestData) {
  try {
    const { nama_siswa, kelas, nama_prestasi, jenis_prestasi, tingkat, peringkat, tanggal_penghargaan } = requestData;
    let { academic_year_id } = requestData;
    
    // Validasi input wajib
    if (!nama_siswa || !kelas || !nama_prestasi || !tingkat) {
      return jsonError("Bad Request: Parameter 'nama_siswa', 'kelas', 'nama_prestasi', dan 'tingkat' wajib diisi.", 400);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_ACHIEVEMENTS);
    
    if (!sheet) {
      return jsonError(`Database sheet '${SHEET_NAME_ACHIEVEMENTS}' tidak ditemukan.`, 404);
    }
    
    // LOGIKA RELASIONAL: Jika frontend tidak mengirimkan academic_year_id, 
    // kita cari otomatis tahun ajaran mana yang saat ini sedang aktif di database.
    if (!academic_year_id) {
      const aySheet = ss.getSheetByName(SHEET_NAME_AY);
      if (aySheet) {
        const ayValues = aySheet.getDataRange().getValues();
        const ayObjects = parseSheetRowsToObjects(ayValues);
        const activeAy = ayObjects.find(ay => ay.is_active === true || ay.is_active.toString().toLowerCase() === "true");
        if (activeAy) {
          academic_year_id = activeAy.id;
        }
      }
    }
    
    // Jika masih tidak ditemukan juga, beri nilai default / error fallback
    if (!academic_year_id) {
      academic_year_id = "UNKNOWN";
    }
    
    // Auto-generate ID unik untuk data prestasi (Contoh: AC-987123)
    const newId = "AC-" + new Date().getTime().toString().slice(-6);
    
    // Susun baris baru sesuai struktur database
    const newRow = [
      newId,
      academic_year_id,
      nama_siswa.toString().trim(),
      kelas.toString().trim(),
      nama_prestasi.toString().trim(),
      jenis_prestasi ? jenis_prestasi.toString().trim() : "Akademik",
      tingkat.toString().trim(),
      peringkat ? peringkat.toString().trim() : "-",
      tanggal_penghargaan ? tanggal_penghargaan.toString().trim() : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd")
    ];
    
    // Append data ke sheet
    sheet.appendRow(newRow);
    
    return jsonSuccess({ id: newId, nama_siswa: nama_siswa, nama_prestasi: nama_prestasi }, "Data prestasi berhasil disimpan.");
    
  } catch (error) {
    console.error("Error di addAchievementHandler: ", error.toString());
    return jsonError(`Gagal menyimpan data prestasi: ${error.toString()}`, 500);
  }
}
