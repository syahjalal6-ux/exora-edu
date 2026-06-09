/**
 * EXORA-EDU - Code.gs
 * Router Utama / API Gateway (Production-Ready)
 */

/**
 * Menangani semua HTTP GET Requests
 * Biasanya digunakan untuk mengambil data (Read)
 */
function doGet(e) {
  // 1. Validasi Keamanan API Key
  if (!validateApiKey(e)) {
    return jsonError("Unauthorized: API Key tidak valid atau tidak disertakan.", 401);
  }
  
  const action = e.parameter.action;
  if (!action) {
    return jsonError("Bad Request: Parameter 'action' wajib disertakan.", 400);
  }
  
  try {
    // 2. Routing Logic berdasarkan parameter 'action'
    switch (action) {
      
      // Modul: AcademicYears.gs
      case "getAcademicYears":
        return typeof getAcademicYearsHandler === "function" 
          ? getAcademicYearsHandler(e) 
          : jsonError("Endpoint getAcademicYears belum diimplementasikan.", 501);
          
      // Modul: Achievements.gs
      case "getAchievements":
        return typeof getAchievementsHandler === "function" 
          ? getAchievementsHandler(e) 
          : jsonError("Endpoint getAchievements belum diimplementasikan.", 501);
          
      // Modul: Alumni.gs
      case "getAlumni":
        return typeof getAlumniHandler === "function" 
          ? getAlumniHandler(e) 
          : jsonError("Endpoint getAlumni belum diimplementasikan.", 501);
          
      // Modul: Analytics.gs
      case "getAnalyticsSummary":
        return typeof getAnalyticsHandler === "function" 
          ? getAnalyticsHandler(e) 
          : jsonError("Endpoint getAnalytics belum diimplementasikan.", 501);

      // Default jika action tidak dikenali
      default:
        return jsonError(`Bad Request: Action GET '${action}' tidak dikenali.`, 400);
    }
    
  } catch (error) {
    // Log error ke Google Cloud Logger (Stackdriver) untuk debugging
    console.error("Error pada doGet: ", error.toString());
    return jsonError(`Internal Server Error: ${error.toString()}`, 500);
  }
}

/**
 * Menangani semua HTTP POST Requests
 * Biasanya digunakan untuk menambah, mengubah, atau menghapus data (Create, Update, Delete)
 */
function doPost(e) {
  // 1. Validasi Keamanan API Key
  if (!validateApiKey(e)) {
    return jsonError("Unauthorized: API Key tidak valid atau tidak disertakan.", 401);
  }
  
  const action = e.parameter.action;
  if (!action) {
    return jsonError("Bad Request: Parameter 'action' wajib disertakan pada URL query.", 400);
  }
  
  try {
    // Mengambil data payload JSON yang dikirim oleh frontend di dalam body request
    let requestData = {};
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    }
    
    // 2. Routing Logic berdasarkan parameter 'action'
    switch (action) {
      
      // Modul: AcademicYears.gs
      case "addAcademicYear":
        return typeof addAcademicYearsHandler === "function" 
          ? addAcademicYearsHandler(requestData) 
          : jsonError("Endpoint addAcademicYear belum diimplementasikan.", 501);
          
      // Modul: Alumni.gs
      case "addAlumni":
        return typeof addAlumniHandler === "function" 
          ? addAlumniHandler(requestData) 
          : jsonError("Endpoint addAlumni belum diimplementasikan.", 501);
          
      // Modul: Achievements.gs
      case "addAchievement":
        return typeof addAchievementHandler === "function" 
          ? addAchievementHandler(requestData) 
          : jsonError("Endpoint addAchievement belum diimplementasikan.", 501);

      default:
        return jsonError(`Bad Request: Action POST '${action}' tidak dikenali.`, 400);
    }
    
  } catch (error) {
    console.error("Error pada doPost: ", error.toString());
    return jsonError(`Internal Server Error: ${error.toString()}`, 500);
  }
}
