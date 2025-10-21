require('dotenv').config();
const staffDB = require('./staff-database-supabase');

async function setOwner() {
  try {
    console.log('🔧 Назначение должности OWNER для m1ruk0_...\n');
    
    // Проверяем существует ли пользователь
    const staff = await staffDB.findStaff('m1ruk0_');
    
    if (staff) {
      // Если существует - обновляем должность
      console.log('✅ Пользователь найден в базе');
      const success = await staffDB.updatePosition('m1ruk0_', 'OWNER');
      
      if (success) {
        console.log('✅ Должность успешно обновлена на OWNER');
      } else {
        console.log('❌ Не удалось обновить должность');
      }
    } else {
      // Если не существует - создаем
      console.log('⚠️  Пользователь не найден, создаем нового...');
      const success = await staffDB.addStaff('m1ruk0_', 'm1ruk0_', 'OWNER');
      
      if (success) {
        console.log('✅ Пользователь создан с должностью OWNER');
      } else {
        console.log('❌ Не удалось создать пользователя');
      }
    }
    
    // Проверяем результат
    const updatedStaff = await staffDB.findStaff('m1ruk0_');
    if (updatedStaff) {
      console.log('\n📊 Текущие данные:');
      console.log(`   Discord: ${updatedStaff.discord}`);
      console.log(`   Minecraft: ${updatedStaff.minecraft}`);
      console.log(`   Должность: ${updatedStaff.position}`);
      console.log(`   Статус: ${updatedStaff.status}`);
      console.log(`   Дата найма: ${updatedStaff.hire_date || 'Не указано'}`);
    }
    
    console.log('\n🎉 Готово!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

setOwner();
