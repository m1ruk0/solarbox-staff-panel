require('dotenv').config();
const { connectDB, closeDB } = require('./mongodb-setup');
const staffDB = require('./staff-database-mongo');
const passwordsDB = require('./passwords-database-mongo');

async function setup() {
  try {
    console.log('🚀 Начинаем настройку...\n');
    
    // Подключаемся к MongoDB
    await connectDB();
    
    // Добавляем OWNER
    console.log('👑 Добавляем OWNER...');
    const staffAdded = await staffDB.addStaff('m1ruk0_', 'Owner', 'OWNER');
    
    if (staffAdded) {
      console.log('✅ Сотрудник m1ruk0_ добавлен с правами OWNER');
    } else {
      console.log('⚠️ Сотрудник уже существует');
    }
    
    // Добавляем пароль
    console.log('\n🔐 Создаем пароль...');
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
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Настройка завершена!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Данные для входа:');
    console.log('👤 Discord: m1ruk0_');
    console.log('👑 Должность: OWNER (полные права)');
    console.log('🔑 Пароль: 123123');
    console.log('❓ Секретный вопрос: Любимая игрушка в детстве?');
    console.log('💬 Ответ: машинка');
    console.log('\n🌐 Войдите на: http://localhost:4000/login.html');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка настройки:', error.message);
    console.error('\n💡 Проверьте:');
    console.error('1. Правильность MONGODB_URI в файле .env');
    console.error('2. Подключение к интернету');
    console.error('3. Настройки Network Access в MongoDB Atlas\n');
    process.exit(1);
  }
}

setup();
