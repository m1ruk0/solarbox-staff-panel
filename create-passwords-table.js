require('dotenv').config();
const { google } = require('googleapis');

async function createPasswordsTable() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('🔐 Создаю таблицу "Пароли"...');

    // Создаём лист "Пароли"
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Пароли',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 5
                },
                tabColor: {
                  red: 0.8,
                  green: 0.2,
                  blue: 0.2
                }
              }
            }
          }]
        }
      });
      console.log('✅ Лист "Пароли" создан');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Лист "Пароли" уже существует');
      } else {
        throw error;
      }
    }

    // Добавляем заголовки
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Пароли!A1:E1',
      valueInputOption: 'RAW',
      resource: {
        values: [['Discord', 'Пароль', 'Вопрос', 'Ответ', 'Дата создания']]
      }
    });
    console.log('✅ Заголовки добавлены');

    // Форматирование заголовков
    const sheetId = await getSheetId(sheets, spreadsheetId, 'Пароли');
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 5
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.2, blue: 0.2 },
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

    console.log('\n🎉 Таблица паролей успешно создана!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

async function getSheetId(sheets, spreadsheetId, sheetName) {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : 0;
}

createPasswordsTable();
