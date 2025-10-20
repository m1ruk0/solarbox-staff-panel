require('dotenv').config();
const { google } = require('googleapis');
const crypto = require('crypto');

class PasswordsDatabase {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
    this.initialized = false;
    this.sheetName = 'Пароли';
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
      console.log('✅ Google Sheets API для паролей инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error.message);
      throw error;
    }
  }

  // Хеширование пароля
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Добавить пользователя с паролем
  async addUser(discord, password, question, answer) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const hashedPassword = this.hashPassword(password);
      const hashedAnswer = this.hashPassword(answer.toLowerCase());
      const today = new Date().toLocaleString('ru-RU');
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:E`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[discord, hashedPassword, question, hashedAnswer, today]]
        }
      });

      console.log(`✅ Пользователь ${discord} добавлен`);
      return true;
    } catch (error) {
      console.error('Ошибка добавления пользователя:', error.message);
      return false;
    }
  }

  // Проверить пароль
  async verifyPassword(discord, password) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:B`,
      });

      const rows = response.data.values || [];
      const userRow = rows.find(row => row[0] && row[0].toLowerCase() === discord.toLowerCase());
      
      if (!userRow) return false;
      
      const hashedPassword = this.hashPassword(password);
      return userRow[1] === hashedPassword;
    } catch (error) {
      console.error('Ошибка проверки пароля:', error.message);
      return false;
    }
  }

  // Получить секретный вопрос
  async getSecurityQuestion(discord) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:C`,
      });

      const rows = response.data.values || [];
      const userRow = rows.find(row => row[0] && row[0].toLowerCase() === discord.toLowerCase());
      
      return userRow ? userRow[2] : null;
    } catch (error) {
      console.error('Ошибка получения вопроса:', error.message);
      return null;
    }
  }

  // Проверить ответ на секретный вопрос
  async verifySecurityAnswer(discord, answer) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:D`,
      });

      const rows = response.data.values || [];
      const userRow = rows.find(row => row[0] && row[0].toLowerCase() === discord.toLowerCase());
      
      if (!userRow) return false;
      
      const hashedAnswer = this.hashPassword(answer.toLowerCase());
      return userRow[3] === hashedAnswer;
    } catch (error) {
      console.error('Ошибка проверки ответа:', error.message);
      return false;
    }
  }

  // Получить всех пользователей (только для админа)
  async getAllUsers() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A2:E`,
      });

      const rows = response.data.values || [];
      return rows.map(row => ({
        discord: row[0] || '',
        question: row[2] || '',
        createdAt: row[4] || ''
      }));
    } catch (error) {
      console.error('Ошибка получения пользователей:', error.message);
      return [];
    }
  }

  // Удалить пользователя
  async deleteUser(discord) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:A`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => 
        row[0] && row[0].toLowerCase() === discord.toLowerCase()
      );

      if (rowIndex === -1) return false;

      // Получаем sheetId
      const sheetsResponse = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      const sheet = sheetsResponse.data.sheets.find(s => s.properties.title === this.sheetName);
      const sheetId = sheet.properties.sheetId;

      // Удаляем строку
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }]
        }
      });

      console.log(`✅ Пользователь ${discord} удален`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error.message);
      return false;
    }
  }
}

module.exports = new PasswordsDatabase();
