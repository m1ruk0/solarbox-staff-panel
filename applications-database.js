require('dotenv').config();
const { google } = require('googleapis');

class ApplicationsDatabase {
  constructor() {
    this.sheets = null;
    // Используем отдельную таблицу для заявок или основную
    this.spreadsheetId = process.env.APPLICATIONS_SHEET_ID || process.env.GOOGLE_SHEET_ID;
    this.initialized = false;
    this.sheetName = 'Заявки'; // ✅ Название листа с заявками
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      console.log('✅ Google Sheets API для заявок инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Google Sheets:', error.message);
      throw error;
    }
  }

  // Получить все заявки
  async getAllApplications() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}`, // Читаем весь лист
      });

      const rows = response.data.values || [];
      if (rows.length === 0) return [];

      // Первая строка - заголовки
      const headers = rows[0];
      
      // Остальные строки - данные
      return rows.slice(1).map((row, index) => {
        const application = {
          id: (index + 2).toString(), // ID = номер строки
          timestamp: row[0] || '',
          status: 'pending',
          position: '',
          comment: '',
          allFields: {} // Все поля из формы
        };

        // Сохраняем все поля
        headers.forEach((header, i) => {
          if (row[i]) {
            application.allFields[header] = row[i];
            
            // Определяем ключевые поля
            const headerLower = header.toLowerCase();
            
            if (headerLower.includes('дискорд') || headerLower.includes('discord')) {
              application.discord = row[i];
            }
            if (headerLower.includes('никнейм') || headerLower.includes('ник')) {
              application.minecraft = row[i];
            }
            if (headerLower.includes('имя')) {
              application.name = row[i];
            }
            if (headerLower.includes('возраст') || headerLower.includes('лет')) {
              application.age = row[i];
            }
            if (headerLower.includes('на кого подаете')) {
              application.position = row[i].toLowerCase().includes('медия') ? 'медия' : 'хелпер';
            }
          }
        });

        return application;
      });
    } catch (error) {
      console.error('Ошибка получения заявок:', error.message);
      return [];
    }
  }

  // Добавить новую заявку
  async addApplication(discord, minecraft, age, experience, why) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const today = new Date().toLocaleString('ru-RU');
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:I`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[discord, minecraft, age, experience, why, today, 'pending', '', '']]
        }
      });

      console.log(`✅ Заявка от ${discord} добавлена в Google Sheets`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления заявки:', error.message);
      return false;
    }
  }

  // Удалить заявку из таблицы (физическое удаление строки)
  async deleteApplication(rowId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Получаем информацию о таблице
      const sheetMetadata = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'sheets(properties(sheetId,title))'
      });
      
      // Находим нужный лист по названию
      const sheet = sheetMetadata.data.sheets.find(
        s => s.properties.title === this.sheetName
      );
      
      if (!sheet) {
        throw new Error(`Лист "${this.sheetName}" не найден`);
      }
      
      const sheetId = sheet.properties.sheetId;
      
      console.log(`🔍 Удаляем строку ${rowId} с листа "${this.sheetName}" (sheetId: ${sheetId})`);
      
      // Физически удаляем строку
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: parseInt(rowId) - 1, // API использует 0-индексацию
                endIndex: parseInt(rowId)
              }
            }
          }]
        }
      });

      console.log(`✅ Заявка удалена (строка ${rowId})`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      console.error('Детали:', error.message);
      return false;
    }
  }

  // Одобрить заявку (и удалить из таблицы)
  async approveApplication(rowId, position, comment) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Удаляем заявку из таблицы
      await this.deleteApplication(rowId);
      console.log(`✅ Заявка одобрена и удалена (строка ${rowId})`);
      return true;
    } catch (error) {
      console.error('Ошибка одобрения заявки:', error.message);
      return false;
    }
  }

  // Отклонить заявку (и удалить из таблицы)
  async rejectApplication(rowId, comment) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Удаляем заявку из таблицы
      await this.deleteApplication(rowId);
      console.log(`✅ Заявка отклонена и удалена (строка ${rowId})`);
      return true;
    } catch (error) {
      console.error('Ошибка отклонения заявки:', error.message);
      return false;
    }
  }
}

module.exports = new ApplicationsDatabase();
