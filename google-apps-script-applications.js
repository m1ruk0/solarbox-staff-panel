// Google Apps Script для обработки заявок
// Добавьте этот код в Google Sheets → Extensions → Apps Script

// ID таблицы с заявками
const SHEET_ID = '174GIm8xB2u8_6ieDhldPscUtFNqXAUhnUrJTu_dPXp0';
const SHEET_NAME = 'Заявки';

// Webhook URL для уведомлений Discord (если нужно)
const DISCORD_WEBHOOK = ''; // Опционально

// Получить все заявки
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getApplications') {
    return getApplications();
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Unknown action'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Обработка POST запросов
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'approve') {
      return approveApplication(data.rowId, data.position, data.comment);
    } else if (action === 'reject') {
      return rejectApplication(data.rowId, data.comment);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Получить все заявки
function getApplications() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const applications = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Пропускаем пустые строки
      if (!row[0] && !row[1]) continue;
      
      const app = {
        id: (i + 1).toString(),
        timestamp: row[0] || '',
        status: row[6] || 'pending',
        position: row[7] || '',
        comment: row[8] || '',
        allFields: {}
      };
      
      // Собираем все поля
      headers.forEach((header, index) => {
        if (row[index]) {
          app.allFields[header] = row[index];
          
          const headerLower = header.toLowerCase();
          if (headerLower.includes('дискорд') || headerLower.includes('discord')) {
            app.discord = row[index];
          }
          if (headerLower.includes('никнейм') || headerLower.includes('ник')) {
            app.minecraft = row[index];
          }
          if (headerLower.includes('возраст')) {
            app.age = row[index];
          }
        }
      });
      
      applications.push(app);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: applications
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Одобрить заявку
function approveApplication(rowId, position, comment) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const row = parseInt(rowId);
    
    // Обновляем статус
    sheet.getRange(row, 7).setValue('approved');
    sheet.getRange(row, 8).setValue(position || '');
    sheet.getRange(row, 9).setValue(comment || '');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Заявка одобрена'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Отклонить заявку
function rejectApplication(rowId, comment) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const row = parseInt(rowId);
    
    // Обновляем статус
    sheet.getRange(row, 7).setValue('rejected');
    sheet.getRange(row, 8).setValue('');
    sheet.getRange(row, 9).setValue(comment || '');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Заявка отклонена'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
