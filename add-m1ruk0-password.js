require('dotenv').config();
const passwordsDB = require('./passwords-database');

async function addM1ruk0() {
  try {
    console.log('🔐 Добавляю пароль для m1ruk0_...');
    
    // Добавляем пользователя с паролем и секретным вопросом
    const success = await passwordsDB.addUser(
      'm1ruk0_',
      '123123',
      'Любимая игрушка в детстве?',
      'машинка' // Замените на ваш ответ
    );
    
    if (success) {
      console.log('✅ Пароль для m1ruk0_ успешно создан!');
      console.log('📝 Discord: m1ruk0_');
      console.log('🔑 Пароль: 123123');
      console.log('❓ Секретный вопрос: Любимая игрушка в детстве?');
      console.log('💬 Ответ: машинка');
      console.log('\n🌐 Теперь можете войти на http://localhost:4000/login.html');
    } else {
      console.log('❌ Ошибка создания пароля');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

addM1ruk0();
