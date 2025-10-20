require('dotenv').config();
const staffDB = require('./staff-database');
const passwordsDB = require('./passwords-database');

async function setupM1ruk0() {
  try {
    console.log('👑 Настройка полных прав для m1ruk0_...\n');
    
    // Шаг 1: Добавляем в персонал с должностью OWNER
    console.log('1️⃣ Добавление в персонал...');
    const staffSuccess = await staffDB.addStaff('m1ruk0_', 'Owner', 'OWNER');
    
    if (staffSuccess) {
      console.log('✅ m1ruk0_ добавлен в персонал с должностью OWNER');
    } else {
      console.log('⚠️ Возможно уже существует в персонале');
    }
    
    // Шаг 2: Создаем пароль
    console.log('\n2️⃣ Создание пароля...');
    const passwordSuccess = await passwordsDB.addUser(
      'm1ruk0_',
      '123123',
      'Любимая игрушка в детстве?',
      'машинка'
    );
    
    if (passwordSuccess) {
      console.log('✅ Пароль создан');
    } else {
      console.log('⚠️ Возможно пароль уже существует');
    }
    
    console.log('\n🎉 Готово! Данные для входа:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Discord: m1ruk0_');
    console.log('👑 Должность: OWNER (полные права)');
    console.log('🔑 Пароль: 123123');
    console.log('❓ Секретный вопрос: Любимая игрушка в детстве?');
    console.log('💬 Ответ: машинка');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Войдите на: http://localhost:4000/login.html');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

setupM1ruk0();
