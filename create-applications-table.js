require('dotenv').config();
const { google } = require('googleapis');

async function createApplicationsTable() {
  try {
    // Инициализация
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('📋 Создаю таблицу "Заявки"...');

    // Создаём лист "Заявки"
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Заявки',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 9
                },
                tabColor: {
                  red: 0.91,
                  green: 0.53,
                  blue: 0.29
                }
              }
            }
          }]
        }
      });
      console.log('✅ Лист "Заявки" создан');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Лист "Заявки" уже существует');
      } else {
        throw error;
      }
    }

    // Добавляем заголовки
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Заявки!A1:I1',
      valueInputOption: 'RAW',
      resource: {
        values: [['Discord', 'Minecraft', 'Возраст', 'Опыт', 'Почему хочет', 'Дата подачи', 'Статус', 'Должность', 'Комментарий']]
      }
    });
    console.log('✅ Заголовки добавлены');

    // Форматирование заголовков
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 1, // ID нового листа
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 9
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.91, green: 0.53, blue: 0.29 },
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

    console.log('\n🎉 Таблица заявок успешно создана!');
    console.log('🔗 Откройте: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createApplicationsTable();
