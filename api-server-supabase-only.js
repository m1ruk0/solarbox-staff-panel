require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Supabase модули
const staffDB = require('./staff-database-supabase');
const applicationsDB = require('./applications-database-supabase');
const passwordsDB = require('./passwords-database-supabase');
const { hasPermission, canPromoteTo, getAvailablePositions } = require('./roles');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// КОРНЕВОЙ МАРШРУТ
// ============================================

app.get('/', (req, res) => {
  res.redirect('/landing.html');
});

// ============================================
// API ENDPOINTS - ПЕРСОНАЛ
// ============================================

// Получить всех сотрудников
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await staffDB.getAllStaff();
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error('Ошибка получения персонала:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить сотрудника
app.post('/api/staff', async (req, res) => {
  try {
    const { discord, minecraft, position } = req.body;
    
    if (!discord || !minecraft || !position) {
      return res.status(400).json({ success: false, error: 'Discord, Minecraft и должность обязательны' });
    }
    
    const success = await staffDB.addStaff(discord, minecraft, position);
    
    if (success) {
      res.json({ success: true, message: 'Сотрудник добавлен' });
    } else {
      res.status(500).json({ success: false, error: 'Не удалось добавить сотрудника' });
    }
  } catch (error) {
    console.error('Ошибка добавления сотрудника:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Обновить должность
app.put('/api/staff/:discord/position', async (req, res) => {
  try {
    const { discord } = req.params;
    const { position } = req.body;
    
    const success = await staffDB.updatePosition(discord, position);
    
    if (success) {
      res.json({ success: true, message: 'Должность обновлена' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка обновления должности:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить варн
app.post('/api/staff/:discord/warn', async (req, res) => {
  try {
    const { discord } = req.params;
    const { count = 1, reason } = req.body;
    
    const success = await staffDB.addWarn(discord, count);
    
    if (success) {
      console.log(`✅ Выдано ${count} варн(ов) для ${discord}. Причина: ${reason}`);
      res.json({ success: true, message: `Выдано ${count} варн(ов)` });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка добавления варна:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Снять варн
app.delete('/api/staff/:discord/warn', async (req, res) => {
  try {
    const { discord } = req.params;
    const { count = 1, reason } = req.body;
    
    const success = await staffDB.removeWarn(discord, count);
    
    if (success) {
      console.log(`✅ Снято ${count} варн(ов) с ${discord}. Причина: ${reason}`);
      res.json({ success: true, message: `Снято ${count} варн(ов)` });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка снятия варна:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Обновить статус
app.put('/api/staff/:discord/status', async (req, res) => {
  try {
    const { discord } = req.params;
    const { status } = req.body;
    
    const success = await staffDB.updateStatus(discord, status);
    
    if (success) {
      res.json({ success: true, message: 'Статус обновлен' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Установить отпуск
app.put('/api/staff/:discord/vacation', async (req, res) => {
  try {
    const { discord } = req.params;
    const { vacation, days } = req.body;
    
    const success = await staffDB.setVacation(discord, vacation, days);
    
    if (success) {
      res.json({ success: true, message: 'Статус отпуска обновлен' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка обновления отпуска:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Уволить сотрудника
app.delete('/api/staff/:discord', async (req, res) => {
  try {
    const { discord } = req.params;
    const { reason } = req.body;
    
    const success = await staffDB.deleteStaff(discord, reason);
    
    if (success) {
      res.json({ success: true, message: 'Сотрудник уволен' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка увольнения сотрудника:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Удалить сотрудника навсегда
app.delete('/api/staff/:discord/permanent-delete', async (req, res) => {
  try {
    const { discord } = req.params;
    const { reason } = req.body;
    
    const success = await staffDB.permanentDelete(discord, reason);
    
    if (success) {
      res.json({ success: true, message: 'Сотрудник удален из базы' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка удаления сотрудника:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const staff = await staffDB.getAllStaff();
    
    const stats = {
      total: staff.length,
      active: staff.filter(s => s.status === 'Активен').length,
      vacation: staff.filter(s => s.vacation === 'Да').length,
      warned: staff.filter(s => s.warns > 0).length,
      blacklist: staff.filter(s => s.status === 'ЧСП').length
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API работает на Supabase' });
});

// ============================================
// API ENDPOINTS - ЗАЯВКИ
// ============================================

// Получить все заявки
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await applicationsDB.getAllApplications();
    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить заявку
app.post('/api/applications', async (req, res) => {
  try {
    const { discord, minecraft, age, experience, why, position } = req.body;
    
    // Валидация обязательных полей
    if (!discord || !minecraft) {
      return res.status(400).json({ 
        success: false, 
        error: 'Discord и Minecraft ники обязательны' 
      });
    }
    
    const applicationData = {
      discord: discord.trim(),
      minecraft: minecraft.trim(),
      age: age || 'Не указан',
      experience: experience || 'Не указан',
      why: why || 'Не указано',
      position: position === 'media' ? 'медия' : 'хелпер'
    };
    
    const success = await applicationsDB.addApplication(applicationData);
    
    if (success) {
      console.log(`✅ Заявка принята: ${applicationData.discord} -> ${applicationData.minecraft} (${applicationData.position})`);
      res.json({ 
        success: true, 
        message: 'Заявка успешно отправлена!',
        data: applicationData
      });
    } else {
      res.status(500).json({ success: false, error: 'Не удалось добавить заявку' });
    }
  } catch (error) {
    console.error('Ошибка API при добавлении заявки:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Одобрить заявку
app.post('/api/applications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { position, comment } = req.body;
    
    // Получаем заявку
    const applications = await applicationsDB.getAllApplications();
    const app = applications.find(a => a.id === id);
    
    if (!app) {
      return res.status(404).json({ success: false, error: 'Заявка не найдена' });
    }
    
    // Добавляем сотрудника
    const staffSuccess = await staffDB.addStaff(app.discord, app.minecraft, position || 'хелпер');
    
    if (staffSuccess) {
      // Обновляем статус заявки
      await applicationsDB.approveApplication(id, comment);
      res.json({ success: true, message: 'Заявка одобрена' });
    } else {
      res.status(500).json({ success: false, error: 'Не удалось добавить сотрудника' });
    }
  } catch (error) {
    console.error('Ошибка одобрения заявки:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отклонить заявку
app.post('/api/applications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const success = await applicationsDB.rejectApplication(id, comment);
    
    if (success) {
      res.json({ success: true, message: 'Заявка отклонена' });
    } else {
      res.status(404).json({ success: false, error: 'Заявка не найдена' });
    }
  } catch (error) {
    console.error('Ошибка отклонения заявки:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// АВТОРИЗАЦИЯ
// ============================================

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { discord, method, password, securityAnswer } = req.body;
    
    // Проверяем есть ли такой сотрудник
    const staff = await staffDB.findStaff(discord);
    
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Вы не являетесь сотрудником' });
    }
    
    // Проверяем права доступа
    if (!hasPermission(staff.position, 'canAccessAdmin') && 
        !hasPermission(staff.position, 'canManageStaff')) {
      return res.status(403).json({ success: false, error: 'У вас нет доступа к панели управления' });
    }
    
    // Проверяем пароль или секретный вопрос
    let authenticated = false;
    
    if (method === 'password' && password) {
      authenticated = await passwordsDB.verifyPassword(discord, password);
      if (!authenticated) {
        return res.status(401).json({ success: false, error: 'Неверный пароль' });
      }
    } else if (method === 'security' && securityAnswer) {
      authenticated = await passwordsDB.verifySecurityAnswer(discord, securityAnswer);
      if (!authenticated) {
        return res.status(401).json({ success: false, error: 'Неверный ответ на секретный вопрос' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Укажите пароль или ответ на секретный вопрос' });
    }
    
    res.json({
      success: true,
      user: {
        discord: staff.discord,
        minecraft: staff.minecraft,
        position: staff.position,
        permissions: {
          canManageStaff: hasPermission(staff.position, 'canManageStaff'),
          canManageApplications: hasPermission(staff.position, 'canManageApplications'),
          canFire: hasPermission(staff.position, 'canFire'),
          canAccessAdmin: hasPermission(staff.position, 'canAccessAdmin'),
          availablePositions: getAvailablePositions(staff.position)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить секретный вопрос
app.post('/api/auth/security-question', async (req, res) => {
  try {
    const { discord } = req.body;
    
    const question = await passwordsDB.getSecurityQuestion(discord);
    
    if (question) {
      res.json({ success: true, question });
    } else {
      res.status(404).json({ success: false, error: 'Секретный вопрос не найден' });
    }
  } catch (error) {
    console.error('Ошибка получения вопроса:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// АДМИН ПАНЕЛЬ ПАРОЛЕЙ
// ============================================

// Получить всех пользователей
app.get('/api/admin/passwords/users', async (req, res) => {
  try {
    const users = await passwordsDB.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить пользователя
app.post('/api/admin/passwords/add', async (req, res) => {
  try {
    const { discord, password, question, answer } = req.body;
    
    const success = await passwordsDB.addUser(discord, password, question, answer);
    
    if (success) {
      res.json({ success: true, message: 'Пользователь добавлен' });
    } else {
      res.status(500).json({ success: false, error: 'Не удалось добавить пользователя' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Удалить пользователя
app.delete('/api/admin/passwords/delete', async (req, res) => {
  try {
    const { discord } = req.body;
    
    const success = await passwordsDB.deleteUser(discord);
    
    if (success) {
      res.json({ success: true, message: 'Пользователь удален' });
    } else {
      res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`🗄️  База данных: Supabase`);
  console.log(`🌐 Главная страница: http://localhost:${PORT}/`);
});

module.exports = app;
