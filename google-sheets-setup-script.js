// Скрипт для автоматического создания и форматирования таблицы персонала
// Вставьте этот код в Google Apps Script (Расширения → Apps Script)

function createStaffTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Персонал');
  
  // Если лист не существует, создаем его
  if (!sheet) {
    sheet = ss.insertSheet('Персонал');
  } else {
    sheet.clear(); // Очищаем если существует
  }
  
  // ============================================
  // НАСТРОЙКА ЛИСТА
  // ============================================
  sheet.setTabColor('#4a86e8'); // Синий цвет вкладки
  
  // ============================================
  // ЗАГОЛОВКИ
  // ============================================
  const headers = ['Discord', 'Minecraft', 'Должность', 'Варны', 'Дата найма', 'Статус', 'Отпуск', 'Дата окончания отпуска'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Форматирование заголовков
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8'); // Яркий синий фон
  headerRange.setFontColor('#ffffff'); // Белый текст
  headerRange.setFontWeight('bold'); // Жирный шрифт
  headerRange.setFontSize(12);
  headerRange.setFontFamily('Google Sans');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  
  // Высота строки заголовка
  sheet.setRowHeight(1, 40);
  
  // ============================================
  // СПИСОК ДОЛЖНОСТЕЙ
  // ============================================
  const positions = [
    'OWNER',
    'RAZRAB',
    'TEX.ADMIN',
    'ADMIN',
    'CURATOR',
    'ZAM.CURATOR',
    'GL.STAFF',
    'MODER',
    'CT.HELPER',
    'HELPER'
  ];
  
  // ============================================
  // ПРИМЕРЫ ДАННЫХ
  // ============================================
  const exampleData = [
    ['username', 'Steve123', 'HELPER', 0, '20.10.2025', 'Активен', 'Нет', ''],
    ['user2', 'Alex456', 'MODER', 1, '15.10.2025', 'Активен', 'Да', '30.10.2025'],
    ['user3', 'Notch789', 'CT.HELPER', 2, '10.10.2025', 'ЧСП', 'Нет', '']
  ];
  
  sheet.getRange(2, 1, exampleData.length, headers.length).setValues(exampleData);
  
  // Высота строк с данными (первые 100 строк)
  const maxRows = Math.min(100, sheet.getMaxRows() - 1);
  if (maxRows > 0) {
    sheet.setRowHeights(2, maxRows, 30);
  }
  
  // ============================================
  // ВЕРТИКАЛЬНОЕ ВЫРАВНИВАНИЕ
  // ============================================
  // Все ячейки выравниваем по центру вертикально
  const availableRows = sheet.getMaxRows();
  sheet.getRange(1, 1, availableRows, headers.length).setVerticalAlignment('middle');
  
  // ============================================
  // ФОРМАТИРОВАНИЕ СТОЛБЦОВ
  // ============================================
  
  // Столбец A (Discord) - ширина 150px
  sheet.setColumnWidth(1, 150);
  
  // Столбец B (Minecraft) - ширина 150px
  sheet.setColumnWidth(2, 150);
  
  // Столбец C (Должность) - ширина 120px
  sheet.setColumnWidth(3, 120);
  
  // Столбец D (Варны) - ширина 80px, центрирование
  sheet.setColumnWidth(4, 80);
  sheet.getRange(2, 4, availableRows - 1, 1).setHorizontalAlignment('center');
  
  // Столбец E (Дата найма) - ширина 120px, центрирование
  sheet.setColumnWidth(5, 120);
  sheet.getRange(2, 5, availableRows - 1, 1).setHorizontalAlignment('center');
  
  // Столбец F (Статус) - ширина 100px, центрирование
  sheet.setColumnWidth(6, 100);
  sheet.getRange(2, 6, availableRows - 1, 1).setHorizontalAlignment('center');
  
  // Столбец G (Отпуск) - ширина 80px, центрирование
  sheet.setColumnWidth(7, 80);
  sheet.getRange(2, 7, availableRows - 1, 1).setHorizontalAlignment('center');
  
  // Столбец H (Дата окончания отпуска) - ширина 150px, центрирование
  sheet.setColumnWidth(8, 150);
  sheet.getRange(2, 8, availableRows - 1, 1).setHorizontalAlignment('center');
  
  // ============================================
  // ВЫПАДАЮЩИЕ СПИСКИ
  // ============================================
  
  // Выпадающий список для должностей (столбец C)
  const positionRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(positions, true)
    .setAllowInvalid(false)
    .setHelpText('Выберите должность из списка')
    .build();
  sheet.getRange(2, 3, availableRows - 1, 1).setDataValidation(positionRule);
  
  // Выпадающий список для статуса (столбец F)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Активен', 'Уволен', 'ЧСП'], true)
    .setAllowInvalid(false)
    .setHelpText('Выберите статус')
    .build();
  sheet.getRange(2, 6, availableRows - 1, 1).setDataValidation(statusRule);
  
  // Выпадающий список для отпуска (столбец G)
  const vacationValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Да', 'Нет'], true)
    .setAllowInvalid(false)
    .setHelpText('В отпуске?')
    .build();
  sheet.getRange(2, 7, availableRows - 1, 1).setDataValidation(vacationValidation);
  
  // ============================================
  // УСЛОВНОЕ ФОРМАТИРОВАНИЕ
  // ============================================
  
  // Статус "Активен" - зеленый
  const activeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Активен')
    .setBackground('#d9ead3')
    .setFontColor('#38761d')
    .setRanges([sheet.getRange('F:F')])
    .build();
  
  // Статус "Уволен" - серый
  const firedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Уволен')
    .setBackground('#efefef')
    .setFontColor('#666666')
    .setRanges([sheet.getRange('F:F')])
    .build();
  
  // Статус "ЧСП" - красный
  const blacklistRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('ЧСП')
    .setBackground('#f4cccc')
    .setFontColor('#cc0000')
    .setRanges([sheet.getRange('F:F')])
    .build();
  
  // Отпуск "Да" - желтый
  const vacationRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Да')
    .setBackground('#fff2cc')
    .setFontColor('#bf9000')
    .setRanges([sheet.getRange('G:G')])
    .build();
  
  // Варны >= 2 - оранжевый
  const warnsRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(2)
    .setBackground('#fce5cd')
    .setFontColor('#e69138')
    .setRanges([sheet.getRange('D:D')])
    .build();
  
  // ============================================
  // ЦВЕТОВОЕ КОДИРОВАНИЕ ДОЛЖНОСТЕЙ
  // ============================================
  
  // OWNER - красный
  const ownerRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('OWNER')
    .setBackground('#f4cccc')
    .setFontColor('#cc0000')
    .setBold(true)
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // RAZRAB - зеленый
  const razrabRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('RAZRAB')
    .setBackground('#d9ead3')
    .setFontColor('#38761d')
    .setBold(true)
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // TEX.ADMIN - синий
  const texAdminRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('TEX.ADMIN')
    .setBackground('#c9daf8')
    .setFontColor('#1155cc')
    .setBold(true)
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // ADMIN - фиолетовый
  const adminRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('ADMIN')
    .setBackground('#d9d2e9')
    .setFontColor('#674ea7')
    .setBold(true)
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // CURATOR - темно-зеленый
  const curatorRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('CURATOR')
    .setBackground('#b6d7a8')
    .setFontColor('#274e13')
    .setBold(true)
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // ZAM.CURATOR - зеленый
  const zamCuratorRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('ZAM.CURATOR')
    .setBackground('#d9ead3')
    .setFontColor('#38761d')
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // GL.STAFF - желтый
  const glStaffRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('GL.STAFF')
    .setBackground('#fff2cc')
    .setFontColor('#bf9000')
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // MODER - оранжевый
  const moderRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('MODER')
    .setBackground('#fce5cd')
    .setFontColor('#e69138')
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // CT.HELPER - светло-зеленый
  const ctHelperRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('CT.HELPER')
    .setBackground('#d9ead3')
    .setFontColor('#38761d')
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // HELPER - фиолетовый
  const helperRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('HELPER')
    .setBackground('#ead1dc')
    .setFontColor('#a64d79')
    .setRanges([sheet.getRange('C:C')])
    .build();
  
  // Применяем правила
  const rules = sheet.getConditionalFormatRules();
  rules.push(
    activeRule, firedRule, blacklistRule, vacationRule, warnsRule,
    ownerRule, razrabRule, texAdminRule, adminRule, curatorRule,
    zamCuratorRule, glStaffRule, moderRule, ctHelperRule, helperRule
  );
  sheet.setConditionalFormatRules(rules);
  
  // ============================================
  // ЧЕРЕДУЮЩИЕСЯ СТРОКИ (ЗЕБРА)
  // ============================================
  const zebraRange = sheet.getRange(2, 1, availableRows - 1, headers.length);
  zebraRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
  const banding = zebraRange.getBandings()[0];
  banding.setFirstRowColor('#ffffff');
  banding.setSecondRowColor('#f8f9fa');
  banding.setHeaderRowColor('#1a73e8');
  banding.setFooterRowColor(null);
  
  // ============================================
  // ГРАНИЦЫ
  // ============================================
  const dataRange = sheet.getRange(1, 1, availableRows, headers.length);
  
  // Внешние границы - толстые
  dataRange.setBorder(
    true, true, true, true, // top, left, bottom, right
    null, null, // vertical, horizontal (внутренние)
    '#1a73e8', 
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );
  
  // Внутренние границы - тонкие
  dataRange.setBorder(
    null, null, null, null, // внешние
    true, true, // vertical, horizontal (внутренние)
    '#e0e0e0', 
    SpreadsheetApp.BorderStyle.SOLID
  );
  
  // ============================================
  // ЗАКРЕПЛЕНИЕ ЗАГОЛОВКА
  // ============================================
  sheet.setFrozenRows(1);
  
  // ============================================
  // ЗАЩИТА ЗАГОЛОВКОВ
  // ============================================
  const protection = headerRange.protect().setDescription('Заголовки таблицы');
  protection.setWarningOnly(true);
  
  // ============================================
  // ДОБАВЛЕНИЕ ФИЛЬТРОВ
  // ============================================
  // Удаляем старый фильтр если существует
  const existingFilter = sheet.getFilter();
  if (existingFilter) {
    existingFilter.remove();
  }
  
  // Создаем новый фильтр
  sheet.getRange(1, 1, availableRows, headers.length).createFilter();
  
  SpreadsheetApp.getUi().alert('✅ Таблица персонала создана и отформатирована!');
}

// Создание меню для запуска скрипта
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 Бот')
    .addItem('📊 Создать таблицу персонала', 'createStaffTable')
    .addToUi();
}
