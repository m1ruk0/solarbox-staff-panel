const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// ВАЖНО: Загружаем .env ПЕРЕД запуском API сервера
// В production (собранном приложении) ищем .env в разных местах
let envPath;
let envLoaded = false;

if (app.isPackaged) {
  // Пробуем несколько путей для production
  const possiblePaths = [
    path.join(process.resourcesPath, 'app.asar', '.env'),
    path.join(process.resourcesPath, '.env'),
    path.join(path.dirname(app.getPath('exe')), '.env'),
    path.join(__dirname, '.env')
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      envPath = testPath;
      require('dotenv').config({ path: envPath });
      console.log('✅ .env файл загружен из:', envPath);
      envLoaded = true;
      break;
    }
  }
  
  if (!envLoaded) {
    console.warn('⚠️ .env файл не найден! Проверенные пути:');
    possiblePaths.forEach(p => console.warn('  -', p));
  }
} else {
  // Development режим
  envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('✅ .env файл загружен из:', envPath);
    envLoaded = true;
  }
}

// Если .env не найден, показываем предупреждение
if (!envLoaded) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: .env файл не найден!');
  console.error('Приложение не сможет подключиться к базе данных.');
}

// Запускаем API сервер
require('./api-server-supabase.js');

let mainWindow;

function createWindow() {
  // Определяем путь к иконке в зависимости от режима
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : path.join(__dirname, 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    autoHideMenuBar: true, // Скрыть меню
    title: 'SolarBox - Панель управления персоналом'
  });

  // Ждем запуска сервера
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:4000');
  }, 2000);

  // Открыть DevTools (для разработки, можно убрать)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Заголовок окна
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
