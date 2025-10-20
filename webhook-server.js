require('dotenv').config();
const express = require('express');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createWebhookServer(client) {
  const app = express();
  app.use(express.json());

  // Endpoint для получения данных из Google Forms
  app.post('/webhook/application', async (req, res) => {
    try {
      const data = req.body;
      
      // НЕ отправляем в Discord канал - только сохраняем в Google Sheets
      console.log('📋 Получена заявка из Google Forms');

      // Извлекаем данные из заявки
      let discordUsername = '';
      let minecraftNick = '';
      let age = '';
      let experience = '';
      let why = '';
      let applicationType = '';
      const fields = data.fields || [];
      
      console.log('📋 Полученные поля из формы:');
      fields.forEach((field, index) => {
        console.log(`   ${index + 1}. "${field.name}" = "${field.value}"`);
      });
      
      for (const field of fields) {
        const fieldNameLower = field.name.toLowerCase();
        const fieldValueLower = field.value.toLowerCase();
        
        // Ищем поле с Discord
        if (fieldNameLower.includes('дискорд') || fieldNameLower.includes('discord')) {
          discordUsername = field.value;
          console.log(`✅ Найдено поле с Discord: "${field.name}" = "${discordUsername}"`);
        }
        
        // Ищем поле с Minecraft
        if (fieldNameLower.includes('майнкрафт') || fieldNameLower.includes('minecraft') || fieldNameLower.includes('ник в игре')) {
          minecraftNick = field.value;
          console.log(`✅ Найдено поле с Minecraft: "${field.name}" = "${minecraftNick}"`);
        }
        
        // Ищем возраст
        if (fieldNameLower.includes('возраст') || fieldNameLower.includes('age') || fieldNameLower.includes('лет')) {
          age = field.value;
          console.log(`✅ Найден возраст: "${field.name}" = "${age}"`);
        }
        
        // Ищем опыт
        if (fieldNameLower.includes('опыт') || fieldNameLower.includes('experience')) {
          experience = field.value;
          console.log(`✅ Найден опыт: "${field.name}" = "${experience}"`);
        }
        
        // Ищем причину
        if (fieldNameLower.includes('почему') || fieldNameLower.includes('зачем') || fieldNameLower.includes('why')) {
          why = field.value;
          console.log(`✅ Найдена причина: "${field.name}" = "${why}"`);
        }
        
        // Определяем тип заявки
        if (fieldNameLower.includes('должность') || fieldNameLower.includes('роль') || 
            fieldValueLower.includes('хелпер') || fieldValueLower.includes('медия')) {
          if (fieldValueLower.includes('хелпер')) {
            applicationType = 'хелпер';
          } else if (fieldValueLower.includes('медия')) {
            applicationType = 'медия';
          }
          console.log(`✅ Тип заявки: ${applicationType}`);
        }
      }
      
      if (!discordUsername) {
        console.log('⚠️ Поле с Discord ником не найдено!');
      }
      
      if (!applicationType) {
        applicationType = 'хелпер'; // По умолчанию
        console.log('⚠️ Тип заявки не определен, используется: хелпер');
      }

      // Заявка уже сохранена в Google Sheets через форму
      // Ничего не отправляем в Discord канал
      
      console.log('✅ Заявка обработана');
      console.log(`   Discord: ${discordUsername}`);
      console.log(`   Minecraft: ${minecraftNick}`);
      console.log(`   Тип: ${applicationType}`);

      res.status(200).json({ success: true, message: 'Заявка сохранена в Google Sheets' });
    } catch (error) {
      console.error('Ошибка при обработке webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint для обжалований банов
  app.post('/webhook/ban-appeal', async (req, res) => {
    try {
      const data = req.body;
      
      // Получаем канал для обжалований
      const channelId = process.env.BAN_APPEAL_CHANNEL_ID;
      const channel = await client.channels.fetch(channelId);

      if (!channel) {
        return res.status(404).json({ error: 'Ban appeal channel not found' });
      }

      // Извлекаем Discord ник из данных
      let discordUsername = '';
      const fields = data.fields || [];
      
      console.log('📋 Полученные поля из формы обжалования:');
      fields.forEach((field, index) => {
        console.log(`   ${index + 1}. "${field.name}" = "${field.value}"`);
      });
      
      for (const field of fields) {
        const fieldNameLower = field.name.toLowerCase();
        
        if (fieldNameLower.includes('дискорд') || fieldNameLower.includes('discord')) {
          discordUsername = field.value;
          console.log(`✅ Найдено поле с Discord: "${field.name}" = "${discordUsername}"`);
          break;
        }
      }
      
      if (!discordUsername) {
        console.log('⚠️ Поле с Discord ником не найдено!');
      }

      // Создаем embed
      const embed = new EmbedBuilder()
        .setColor(data.color || 0xffa500)
        .setTimestamp();

      if (data.title) {
        embed.setTitle(data.title);
      }

      if (data.description) {
        embed.setDescription(data.description);
      }

      if (data.fields && data.fields.length > 0) {
        data.fields.forEach(field => {
          embed.addFields({
            name: field.name,
            value: field.value,
            inline: field.inline || false
          });
        });
      }

      if (data.footer) {
        embed.setFooter({ text: data.footer });
      }

      // Создаем кнопки для обжалования
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`unban_${discordUsername}`)
            .setLabel('✅ Разбанить')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`reject_appeal_${discordUsername}`)
            .setLabel('❌ Отклонить')
            .setStyle(ButtonStyle.Danger)
        );

      // Отправляем сообщение с кнопками
      const message = await channel.send({
        content: data.content || '',
        embeds: [embed],
        components: [row]
      });

      console.log('✅ Обжалование отправлено в канал');
      res.status(200).json({ success: true, messageId: message.id });
    } catch (error) {
      console.error('❌ Ошибка при обработке обжалования:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Запуск сервера
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🌐 Webhook сервер запущен на порту ${PORT}`);
    console.log(`📡 URL для заявок: http://localhost:${PORT}/webhook/application`);
    console.log(`📡 URL для обжалований: http://localhost:${PORT}/webhook/ban-appeal`);
  });

  return app;
}

module.exports = { createWebhookServer };
