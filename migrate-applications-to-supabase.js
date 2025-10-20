require('dotenv').config();
const applicationsGoogleDB = require('./applications-database');
const applicationsSupabaseDB = require('./applications-database-supabase');

async function migrate() {
  try {
    console.log('🚀 Начинаем миграцию заявок из Google Sheets в Supabase...\n');
    
    // Получаем все заявки из Google Sheets
    const applications = await applicationsGoogleDB.getAllApplications();
    
    console.log(`📊 Найдено ${applications.length} заявок\n`);
    
    if (applications.length === 0) {
      console.log('⚠️ Заявок не найдено');
      process.exit(0);
    }
    
    // Переносим каждую заявку
    let success = 0;
    let failed = 0;
    
    for (const app of applications) {
      try {
        const result = await applicationsSupabaseDB.addApplication({
          discord: app.discord,
          minecraft: app.minecraft,
          age: app.age,
          experience: app.experience,
          reason: app.reason
        });
        
        if (result) {
          console.log(`✅ Перенесена: ${app.discord}`);
          success++;
        } else {
          console.log(`❌ Ошибка: ${app.discord}`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ Ошибка при переносе ${app.discord}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Миграция завершена!`);
    console.log(`✅ Успешно: ${success}`);
    console.log(`❌ Ошибок: ${failed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  }
}

migrate();
