require('dotenv').config();
const staffDB = require('./staff-database');

async function addOwner() {
  try {
    console.log('📝 Добавляю m1ruk0_ с правами OWNER...');
    
    const success = await staffDB.addStaff('m1ruk0_', 'Owner', 'OWNER');
    
    if (success) {
      console.log('✅ m1ruk0_ успешно добавлен с правами OWNER!');
      console.log('🔑 Теперь можете войти на http://localhost:4000/login.html');
    } else {
      console.log('❌ Ошибка добавления');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

addOwner();
