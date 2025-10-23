require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const staffDB = require('./staff-database-supabase');
const applicationsDB = require('./applications-database-supabase'); // Supabase для заявок!
const passwordsDB = require('./passwords-database-supabase');
const logsDB = require('./logs-database-supabase');
const bugsDB = require('./bugs-database-supabase');
const reportsDB = require('./reports-database-supabase');
const withdrawalsDB = require('./withdrawals-database-supabase');
const { hasPermission, canPromoteTo, getAvailablePositions, canManageStaffMember } = require('./roles');

// Discord бот (опционально)
let sendApplicationAcceptedDM = null;

// Пытаемся подключить Discord бота только если токен настроен
if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'ваш_токен_бота_здесь') {
  setTimeout(() => {
    try {
      const discordBot = require('./index');
      sendApplicationAcceptedDM = discordBot.sendApplicationAcceptedDM;
      console.log('[OK] Discord bot connected for notifications');
    } catch (error) {
      console.log('[WARN] Discord bot not connected:', error.message);
    }
  }, 3000);
} else {
  console.log('[INFO] Discord bot disabled (token not configured)');
  console.log('       API server running without Discord notifications');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper функция для проверки прав управления сотрудником
async function checkManagementPermission(moderator, moderatorPosition, targetDiscord) {
  // Проверка прав модератора
  if (!moderatorPosition || !hasPermission(moderatorPosition, 'canManageStaff')) {
    return { allowed: false, error: 'У вас нет прав на управление персоналом' };
  }
  
  // Получаем данные целевого сотрудника
  const allStaff = await staffDB.getAllStaff();
  const targetStaff = allStaff.find(s => s.discord.toLowerCase() === targetDiscord.toLowerCase());
  
  if (!targetStaff) {
    return { allowed: false, error: 'Сотрудник не найден' };
  }
  
  // Проверка: нельзя управлять самим собой
  if (moderator && moderator.toLowerCase() === targetDiscord.toLowerCase()) {
    return { allowed: false, error: 'Вы не можете выполнить это действие с самим собой' };
  }
  
  // Проверка: можно управлять только теми, кто ниже по иерархии
  if (!canManageStaffMember(moderatorPosition, targetStaff.position)) {
    return { allowed: false, error: 'Вы не можете управлять сотрудником с такой же или выше должностью' };
  }
  
  return { allowed: true, targetStaff };
}

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница - перенаправление на landing
app.get('/', (req, res) => {
  res.redirect('/landing.html');
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

// Получить одного сотрудника по Discord
app.get('/api/staff/:discord', async (req, res) => {
  try {
    const { discord } = req.params;
    const staff = await staffDB.getStaffByDiscord(discord);
    
    if (staff) {
      res.json({ success: true, staff });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка получения сотрудника:', error);
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
    const { position, moderator, moderatorPosition } = req.body;
    
    // Проверка прав модератора
    if (!moderatorPosition || !hasPermission(moderatorPosition, 'canManageStaff')) {
      return res.status(403).json({ success: false, error: 'У вас нет прав на управление персоналом' });
    }
    
    // Проверка, может ли модератор выдать эту должность
    if (!canPromoteTo(moderatorPosition, position)) {
      return res.status(403).json({ success: false, error: `Вы не можете выдавать должность ${position}` });
    }
    
    // Получаем данные целевого сотрудника
    const allStaff = await staffDB.getAllStaff();
    const targetStaff = allStaff.find(s => s.discord.toLowerCase() === discord.toLowerCase());
    
    if (!targetStaff) {
      return res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
    
    // Проверка: нельзя изменять должность самому себе
    if (moderator && moderator.toLowerCase() === discord.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Вы не можете изменить должность самому себе' });
    }
    
    // Проверка: можно управлять только теми, кто ниже по иерархии
    if (!canManageStaffMember(moderatorPosition, targetStaff.position)) {
      return res.status(403).json({ success: false, error: 'Вы не можете управлять сотрудником с такой же или выше должностью' });
    }
    
    const success = await staffDB.updatePosition(discord, position);
    
    if (success) {
      await logsDB.addLog('Изменена должность', moderator || 'Система', discord, `Новая должность: ${position}`);
      res.json({ success: true, message: 'Должность обновлена' });
    } else {
      res.status(404).json({ success: false, error: 'Не удалось обновить должность' });
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
    const { count, reason, moderator, moderatorPosition } = req.body;
    
    // Проверка прав
    const permission = await checkManagementPermission(moderator, moderatorPosition, discord);
    if (!permission.allowed) {
      return res.status(403).json({ success: false, error: permission.error });
    }
    
    const success = await staffDB.addWarn(discord, count);
    
    if (success) {
      await logsDB.addLog(
        'Выдан варн',
        moderator || 'Система',
        discord,
        `Количество: ${count || 1}. Причина: ${reason || 'Не указана'}`
      );
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
    const { count, reason, moderator, moderatorPosition } = req.body;
    
    // Проверка прав
    const permission = await checkManagementPermission(moderator, moderatorPosition, discord);
    if (!permission.allowed) {
      return res.status(403).json({ success: false, error: permission.error });
    }
    
    const success = await staffDB.removeWarn(discord, count);
    
    if (success) {
      await logsDB.addLog(
        'Снят варн',
        moderator || 'Система',
        discord,
        `Количество: ${count || 1}. Причина: ${reason || 'Не указана'}`
      );
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
    const { vacation, days, moderator, moderatorPosition } = req.body;
    
    // Проверка прав
    const permission = await checkManagementPermission(moderator, moderatorPosition, discord);
    if (!permission.allowed) {
      return res.status(403).json({ success: false, error: permission.error });
    }
    
    const success = await staffDB.setVacation(discord, vacation, days);
    
    if (success) {
      await logsDB.addLog(
        vacation ? 'Отправлен в отпуск' : 'Возвращен из отпуска',
        moderator || 'Система',
        discord,
        vacation ? `Дней: ${days || 0}` : 'Отпуск завершен'
      );
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
    const { reason, moderator, moderatorPosition } = req.body;
    
    // Проверка прав
    const permission = await checkManagementPermission(moderator, moderatorPosition, discord);
    if (!permission.allowed) {
      return res.status(403).json({ success: false, error: permission.error });
    }
    
    const success = await staffDB.deleteStaff(discord, reason);
    
    if (success) {
      await logsDB.addLog(
        'Уволен сотрудник',
        moderator || 'Система',
        discord,
        `Причина: ${reason || 'Не указана'}`
      );
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
    const { moderator } = req.body;
    
    const success = await staffDB.updateStatus(discord, 'Активен');
    
    if (success) {
      await logsDB.addLog(
        'Восстановлен сотрудник',
        moderator || 'Система',
        discord,
        'Статус изменен на "Активен"'
      );
      res.json({ success: true, message: 'Сотрудник восстановлен' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка восстановления сотрудника:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить солярики
app.post('/api/staff/:discord/solariki/add', async (req, res) => {
  try {
    const { discord } = req.params;
    const { amount, moderator, moderatorPosition } = req.body;
    
    // Проверка прав (ZAM.CURATOR и выше)
    const allowedPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    if (!allowedPositions.includes(moderatorPosition)) {
      return res.status(403).json({ success: false, error: 'Недостаточно прав для выдачи соляриков' });
    }
    
    // Защита: нельзя выдавать себе (кроме OWNER)
    if (discord.toLowerCase() === moderator.toLowerCase() && moderatorPosition !== 'OWNER') {
      return res.status(403).json({ success: false, error: 'Нельзя выдавать солярики самому себе' });
    }
    
    const success = await staffDB.addSolariki(discord, parseInt(amount));
    
    if (success) {
      await logsDB.addLog(
        'Выданы солярики',
        moderator,
        discord,
        `Количество: ${amount}`
      );
      res.json({ success: true, message: 'Солярики выданы' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка выдачи соляриков:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Снять солярики
app.post('/api/staff/:discord/solariki/remove', async (req, res) => {
  try {
    const { discord } = req.params;
    const { amount, moderator, moderatorPosition } = req.body;
    
    // Проверка прав (ZAM.CURATOR и выше)
    const allowedPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    if (!allowedPositions.includes(moderatorPosition)) {
      return res.status(403).json({ success: false, error: 'Недостаточно прав для снятия соляриков' });
    }
    
    // Защита: нельзя снимать у себя (кроме OWNER)
    if (discord.toLowerCase() === moderator.toLowerCase() && moderatorPosition !== 'OWNER') {
      return res.status(403).json({ success: false, error: 'Нельзя снимать солярики у самого себя' });
    }
    
    const success = await staffDB.removeSolariki(discord, parseInt(amount));
    
    if (success) {
      await logsDB.addLog(
        'Сняты солярики',
        moderator,
        discord,
        `Количество: ${amount}`
      );
      res.json({ success: true, message: 'Солярики сняты' });
    } else {
      res.status(404).json({ success: false, error: 'Сотрудник не найден' });
    }
  } catch (error) {
    console.error('Ошибка снятия соляриков:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Передать солярики другому пользователю
app.post('/api/staff/solariki/transfer', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, error: 'Не указаны все параметры' });
    }
    
    if (from.toLowerCase() === to.toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Нельзя передать самому себе' });
    }
    
    // Проверяем существование отправителя
    const sender = await staffDB.getStaffByDiscord(from);
    if (!sender) {
      return res.status(404).json({ success: false, error: 'Отправитель не найден' });
    }
    
    // Проверяем баланс
    if ((sender.solariki || 0) < amount) {
      return res.status(400).json({ success: false, error: 'Недостаточно соляриков' });
    }
    
    // Проверяем существование получателя
    const recipient = await staffDB.getStaffByDiscord(to);
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Получатель не найден' });
    }
    
    // Снимаем у отправителя
    const removed = await staffDB.removeSolariki(from, amount);
    if (!removed) {
      return res.status(500).json({ success: false, error: 'Ошибка снятия соляриков' });
    }
    
    // Добавляем получателю
    const added = await staffDB.addSolariki(to, amount);
    if (!added) {
      // Возвращаем обратно если не удалось добавить
      await staffDB.addSolariki(from, amount);
      return res.status(500).json({ success: false, error: 'Ошибка добавления соляриков' });
    }
    
    // Логируем
    await logsDB.addLog(
      'Передача соляриков',
      from,
      to,
      `Количество: ${amount}`
    );
    
    res.json({ success: true, message: 'Солярики переданы' });
  } catch (error) {
    console.error('Ошибка передачи соляриков:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Удалить навсегда
app.delete('/api/staff/:discord/permanent-delete', async (req, res) => {
  try {
    const { discord } = req.params;
    const { reason, moderator, moderatorPosition } = req.body;
    
    // Проверка прав
    const permission = await checkManagementPermission(moderator, moderatorPosition, discord);
    if (!permission.allowed) {
      return res.status(403).json({ success: false, error: permission.error });
    }
    
    const success = await staffDB.permanentDelete(discord, reason);
    
    if (success) {
      await logsDB.addLog(
        'Удален из базы',
        moderator || 'Система',
        discord,
        `Причина: ${reason || 'Не указана'}. Удаление безвозвратно!`
      );
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
    
    // Проверяем права доступа - ZAM.CURATOR и выше
    const allowedPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    if (!allowedPositions.includes(staff.position)) {
      return res.status(403).json({ success: false, error: 'Доступ к панели управления имеют только заместители кураторов и выше' });
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

// Получить архив заявок (принятые и отклоненные)
app.get('/api/applications/archive', async (req, res) => {
  try {
    const archived = await applicationsDB.getArchivedApplications();
    res.json({ success: true, data: archived });
  } catch (error) {
    console.error('Ошибка получения архива:', error);
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
      application.discord || 'unknown',
      application.minecraft || 'unknown',
      position
    );
    
    if (!staffAdded) {
      return res.status(400).json({ success: false, error: 'Не удалось добавить сотрудника' });
    }
    
    // Обновляем статус заявки
    const success = await applicationsDB.approveApplication(id, comment);
    
    if (success) {
      // Добавляем лог
      await logsDB.addLog(
        'Заявка принята',
        moderator || 'Система',
        application.discord,
        `Должность: ${position}. ${comment ? 'Комментарий: ' + comment : ''}`
      );
      
      // Отправляем уведомление в Discord ЛС
      if (sendApplicationAcceptedDM && application.discord) {
        try {
          await sendApplicationAcceptedDM(application.discord, position, comment);
          console.log(`[OK] Notification sent to user ${application.discord}`);
        } catch (error) {
          console.error('[ERROR] Failed to send notification:', error.message);
        }
      }
      
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
    
    // Получаем данные заявки перед отклонением
    const applications = await applicationsDB.getAllApplications();
    const application = applications.find(app => app.id === id);
    
    const success = await applicationsDB.rejectApplication(id, comment);
    
    if (success) {
      // Добавляем лог
      if (application) {
        await logsDB.addLog(
          'Заявка отклонена',
          moderator || 'Система',
          application.discord,
          comment || 'Без комментария'
        );
      }
      
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

// ============================================
// БАГИ
// ============================================

// Получить все баги
app.get('/api/bugs', async (req, res) => {
  try {
    const bugs = await bugsDB.getAllBugs();
    res.json({ success: true, data: bugs });
  } catch (error) {
    console.error('Ошибка получения багов:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавить баг
app.post('/api/bugs', async (req, res) => {
  try {
    const success = await bugsDB.addBug(req.body);
    
    if (success) {
      res.json({ success: true, message: 'Баг отправлен! Спасибо за помощь!' });
    } else {
      res.status(400).json({ success: false, error: 'Не удалось отправить баг' });
    }
  } catch (error) {
    console.error('Ошибка добавления бага:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Обновить статус бага
app.put('/api/bugs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolvedBy, adminComment, moderatorPosition } = req.body;
    
    // Проверка прав (ZAM.CURATOR и выше)
    const allowedPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    if (!allowedPositions.includes(moderatorPosition)) {
      return res.status(403).json({ success: false, error: 'Недостаточно прав для управления багами' });
    }
    
    const success = await bugsDB.updateBugStatus(id, status, resolvedBy, adminComment);
    
    if (success) {
      res.json({ success: true, message: 'Статус бага обновлен' });
    } else {
      res.status(404).json({ success: false, error: 'Баг не найден' });
    }
  } catch (error) {
    console.error('Ошибка обновления статуса бага:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Удалить баг
app.delete('/api/bugs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { moderatorPosition } = req.body;
    
    // Проверка прав (только ADMIN и выше)
    const allowedPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN'];
    if (!allowedPositions.includes(moderatorPosition)) {
      return res.status(403).json({ success: false, error: 'Недостаточно прав для удаления багов' });
    }
    
    const success = await bugsDB.deleteBug(id);
    
    if (success) {
      res.json({ success: true, message: 'Баг удален' });
    } else {
      res.status(404).json({ success: false, error: 'Баг не найден' });
    }
  } catch (error) {
    console.error('Ошибка удаления бага:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ОТЧЕТЫ (REPORTS)
// ============================================

// Создать отчет
app.post('/api/reports', async (req, res) => {
  try {
    const { author, report_type, player_nickname, reason, description, screenshots } = req.body;
    
    if (!author) {
      return res.status(400).json({ success: false, error: 'Не указан автор отчета' });
    }
    
    const report = await reportsDB.createReport({
      author,
      report_type: report_type || 'daily_report',
      player_nickname: player_nickname || '',
      reason: reason || '',
      description: description || '',
      screenshots: screenshots || []
    });
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить все отчеты
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await reportsDB.getAllReports();
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить отчеты по автору
app.get('/api/reports/my', async (req, res) => {
  try {
    const { author } = req.query;
    
    if (!author) {
      return res.status(400).json({ success: false, error: 'Не указан автор' });
    }
    
    const reports = await reportsDB.getReportsByAuthor(author);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error getting reports by author:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить отчет по ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await reportsDB.getReportById(id);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Отчет не найден' });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Одобрить отчет
app.post('/api/reports/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer, reviewer_position, comment } = req.body;
    
    if (!reviewer) {
      return res.status(400).json({ success: false, error: 'Не указан проверяющий' });
    }
    
    const report = await reportsDB.approveReport(id, reviewer, reviewer_position, comment || '');
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error approving report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отклонить отчет
app.post('/api/reports/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer, reviewer_position, comment } = req.body;
    
    if (!reviewer) {
      return res.status(400).json({ success: false, error: 'Не указан проверяющий' });
    }
    
    const report = await reportsDB.rejectReport(id, reviewer, reviewer_position, comment || '');
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error rejecting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить статистику отчетов
app.get('/api/reports/stats', async (req, res) => {
  try {
    const stats = await reportsDB.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ЗАЯВКИ НА ВЫВОД (WITHDRAWALS)
// ============================================

// Создать заявку на вывод
app.post('/api/withdrawals', async (req, res) => {
  try {
    const { discord, minecraft, amount } = req.body;
    
    if (!discord || !minecraft || !amount) {
      return res.status(400).json({ success: false, error: 'Не все поля заполнены' });
    }
    
    if (amount < 100) {
      return res.status(400).json({ success: false, error: 'Минимальная сумма вывода: 100 соляриков' });
    }
    
    // Проверяем баланс пользователя
    const staff = await staffDB.getStaffByDiscord(discord);
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    
    if (staff.solariki < amount) {
      return res.status(400).json({ success: false, error: 'Недостаточно соляриков на балансе' });
    }
    
    // Снимаем соларики с баланса
    await staffDB.removeSolariki(discord, amount, 'Заявка на вывод');
    
    // Создаем заявку
    const withdrawal = await withdrawalsDB.createWithdrawal({
      discord,
      minecraft,
      amount
    });
    
    res.json({ success: true, data: withdrawal });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить все заявки
app.get('/api/withdrawals', async (req, res) => {
  try {
    const withdrawals = await withdrawalsDB.getAllWithdrawals();
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error('Error getting withdrawals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить заявки пользователя
app.get('/api/withdrawals/my', async (req, res) => {
  try {
    const { discord } = req.query;
    
    if (!discord) {
      return res.status(400).json({ success: false, error: 'Discord не указан' });
    }
    
    const withdrawals = await withdrawalsDB.getUserWithdrawals(discord);
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error('Error getting user withdrawals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Одобрить заявку
app.post('/api/withdrawals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer } = req.body;
    
    if (!reviewer) {
      return res.status(400).json({ success: false, error: 'Не указан проверяющий' });
    }
    
    const withdrawal = await withdrawalsDB.approveWithdrawal(id, reviewer);
    res.json({ success: true, data: withdrawal });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отклонить заявку
app.post('/api/withdrawals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer, comment } = req.body;
    
    if (!reviewer) {
      return res.status(400).json({ success: false, error: 'Не указан проверяющий' });
    }
    
    if (!comment) {
      return res.status(400).json({ success: false, error: 'Не указана причина отклонения' });
    }
    
    // Получаем заявку
    const withdrawal = await withdrawalsDB.getWithdrawalById(id);
    
    // Возвращаем соларики пользователю
    await staffDB.addSolariki(withdrawal.discord, withdrawal.amount, 'Возврат за отклоненную заявку на вывод');
    
    // Отклоняем заявку
    const rejectedWithdrawal = await withdrawalsDB.rejectWithdrawal(id, reviewer, comment);
    res.json({ success: true, data: rejectedWithdrawal });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получить статистику заявок
app.get('/api/withdrawals/stats', async (req, res) => {
  try {
    const stats = await withdrawalsDB.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting withdrawal stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.API_PORT || 4000;

app.listen(PORT, () => {
  console.log(`[START] API server started on port ${PORT}`);
  console.log(`[API] Available at: http://localhost:${PORT}/api`);
  console.log(`[DB] Database: Supabase (PostgreSQL)`);
});

module.exports = app;
