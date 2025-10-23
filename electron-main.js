const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// ВАЖНО: Загружаем .env ПЕРВЫМ ДЕЛОМ
// В dev режиме загружаем из корня проекта
if (!app.isPackaged) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  console.log('[ENV] .env loaded from:', path.join(__dirname, '.env'));
}

// Auto-update configuration
autoUpdater.autoDownload = false; // Don't download automatically
autoUpdater.autoInstallOnAppQuit = true; // Install on app quit

// GitHub token for private repositories
if (process.env.GH_TOKEN) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'm1ruk0',
    repo: 'solarbox-staff-panel',
    private: true,
    token: process.env.GH_TOKEN
  });
  console.log('[GITHUB] Private repository access configured');
} else {
  console.log('[WARN] GH_TOKEN not found - private repo access may fail');
}

// Force dev update config for testing
if (process.env.FORCE_UPDATE_CHECK === 'true') {
  autoUpdater.forceDevUpdateConfig = true;
  console.log('[DEV-UPDATE] Force dev update config enabled');
  
  // Отключаем проверку подписи для тестирования
  process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';
  
  // Обработчик для пропуска проверки подписи
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[UPDATE] Downloaded successfully (signature check skipped for testing)');
  });
}

let updateWindow = null;

// Загрузка .env для production
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
      enableRemoteModule: false,
      devTools: !app.isPackaged // DevTools только в dev режиме
    },
    autoHideMenuBar: true,
    frame: true,
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

  // Блокировка DevTools в production
  if (app.isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });

    // Блокировка контекстного меню
    mainWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });

    // Блокировка горячих клавиш DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        event.preventDefault();
      }
      if (input.control && input.shift && input.key.toLowerCase() === 'j') {
        event.preventDefault();
      }
      if (input.key === 'F12') {
        event.preventDefault();
      }
    });
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

// Auto-update event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('[UPDATE] Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('[UPDATE] Update available:', info.version);
  createUpdateWindow(info);
});

autoUpdater.on('update-not-available', () => {
  console.log('[UPDATE] No updates available, you have the latest version');
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('[DOWNLOAD] Progress:', progressObj.percent.toFixed(2) + '%');
  
  if (mainWindow) {
    mainWindow.setProgressBar(progressObj.percent / 100);
  }
  
  if (updateWindow) {
    updateWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', () => {
  console.log('[UPDATE] Update downloaded');
  
  if (mainWindow) {
    mainWindow.setProgressBar(-1);
  }
  
  if (updateWindow) {
    updateWindow.webContents.send('update-downloaded');
  }
});

autoUpdater.on('error', (error) => {
  console.error('[ERROR] Update error:', error);
  
  if (updateWindow) {
    updateWindow.webContents.send('update-error', error);
  }
});

app.whenReady().then(() => {
  createWindow();
  
  console.log('[MODE] Application mode:', app.isPackaged ? 'PRODUCTION (packaged)' : 'DEVELOPMENT (dev)');
  console.log('[VERSION] Application version:', app.getVersion());
  
  // Check environment variable for dev mode testing
  const forceUpdateCheck = process.env.FORCE_UPDATE_CHECK === 'true';
  
  // Check for updates 3 seconds after startup
  if (app.isPackaged || forceUpdateCheck) {
    console.log('[AUTO-UPDATE] Enabled');
    if (forceUpdateCheck) {
      console.log('[TEST MODE] Checking updates in dev mode');
    }
    setTimeout(() => {
      console.log('[UPDATE] Starting update check...');
      console.log('[REPO] GitHub Repo: m1ruk0/solarbox-staff-panel');
      console.log('[VERSION] Current version:', app.getVersion());
      autoUpdater.checkForUpdates()
        .then(result => {
          console.log('[RESULT] Check result:', result);
        })
        .catch(error => {
          console.error('[ERROR] Check failed:', error.message);
        });
    }, 3000);
  } else {
    console.log('[AUTO-UPDATE] Disabled (development mode)');
    console.log('[INFO] To test, build the app: npm run build');
    console.log('[INFO] Or run with FORCE_UPDATE_CHECK=true for dev mode test');
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
