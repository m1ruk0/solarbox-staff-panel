// ============================================
// ФУНКЦИЯ СОХРАНЕНИЯ ЗАЯВКИ
// ============================================

function onFormSubmit(e) {
  try {
    // Заявка автоматически сохраняется в Google Sheets
    // Ничего дополнительно делать не нужно!
    // Сайт будет читать данные напрямую из листа "Заявки"
    
    Logger.log('✅ Заявка сохранена в Google Sheets!');
    
  } catch (error) {
    Logger.log('❌ Ошибка: ' + error.toString());
  }
}

// ============================================
// УСТАНОВКА ТРИГГЕРА
// ============================================

function setupTrigger() {
  // Удаляем старые триггеры
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Создаем новый триггер на отправку формы
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
  
  Logger.log('✅ Триггер установлен!');
}
