// Модуль для работы с базой данных персонала в Google Sheets
const { google } = require('googleapis');

class StaffDatabase {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
    this.initialized = false;
  }

  // Инициализация Google Sheets API
  async initialize() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      console.log('✅ Google Sheets API инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Google Sheets:', error.message);
      this.initialized = false;
    }
  }

  // Получить всех сотрудников
  async getAllStaff() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Персонал!A2:G', // Discord, Minecraft, Должность, Варны, Дата найма, Статус, Отпуск
      });

      const rows = response.data.values || [];
      return rows.map(row => ({
        discord: row[0] || '',
        minecraft: row[1] || '',
        position: row[2] || '',
        warns: parseInt(row[3]) || 0,
        hireDate: row[4] || '',
        status: row[5] || 'Активен',
        vacation: row[6] || 'Нет'
      }));
    } catch (error) {
      console.error('Ошибка получения данных:', error.message);
      return [];
    }
  }

  // Найти сотрудника по Discord нику
  async findStaff(discordUsername) {
    const allStaff = await this.getAllStaff();
    return allStaff.find(staff => 
      staff.discord.toLowerCase() === discordUsername.toLowerCase()
    );
  }

  // Добавить нового сотрудника
  async addStaff(discordUsername, minecraftNick, position) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const today = new Date().toLocaleDateString('ru-RU');
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Персонал!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[discordUsername, minecraftNick, position, 0, today, 'Активен', 'Нет']]
        }
      });

      console.log(`✅ Добавлен сотрудник: ${discordUsername} (${minecraftNick}) - ${position}`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления сотрудника:', error.message);
      return false;
    }
  }

  // Найти сотрудника по Discord
  async getStaffByDiscord(discordUsername) {
    const allStaff = await this.getAllStaff();
    return allStaff.find(s => s.discord.toLowerCase() === discordUsername.toLowerCase());
  }

  // Алиас для getStaffByDiscord
  async findStaff(discordUsername) {
    return await this.getStaffByDiscord(discordUsername);
  }

  // Обновить должность
  async updatePosition(discordUsername, newPosition) {
    return await this.updateField(discordUsername, 'C', newPosition);
  }

  // Добавить варн
  async addWarn(discordUsername, count = 1) {
    const staff = await this.getStaffByDiscord(discordUsername);
    if (!staff) return false;
    
    const newWarns = Math.min(staff.warns + count, 3); // Максимум 3 варна
    return await this.updateField(discordUsername, 'D', newWarns);
  }

  // Снять варн
  async removeWarn(discordUsername, count = 1) {
    const staff = await this.getStaffByDiscord(discordUsername);
    if (!staff) return false;
    
    const newWarns = Math.max(staff.warns - count, 0); // Минимум 0 варнов
    return await this.updateField(discordUsername, 'D', newWarns);
  }

  // Обновить статус
  async updateStatus(discordUsername, status) {
    return await this.updateField(discordUsername, 'F', status);
  }

  // Установить отпуск
  async setVacation(discordUsername, onVacation, days = 0) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Находим строку
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Персонал!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => 
        row[0] && row[0].toLowerCase() === discordUsername.toLowerCase()
      );

      if (rowIndex === -1) return false;

      // Вычисляем дату окончания отпуска
      let endDate = '';
      if (onVacation && days > 0) {
        const end = new Date();
        end.setDate(end.getDate() + days);
        endDate = end.toLocaleDateString('ru-RU');
      }

      // Обновляем отпуск и дату окончания
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Персонал!G${rowIndex + 1}:H${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[onVacation ? 'Да' : 'Нет', endDate]]
        }
      });

      console.log(`✅ Отпуск обновлен для ${discordUsername}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления отпуска:', error.message);
      return false;
    }
  }

  // Уволить сотрудника (изменить статус на "Уволен")
  async deleteStaff(discordUsername, reason) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Меняем статус на "Уволен" вместо удаления
      const success = await this.updateField(discordUsername, 'F', 'Уволен');
      
      if (success) {
        console.log(`✅ Сотрудник ${discordUsername} уволен. Причина: ${reason}`);
      }
      
      return success;
    } catch (error) {
      console.error('Ошибка увольнения сотрудника:', error.message);
      return false;
    }
  }

  // Удалить сотрудника навсегда из таблицы
  async permanentDelete(discordUsername, reason) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Находим строку
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Персонал!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => 
        row[0] && row[0].toLowerCase() === discordUsername.toLowerCase()
      );

      if (rowIndex === -1) {
        console.log(`❌ Сотрудник ${discordUsername} не найден`);
        return false;
      }

      // Удаляем строку
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }]
        }
      });

      console.log(`✅ Сотрудник ${discordUsername} УДАЛЕН из базы. Причина: ${reason}`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления сотрудника:', error.message);
      return false;
    }
  }

  // Универсальная функция обновления поля
  async updateField(discordUsername, column, value) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Находим строку с пользователем
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Персонал!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => 
        row[0] && row[0].toLowerCase() === discordUsername.toLowerCase()
      );

      if (rowIndex === -1) {
        console.log(`❌ Сотрудник ${discordUsername} не найден`);
        return false;
      }

      // Обновляем значение (rowIndex + 1 потому что API использует 1-индексацию)
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Персонал!${column}${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[value]]
        }
      });

      console.log(`✅ Обновлено поле ${column} для ${discordUsername}: ${value}`);
      return true;
    } catch (error) {
      console.error('Ошибка обновления поля:', error.message);
      return false;
    }
  }

  // Удалить сотрудника
  async removeStaff(discordUsername) {
    return await this.updateStatus(discordUsername, 'Уволен');
  }
}

module.exports = new StaffDatabase();
