/**
 * EXORA-EDU - AcademicYears.gs
 * Modul Manajemen Tahun Ajaran (Production-Ready)
 */

// Ganti dengan ID Spreadsheet database Anda, atau kelola secara dinamis
const SPREADSHEET_ID = "ID_SPREADSHEET_DATABASE_ANDA"; 
const SHEET_NAME_AY = "AcademicYears";

/**
 * Handler untuk mengambil semua data Tahun Ajaran (HTTP GET)
 * Diarsitekturkan untuk dipanggil oleh Code.gs
 */
function getAcademicYearsHandler(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_AY);
    
    if (!sheet) {
      return jsonError(`Database sheet '${SHEET_NAME_AY}' tidak ditemukan.`, 404);
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Jika hanya ada header atau kosong
    if (values.length <= 1) {
      return jsonSuccess([], "Belum ada data tahun ajaran.");
    }
    
    // Mengubah array 2D dari Sheet menjadi Array of Objects JSON yang rapi
    const formattedData = parseSheetRowsToObjects(values);
    
    // Format tipe data boolean dan tanggal agar bersih sebelum dikirim ke frontend
    const cleanedData = formattedData.map(item => {
      return {
        id: item.id,
        year_name: item.year_name,
        start_date: formatDate(item.start_date) || item.start_date,
        end_date: formatDate(item.end_date) || item.end_date,
        is_active: item.is_active === true || item.is_active.toString().toLowerCase() === "true"
      };
    });
    
    // Jika frontend meminta spesifik yang aktif saja (e.g., ?action=getAcademicYears&activeOnly=true)
    if (e && e.parameter && e.parameter.activeOnly === "true") {
      const activeYear = cleanedData.find(item => item.is_active === true);
      return jsonSuccess(activeYear || null, "Data tahun ajaran aktif berhasil diambil.");
    }
    
    return jsonSuccess(cleanedData, "Semua data tahun ajaran berhasil diambil.");
    
  } catch (error) {
    console.error("Error di getAcademicYearsHandler: ", error.toString());
    return jsonError(`Gagal mengambil data tahun ajaran: ${error.toString()}`, 500);
  }
}

/**
 * Handler untuk menambah atau memperbarui Tahun Ajaran (HTTP POST)
 * Menjamin integritas data: Hanya boleh ada 1 tahun ajaran yang AKTIF.
 */
function addAcademicYearsHandler(requestData) {
  try {
    const { year_name, start_date, end_date, is_active } = requestData;
    
    // Validasi input wajib
    if (!year_name || !start_date || !end_date) {
      return jsonError("Bad Request: Parameter 'year_name', 'start_date', dan 'end_date' wajib diisi.", 400);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_AY);
    
    if (!sheet) {
      return jsonError(`Database sheet '${SHEET_NAME_AY}' tidak ditemukan.`, 404);
    }
    
    const statusActive = is_active === true || is_active.toString().toLowerCase() === "true";
    const values = sheet.getDataRange().getValues();
    
    // LOGIKA INTEGRITAS: Jika data baru ini diatur sebagai AKTIF (true),
    // maka matikan semua status 'true' pada tahun ajaran lain di database.
    if (statusActive && values.length > 1) {
      const header = values[0];
      const isActiveIndex = header.indexOf("is_active");
      
      if (isActiveIndex !== -1) {
        for (let i = 1; i < values.length; i++) {
          // Baris di Google Sheet dimulai dari indeks 1, baris data dimulai dari indeks 2 (i + 1)
          sheet.getRange(i + 1, isActiveIndex + 1).setValue(false);
        }
      }
    }
    
    // Generate ID Unik otomatis (Contoh: AY-171822000)
    const newId = "AY-" + new Date().getTime().toString().slice(-6);
    
    // Susun baris data baru sesuai urutan header kolom
    // id | year_name | start_date | end_date | is_active
    const newRow = [
      newId,
      year_name,
      start_date, // Format string "YYYY-MM-DD" dari frontend otomatis dikenali Google Sheet sebagai Date
      end_date,
      statusActive
    ];
    
    // Masukkan data ke baris paling bawah sheet
    sheet.appendRow(newRow);
    
    return jsonSuccess({ id: newId, year_name: year_name }, "Tahun ajaran baru berhasil disimpan.");
    
  } catch (error) {
    console.error("Error di addAcademicYearsHandler: ", error.toString());
    return jsonError(`Gagal menyimpan tahun ajaran: ${error.toString()}`, 500);
  }
}
