require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder: ModalActionRowBuilder } = require('discord.js');
const config = require('./config');
const { createWebhookServer } = require('./webhook-server');
const staffDB = require('./staff-database-supabase');
const { handleStaffButton, handleStaffModal } = require('./staff-handlers');

// Создаем клиента Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // Для проверки ролей
  ]
});

// Команды для регистрации
const commands = [
  new SlashCommandBuilder()
    .setName('yes')
    .setDescription('Одобрить заявку пользователя')
    .addUserOption(option =>
      option.setName('пользователь')
        .setDescription('Выберите пользователя')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('no')
    .setDescription('Отклонить заявку пользователя')
    .addUserOption(option =>
      option.setName('пользователь')
        .setDescription('Выберите пользователя')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('sn')
    .setDescription('Уволить модератора')
    .addUserOption(option =>
      option.setName('пользователь')
        .setDescription('Выберите пользователя для увольнения')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('причина')
        .setDescription('Причина увольнения')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Показать все роли сервера с их ID'),
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Открыть панель управления персоналом')
    .addChannelOption(option =>
      option.setName('канал')
        .setDescription('Канал куда отправить панель')
        .setRequired(true)
    )
].map(command => command.toJSON());

// Регистрация команд
async function registerCommands() {
  try {
    console.log('Начинаю регистрацию slash-команд...');
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('✅ Slash-команды успешно зарегистрированы!');
  } catch (error) {
    console.error('Ошибка при регистрации команд:', error);
  }
}

// Функция проверки прав пользователя
function hasPermission(member) {
  // Проверяем, есть ли у пользователя хотя бы одна из разрешенных ролей
  return config.allowedRoles.some(roleId => member.roles.cache.has(roleId));
}

// Функция отправки сообщения пользователю и выдачи роли
async function sendApplicationResponse(member, isAccepted, moderator, applicationType) {
  try {
    const appConfig = config.applicationTypes[applicationType];
    if (!appConfig) {
      console.error(`Неизвестный тип заявки: ${applicationType}`);
      return false;
    }

    const messageConfig = isAccepted ? appConfig.acceptedMessage : appConfig.rejectedMessage;
    
    const embed = new EmbedBuilder()
      .setTitle(messageConfig.title)
      .setDescription(messageConfig.description)
      .setColor(messageConfig.color)
      .setTimestamp()
      .setFooter({ text: `Решение принято модератором: ${moderator.tag}` });
    
    // Если заявка принята, выдаем роль
    if (isAccepted && appConfig.roleId) {
      try {
        await member.roles.add(appConfig.roleId);
        console.log(`✅ Роль ${appConfig.roleId} выдана пользователю ${member.user.tag}`);
      } catch (roleError) {
        console.error('Ошибка при выдаче роли:', roleError);
      }
    }
    
    await member.user.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error('Ошибка при отправке сообщения пользователю:', error);
    return false;
  }
}

// Функция увольнения модератора
async function fireModerator(member, moderator, reason) {
  try {
    const removedRoles = [];
    const failedRoles = [];
    
    // Удаляем все роли модерации
    console.log(`🔄 Начинаем удаление ролей у ${member.user.tag}`);
    console.log(`📋 Всего ролей для проверки: ${config.moderationRoles.length}`);
    
    // Показываем все роли пользователя
    console.log(`\n👤 Роли пользователя (${member.roles.cache.size}):`);
    member.roles.cache.forEach(role => {
      if (role.name !== '@everyone') {
        const inConfig = config.moderationRoles.includes(role.id);
        console.log(`   - ${role.name} (ID: ${role.id}) ${inConfig ? '✓ В конфиге' : '✗ Не в конфиге'}`);
      }
    });
    
    for (const roleId of config.moderationRoles) {
      console.log(`\n🔍 Проверяем роль: ${roleId} (тип: ${typeof roleId})`);
      
      // Проверяем есть ли роль в кэше
      const hasRole = member.roles.cache.has(roleId);
      console.log(`   Проверка has(): ${hasRole}`);
      
      // Дополнительная проверка - ищем роль по ID
      const foundRole = member.roles.cache.get(roleId);
      console.log(`   Проверка get(): ${foundRole ? 'найдена' : 'не найдена'}`);
      
      if (hasRole || foundRole) {
        console.log(`   ✓ Роль найдена у пользователя`);
        try {
          await member.roles.remove(roleId);
          removedRoles.push(roleId);
          console.log(`   ✅ Роль успешно удалена`);
        } catch (roleError) {
          failedRoles.push(roleId);
          console.error(`   ❌ Ошибка при удалении роли:`);
          console.error(`      Код ошибки: ${roleError.code}`);
          console.error(`      Сообщение: ${roleError.message}`);
          
          if (roleError.code === 50013) {
            console.error(`      💡 Решение: Переместите роль бота ВЫШЕ этой роли в настройках сервера`);
          }
        }
      } else {
        console.log(`   ⊘ Роль не найдена у пользователя (пропускаем)`);
      }
    }
    
    console.log(`\n📊 Итого: удалено ${removedRoles.length}, не удалось ${failedRoles.length}`);
    
    // Отправляем уведомление пользователю с причиной
    let description = config.messages.fired.description;
    if (reason) {
      description += `\n\n**Причина:** ${reason}`;
    }
    
    const embed = new EmbedBuilder()
      .setTitle(config.messages.fired.title)
      .setDescription(description)
      .setColor(config.messages.fired.color)
      .setTimestamp()
      .setFooter({ text: `Решение принято администратором: ${moderator.tag}` });
    
    try {
      await member.user.send({ embeds: [embed] });
    } catch (error) {
      console.log('Не удалось отправить ЛС пользователю (возможно, закрыты)');
    }
    
    return { 
      success: true, 
      removedCount: removedRoles.length,
      failedCount: failedRoles.length,
      failedRoles: failedRoles
    };
  } catch (error) {
    console.error('Ошибка при увольнении модератора:', error);
    return { success: false, error: error.message };
  }
}

// Обработка slash-команд и кнопок
client.on('interactionCreate', async interaction => {
  // Обработка кнопок
  if (interaction.isButton()) {
    const customId = interaction.customId;
    
    // Проверяем права пользователя
    if (!hasPermission(interaction.member)) {
      await interaction.reply({
        content: '❌ У вас нет прав для использования этой кнопки!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Обработка кнопок панели управления персоналом
    if (customId.startsWith('staff_')) {
      await handleStaffButton(interaction);
      return;
    }

    // Обработка кнопок обжалования бана
    if (customId.startsWith('unban_') || customId.startsWith('reject_appeal_')) {
      const action = customId.startsWith('unban_') ? 'unban' : 'reject_appeal';
      const discordUsername = customId.replace('unban_', '').replace('reject_appeal_', '');
      
      try {
        // Ищем пользователя по нику
        const members = await interaction.guild.members.fetch();
        const targetMember = members.find(member => {
          return member.user.tag === discordUsername || 
                 member.user.username === discordUsername ||
                 member.displayName === discordUsername;
        });

        if (action === 'unban') {
          // Разбаниваем пользователя
          try {
            await interaction.guild.members.unban(targetMember ? targetMember.user.id : discordUsername, 
              `Обжалование одобрено модератором ${interaction.user.tag}`);
            
            // Отправляем ЛС пользователю
            if (targetMember) {
              const embed = new EmbedBuilder()
                .setTitle(config.messages.banAppealAccepted.title)
                .setDescription(config.messages.banAppealAccepted.description)
                .setColor(config.messages.banAppealAccepted.color)
                .setTimestamp()
                .setFooter({ text: `Решение принято модератором: ${interaction.user.tag}` });
              
              try {
                await targetMember.user.send({ embeds: [embed] });
              } catch (error) {
                console.log('Не удалось отправить ЛС пользователю');
              }
            }

            // Обновляем сообщение
            await interaction.update({
              components: []
            });

            await interaction.followUp({
              content: `✅ Пользователь ${discordUsername} разбанен!`,
              flags: MessageFlags.Ephemeral
            });
          } catch (error) {
            await interaction.reply({
              content: `❌ Ошибка при разбане: ${error.message}\n\nВозможно пользователь не забанен или ID неверный.`,
              flags: MessageFlags.Ephemeral
            });
          }
        } else {
          // Отклоняем обжалование
          if (targetMember) {
            const embed = new EmbedBuilder()
              .setTitle(config.messages.banAppealRejected.title)
              .setDescription(config.messages.banAppealRejected.description)
              .setColor(config.messages.banAppealRejected.color)
              .setTimestamp()
              .setFooter({ text: `Решение принято модератором: ${interaction.user.tag}` });
            
            try {
              await targetMember.user.send({ embeds: [embed] });
            } catch (error) {
              console.log('Не удалось отправить ЛС пользователю');
            }
          }

          await interaction.update({
            components: []
          });

          await interaction.followUp({
            content: `❌ Обжалование пользователя ${discordUsername} отклонено.`,
            flags: MessageFlags.Ephemeral
          });
        }
      } catch (error) {
        console.error('Ошибка при обработке обжалования:', error);
        await interaction.reply({
          content: '❌ Произошла ошибка при обработке обжалования.',
          flags: MessageFlags.Ephemeral
        });
      }
      return;
    }

    // Извлекаем действие, тип заявки и Discord ник из customId
    const parts = customId.split('_');
    const action = parts[0];
    const applicationType = parts[1];
    const discordUsername = parts.slice(2).join('_'); // На случай если в нике есть _
    
    if (action === 'accept' || action === 'reject') {
      const isAccepted = action === 'accept';
      
      // Проверяем что тип заявки существует
      const appConfig = config.applicationTypes[applicationType];
      if (!appConfig) {
        await interaction.reply({
          content: `❌ Неизвестный тип заявки: ${applicationType}`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      
      // Пытаемся найти пользователя по нику
      try {
        console.log(`🔍 Ищем пользователя: "${discordUsername}"`);
        
        // Ищем пользователя на сервере
        const members = await interaction.guild.members.fetch();
        
        // Дебаг: показываем что ищем
        console.log(`📝 Варианты поиска:`);
        console.log(`   - По tag (username#0000): ${discordUsername}`);
        console.log(`   - По username: ${discordUsername}`);
        console.log(`   - По displayName: ${discordUsername}`);
        
        const targetMember = members.find(member => {
          const matches = 
            member.user.tag === discordUsername || 
            member.user.username === discordUsername ||
            member.displayName === discordUsername ||
            member.user.tag.toLowerCase() === discordUsername.toLowerCase() ||
            member.user.username.toLowerCase() === discordUsername.toLowerCase() ||
            member.displayName.toLowerCase() === discordUsername.toLowerCase();
          
          if (matches) {
            console.log(`✅ Найден: ${member.user.tag} (ID: ${member.user.id})`);
          }
          
          return matches;
        });

        if (!targetMember) {
          console.log(`❌ Пользователь не найден!`);
          console.log(`📋 Первые 5 пользователей на сервере для сравнения:`);
          members.first(5).forEach(m => {
            console.log(`   - tag: "${m.user.tag}", username: "${m.user.username}", displayName: "${m.displayName}"`);
          });
          
          await interaction.reply({
            content: `❌ Пользователь "${discordUsername}" не найден на сервере!\n\n` +
                     `Проверьте что:\n` +
                     `• Пользователь есть на сервере\n` +
                     `• Ник указан правильно (с учетом регистра)\n` +
                     `• В форме указано поле "Ваш Discord"`,
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        // Отправляем сообщение пользователю и выдаем роль
        const success = await sendApplicationResponse(targetMember, isAccepted, interaction.user, applicationType);

        if (success) {
          // Обновляем сообщение - убираем кнопки
          await interaction.update({
            components: []
          });

          // Отправляем подтверждение
          const roleText = isAccepted ? ` и выдана роль ${applicationType}` : '';
          await interaction.followUp({
            content: `${isAccepted ? '✅' : '❌'} Пользователю ${targetMember.user.tag} отправлено уведомление о ${isAccepted ? 'принятии' : 'отклонении'} заявки${roleText}.`,
            flags: MessageFlags.Ephemeral
          });
        } else {
          await interaction.reply({
            content: '❌ Не удалось отправить сообщение пользователю. Возможно, у него закрыты личные сообщения.',
            flags: MessageFlags.Ephemeral
          });
        }
      } catch (error) {
        console.error('Ошибка при обработке кнопки:', error);
        await interaction.reply({
          content: '❌ Произошла ошибка при обработке заявки.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
    return;
  }

  // Обработка модальных окон
  if (interaction.isModalSubmit()) {
    if (interaction.customId.includes('staff_')) {
      await handleStaffModal(interaction);
      return;
    }
  }

  if (!interaction.isChatInputCommand()) return;

  // Проверяем что команда используется на сервере, а не в ЛС
  if (!interaction.guild) {
    await interaction.reply({
      content: '❌ Эта команда работает только на сервере и только администратором!',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const { commandName, options, user: moderator } = interaction;

  // Проверяем, что команда /yes или /no
  if (commandName === 'yes' || commandName === 'no') {
    // Проверяем права пользователя
    if (!hasPermission(interaction.member)) {
      await interaction.reply({
        content: '❌ У вас нет прав для использования этой команды!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const targetUser = options.getUser('пользователь');
    const isAccepted = commandName === 'yes';

    // Получаем member объект
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    
    if (!targetMember) {
      await interaction.reply({
        content: '❌ Пользователь не найден на сервере!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Используем тип заявки по умолчанию (хелпер)
    const success = await sendApplicationResponse(targetMember, isAccepted, moderator, 'хелпер');

    if (success) {
      const responseEmbed = new EmbedBuilder()
        .setTitle(isAccepted ? '✅ Заявка одобрена' : '❌ Заявка отклонена')
        .setDescription(`Пользователю ${targetUser.tag} отправлено уведомление о ${isAccepted ? 'принятии' : 'отклонении'} заявки.`)
        .setColor(isAccepted ? 0x00ff00 : 0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [responseEmbed], flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ 
        content: '❌ Не удалось отправить сообщение пользователю. Возможно, у него закрыты личные сообщения.', 
        flags: MessageFlags.Ephemeral 
      });
    }
  }

  // Обработка команды /sn (увольнение модератора)
  if (commandName === 'sn') {
    // Проверяем права пользователя
    if (!hasPermission(interaction.member)) {
      await interaction.reply({
        content: '❌ У вас нет прав для использования этой команды!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const targetUser = options.getUser('пользователь');
    const reason = options.getString('причина');
    
    // Получаем member объект для работы с ролями
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    
    if (!targetMember) {
      await interaction.reply({
        content: '❌ Пользователь не найден на сервере!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Увольняем модератора с указанием причины
    const result = await fireModerator(targetMember, moderator, reason);

    if (result.success) {
      let description = `Пользователь ${targetUser.tag} был уволен с должности модератора.\n\n**Причина:** ${reason}\n\n✅ Удалено ролей: ${result.removedCount}`;
      
      if (result.failedCount > 0) {
        description += `\n⚠️ Не удалось удалить ролей: ${result.failedCount}\n\n**Примечание:** Роль бота должна быть выше ролей модерации в иерархии сервера.`;
      }
      
      const responseEmbed = new EmbedBuilder()
        .setTitle('🔨 Модератор уволен')
        .setDescription(description)
        .setColor(result.failedCount > 0 ? 0xffa500 : 0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [responseEmbed], flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({
        content: `❌ Ошибка при увольнении модератора: ${result.error}`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  // Обработка команды /roles (показать все роли сервера)
  if (commandName === 'roles') {
    // Проверяем права пользователя
    if (!hasPermission(interaction.member)) {
      await interaction.reply({
        content: '❌ У вас нет прав для использования этой команды!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const roles = interaction.guild.roles.cache
      .filter(role => role.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map(role => `**${role.name}** - \`${role.id}\``)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📋 Роли сервера')
      .setDescription(roles || 'Нет ролей')
      .setColor(0x5865F2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // Обработка команды /panel (панель управления персоналом)
  if (commandName === 'panel') {
    // Проверяем права пользователя
    if (!hasPermission(interaction.member)) {
      await interaction.reply({
        content: '❌ У вас нет прав для использования этой команды!',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const targetChannel = options.getChannel('канал');

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Панель управления персоналом')
      .setDescription('Выберите действие для управления персоналом сервера')
      .setColor(0x5865F2)
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('staff_hire')
          .setLabel('➕ Нанять')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('staff_fire')
          .setLabel('🔥 Уволить')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('staff_promote')
          .setLabel('⬆️ Повысить')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('staff_demote')
          .setLabel('⬇️ Понизить')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('staff_warn')
          .setLabel('⚠️ Выдать варн')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('staff_unwarn')
          .setLabel('✅ Снять варн')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('staff_blacklist')
          .setLabel('🚫 ЧСП')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('staff_list')
          .setLabel('📋 Список')
          .setStyle(ButtonStyle.Primary)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('staff_vacation_add')
          .setLabel('🏖️ В отпуск')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('staff_vacation_remove')
          .setLabel('💼 Из отпуска')
          .setStyle(ButtonStyle.Secondary)
      );

    await targetChannel.send({
      embeds: [embed],
      components: [row1, row2, row3]
    });

    await interaction.reply({
      content: `✅ Панель управления отправлена в ${targetChannel}`,
      flags: MessageFlags.Ephemeral
    });
  }
});

async function sendApplicationAcceptedDM(discordUsername, position, comment) {
  try {
    let cleanUsername = discordUsername.trim();
    if (cleanUsername.startsWith('@')) {
      cleanUsername = cleanUsername.substring(1);
    }
    
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.log('❌ Бот не находится ни на одном сервере');
      return false;
    }

    await guild.members.fetch();
    
    const member = guild.members.cache.find(m => 
      m.user.username.toLowerCase() === cleanUsername.toLowerCase() ||
      m.user.tag.toLowerCase() === cleanUsername.toLowerCase() ||
      m.displayName.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (!member) {
      console.log(`❌ Пользователь ${discordUsername} не найден на сервере`);
      return false;
    }

    const positionLower = position.toLowerCase();
    const messageConfig = config.applicationTypes[positionLower]?.acceptedMessage || config.messages.accepted;
    
    const embed = new EmbedBuilder()
      .setTitle(messageConfig.title)
      .setDescription(`${messageConfig.description}\n\n**Должность:** ${position}${comment ? `\n**Комментарий модератора:** ${comment}` : ''}`)
      .setColor(messageConfig.color)
      .setFooter({ text: 'Панель управления персоналом' })
      .setTimestamp();

    await member.send({ embeds: [embed] });
    console.log(`✅ Уведомление отправлено пользователю ${member.user.tag}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки ЛС:', error.message);
    if (error.code === 50007) {
      console.log('⚠️ Пользователь запретил ЛС от ботов');
    }
    return false;
  }
}

client.once('clientReady', async () => {
  console.log(`✅ Бот запущен как ${client.user.tag}`);
  await registerCommands();
  
  createWebhookServer(client);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = { client, sendApplicationAcceptedDM };
