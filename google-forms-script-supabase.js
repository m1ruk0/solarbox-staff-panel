// Google Apps Script для отправки заявок в Supabase через API
// Этот скрипт нужно добавить в Google Forms

// НАСТРОЙКИ - замените на ваши данные!
const API_URL = 'https://staff-management-panel-production.up.railway.app/api'; // Или ваш Render URL
// Например: 'https://your-app.onrender.com/api'

function onFormSubmit(e) {
  try {
    // Получаем ответы из формы
    const responses = e.response.getItemResponses();
    
    // Создаем объект с данными заявки
    const application = {
      discord: '',
      minecraft: '',
      age: '',
      experience: '',
      reason: ''
    };
    
    // Заполняем данные из ответов формы
    responses.forEach(function(response) {
      const question = response.getItem().getTitle();
      const answer = response.getResponse();
      
      // Сопоставляем вопросы с полями
      if (question.includes('Discord') || question.includes('Дискорд')) {
        application.discord = answer;
      } else if (question.includes('Minecraft') || question.includes('Майнкрафт')) {
        application.minecraft = answer;
      } else if (question.includes('возраст') || question.includes('Возраст')) {
        application.age = answer;
      } else if (question.includes('опыт') || question.includes('Опыт')) {
        application.experience = answer;
      } else if (question.includes('Почему') || question.includes('причин')) {
        application.reason = answer;
      }
    });
    
    // Отправляем заявку на сервер
    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(application),
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(API_URL + '/applications', options);
    const result = JSON.parse(response.getContentText());
    
    if (result.success) {
      Logger.log('✅ Заявка успешно отправлена: ' + application.discord);
    } else {
      Logger.log('❌ Ошибка отправки заявки: ' + result.error);
    }
    
  } catch (error) {
    Logger.log('❌ Ошибка: ' + error.toString());
  }
}

// Функция для тестирования (запустите вручную)
function testSubmit() {
  const testData = {
    discord: 'test_user',
    minecraft: 'TestPlayer',
    age: '18',
    experience: '2 года',
    reason: 'Тестовая заявка'
  };
  
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(testData),
    'muteHttpExceptions': true
  };
  
  const response = UrlFetchApp.fetch(API_URL + '/applications', options);
  Logger.log(response.getContentText());
}
