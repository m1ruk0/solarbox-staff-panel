require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const staffDB = require('./staff-database-supabase');
const applicationsDB = require('./applications-database'); // Google Sheets для заявок!
const passwordsDB = require('./passwords-database-supabase');
const logsDB = require('./logs-database-supabase');
const { hasPermission, canPromoteTo, getAvailablePositions } = require('./roles');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ============================================
// ПЕРСОНАЛ
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
    const { discord, minecraft, position, moderator } = req.body;
    
    const success = await staffDB.addStaff(discord, minecraft, position);
    
    if (success) {
      await logsDB.addLog('Добавлен сотрудник', moderator || 'Система', discord, `Должность: ${position}`);
      res.json({ success: true, message: 'Сотрудник добавлен' });
    } else {
      res.status(400).json({ success: false, error: 'Не удалось добавить сотрудника' });
    }
  } catch (error) {
    console.error('Ошибка добавления сотрудника:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Изменить должность
app.put('/api/staff/:discord/position', async (req, res) => {
  try {
    const { discord } = req.params;
    const { position, moderator } = req.body;
    
    const success = await staffDB.updatePosition(discord, position);
    
    if (success) {
      await logsDB.addLog('Изменена должность', moderator || 'Система', discord, `Новая должность: ${position}`);
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
    const { count, reason } = req.body;
    
    const success = await staffDB.addWarn(discord, count);
    
    if (success) {
      res.json({ success: true, message: 'Варн добавлен' });
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
    const { count, reason } = req.body;
    
    const success = await staffDB.removeWarn(discord, count);
    
    if (success) {
      res.json({ success: true, message: 'Варн снят' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка снятия варна:', error);
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
    const { reason, moderator } = req.body;
    
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

// Восстановить сотрудника
app.put('/api/staff/:discord/restore', async (req, res) => {
  try {
    const { discord } = req.params;
    
    const success = await staffDB.updateStatus(discord, 'Активен');
    
    if (success) {
      res.json({ success: true, message: 'Сотрудник восстановлен' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка восстановления сотрудника:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Удалить навсегда
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
      fired: staff.filter(s => s.status === 'Уволен').length
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
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
    
    const staff = await staffDB.findStaff(discord);
    
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Вы не являетесь сотрудником' });
    }
    
    if (!hasPermission(staff.position, 'canAccessAdmin') && 
        !hasPermission(staff.position, 'canManageStaff')) {
      return res.status(403).json({ success: false, error: 'У вас нет доступа к панели управления' });
    }
    
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
// ЗАЯВКИ
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
    const success = await applicationsDB.addApplication(req.body);
    
    if (success) {
      res.json({ success: true, message: 'Заявка добавлена' });
    } else {
      res.status(400).json({ success: false, error: 'Не удалось добавить заявку' });
    }
  } catch (error) {
    console.error('Ошибка добавления заявки:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Принять заявку
app.post('/api/applications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { position, comment, moderator } = req.body;
    
    // Получаем данные заявки
    const applications = await applicationsDB.getAllApplications();
    const application = applications.find(app => app.id === id);
    
    if (!application) {
      return res.status(404).json({ success: false, error: 'Заявка не найдена' });
    }
    
    // Добавляем сотрудника в Supabase
    const staffAdded = await staffDB.addStaff(
      application.discord || application.allFields['Discord'] || 'unknown',
      application.minecraft || application.allFields['Minecraft никнейм'] || 'unknown',
      position
    );
    
    if (!staffAdded) {
      return res.status(400).json({ success: false, error: 'Не удалось добавить сотрудника' });
    }
    
    // Обновляем статус в Google Sheets
    const success = await applicationsDB.approveApplication(id, position, comment, moderator);
    
    if (success) {
      res.json({ success: true, message: 'Заявка принята, сотрудник добавлен' });
    } else {
      res.status(404).json({ success: false, error: 'Не удалось обновить заявку' });
    }
  } catch (error) {
    console.error('Ошибка принятия заявки:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отклонить заявку
app.post('/api/applications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, moderator } = req.body;
    
    const success = await applicationsDB.rejectApplication(id, comment, moderator);
    
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

// ============================================
// ЛОГИ (только для OWNER)
// ============================================

// Получить все логи
app.get('/api/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await logsDB.getAllLogs(limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить логи модератора
app.get('/api/logs/:moderator', async (req, res) => {
  try {
    const { moderator } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const logs = await logsDB.getLogsByModerator(moderator, limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Ошибка получения логов модератора:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.API_PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`🔒 База данных: Supabase (PostgreSQL)`);
});

module.exports = app;
