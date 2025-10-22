const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Настройка автообновлений
autoUpdater.autoDownload = false; // Не скачиваем автоматически
autoUpdater.autoInstallOnAppQuit = true; // Устанавливаем при выходе

let updateWindow = null;

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
let serverReady = false;
const apiServer = require('./api-server-supabase.js');

// Ждем готовности сервера
setTimeout(() => {
  serverReady = true;
  console.log('✅ API сервер готов');
}, 3000);

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

  // Показываем экран загрузки (как на сайте)
  mainWindow.loadURL('data:text/html,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { margin: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Inter', Arial, sans-serif; }
        .loader-content { text-align: center; }
        .loader-spinner { width: 50px; height: 50px; margin: 0 auto 2rem; border-radius: 50%; border: 4px solid transparent; border-top-color: #764ba2; border-right-color: #764ba2; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-text { color: white; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; animation: pulse 1.5s ease-in-out infinite; }
        .loader-subtext { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    </head>
    <body>
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">Загрузка...</div>
        <div class="loader-subtext">Подготовка панели управления</div>
      </div>
    </body>
    </html>
  `));
  
  // Ждем запуска сервера и загружаем login.html
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:4000/login.html').catch(err => {
      console.error('❌ Ошибка загрузки:', err);
      mainWindow.loadURL('data:text/html,<h1 style="text-align:center;margin-top:50px;font-family:Arial;">Ошибка запуска сервера</h1><p style="text-align:center;font-family:Arial;">Проверьте .env файл и подключение к базе данных.</p>');
    });
  }, 3500);

  // DevTools только в режиме разработки
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Заголовок окна
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });
}

// Функция создания окна обновлений
function createUpdateWindow(updateInfo) {
  if (updateWindow) {
    updateWindow.focus();
    return;
  }

  updateWindow = new BrowserWindow({
    width: 550,
    height: 450,
    resizable: false,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    parent: mainWindow,
    modal: true
  });

  const updatePath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'public', 'update.html')
    : path.join(__dirname, 'public', 'update.html');

  if (fs.existsSync(updatePath)) {
    updateWindow.loadFile(updatePath);
  } else {
    updateWindow.loadURL('http://localhost:4000/update.html');
  }

  updateWindow.on('closed', () => {
    updateWindow = null;
  });

  // Отправляем информацию об обновлении
  updateWindow.webContents.on('did-finish-load', () => {
    updateWindow.webContents.send('update-info', updateInfo);
  });
}

// Обработчики IPC от окна обновлений
ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('close-update-window', () => {
  if (updateWindow) {
    updateWindow.close();
  }
});

// Обработчики событий автообновления
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Проверка обновлений...');
});

autoUpdater.on('update-available', (info) => {
  console.log('✅ Доступно обновление:', info.version);
  createUpdateWindow(info);
});

autoUpdater.on('update-not-available', () => {
  console.log('✅ Обновлений нет, у вас последняя версия');
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('📥 Загрузка:', progressObj.percent.toFixed(2) + '%');
  
  if (mainWindow) {
    mainWindow.setProgressBar(progressObj.percent / 100);
  }
  
  if (updateWindow) {
    updateWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', () => {
  console.log('✅ Обновление загружено');
  
  if (mainWindow) {
    mainWindow.setProgressBar(-1);
  }
  
  if (updateWindow) {
    updateWindow.webContents.send('update-downloaded');
  }
});

autoUpdater.on('error', (error) => {
  console.error('❌ Ошибка обновления:', error);
  
  if (updateWindow) {
    updateWindow.webContents.send('update-error', error);
  }
});

app.whenReady().then(() => {
  createWindow();
  
  // Проверяем обновления через 3 секунды после запуска
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 3000);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
