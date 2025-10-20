require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Удаление всех глобальных команд
(async () => {
  try {
    console.log('🗑️ Удаление всех команд...');
    
    // Получаем ID приложения из токена
    const clientId = Buffer.from(process.env.DISCORD_TOKEN.split('.')[0], 'base64').toString();
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] }
    );
    
    console.log('✅ Все команды успешно удалены!');
    console.log('Теперь запустите бота командой: npm start');
  } catch (error) {
    console.error('❌ Ошибка при удалении команд:', error);
  }
})();
