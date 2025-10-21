require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Проверка подключения к Supabase...\n');

// Проверяем переменные окружения
console.log('📋 Проверка переменных окружения:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Установлена' : '❌ Не установлена'}`);
console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Установлена' : '❌ Не установлена'}`);
console.log('');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_KEY должны быть указаны в .env файле');
  console.log('\nДобавьте в файл .env:');
  console.log('SUPABASE_URL=https://ваш-проект.supabase.co');
  console.log('SUPABASE_KEY=ваш_anon_ключ');
  process.exit(1);
}

// Создаем клиент
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testConnection() {
  try {
    console.log('🔌 Подключение к Supabase...');
    
    // Проверяем подключение
    const { data, error } = await supabase.from('staff').select('count');
    
    if (error) {
      if (error.message.includes('relation "staff" does not exist')) {
        console.log('⚠️  Таблицы еще не созданы');
        console.log('\n📝 Выполните следующие шаги:');
        console.log('   1. Откройте Supabase Dashboard');
        console.log('   2. Перейдите в SQL Editor');
        console.log('   3. Скопируйте содержимое файла supabase-schema.sql');
        console.log('   4. Вставьте и нажмите Run');
        console.log('   5. Запустите этот скрипт снова');
        return;
      }
      throw error;
    }
    
    console.log('✅ Подключение успешно!\n');
    
    // Проверяем таблицы
    console.log('📊 Проверка таблиц:');
    
    const tables = ['staff', 'applications', 'passwords', 'logs'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        console.log(`   ✅ ${table.padEnd(15)} - таблица существует`);
      } catch (err) {
        console.log(`   ❌ ${table.padEnd(15)} - таблица не найдена`);
      }
    }
    
    console.log('\n🎉 Все проверки пройдены!');
    console.log('\n🚀 Теперь вы можете запустить сервер:');
    console.log('   npm run api-supabase');
    
  } catch (error) {
    console.error('\n❌ Ошибка подключения:', error.message);
    console.log('\n🔧 Возможные решения:');
    console.log('   1. Проверьте правильность SUPABASE_URL и SUPABASE_KEY');
    console.log('   2. Убедитесь что проект создан в Supabase');
    console.log('   3. Проверьте что таблицы созданы (см. supabase-schema.sql)');
  }
}

testConnection();
