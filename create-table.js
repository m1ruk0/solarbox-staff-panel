require('dotenv').config();
const { google } = require('googleapis');

async function createTable() {
  try {
    // Инициализация
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('📊 Создаю таблицу "Персонал"...');

    // Создаём лист "Персонал"
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Персонал',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 7
                },
                tabColor: {
                  red: 0.29,
                  green: 0.53,
                  blue: 0.91
                }
              }
            }
          }]
        }
      });
      console.log('✅ Лист "Персонал" создан');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Лист "Персонал" уже существует');
      } else {
        throw error;
      }
    }

    // Добавляем заголовки
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Персонал!A1:G1',
      valueInputOption: 'RAW',
      resource: {
        values: [['Discord', 'Minecraft', 'Должность', 'Варны', 'Дата найма', 'Статус', 'Отпуск']]
      }
    });
    console.log('✅ Заголовки добавлены');

    // Добавляем примеры данных
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Персонал!A2:G4',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          ['username', 'Steve123', 'HELPER', 0, '20.10.2025', 'Активен', 'Нет'],
          ['user2', 'Alex456', 'MODER', 1, '15.10.2025', 'Активен', 'Да'],
          ['user3', 'Notch789', 'CT.HELPER', 2, '10.10.2025', 'ЧСП', 'Нет']
        ]
      }
    });
    console.log('✅ Примеры данных добавлены');

    // Форматирование заголовков
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 7
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.1, green: 0.45, blue: 0.91 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 12,
                    bold: true
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
            }
          }
        ]
      }
    });
    console.log('✅ Форматирование применено');

    console.log('\n🎉 Таблица успешно создана!');
    console.log('🔗 Откройте: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createTable();
