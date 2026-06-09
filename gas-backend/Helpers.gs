/**
 * EXORA-EDU - Helpers.gs
 * Modul Utilitas Global & Standarisasi API (Production-Ready)
 */

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const API_CONFIG = {
  // Ganti dengan API Key rahasia Anda untuk mengamankan endpoint
  API_KEY: "EXORA_EDU_SECRET_TOKEN_2026", 
  
  // Format standar untuk response error internal
  DEFAULT_ERROR_MSG: "Terjadi kesalahan internal pada server."
};

// ==========================================
// 2. RESPONSE UTILITIES (CORS & JSON)
// ==========================================

/**
 * Membuat response JSON sukses yang seragam dan mendukung CORS
 * @param {Object|Array} data - Data yang ingin dikirim ke frontend
 * @param {string} message - Pesan sukses kustom
 * @return {TextOutput} Google Apps Script TextOutput Object
 */
function jsonSuccess(data = {}, message = "Request berhasil diproses.") {
  const payload = {
    success: true,
    message: message,
    timestamp: new Date().toISOString(),
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Membuat response JSON error yang seragam dan mendukung CORS
 * @param {string} message - Pesan detail error
 * @param {number} code - HTTP status code analog (e.g., 400, 401, 404, 500)
 * @return {TextOutput} Google Apps Script TextOutput Object
 */
function jsonError(message = API_CONFIG.DEFAULT_ERROR_MSG, code = 400) {
  const payload = {
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
    error_code: code
  };
  
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 3. SECURITY & VALIDATION UTILITIES
// ==========================================

/**
 * Memvalidasi apakah request membawa API Key yang sah
 * @param {Object} e - Object event dari doGet atau doPost
 * @return {boolean} True jika valid, False jika tidak
 */
function validateApiKey(e) {
  // Mencari API Key dari parameter query (?apiKey=...) atau dari header request jika memungkinkan
  const clientKey = (e && e.parameter && e.parameter.apiKey) || "";
  return clientKey === API_CONFIG.API_KEY;
}

// ==========================================
// 4. DATA MANIPULATION HELPERS
// ==========================================

/**
 * Mengubah baris-baris data dari Google Sheets menjadi Array of Objects berdasarkan Header
 * @param {Array<Array>} rows - Data mentah dari sheet.getSheetValues() atau getValues()
 * @return {Array<Object>} Data yang sudah rapi berformat JSON-ready
 */
function parseSheetRowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  
  // Baris pertama diasumsikan sebagai nama kolom (Headers)
  const headers = rows[0].map(h => h.toString().trim());
  const result = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    let hasData = false;
    
    headers.forEach((header, index) => {
      const cellValue = row[index];
      obj[header] = cellValue !== undefined ? cellValue : null;
      if (cellValue !== "" && cellValue !== null) hasData = true;
    });
    
    // Hanya masukkan baris yang benar-benar ada isinya (bukan baris kosong di bawah)
    if (hasData) {
      result.push(obj);
    }
  }
  
  return result;
}

/**
 * Format tanggal standar untuk output API (YYYY-MM-DD)
 * @param {Date} dateObj - Objek Date dari Google Sheets
 * @return {string|null} Tanggal berformat string atau null jika tidak valid
 */
function formatDate(dateObj) {
  if (dateObj instanceof Date && !isNaN(dateObj)) {
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return null;
}
