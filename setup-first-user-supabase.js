require('dotenv').config();
const staffDB = require('./staff-database-supabase');
const passwordsDB = require('./passwords-database-supabase');

async function setup() {
  try {
    console.log('🚀 Начинаем настройку...\n');
    
    // Добавляем OWNER
    const staffAdded = await staffDB.addStaff('m1ruk0_', 'Owner', 'OWNER');
    if (staffAdded) {
      console.log('✅ Сотрудник m1ruk0_ добавлен с правами OWNER');
    } else {
      console.log('⚠️ Сотрудник уже существует');
    }
    
    // Добавляем пароль
    const passwordAdded = await passwordsDB.addUser(
      'm1ruk0_',
      '123123',
      'Любимая игрушка в детстве?',
      'машинка'
    );
    if (passwordAdded) {
      console.log('✅ Пароль создан');
    } else {
      console.log('⚠️ Пароль уже существует');
    }
    
    console.log('\n🎉 Настройка завершена!');
    console.log('\n📝 Данные для входа:');
    console.log('Discord: m1ruk0_');
    console.log('Пароль: 123123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

setup();
